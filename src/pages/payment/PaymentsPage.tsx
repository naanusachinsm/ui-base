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
import type { Payment } from "@/api/paymentTypes";
import {
  PaymentStatus,
  PaymentMethod,
  PaymentStatusLabels,
  PaymentMethodLabels,
  PaymentStatusColors,
  PaymentMethodColors,
} from "@/api/paymentTypes";
import { paymentService } from "@/api/paymentService";
import { roleService } from "@/api/roleService";
import { ActionType, ModuleName } from "@/api/roleTypes";
import { toast } from "sonner";
import PaymentModal from "./PaymentModal";
import { useAppStore } from "@/stores/appStore";

// Simple table row component
const SimpleTableRow = ({ row }: { row: Row<Payment> }) => {
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
        <Badge className={PaymentStatusColors[value as PaymentStatus]}>
          {PaymentStatusLabels[value as PaymentStatus]}
        </Badge>
      );
    case "paymentMethod":
      return (
        <Badge className={PaymentMethodColors[value as PaymentMethod]}>
          {PaymentMethodLabels[value as PaymentMethod]}
        </Badge>
      );
    case "date":
      return value ? new Date(value as string).toLocaleDateString() : "N/A";
    case "amount":
      const amount =
        typeof value === "number" ? value : parseFloat(value as string) || 0;
      return `$${amount.toFixed(2)}`;
    case "balance":
      const balance =
        typeof value === "number" ? value : parseFloat(value as string) || 0;
      return `$${balance.toFixed(2)}`;
    default:
      return (value as string) || "N/A";
  }
};

