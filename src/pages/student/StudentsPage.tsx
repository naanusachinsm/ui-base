/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useMemo, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Download,
  GripVertical,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Student } from "@/api/studentTypes";
import {
  StudentStatus,
  StudentStatusLabels,
  StudentStatusColors,
} from "@/api/studentTypes";
import { studentService } from "@/api/studentService";
import { roleService } from "@/api/roleService";
import { ActionType, ModuleName } from "@/api/roleTypes";
import { toast } from "sonner";
import StudentModal from "./StudentModal";
import { useAppStore } from "@/stores/appStore";

// Drag handle component
const DragHandle = () => (
  <div className="cursor-move p-1 text-muted-foreground hover:text-foreground">
    <GripVertical className="h-4 w-4" />
  </div>
);

// Sortable table row component
const SortableTableRow = ({ row }: { row: Row<Student> }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.original.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      data-state={row.getIsSelected() && "selected"}
      className={isDragging ? "bg-muted/50" : ""}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell
          key={cell.id}
          className="text-left"
          style={{ width: cell.column.getSize() }}
        >
          {cell.column.id === "drag" ? (
            <div {...attributes} {...listeners}>
              <DragHandle />
            </div>
          ) : (
            flexRender(cell.column.columnDef.cell, cell.getContext())
          )}
        </TableCell>
      ))}
    </TableRow>
  );
};

// Table cell viewer component
const TableCellViewer = ({ value, type }: { value: unknown; type: string }) => {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">-</span>;
  }

  switch (type) {
    case "date":
      return (
        <span className="text-sm">
          {new Date(value as string).toLocaleDateString()}
        </span>
      );
    case "phone":
      return <span className="font-mono text-sm">{value as string}</span>;
    case "email":
      return (
        <span className="text-sm text-muted-foreground">
          {value as string}
        </span>
      );
    case "status": {
      const status = value as StudentStatus;
      return (
        <Badge variant="outline" className={StudentStatusColors[status]}>
          {StudentStatusLabels[status]}
        </Badge>
      );
    }
    case "text":
    default:
      return <span className="text-sm">{value as string}</span>;
  }
};

