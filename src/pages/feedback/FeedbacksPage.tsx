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
  Download,
  Copy,
  Star,
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
import type { Feedback } from "@/api/feedbackTypes";
import {
  FeedbackStatus,
  FeedbackStatusLabels,
  FeedbackStatusColors,
} from "@/api/feedbackTypes";
import { feedbackService } from "@/api/feedbackService";
import { roleService } from "@/api/roleService";
import { ActionType, ModuleName } from "@/api/roleTypes";
import { toast } from "sonner";
import FeedbackModal from "./FeedbackModal";
import { useAppStore } from "@/stores/appStore";

// Simple table row component
const SimpleTableRow = ({ row }: { row: Row<Feedback> }) => {
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
        <Badge className={FeedbackStatusColors[value as FeedbackStatus]}>
          {FeedbackStatusLabels[value as FeedbackStatus]}
        </Badge>
      );
    case "date":
      return value ? new Date(value as string).toLocaleDateString() : "N/A";
    case "rating":
      const rating =
        typeof value === "number" ? value : parseFloat(value as string) || 0;
      return (
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="font-medium">{rating.toFixed(1)}</span>
        </div>
      );
    case "comment":
      const comment = (value as string) || "";
      return comment.length > 50
        ? `${comment.substring(0, 50)}...`
        : comment || "N/A";
    default:
      return (value as string) || "N/A";
  }
};

export default function FeedbacksPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  const [, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
    null
  );

  const [moduleActions, setModuleActions] = useState<ActionType[]>([]);

  // Get user data from store
  const { user } = useAppStore();

  // Fetch feedbacks data on component mount and when pagination/filters change
  useEffect(() => {
    let isCancelled = false;

    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        const response = await feedbackService.getFeedbacks({
          page: currentPage,
          limit: pageSize,
          search: searchTerm || undefined,
          status:
            statusFilter !== "all"
              ? (statusFilter as FeedbackStatus)
              : undefined,
        });

        // Only update state if component is still mounted
        if (!isCancelled) {
          if (response.success && response.data) {
            setFeedbacks(response.data.data);
            setTotalPages(response.data.totalPages);
            setTotalItems(response.data.total);
          } else {
            setFeedbacks([]);
            setTotalPages(0);
            setTotalItems(0);
            toast.error("No feedback data available");
          }
        }
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
        // Handle error without fallback data
        if (!isCancelled) {
          setFeedbacks([]);
          setTotalPages(0);
          setTotalItems(0);
          toast.error("Failed to load feedback data");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchFeedbacks();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isCancelled = true;
    };
  }, [currentPage, pageSize, searchTerm, statusFilter]);

  // Fetch module actions when user is available
  useEffect(() => {
    const fetchModuleActions = async () => {
      if (!user?.role) {
        return;
      }

      try {
        const response = await roleService.getRoleActions(
          user.role,
          ModuleName.FEEDBACK
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

  // Refresh feedbacks data
  const refreshFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await feedbackService.getFeedbacks({
        page: currentPage,
        limit: pageSize,
        search: searchTerm || undefined,
        status:
          statusFilter !== "all" ? (statusFilter as FeedbackStatus) : undefined,
      });

      if (response.success && response.data) {
        setFeedbacks(response.data.data);
        setTotalPages(response.data.totalPages);
        setTotalItems(response.data.total);
      } else {
        setFeedbacks([]);
        setTotalPages(0);
        setTotalItems(0);
        toast.error("No feedback data available");
      }
    } catch (error) {
      console.error("Error refreshing feedbacks:", error);
      setFeedbacks([]);
      setTotalPages(0);
      setTotalItems(0);
      toast.error("Failed to refresh feedback data");
    } finally {
      setLoading(false);
    }
  };

  // Handle opening modal for viewing feedback
  const handleViewFeedback = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setIsModalOpen(true);
  };

  // Handle closing modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFeedback(null);
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
  const columns: ColumnDef<Feedback>[] = useMemo(
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
        accessorKey: "rating",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="cursor-pointer"
            >
              Rating
              <ArrowUpDown className="ml-2 h-2 w-2" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="text-left">
            <TableCellViewer value={row.getValue("rating")} type="rating" />
          </div>
        ),
        size: 100,
        minSize: 90,
        maxSize: 110,
      },
      {
        accessorKey: "comment",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="cursor-pointer"
            >
              Comment
              <ArrowUpDown className="ml-2 h-2 w-2" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="text-left">
            <TableCellViewer value={row.getValue("comment")} type="comment" />
          </div>
        ),
        size: 200,
        minSize: 150,
        maxSize: 250,
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
        cell: ({ row }) => (
          <div className="text-left">
            <TableCellViewer value={row.getValue("createdAt")} type="date" />
          </div>
        ),
        size: 100,
        minSize: 90,
        maxSize: 110,
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const feedback = row.original;

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
                        const feedbackData = {
                          id: feedback.id,
                          studentId: feedback.studentId,
                          courseId: feedback.courseId,
                          cohortId: feedback.cohortId,
                          rating: feedback.rating,
                          comment: feedback.comment,
                          description: feedback.description,
                          status: feedback.status,
                          createdAt: feedback.createdAt,
                          updatedAt: feedback.updatedAt,
                          student: {
                            id: feedback.student?.id,
                            name: feedback.student?.name,
                            email: feedback.student?.email,
                          },
                          course: {
                            id: feedback.course?.id,
                            name: feedback.course?.name,
                          },
                          cohort: {
                            id: feedback.cohort?.id,
                            name: feedback.cohort?.name,
                            code: feedback.cohort?.code,
                          },
                        };
                        await navigator.clipboard.writeText(
                          JSON.stringify(feedbackData, null, 2)
                        );
                        toast.success("Feedback data copied to clipboard");
                      } catch (error) {
                        console.error("Failed to copy feedback data:", error);
                        toast.error("Failed to copy feedback data");
                      }
                    }}
                    className="cursor-pointer"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Data
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {canPerformAction(ActionType.READ) && (
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => handleViewFeedback(feedback)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View details
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

  // Use feedbacks directly since filtering is now server-side
  const filteredFeedbacks = feedbacks;

  const table = useReactTable({
    data: filteredFeedbacks,
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
      <div>
        <div>
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Search feedbacks..."
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
                  <SelectItem value={FeedbackStatus.SUBMITTED}>
                    SUBMITTED
                  </SelectItem>
                  <SelectItem value={FeedbackStatus.REVIEWED}>
                    REVIEWED
                  </SelectItem>
                  <SelectItem value={FeedbackStatus.CLOSED}>CLOSED</SelectItem>
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
                      No feedbacks found.
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
              feedbacks
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

      {/* Feedback Modal */}
      {selectedFeedback && (
        <FeedbackModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          feedback={selectedFeedback}
        />
      )}
    </div>
  );
}
