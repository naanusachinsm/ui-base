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
  UserPlus,
  Download,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
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
import type { Enrollment } from "@/api/enrollmentTypes";
import {
  EnrollmentStatus,
  EnrollmentStatusLabels,
  EnrollmentStatusColors,
} from "@/api/enrollmentTypes";
import { enrollmentService } from "@/api/enrollmentService";
import { roleService } from "@/api/roleService";
import { ActionType, ModuleName } from "@/api/roleTypes";
import { toast } from "sonner";
import EnrollmentModal from "./EnrollmentModal";
import { useAppStore } from "@/stores/appStore";

// Simple table row component (no drag functionality)
const SimpleTableRow = ({ row }: { row: Row<Enrollment> }) => {
  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      className="hover:bg-muted/50"
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell
          key={cell.id}
          className="text-left"
          style={{ width: cell.column.getSize() }}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
};

// Table cell viewer component
const TableCellViewer = ({ value, type }: { value: unknown; type: string }) => {
  switch (type) {
    case "status":
      return (
        <Badge className={EnrollmentStatusColors[value as EnrollmentStatus]}>
          {EnrollmentStatusLabels[value as EnrollmentStatus]}
        </Badge>
      );
    case "date":
      return value ? new Date(value as string).toLocaleDateString() : "N/A";
    case "student":
      return (value as string) || "N/A";
    case "cohort":
      return (value as string) || "N/A";
    default:
      return (value as string) || "N/A";
  }
};

