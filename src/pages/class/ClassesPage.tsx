/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useEffect } from "react";
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
  Calendar,
  Copy,
  Clock,
  Users,
  MapPin,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import type { Class } from "@/api/classTypes";
import {
  ClassStatus,
  ClassStatusLabels,
  ClassStatusColors,
  ClassMode,
  ClassModeLabels,
  ClassModeColors,
} from "@/api/classTypes";
import { classService } from "@/api/classService";
import { roleService } from "@/api/roleService";
import { ActionType, ModuleName } from "@/api/roleTypes";
import { toast } from "sonner";
import { useAppStore } from "@/stores/appStore";
import ClassModal from "./ClassModal";

// Simple table row component
const SimpleTableRow = ({ row }: { row: Row<Class> }) => {
  return (
    <TableRow data-state={row.getIsSelected() && "selected"}>
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
};

const TableCellViewer = ({ value, type }: { value: any; type: string }) => {
  switch (type) {
    case "status":
      return (
        <Badge
          variant="outline"
          className={ClassStatusColors[value as ClassStatus]}
        >
          {ClassStatusLabels[value as ClassStatus]}
        </Badge>
      );
    case "mode":
      return (
        <Badge
          variant="outline"
          className={ClassModeColors[value as ClassMode]}
        >
          {ClassModeLabels[value as ClassMode]}
        </Badge>
      );
    case "avatar":
      return (
        <Avatar className="h-8 w-8">
          <AvatarImage src={value} alt="Class" />
          <AvatarFallback>
            <Calendar className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      );
    case "date":
      return (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {new Date(value).toLocaleDateString()}
          </span>
        </div>
      );
    case "datetime":
      return (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{new Date(value).toLocaleString()}</span>
        </div>
      );
    case "cohort":
      return (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{value?.name || "N/A"}</span>
        </div>
      );
    case "instructor":
      return (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{value?.name || "N/A"}</span>
        </div>
      );
    case "center":
      return (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{value?.name || "N/A"}</span>
        </div>
      );
    case "meetingUrl":
      return value ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open(value, "_blank")}
          className="h-8 w-8 p-0 cursor-pointer"
        >
          <Video className="h-4 w-4" />
        </Button>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    default:
      return <span className="text-sm">{value || "-"}</span>;
  }
};

