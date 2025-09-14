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
  UserCheck,
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
import type { Enquiry } from "@/api/enquiryTypes";
import {
  EnquiryStatus,
  EnquirySource,
  EnquiryStatusLabels,
  EnquirySourceLabels,
  EnquiryStatusColors,
  EnquirySourceColors,
} from "@/api/enquiryTypes";
import { enquiryService } from "@/api/enquiryService";
import { roleService } from "@/api/roleService";
import { ActionType, ModuleName } from "@/api/roleTypes";
import { toast } from "sonner";
import { useAppStore } from "@/stores/appStore";
import { useNavigate } from "react-router-dom";

// Simple table row component
const SimpleTableRow = ({ row }: { row: Row<Enquiry> }) => {
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
        <Badge className={EnquiryStatusColors[value as EnquiryStatus]}>
          {EnquiryStatusLabels[value as EnquiryStatus]}
        </Badge>
      );
    case "source":
      return (
        <Badge className={EnquirySourceColors[value as EnquirySource]}>
          {EnquirySourceLabels[value as EnquirySource]}
        </Badge>
      );
    case "date":
      return value ? new Date(value as string).toLocaleDateString() : "N/A";
    case "phone":
      return (value as string) || "N/A";
    case "email":
      return (value as string) || "N/A";
    default:
      return (value as string) || "N/A";
  }
};

