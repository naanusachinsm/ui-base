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
  Copy,
  Activity,
  Calendar,
  Filter,
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
import type { AuditLog } from "@/api/auditTypes";
import {
  AuditAction,
  AuditModule,
  AuditActionLabels,
  AuditModuleLabels,
  AuditActionColors,
} from "@/api/auditTypes";
import { auditLogService } from "@/api/auditService";
import { roleService } from "@/api/roleService";
import { ActionType, ModuleName } from "@/api/roleTypes";
import { toast } from "sonner";
import AuditLogModal from "./AuditLogModal";
import { useAppStore } from "@/stores/appStore";

// Simple table row component
const SimpleTableRow = ({ row }: { row: Row<AuditLog> }) => {
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
    case "action":
      if (!value) return <Badge variant="outline">N/A</Badge>;
      return (
        <Badge className={AuditActionColors[value as AuditAction]}>
          {AuditActionLabels[value as AuditAction]}
        </Badge>
      );
    case "module":
      if (!value) return <Badge variant="outline">N/A</Badge>;
      return (
        <Badge variant="outline">
          {AuditModuleLabels[value as AuditModule]}
        </Badge>
      );
    case "moduleText":
      return (value as string) || "N/A";
    case "date":
      return value ? new Date(value as string).toLocaleDateString() : "N/A";
    case "datetime":
      return value ? new Date(value as string).toLocaleString() : "N/A";
    case "user":
      const user = value as { name?: string; email?: string };
      if (!user?.name && !user?.email) return "N/A";
      return (
        <div className="min-w-0">
          <div className="font-medium truncate" title={user.name || "Unknown"}>
            {user.name || "Unknown User"}
          </div>
          {user.email && (
            <div
              className="text-sm text-muted-foreground truncate"
              title={user.email}
            >
              {user.email}
            </div>
          )}
        </div>
      );
    case "performedBy":
      return (value as string) || "N/A";
    case "message":
      const message = (value as string) || "";
      return message.length > 50
        ? `${message.substring(0, 50)}...`
        : message || "N/A";
    default:
      return (value as string) || "N/A";
  }
};