export default function StudentsPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [students, setStudents] = useState<Student[]>([]);
  const [, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const [moduleActions, setModuleActions] = useState<ActionType[]>([]);

  // Get user data from store
  const { user } = useAppStore();

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setStudents((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Fetch students data on component mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await studentService.getStudents({
          limit: 100,
        });

        if (response.success && response.data) {
          setStudents(response.data.data);
        } else {
          setStudents([]);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        // Fallback to empty data on error
        setStudents([]);
        toast.error("Error loading students");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []); // Only run on mount

  // Fetch module actions when user is available
  useEffect(() => {
    const fetchModuleActions = async () => {
      if (!user?.role) {
        return;
      }

      try {
        const response = await roleService.getRoleActions(
          user.role,
          ModuleName.STUDENT
        );

        if (response.success && response.data) {
          setModuleActions(response.data.actions || []);
        } else {
          setModuleActions([]);
          if (response.message) {
            toast.error(`Failed to fetch permissions: ${response.message}`);
          } else {
            toast.error(
              "Failed to fetch module actions - no permissions data received"
            );
          }
        }
      } catch (error) {
        setModuleActions([]);
        toast.error(
          `Failed to fetch module actions: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    };

    fetchModuleActions();
  }, [user]); // Run when user changes

  // Refresh students data
  const refreshStudents = async () => {
    try {
      setLoading(true);
      const response = await studentService.getStudents({
        limit: 100,
      });

      if (response.success && response.data) {
        setStudents(response.data.data);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error("Error refreshing students:", error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle opening modal for adding new student
  const handleAddStudent = () => {
    setSelectedStudent(null);
    setIsModalOpen(true);
  };

  // Handle opening modal for editing student
  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  // Handle opening modal for viewing student details
  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsViewMode(true);
    setIsModalOpen(true);
  };

  // Handle closing modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
    setIsViewMode(false);
  };

  // Handle successful form submission
  const handleModalSuccess = () => {
    refreshStudents();
  };

  // Handle delete confirmation
  const handleDeleteClick = (student: Student) => {
    setStudentToDelete(student);
    setIsDeleteDialogOpen(true);
  };

  // Handle confirmed delete
  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;

    try {
      const response = await studentService.deleteStudent(studentToDelete.id);
      if (response.success) {
        toast.success("Student deleted successfully");
        refreshStudents();
      } else {
        toast.error("Failed to delete student");
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error("Error deleting student");
    } finally {
      setIsDeleteDialogOpen(false);
      setStudentToDelete(null);
    }
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setStudentToDelete(null);
  };

  // Check if action is available in module actions
  const canPerformAction = useMemo(() => {
    return (action: ActionType): boolean => {
      return moduleActions.includes(action);
    };
  }, [moduleActions]);

  // Filter students based on search term and status
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch = student.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || student.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [students, searchTerm, statusFilter]);

  // Table columns definition
  const columns: ColumnDef<Student>[] = useMemo(
    () => [
      {
        id: "drag",
        header: "",
        cell: () => <DragHandle />,
        enableSorting: false,
        enableHiding: false,
        size: 40,
        maxSize: 40,
      },
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <div className="text-left">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
        size: 50,
        maxSize: 50,
      },
      {
        id: "avatar",
        accessorFn: (row) => row.name,
        header: "Avatar",
        cell: ({ row }) => {
          const name = row.getValue("name") as string;
          const initials = name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
          return (
            <div className="text-left">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
            </div>
          );
        },
        enableSorting: false,
        size: 60,
        maxSize: 60,
      },
      {
        accessorKey: "name",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="cursor-pointer"
            >
              Name
              <ArrowUpDown className="ml-2 h-2 w-2" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="text-left">
            <div className="flex flex-col">
              <div className="font-medium">{row.getValue("name")}</div>
              <div className="text-sm text-muted-foreground">
                {row.original.email}
              </div>
            </div>
          </div>
        ),
        size: 200,
        minSize: 150,
      },

      {
        accessorKey: "status",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="cursor-pointer"
            >
              Status
              <ArrowUpDown className="ml-2 h-2 w-2" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="text-left">
            <TableCellViewer value={row.getValue("status")} type="status" />
          </div>
        ),
        size: 100,
        maxSize: 100,
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => (
          <div className="text-left">
            <TableCellViewer value={row.getValue("phone")} type="phone" />
          </div>
        ),
        size: 130,
        maxSize: 130,
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="cursor-pointer"
            >
              Created
              <ArrowUpDown className="ml-2 h-2 w-2" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const date = new Date(row.getValue("createdAt"));
          return <div className="text-left">{date.toLocaleDateString()}</div>;
        },
        size: 110,
        maxSize: 110,
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const student = row.original;

          return (
            <div className="text-left">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-8 w-8 p-0 cursor-pointer"
                  >
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(student.email);
                        toast.success("Email copied to clipboard");
                      } catch (error) {
                        console.error("Failed to copy email:", error);
                        toast.error("Failed to copy email");
                      }
                    }}
                    className="cursor-pointer"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy email
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {canPerformAction(ActionType.READ) && (
                    <DropdownMenuItem
                      onClick={() => handleViewStudent(student)}
                      className="cursor-pointer"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View details
                    </DropdownMenuItem>
                  )}
                  {canPerformAction(ActionType.UPDATE) && (
                    <DropdownMenuItem
                      onClick={() => handleEditStudent(student)}
                      className="cursor-pointer"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit student
                    </DropdownMenuItem>
                  )}
                  {canPerformAction(ActionType.DELETE) && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(student)}
                        className="text-red-600 cursor-pointer"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete student
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
        size: 70,
        maxSize: 70,
      },
    ],
    [canPerformAction]
  );

  // Table instance
  const table = useReactTable({
    data: filteredStudents,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full px-4 py-2">
      <div className="space-y-4">
        {/* Filters and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="max-w-sm cursor-pointer"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] cursor-pointer">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value={StudentStatus.ACTIVE}>
                  Active
                </SelectItem>
                <SelectItem value={StudentStatus.INACTIVE}>
                  Inactive
                </SelectItem>
                <SelectItem value={StudentStatus.SUSPENDED}>
                  Suspended
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            {table.getFilteredSelectedRowModel().rows.length > 0 &&
              canPerformAction(ActionType.READ) && (
                <Button
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => {
                    // TODO: Implement CSV export functionality
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              )}
            {canPerformAction(ActionType.CREATE) && (
              <Button className="cursor-pointer" onClick={handleAddStudent}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Student
              </Button>
            )}
          </div>
        </div>
        <div className="rounded-md border">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <Table style={{ tableLayout: "fixed", width: "100%" }}>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead
                          key={header.id}
                          className="text-left"
                          style={{ width: header.getSize() }}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={filteredStudents.map((student) => student.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <SortableTableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No students found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="cursor-pointer"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="cursor-pointer"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Student Modal */}
      <StudentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        student={selectedStudent}
        onSuccess={handleModalSuccess}
        isReadOnly={isViewMode}
        userCenterId={user?.centerId}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              student <strong>{studentToDelete?.name}</strong> and remove all
              associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleCancelDelete}
              className="cursor-pointer"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 cursor-pointer"
            >
              Delete Student
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