export default function EnrollmentsPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  // Debug enrollments state changes
  useEffect(() => {
    console.log("Enrollments state changed:", {
      enrollments,
      length: enrollments.length,
      firstEnrollment: enrollments[0],
    });
  }, [enrollments]);
  const [, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] =
    useState<Enrollment | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [enrollmentToDelete, setEnrollmentToDelete] =
    useState<Enrollment | null>(null);

  const [moduleActions, setModuleActions] = useState<ActionType[]>([]);

  // Get user data from store
  const { user } = useAppStore();

  // Fetch enrollments data on component mount and when pagination/filters change
  useEffect(() => {
    let isCancelled = false;

    const fetchEnrollments = async () => {
      try {
        setLoading(true);
        console.log("Fetching enrollments from API...");
        const response = await enrollmentService.getEnrollments({
          page: currentPage,
          limit: pageSize,
          search: searchTerm || undefined,
          status:
            statusFilter !== "all"
              ? (statusFilter as EnrollmentStatus)
              : undefined,
        });

        console.log("Enrollment API response:", response);

        // Only update state if component is still mounted
        if (!isCancelled) {
          if (response.success && response.data) {
            console.log("Setting enrollments from API:", response.data.data);
            console.log("First enrollment structure:", response.data.data[0]);
            console.log(
              "First enrollment keys:",
              Object.keys(response.data.data[0] || {})
            );
            console.log(
              "First enrollment student:",
              response.data.data[0]?.student
            );
            console.log(
              "First enrollment cohort:",
              response.data.data[0]?.cohort
            );
            setEnrollments(response.data.data);
            setTotalPages(response.data.totalPages);
            setTotalItems(response.data.total);
          } else {
            console.log("API response failed, no data available");
            setEnrollments([]);
            setTotalPages(0);
            setTotalItems(0);
            toast.error("No enrollment data available");
          }
        }
      } catch (error) {
        console.error("Error fetching enrollments:", error);
        // Handle error without fallback data
        if (!isCancelled) {
          console.log("API error, no data available");
          setEnrollments([]);
          setTotalPages(0);
          setTotalItems(0);
          toast.error("Failed to load enrollment data");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchEnrollments();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isCancelled = true;
    };
  }, [currentPage, pageSize, searchTerm, statusFilter]); // Run when pagination or filters change

  // Fetch module actions when user is available
  useEffect(() => {
    const fetchModuleActions = async () => {
      if (!user?.role) {
        return;
      }

      try {
        const response = await roleService.getRoleActions(
          user.role,
          ModuleName.ENROLLMENT
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

  // Refresh enrollments data
  const refreshEnrollments = async () => {
    try {
      setLoading(true);
      const response = await enrollmentService.getEnrollments({
        page: currentPage,
        limit: pageSize,
        search: searchTerm || undefined,
        status:
          statusFilter !== "all"
            ? (statusFilter as EnrollmentStatus)
            : undefined,
      });

      if (response.success && response.data) {
        setEnrollments(response.data.data);
        setTotalPages(response.data.totalPages);
        setTotalItems(response.data.total);
      } else {
        setEnrollments([]);
        setTotalPages(0);
        setTotalItems(0);
        toast.error("No enrollment data available");
      }
    } catch (error) {
      console.error("Error refreshing enrollments:", error);
      setEnrollments([]);
      setTotalPages(0);
      setTotalItems(0);
      toast.error("Failed to refresh enrollment data");
    } finally {
      setLoading(false);
    }
  };

  // Handle opening modal for adding new enrollment
  const handleAddEnrollment = () => {
    setSelectedEnrollment(null);
    setIsModalOpen(true);
  };

  // Handle opening modal for editing enrollment
  const handleEditEnrollment = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  // Handle opening modal for viewing enrollment details
  const handleViewEnrollment = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setIsViewMode(true);
    setIsModalOpen(true);
  };

  // Handle closing modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEnrollment(null);
    setIsViewMode(false);
  };

  // Handle successful form submission
  const handleModalSuccess = () => {
    refreshEnrollments();
  };

  // Handle delete confirmation
  const handleDeleteClick = (enrollment: Enrollment) => {
    setEnrollmentToDelete(enrollment);
    setIsDeleteDialogOpen(true);
  };

  // Handle confirmed delete
  const handleConfirmDelete = async () => {
    if (!enrollmentToDelete) return;

    try {
      const response = await enrollmentService.deleteEnrollment(
        enrollmentToDelete.id
      );

      if (response.success) {
        toast.success("Enrollment deleted successfully");
        refreshEnrollments();
      } else {
        toast.error("Failed to delete enrollment");
      }
    } catch (error) {
      console.error("Error deleting enrollment:", error);
      toast.error("Failed to delete enrollment");
    } finally {
      setIsDeleteDialogOpen(false);
      setEnrollmentToDelete(null);
    }
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setEnrollmentToDelete(null);
  };

  // Check if action is available in module actions
  const canPerformAction = useMemo(() => {
    return (action: ActionType): boolean => {
      return moduleActions.includes(action);
    };
  }, [moduleActions]);

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

  // Define columns
  const columns: ColumnDef<Enrollment>[] = useMemo(
    () => [
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
        accessorKey: "student",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="cursor-pointer"
            >
              Student
              <ArrowUpDown className="ml-2 h-2 w-2" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const studentName = row.original.student?.name || "Unknown Student";
          const studentEmail = row.original.student?.email;

          return (
            <div className="text-left min-w-0">
              <div className="flex flex-col">
                <div className="font-medium truncate" title={studentName}>
                  {studentName}
                </div>
                {studentEmail && (
                  <div
                    className="text-sm text-muted-foreground truncate"
                    title={studentEmail}
                  >
                    {studentEmail}
                  </div>
                )}
              </div>
            </div>
          );
        },
        size: 140,
        minSize: 120,
        maxSize: 160,
      },
      {
        accessorKey: "cohort",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="cursor-pointer"
            >
              Cohort
              <ArrowUpDown className="ml-2 h-2 w-2" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const cohortName = row.original.cohort?.name || "Unknown Cohort";
          const cohortCode = row.original.cohort?.code;

          return (
            <div className="text-left min-w-0">
              <div className="flex flex-col">
                <div className="font-medium truncate" title={cohortName}>
                  {cohortName}
                </div>
                {cohortCode && (
                  <div
                    className="text-sm text-muted-foreground truncate"
                    title={cohortCode}
                  >
                    {cohortCode}
                  </div>
                )}
              </div>
            </div>
          );
        },
        size: 150,
        minSize: 120,
        maxSize: 180,
      },
      {
        accessorKey: "enrollmentDate",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="cursor-pointer"
            >
              Enrollment Date
              <ArrowUpDown className="ml-2 h-2 w-2" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="text-left">
            <TableCellViewer
              value={row.getValue("enrollmentDate")}
              type="date"
            />
          </div>
        ),
        size: 110,
        minSize: 100,
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
        size: 90,
        minSize: 80,
        maxSize: 100,
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
        size: 100,
        minSize: 90,
        maxSize: 110,
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const enrollment = row.original;

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
                        await navigator.clipboard.writeText(
                          enrollment.id.toString()
                        );
                        toast.success("Enrollment ID copied to clipboard");
                      } catch (error) {
                        console.error("Failed to copy enrollment ID:", error);
                        toast.error("Failed to copy enrollment ID");
                      }
                    }}
                    className="cursor-pointer"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy ID
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {canPerformAction(ActionType.READ) && (
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => handleViewEnrollment(enrollment)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View details
                    </DropdownMenuItem>
                  )}
                  {canPerformAction(ActionType.UPDATE) && (
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => handleEditEnrollment(enrollment)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit enrollment
                    </DropdownMenuItem>
                  )}
                  {canPerformAction(ActionType.DELETE) && (
                    <DropdownMenuItem
                      className="text-red-600 cursor-pointer"
                      onClick={() => handleDeleteClick(enrollment)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete enrollment
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
        size: 60,
        maxSize: 60,
      },
    ],
    [canPerformAction]
  );

  // Use enrollments directly since filtering is now server-side
  const filteredEnrollments = enrollments;

  const table = useReactTable({
    data: filteredEnrollments,
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
  console.log("Table debug info:", {
    filteredEnrollmentsLength: filteredEnrollments.length,
    tableRowsLength: table.getRowModel().rows.length,
    tableRowModel: table.getRowModel(),
    columnsLength: columns.length,
  });

  return (
    <div className="w-full px-4 py-2">
      <div>
        <div>
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Search enrollments..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={handleStatusFilterChange}
              >
                <SelectTrigger className="w-[180px] cursor-pointer">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value={EnrollmentStatus.ENROLLED}>
                    Enrolled
                  </SelectItem>
                  <SelectItem value={EnrollmentStatus.COMPLETED}>
                    Completed
                  </SelectItem>
                  <SelectItem value={EnrollmentStatus.DROPPED}>
                    Dropped
                  </SelectItem>
                  <SelectItem value={EnrollmentStatus.PENDING}>
                    Pending
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              {table.getFilteredSelectedRowModel().rows.length > 0 &&
                canPerformAction(ActionType.EXPORT) && (
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
                <Button
                  className="cursor-pointer"
                  onClick={handleAddEnrollment}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Enrollment
                </Button>
              )}
            </div>
          </div>
          <div className="rounded-md border">
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
                  table
                    .getRowModel()
                    .rows.map((row) => (
                      <SimpleTableRow key={row.id} row={row} />
                    ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No enrollments found.
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
              enrollments
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
        </div>
      </div>

      {/* Enrollment Modal */}
      <EnrollmentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        enrollment={selectedEnrollment}
        onSuccess={handleModalSuccess}
        isReadOnly={isViewMode}
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
              enrollment for{" "}
              <strong>{enrollmentToDelete?.student?.name}</strong> in cohort{" "}
              <strong>{enrollmentToDelete?.cohort?.name}</strong> and remove all
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
              Delete Enrollment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