export default function EnquiriesPage() {
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);

  const [, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [enquiryToDelete, setEnquiryToDelete] = useState<Enquiry | null>(null);

  const [moduleActions, setModuleActions] = useState<ActionType[]>([]);

  // Get user data from store
  const { user } = useAppStore();

  // Fetch enquiries data on component mount and when pagination/filters change
  useEffect(() => {
    let isCancelled = false;

    const fetchEnquiries = async () => {
      try {
        setLoading(true);
        const response = await enquiryService.getEnquiries({
          page: currentPage,
          limit: pageSize,
          search: searchTerm || undefined,
          status:
            statusFilter !== "all"
              ? (statusFilter as EnquiryStatus)
              : undefined,
          source:
            sourceFilter !== "all"
              ? (sourceFilter as EnquirySource)
              : undefined,
        });

        // Only update state if component is still mounted
        if (!isCancelled) {
          if (response.success && response.data) {
            setEnquiries(response.data.data);
            setTotalPages(response.data.totalPages);
            setTotalItems(response.data.total);
          } else {
            setEnquiries([]);
            setTotalPages(0);
            setTotalItems(0);
            toast.error("No enquiry data available");
          }
        }
      } catch (error) {
        console.error("Error fetching enquiries:", error);
        // Handle error without fallback data
        if (!isCancelled) {
          setEnquiries([]);
          setTotalPages(0);
          setTotalItems(0);
          toast.error("Failed to load enquiry data");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchEnquiries();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isCancelled = true;
    };
  }, [currentPage, pageSize, searchTerm, statusFilter, sourceFilter]);

  // Fetch module actions when user is available
  useEffect(() => {
    const fetchModuleActions = async () => {
      if (!user?.role) {
        return;
      }

      try {
        const response = await roleService.getRoleActions(
          user.role,
          ModuleName.ENQUIRY
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

  // Refresh enquiries data
  const refreshEnquiries = async () => {
    try {
      setLoading(true);
      const response = await enquiryService.getEnquiries({
        page: currentPage,
        limit: pageSize,
        search: searchTerm || undefined,
        status:
          statusFilter !== "all" ? (statusFilter as EnquiryStatus) : undefined,
        source:
          sourceFilter !== "all" ? (sourceFilter as EnquirySource) : undefined,
      });

      if (response.success && response.data) {
        setEnquiries(response.data.data);
        setTotalPages(response.data.totalPages);
        setTotalItems(response.data.total);
      } else {
        setEnquiries([]);
        setTotalPages(0);
        setTotalItems(0);
        toast.error("No enquiry data available");
      }
    } catch (error) {
      console.error("Error refreshing enquiries:", error);
      setEnquiries([]);
      setTotalPages(0);
      setTotalItems(0);
      toast.error("Failed to refresh enquiry data");
    } finally {
      setLoading(false);
    }
  };

  // Handle opening modal for adding new enquiry
  const handleAddEnquiry = () => {
    navigate("/dashboard/enquiries/new");
  };

  // Handle opening modal for editing enquiry
  const handleEditEnquiry = (enquiry: Enquiry) => {
    navigate(`/dashboard/enquiries/${enquiry.id}`);
  };

  // Handle opening modal for viewing enquiry details
  const handleViewEnquiry = (enquiry: Enquiry) => {
    navigate(`/dashboard/enquiries/${enquiry.id}?mode=view`);
  };

  // Handle convert to enrollment
  const handleConvertToEnrollment = (enquiry: Enquiry) => {
    navigate(`/dashboard/enrollments/new?enquiryId=${enquiry.id}`);
  };

  // Handle delete confirmation
  const handleDeleteClick = (enquiry: Enquiry) => {
    setEnquiryToDelete(enquiry);
    setIsDeleteDialogOpen(true);
  };

  // Handle confirmed delete
  const handleConfirmDelete = async () => {
    if (!enquiryToDelete) return;

    try {
      const response = await enquiryService.deleteEnquiry(enquiryToDelete.id);

      if (response.success) {
        toast.success("Enquiry deleted successfully");
        refreshEnquiries();
      } else {
        toast.error("Failed to delete enquiry");
      }
    } catch (error) {
      console.error("Error deleting enquiry:", error);
      toast.error("Failed to delete enquiry");
    } finally {
      setIsDeleteDialogOpen(false);
      setEnquiryToDelete(null);
    }
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setEnquiryToDelete(null);
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

  // Handle source filter change
  const handleSourceFilterChange = (value: string) => {
    setSourceFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Define columns - minimal set as requested
  const columns: ColumnDef<Enquiry>[] = useMemo(
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
        cell: ({ row }) => {
          const enquiryName = row.original.name;
          const enquiryPhone = row.original.phone;

          return (
            <div className="text-left min-w-0">
              <div className="flex flex-col">
                <div className="font-medium truncate" title={enquiryName}>
                  {enquiryName}
                </div>
                {enquiryPhone && (
                  <div
                    className="text-sm text-muted-foreground truncate"
                    title={enquiryPhone}
                  >
                    {enquiryPhone}
                  </div>
                )}
              </div>
            </div>
          );
        },
        size: 180,
        minSize: 160,
        maxSize: 200,
      },
      {
        accessorKey: "enquiryDate",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="cursor-pointer"
            >
              Enquiry Date
              <ArrowUpDown className="ml-2 h-2 w-2" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="text-left">
            <TableCellViewer value={row.getValue("enquiryDate")} type="date" />
          </div>
        ),
        size: 110,
        minSize: 100,
        maxSize: 120,
      },
      {
        accessorKey: "source",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="cursor-pointer"
            >
              Source
              <ArrowUpDown className="ml-2 h-2 w-2" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="text-left">
            <TableCellViewer value={row.getValue("source")} type="source" />
          </div>
        ),
        size: 100,
        minSize: 90,
        maxSize: 110,
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
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const enquiry = row.original;

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
                        const enquiryData = {
                          id: enquiry.id,
                          name: enquiry.name,
                          phone: enquiry.phone,
                          enquiryDate: enquiry.enquiryDate,
                          description: enquiry.description,
                          source: enquiry.source,
                          status: enquiry.status,
                          center: enquiry.center,
                          course: enquiry.course,
                          assignedEmployee: enquiry.assignedEmployee,
                          createdAt: enquiry.createdAt,
                          updatedAt: enquiry.updatedAt,
                        };
                        await navigator.clipboard.writeText(
                          JSON.stringify(enquiryData, null, 2)
                        );
                        toast.success("Enquiry data copied to clipboard");
                      } catch (error) {
                        console.error("Failed to copy enquiry data:", error);
                        toast.error("Failed to copy enquiry data");
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
                      onClick={() => handleViewEnquiry(enquiry)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View details
                    </DropdownMenuItem>
                  )}
                  {canPerformAction(ActionType.UPDATE) && (
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => handleEditEnquiry(enquiry)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit enquiry
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    className="cursor-pointer text-blue-600"
                    onClick={() => handleConvertToEnrollment(enquiry)}
                  >
                    <UserCheck className="mr-2 h-4 w-4" />
                    Convert to Enrollment
                  </DropdownMenuItem>
                  {canPerformAction(ActionType.DELETE) && (
                    <DropdownMenuItem
                      className="text-red-600 cursor-pointer"
                      onClick={() => handleDeleteClick(enquiry)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete enquiry
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

  // Use enquiries directly since filtering is now server-side
  const filteredEnquiries = enquiries;

  const table = useReactTable({
    data: filteredEnquiries,
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
                  placeholder="Search enquiries..."
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
                  <SelectItem value={EnquiryStatus.NEW}>New</SelectItem>
                  <SelectItem value={EnquiryStatus.CONTACTED}>
                    Contacted
                  </SelectItem>
                  <SelectItem value={EnquiryStatus.INTERESTED}>
                    Interested
                  </SelectItem>
                  <SelectItem value={EnquiryStatus.CONVERTED}>
                    Converted
                  </SelectItem>
                  <SelectItem value={EnquiryStatus.LOST}>Lost</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={sourceFilter}
                onValueChange={handleSourceFilterChange}
              >
                <SelectTrigger className="w-[180px] cursor-pointer">
                  <SelectValue placeholder="Filter by source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value={EnquirySource.WEBSITE}>Website</SelectItem>
                  <SelectItem value={EnquirySource.REFERRAL}>
                    Referral
                  </SelectItem>
                  <SelectItem value={EnquirySource.ADVERTISEMENT}>
                    Advertisement
                  </SelectItem>
                  <SelectItem value={EnquirySource.WALK_IN}>Walk In</SelectItem>
                  <SelectItem value={EnquirySource.SOCIAL_MEDIA}>
                    Social Media
                  </SelectItem>
                  <SelectItem value={EnquirySource.OTHER}>Other</SelectItem>
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
                <Button className="cursor-pointer" onClick={handleAddEnquiry}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Enquiry
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
                      No enquiries found.
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
              enquiries
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
              enquiry for <strong>{enquiryToDelete?.name}</strong> and remove
              all associated data.
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
              Delete Enquiry
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
