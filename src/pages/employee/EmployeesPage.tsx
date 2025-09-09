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
import type { Employee } from "@/api/employeeTypes";
import {
  EmployeeRole,
  EmployeeStatus,
  EmployeeRoleLabels,
  EmployeeStatusLabels,
  EmployeeStatusColors,
} from "@/api/employeeTypes";
import { employeeService } from "@/api/employeeService";
import { toast } from "sonner";
import EmployeeModal from "./EmployeeModal";
import { useAppStore } from "@/stores/appStore";

// Drag handle component
const DragHandle = () => (
  <div className="cursor-move p-1 text-muted-foreground hover:text-foreground">
    <GripVertical className="h-4 w-4" />
  </div>
);

// Sortable table row component
const SortableTableRow = ({ row }: { row: Row<Employee> }) => {
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
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      data-state={row.getIsSelected() && "selected"}
      className={`hover:bg-muted/50 ${isDragging ? "opacity-50" : ""}`}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell
          key={cell.id}
          className="text-left"
          style={{ width: cell.column.getSize() }}
        >
          {cell.column.id === "drag" ? (
            <div {...attributes} {...listeners}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
  switch (type) {
    case "avatar":
      return (
        <Avatar className="h-8 w-8">
          <AvatarImage src={value as string} alt="Employee" />
          <AvatarFallback>EM</AvatarFallback>
        </Avatar>
      );
    case "status":
      return (
        <Badge className={EmployeeStatusColors[value as EmployeeStatus]}>
          {EmployeeStatusLabels[value as EmployeeStatus]}
        </Badge>
      );
    case "role":
      return (
        <Badge variant="outline">
          {EmployeeRoleLabels[value as EmployeeRole]}
        </Badge>
      );
    case "salary":
      return value ? `$${(value as number).toLocaleString()}` : "N/A";
    case "phone":
      return (value as string) || "N/A";
    case "location": {
      const locationValue = value as {
        city?: string;
        state?: string;
        country?: string;
      };
      const parts = [
        locationValue.city,
        locationValue.state,
        locationValue.country,
      ].filter(Boolean);
      return parts.length > 0 ? parts.join(", ") : "N/A";
    }
    default:
      return (value as string) || "N/A";
  }
};

export default function EmployeesPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [isViewMode, setIsViewMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(
    null
  );

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
      setEmployees((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Fetch employees data on component mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await employeeService.getEmployees({
          limit: 100,
        });

        console.log("API Response:", response);
        console.log("Response structure:", {
          success: response.success,
          data: response.data,
          employees: response.data?.data,
          dataType: typeof response.data,
          employeesType: typeof response.data?.data,
          isArray: Array.isArray(response.data?.data),
        });

        if (response.success && response.data) {
          toast.success("Employees loaded successfully");
          setEmployees(response.data.data);
        } else {
          setEmployees([]);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
        // Fallback to sample data on error
        setEmployees([]);
        toast.error("Error loading employees, using sample data");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []); // Only run on mount

  // Refresh employees data
  const refreshEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeeService.getEmployees({
        limit: 100,
      });

      if (response.success && response.data) {
        setEmployees(response.data.data);
      } else {
        setEmployees([]);
      }
    } catch (error) {
      console.error("Error refreshing employees:", error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle opening modal for adding new employee
  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setIsModalOpen(true);
  };

  // Handle opening modal for editing employee
  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  // Handle opening modal for viewing employee details
  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsViewMode(true);
    setIsModalOpen(true);
  };

  // Handle closing modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
    setIsViewMode(false);
  };

  // Handle successful form submission
  const handleModalSuccess = () => {
    refreshEmployees();
  };

  // Handle delete confirmation
  const handleDeleteClick = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setIsDeleteDialogOpen(true);
  };

  // Handle confirmed delete
  const handleConfirmDelete = async () => {
    if (!employeeToDelete) return;

    try {
      const response = await employeeService.deleteEmployee(
        employeeToDelete.id
      );

      if (response.success) {
        toast.success("Employee deleted successfully");
        refreshEmployees();
      } else {
        toast.error("Failed to delete employee");
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast.error("Failed to delete employee");
    } finally {
      setIsDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    }
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setEmployeeToDelete(null);
  };

  // Define columns
  const columns: ColumnDef<Employee>[] = useMemo(
    () => [
      {
        accessorKey: "drag",
        header: "",
        cell: () => (
          <div className="text-left">
            <DragHandle />
          </div>
        ),
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
        accessorKey: "role",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="cursor-pointer"
            >
              Role
              <ArrowUpDown className="ml-2 h-2 w-2" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="text-left">
            <TableCellViewer value={row.getValue("role")} type="role" />
          </div>
        ),
        size: 120,
        maxSize: 120,
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
          const employee = row.original;

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
                        await navigator.clipboard.writeText(employee.email);
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
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => handleViewEmployee(employee)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View details
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => handleEditEmployee(employee)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit employee
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600 cursor-pointer"
                    onClick={() => handleDeleteClick(employee)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete employee
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
        size: 60,
        maxSize: 60,
      },
    ],
    []
  );

  // Filter employees based on search and filters
  const filteredEmployees = useMemo(() => {
    console.log("Current employees state:", employees);

    if (!employees || !Array.isArray(employees)) {
      console.log("Employees is not an array, returning empty array");
      return [];
    }

    console.log("Filtering employees:", employees.length, "items");

    return employees.filter((employee) => {
      const matchesSearch =
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || employee.status === statusFilter;
      const matchesRole = roleFilter === "all" || employee.role === roleFilter;

      console.log("Filtering employee:", {
        name: employee.name,
        status: employee.status,
        role: employee.role,
        searchTerm,
        statusFilter,
        roleFilter,
        matchesSearch,
        matchesStatus,
        matchesRole,
        finalMatch: matchesSearch && matchesStatus && matchesRole,
      });

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [employees, searchTerm, statusFilter, roleFilter]);

  const table = useReactTable({
    data: filteredEmployees,
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

  // Debug table data
  console.log("Table rows:", table.getRowModel().rows);
  console.log("Filtered employees count:", filteredEmployees.length);

  return (
    <div className="w-full px-4 py-2">
      <div>
        <div>
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] cursor-pointer">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value={EmployeeStatus.ACTIVE}>Active</SelectItem>
                  <SelectItem value={EmployeeStatus.INACTIVE}>
                    Inactive
                  </SelectItem>
                  <SelectItem value={EmployeeStatus.SUSPENDED}>
                    Suspended
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px] cursor-pointer">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value={EmployeeRole.INSTRUCTOR}>
                    Instructor
                  </SelectItem>
                  <SelectItem value={EmployeeRole.OPERATOR}>
                    Operator
                  </SelectItem>
                  <SelectItem value={EmployeeRole.ADMIN}>Admin</SelectItem>
                  <SelectItem value={EmployeeRole.SUPERADMIN}>
                    Super Admin
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              {table.getFilteredSelectedRowModel().rows.length > 0 && (
                <Button
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => {
                    // TODO: Implement CSV export functionality
                    console.log("Export clicked");
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              )}
              <Button className="cursor-pointer" onClick={handleAddEmployee}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Employee
              </Button>
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
                      items={filteredEmployees.map((emp) => emp.id)}
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
                        No employees found.
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
      </div>

      {/* Employee Modal */}
      <EmployeeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        employee={selectedEmployee}
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
              employee <strong>{employeeToDelete?.name}</strong> and remove all
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
              Delete Employee
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