export default function PaymentsPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [payments, setPayments] = useState<Payment[]>([]);

  const [, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);

  const [moduleActions, setModuleActions] = useState<ActionType[]>([]);

  // Get user data from store
  const { user } = useAppStore();

  // Fetch payments data on component mount and when pagination/filters change
  useEffect(() => {
    let isCancelled = false;

    const fetchPayments = async () => {
      try {
        setLoading(true);
        const response = await paymentService.getPayments({
          page: currentPage,
          limit: pageSize,
          search: searchTerm || undefined,
          status:
            statusFilter !== "all"
              ? (statusFilter as PaymentStatus)
              : undefined,
          paymentMethod:
            paymentMethodFilter !== "all"
              ? (paymentMethodFilter as PaymentMethod)
              : undefined,
        });

        // Only update state if component is still mounted
        if (!isCancelled) {
          if (response.success && response.data) {
            setPayments(response.data.data);
            setTotalPages(response.data.totalPages);
            setTotalItems(response.data.total);
          } else {
            setPayments([]);
            setTotalPages(0);
            setTotalItems(0);
            toast.error("No payment data available");
          }
        }
      } catch (error) {
        console.error("Error fetching payments:", error);
        // Handle error without fallback data
        if (!isCancelled) {
          setPayments([]);
          setTotalPages(0);
          setTotalItems(0);
          toast.error("Failed to load payment data");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchPayments();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isCancelled = true;
    };
  }, [currentPage, pageSize, searchTerm, statusFilter, paymentMethodFilter]);

  // Fetch module actions when user is available
  useEffect(() => {
    const fetchModuleActions = async () => {
      if (!user?.role) {
        return;
      }

      try {
        const response = await roleService.getRoleActions(
          user.role,
          ModuleName.PAYMENT
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

  // Refresh payments data
  const refreshPayments = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getPayments({
        page: currentPage,
        limit: pageSize,
        search: searchTerm || undefined,
        status:
          statusFilter !== "all" ? (statusFilter as PaymentStatus) : undefined,
        paymentMethod:
          paymentMethodFilter !== "all"
            ? (paymentMethodFilter as PaymentMethod)
            : undefined,
      });

      if (response.success && response.data) {
        setPayments(response.data.data);
        setTotalPages(response.data.totalPages);
        setTotalItems(response.data.total);
      } else {
        setPayments([]);
        setTotalPages(0);
        setTotalItems(0);
        toast.error("No payment data available");
      }
    } catch (error) {
      console.error("Error refreshing payments:", error);
      setPayments([]);
      setTotalPages(0);
      setTotalItems(0);
      toast.error("Failed to refresh payment data");
    } finally {
      setLoading(false);
    }
  };

  // Handle opening modal for adding new payment
  const handleAddPayment = () => {
    setSelectedPayment(null);
    setIsModalOpen(true);
  };

  // Handle opening modal for editing payment
  const handleEditPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  // Handle opening modal for viewing payment details
  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsViewMode(true);
    setIsModalOpen(true);
  };

  // Handle closing modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPayment(null);
    setIsViewMode(false);
  };

  // Handle successful form submission
  const handleModalSuccess = () => {
    refreshPayments();
  };

  // Handle delete confirmation
  const handleDeleteClick = (payment: Payment) => {
    setPaymentToDelete(payment);
    setIsDeleteDialogOpen(true);
  };

  // Handle confirmed delete
  const handleConfirmDelete = async () => {
    if (!paymentToDelete) return;

    try {
      const response = await paymentService.deletePayment(paymentToDelete.id);

      if (response.success) {
        toast.success("Payment deleted successfully");
        refreshPayments();
      } else {
        toast.error("Failed to delete payment");
      }
    } catch (error) {
      console.error("Error deleting payment:", error);
      toast.error("Failed to delete payment");
    } finally {
      setIsDeleteDialogOpen(false);
      setPaymentToDelete(null);
    }
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setPaymentToDelete(null);
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

  // Handle payment method filter change
  const handlePaymentMethodFilterChange = (value: string) => {
    setPaymentMethodFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Define columns
  const columns: ColumnDef<Payment>[] = useMemo(
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
        accessorKey: "amount",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="cursor-pointer"
            >
              Amount
              <ArrowUpDown className="ml-2 h-2 w-2" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="text-left">
            <TableCellViewer value={row.getValue("amount")} type="amount" />
          </div>
        ),
        size: 100,
        minSize: 90,
        maxSize: 110,
      },
      {
        accessorKey: "balance",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="cursor-pointer"
            >
              Balance
              <ArrowUpDown className="ml-2 h-2 w-2" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="text-left">
            <TableCellViewer value={row.getValue("balance")} type="balance" />
          </div>
        ),
        size: 100,
        minSize: 90,
        maxSize: 110,
      },
      {
        accessorKey: "paymentMethod",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="cursor-pointer"
            >
              Method
              <ArrowUpDown className="ml-2 h-2 w-2" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="text-left">
            <TableCellViewer
              value={row.getValue("paymentMethod")}
              type="paymentMethod"
            />
          </div>
        ),
        size: 120,
        minSize: 100,
        maxSize: 140,
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
        accessorKey: "paymentDate",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="cursor-pointer"
            >
              Payment Date
              <ArrowUpDown className="ml-2 h-2 w-2" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="text-left">
            <TableCellViewer value={row.getValue("paymentDate")} type="date" />
          </div>
        ),
        size: 110,
        minSize: 100,
        maxSize: 120,
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const payment = row.original;

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
                        const paymentData = {
                          id: payment.id,
                          studentId: payment.studentId,
                          enrollmentId: payment.enrollmentId,
                          courseId: payment.courseId,
                          cohortId: payment.cohortId,
                          centerId: payment.centerId,
                          processedByEmployeeId: payment.processedByEmployeeId,
                          amount: payment.amount,
                          balance: payment.balance,
                          paymentMethod: payment.paymentMethod,
                          transactionId: payment.transactionId,
                          paymentDate: payment.paymentDate,
                          status: payment.status,
                          description: payment.description,
                          createdAt: payment.createdAt,
                          updatedAt: payment.updatedAt,
                          student: {
                            id: payment.student?.id,
                            name: payment.student?.name,
                            email: payment.student?.email,
                          },
                          enrollment: {
                            id: payment.enrollment?.id,
                            enrollmentDate: payment.enrollment?.enrollmentDate,
                            status: payment.enrollment?.status,
                          },
                          course: {
                            id: payment.course?.id,
                            name: payment.course?.name,
                          },
                          cohort: {
                            id: payment.cohort?.id,
                            name: payment.cohort?.name,
                            code: payment.cohort?.code,
                          },
                          center: {
                            id: payment.center?.id,
                            name: payment.center?.name,
                          },
                          processedByEmployee: {
                            id: payment.processedByEmployee?.id,
                            name: payment.processedByEmployee?.name,
                            email: payment.processedByEmployee?.email,
                          },
                        };
                        await navigator.clipboard.writeText(
                          JSON.stringify(paymentData, null, 2)
                        );
                        toast.success("Payment data copied to clipboard");
                      } catch (error) {
                        console.error("Failed to copy payment data:", error);
                        toast.error("Failed to copy payment data");
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
                      onClick={() => handleViewPayment(payment)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View details
                    </DropdownMenuItem>
                  )}
                  {canPerformAction(ActionType.UPDATE) && (
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => handleEditPayment(payment)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit payment
                    </DropdownMenuItem>
                  )}
                  {canPerformAction(ActionType.DELETE) && (
                    <DropdownMenuItem
                      className="text-red-600 cursor-pointer"
                      onClick={() => handleDeleteClick(payment)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete payment
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

  // Use payments directly since filtering is now server-side
  const filteredPayments = payments;

  const table = useReactTable({
    data: filteredPayments,
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
                  placeholder="Search payments..."
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
                  <SelectItem value={PaymentStatus.COMPLETED}>
                    Completed
                  </SelectItem>
                  <SelectItem value={PaymentStatus.PENDING}>Pending</SelectItem>
                  <SelectItem value={PaymentStatus.FAILED}>Failed</SelectItem>
                  <SelectItem value={PaymentStatus.REFUNDED}>
                    Refunded
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={paymentMethodFilter}
                onValueChange={handlePaymentMethodFilterChange}
              >
                <SelectTrigger className="w-[180px] cursor-pointer">
                  <SelectValue placeholder="Filter by method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value={PaymentMethod.CREDIT_CARD}>
                    CREDIT CARD
                  </SelectItem>
                  <SelectItem value={PaymentMethod.DEBIT_CARD}>
                    DEBIT CARD
                  </SelectItem>
                  <SelectItem value={PaymentMethod.PAYPAL}>PAYPAL</SelectItem>
                  <SelectItem value={PaymentMethod.UPI}>UPI</SelectItem>
                  <SelectItem value={PaymentMethod.NET_BANKING}>
                    NET BANKING
                  </SelectItem>
                  <SelectItem value={PaymentMethod.DIRECT_BILL}>
                    DIRECT BILL
                  </SelectItem>
                  <SelectItem value={PaymentMethod.OTHER}>OTHER</SelectItem>
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
                <Button className="cursor-pointer" onClick={handleAddPayment}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Payment
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
                      No payments found.
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
              payments
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

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        payment={selectedPayment}
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
              payment for <strong>{paymentToDelete?.student?.name}</strong> and
              remove all associated data.
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
              Delete Payment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