export default function ClassesPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [classes, setClasses] = useState<Class[]>([]);
  const [, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [modeFilter, setModeFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const [moduleActions, setModuleActions] = useState<ActionType[]>([]);

  // Get user data from store
  const { user } = useAppStore();

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(Number(newPageSize));
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Handle search with debouncing
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Handle mode filter change
  const handleModeFilterChange = (value: string) => {
    setModeFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Fetch classes data on component mount and when pagination/filters change
  useEffect(() => {
    const fetchClasses = async () => {
      if (!user?.centerId) {
        return;
      }

      try {
        setLoading(true);
        const response = await classService.getClasses({
          page: currentPage,
          limit: pageSize,
          search: searchTerm || undefined,
          status: statusFilter !== "all" ? (statusFilter as any) : undefined,
          mode: modeFilter !== "all" ? (modeFilter as any) : undefined,
          centerId: user?.centerId,
        });

        if (response.success && response.data) {
          setClasses(response.data.data);
          setTotalPages(response.data.totalPages);
          setTotalItems(response.data.total);
        } else {
          setClasses([]);
          setTotalPages(0);
          setTotalItems(0);
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
        setClasses([]);
        setTotalPages(0);
        setTotalItems(0);
        toast.error("Failed to fetch classes");
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [
    currentPage,
    pageSize,
    searchTerm,
    statusFilter,
    modeFilter,
    user?.centerId,
  ]);

  // Fetch module actions when user is available
  useEffect(() => {
    const fetchModuleActions = async () => {
      if (!user?.role) {
        return;
      }

      try {
        const response = await roleService.getRoleActions(
          user.role,
          ModuleName.CLASS
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
  }, [user]);

  // Refresh classes data
  const refreshClasses = async () => {
    try {
      setLoading(true);
      const response = await classService.getClasses({
        page: currentPage,
        limit: pageSize,
        search: searchTerm || undefined,
        status: statusFilter !== "all" ? (statusFilter as any) : undefined,
        mode: modeFilter !== "all" ? (modeFilter as any) : undefined,
        centerId: user?.centerId,
      });

      if (response.success && response.data) {
        setClasses(response.data.data);
        setTotalPages(response.data.totalPages);
        setTotalItems(response.data.total);
      } else {
        setClasses([]);
        setTotalPages(0);
        setTotalItems(0);
      }
    } catch (error) {
      console.error("Error refreshing classes:", error);
      setClasses([]);
      setTotalPages(0);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  // Handle opening modal for adding new class
  const handleAddClass = () => {
    setSelectedClass(null);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  // Handle opening modal for viewing class
  const handleViewClass = (classItem: Class) => {
    setSelectedClass(classItem);
    setIsViewMode(true);
    setIsModalOpen(true);
  };

  // Handle opening modal for editing class
  const handleEditClass = (classItem: Class) => {
    setSelectedClass(classItem);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  // Handle opening delete dialog
  const handleDeleteClass = (classItem: Class) => {
    setClassToDelete(classItem);
    setIsDeleteDialogOpen(true);
  };

  // Handle confirming delete
  const handleConfirmDelete = async () => {
    if (!classToDelete) return;

    try {
      const response = await classService.deleteClass(classToDelete.id);

      if (response.success) {
        toast.success("Class deleted successfully");
        await refreshClasses();
      } else {
        toast.error(response.message || "Failed to delete class");
      }
    } catch (error) {
      console.error("Error deleting class:", error);
      toast.error("Failed to delete class");
    } finally {
      setIsDeleteDialogOpen(false);
      setClassToDelete(null);
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedClass(null);
    setIsViewMode(false);
  };

  // Handle modal success
  const handleModalSuccess = async () => {
    await refreshClasses();
    handleModalClose();
  };

  // Handle copy class
  const handleCopyClass = (classItem: Class) => {
    const classToCopy = { ...classItem };
    delete (classToCopy as any).id;
    delete (classToCopy as any).createdAt;
    delete (classToCopy as any).updatedAt;
    delete (classToCopy as any).deletedAt;
    delete (classToCopy as any).createdBy;
    delete (classToCopy as any).updatedBy;
    delete (classToCopy as any).deletedBy;
    classToCopy.name = `${classItem.name} (Copy)`;

    setSelectedClass(classToCopy as Class);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  // Define columns
  const columns: ColumnDef<Class>[] = useMemo(
    () => [
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
              Class Name
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("name")}</div>
        ),
      },
      {
        accessorKey: "cohort",
        header: "Cohort",
        cell: ({ row }) => {
          const cohort = row.original.cohort;
          const cohortName = cohort?.name || "N/A";
          return (
            <div className="flex items-center gap-2 max-w-[200px]">
              <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm truncate" title={cohortName}>
                {cohortName}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "instructor",
        header: "Instructor",
        cell: ({ row }) => {
          const instructor = row.original.instructor;
          const instructorName = instructor?.name || "N/A";
          return (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{instructorName}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "mode",
        header: "Mode",
        cell: ({ row }) => (
          <TableCellViewer value={row.getValue("mode")} type="mode" />
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <TableCellViewer value={row.getValue("status")} type="status" />
        ),
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const classItem = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() =>
                    navigator.clipboard.writeText(classItem.id.toString())
                  }
                  className="cursor-pointer"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {moduleActions.includes(ActionType.READ) && (
                  <DropdownMenuItem
                    onClick={() => handleViewClass(classItem)}
                    className="cursor-pointer"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View details
                  </DropdownMenuItem>
                )}
                {moduleActions.includes(ActionType.UPDATE) && (
                  <DropdownMenuItem
                    onClick={() => handleEditClass(classItem)}
                    className="cursor-pointer"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit class
                  </DropdownMenuItem>
                )}
                {moduleActions.includes(ActionType.CREATE) && (
                  <DropdownMenuItem
                    onClick={() => handleCopyClass(classItem)}
                    className="cursor-pointer"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate class
                  </DropdownMenuItem>
                )}
                {moduleActions.includes(ActionType.DELETE) && (
                  <DropdownMenuItem
                    onClick={() => handleDeleteClass(classItem)}
                    className="text-red-600 cursor-pointer"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete class
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [moduleActions]
  );

  const table = useReactTable({
    data: classes,
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
              placeholder="Search classes..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="max-w-sm"
            />
            <Select
              value={statusFilter}
              onValueChange={handleStatusFilterChange}
            >
              <SelectTrigger className="w-[180px] cursor-pointer">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value={ClassStatus.SCHEDULED}>Scheduled</SelectItem>
                <SelectItem value={ClassStatus.COMPLETED}>Completed</SelectItem>
                <SelectItem value={ClassStatus.CANCELLED}>Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={modeFilter} onValueChange={handleModeFilterChange}>
              <SelectTrigger className="w-[180px] cursor-pointer">
                <SelectValue placeholder="Filter by mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modes</SelectItem>
                <SelectItem value={ClassMode.ONLINE}>Online</SelectItem>
                <SelectItem value={ClassMode.IN_PERSON}>In Person</SelectItem>
                <SelectItem value={ClassMode.HYBRID}>Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {moduleActions.includes(ActionType.CREATE) && (
            <Button onClick={handleAddClass} className="cursor-pointer">
              <Calendar className="mr-2 h-4 w-4" />
              Add Class
            </Button>
          )}
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
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
                table
                  .getRowModel()
                  .rows.map((row) => <SimpleTableRow key={row.id} row={row} />)
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No classes found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between py-4">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, totalItems)} of {totalItems}{" "}
            classes
          </div>
          <div className="flex items-center space-x-4">
            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {/* Show page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => handlePageChange(pageNum)}
                          isActive={currentPage === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Show:</span>
              <Select
                value={pageSize.toString()}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="w-[80px] cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Class Modal */}
        <ClassModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          class={selectedClass}
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
                class "{classToDelete?.name}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="cursor-pointer">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                className="cursor-pointer"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