export default function AuditLogsPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const [, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [moduleFilter, setModuleFilter] = useState<string>("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLog | null>(
    null
  );

  const [moduleActions, setModuleActions] = useState<ActionType[]>([]);

  // Get user data from store
  const { user } = useAppStore();

  // Fetch audit logs data on component mount and when pagination/filters change
  useEffect(() => {
    let isCancelled = false;

    const fetchAuditLogs = async () => {
      try {
        setLoading(true);
        const response = await auditLogService.getAuditLogs({
          page: currentPage,
          limit: pageSize,
          search: searchTerm || undefined,
          action:
            actionFilter !== "all" ? (actionFilter as AuditAction) : undefined,
          module:
            moduleFilter !== "all" ? (moduleFilter as AuditModule) : undefined,
        });

        // Only update state if component is still mounted
        if (!isCancelled) {
          if (response.success && response.data) {
            setAuditLogs(response.data.data);
            setTotalPages(response.data.totalPages);
            setTotalItems(response.data.total);
          } else {
            setAuditLogs([]);
            setTotalPages(0);
            setTotalItems(0);
            toast.error("No audit log data available");
          }
        }
      } catch (error) {
        console.error("Error fetching audit logs:", error);
        // Handle error without fallback data
        if (!isCancelled) {
          setAuditLogs([]);
          setTotalPages(0);
          setTotalItems(0);
          toast.error("Failed to load audit log data");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchAuditLogs();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isCancelled = true;
    };
  }, [currentPage, pageSize, searchTerm, actionFilter, moduleFilter]);

  // Fetch module actions when user is available
  useEffect(() => {
    const fetchModuleActions = async () => {
      if (!user?.role) {
        return;
      }

      try {
        const response = await roleService.getRoleActions(
          user.role,
          ModuleName.AUDITLOGS
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

  // Refresh audit logs data
  const refreshAuditLogs = async () => {
    try {
      setLoading(true);
      const response = await auditLogService.getAuditLogs({
        page: currentPage,
        limit: pageSize,
        search: searchTerm || undefined,
        action:
          actionFilter !== "all" ? (actionFilter as AuditAction) : undefined,
        module:
          moduleFilter !== "all" ? (moduleFilter as AuditModule) : undefined,
      });

      if (response.success && response.data) {
        setAuditLogs(response.data.data);
        setTotalPages(response.data.totalPages);
        setTotalItems(response.data.total);
      } else {
        setAuditLogs([]);
        setTotalPages(0);
        setTotalItems(0);
        toast.error("No audit log data available");
      }
    } catch (error) {
      console.error("Error refreshing audit logs:", error);
      setAuditLogs([]);
      setTotalPages(0);
      setTotalItems(0);
      toast.error("Failed to refresh audit log data");
    } finally {
      setLoading(false);
    }
  };

  // Handle opening modal for viewing audit log
  const handleViewAuditLog = (auditLog: AuditLog) => {
    setSelectedAuditLog(auditLog);
    setIsModalOpen(true);
  };

  // Handle closing modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAuditLog(null);
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

  // Handle filter changes
  const handleActionFilterChange = (value: string) => {
    setActionFilter(value);
    setCurrentPage(1);
  };

  const handleModuleFilterChange = (value: string) => {
    setModuleFilter(value);
    setCurrentPage(1);
  };

  // Define columns
  const columns: ColumnDef<AuditLog>[] = useMemo(
    () => [
      {
        accessorKey: "user",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="cursor-pointer"
            >
              Performed By
              <ArrowUpDown className="ml-2 h-2 w-2" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="text-left">
            <TableCellViewer
              value={row.original.performedByEmployee?.name || "Unknown User"}
              type="performedBy"
            />
          </div>
        ),
        size: 160,
        minSize: 140,
        maxSize: 180,
      },
      {
        accessorKey: "action",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="cursor-pointer"
            >
              Action
              <ArrowUpDown className="ml-2 h-2 w-2" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="text-left">
            <TableCellViewer value={row.getValue("action")} type="action" />
          </div>
        ),
        size: 100,
        minSize: 90,
        maxSize: 110,
      },
      {
        accessorKey: "module",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="cursor-pointer"
            >
              Module
              <ArrowUpDown className="ml-2 h-2 w-2" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="text-left">
            <TableCellViewer value={row.getValue("module")} type="moduleText" />
          </div>
        ),
        size: 120,
        minSize: 100,
        maxSize: 140,
      },
      {
        accessorKey: "description",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="cursor-pointer"
            >
              Description
              <ArrowUpDown className="ml-2 h-2 w-2" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="text-left">
            <TableCellViewer
              value={row.getValue("description")}
              type="message"
            />
          </div>
        ),
        size: 200,
        minSize: 150,
        maxSize: 250,
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
            <TableCellViewer
              value={row.getValue("createdAt")}
              type="datetime"
            />
          </div>
        ),
        size: 140,
        minSize: 120,
        maxSize: 160,
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const auditLog = row.original;

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
                        const auditLogData = {
                          id: auditLog.id,
                          createdAt: auditLog.createdAt,
                          updatedAt: auditLog.updatedAt,
                          deletedAt: auditLog.deletedAt,
                          createdBy: auditLog.createdBy,
                          updatedBy: auditLog.updatedBy,
                          deletedBy: auditLog.deletedBy,
                          centerId: auditLog.centerId,
                          performedByEmployeeId: auditLog.performedByEmployeeId,
                          module: auditLog.module,
                          action: auditLog.action,
                          recordId: auditLog.recordId,
                          details: auditLog.details,
                          description: auditLog.description,
                          eventTimestamp: auditLog.eventTimestamp,
                          center: auditLog.center,
                          performedByEmployee: auditLog.performedByEmployee,
                        };
                        await navigator.clipboard.writeText(
                          JSON.stringify(auditLogData, null, 2)
                        );
                        toast.success("Audit log data copied to clipboard");
                      } catch (error) {
                        console.error("Failed to copy audit log data:", error);
                        toast.error("Failed to copy audit log data");
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
                      onClick={() => handleViewAuditLog(auditLog)}
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

  // Use audit logs directly since filtering is now server-side
  const filteredAuditLogs = auditLogs;

  const table = useReactTable({
    data: filteredAuditLogs,
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
                  placeholder="Search audit logs..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Select
                value={actionFilter}
                onValueChange={handleActionFilterChange}
              >
                <SelectTrigger className="w-[140px] cursor-pointer">
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {Object.entries(AuditActionLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={moduleFilter}
                onValueChange={handleModuleFilterChange}
              >
                <SelectTrigger className="w-[140px] cursor-pointer">
                  <SelectValue placeholder="Filter by module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modules</SelectItem>
                  {Object.entries(AuditModuleLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                      No audit logs found.
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
              audit logs
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

      {/* Audit Log Modal */}
      {selectedAuditLog && (
        <AuditLogModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          auditLog={selectedAuditLog}
        />
      )}
    </div>
  );
}
