/* eslint-disable @typescript-eslint/no-unused-vars */
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
  Building2,
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
import type { Center } from "@/api/centerTypes";
import {
  CenterStatus,
  CenterStatusLabels,
  CenterStatusColors,
} from "@/api/centerTypes";
import { centerService } from "@/api/centerService";
import { roleService } from "@/api/roleService";
import { ActionType, ModuleName } from "@/api/roleTypes";
import { toast } from "sonner";
import CenterModal from "./CenterModal";
import { useAppStore } from "@/stores/appStore";

// Drag handle component


// Regular table row component
const RegularTableRow = ({ row }: { row: Row<Center> }) => {
  return (
    <TableRow data-state={row.getIsSelected() && "selected"}>
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
        <span className="text-sm text-muted-foreground">{value as string}</span>
      );
    case "status": {
      const status = value as CenterStatus;
      return (
        <Badge variant="outline" className={CenterStatusColors[status]}>
          {CenterStatusLabels[status]}
        </Badge>
      );
    }
    case "text":
    default:
      return <span className="text-sm">{value as string}</span>;
  }
};

export function CentersPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [centers, setCenters] = useState<Center[]>([]);
  const [, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [centerToDelete, setCenterToDelete] = useState<Center | null>(null);

  const [moduleActions, setModuleActions] = useState<ActionType[]>([]);

  // Get user data from store
  const { user } = useAppStore();



  // Fetch centers data on component mount
  useEffect(() => {
    const fetchCenters = async () => {
      try {
        setLoading(true);
        const response = await centerService.getCenters({
          limit: 100,
        });

        if (response.success && response.data) {
          setCenters(response.data.data);
        } else {
          setCenters([]);
        }
      } catch (error) {
        console.error("Error fetching centers:", error);
        // Fallback to empty data on error
        setCenters([]);
        toast.error("Error loading centers");
      } finally {
        setLoading(false);
      }
    };

    fetchCenters();
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
          ModuleName.CENTER
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

  // Refresh centers data
  const refreshCenters = async () => {
    try {
      setLoading(true);
      const response = await centerService.getCenters({
        limit: 100,
      });

      if (response.success && response.data) {
        setCenters(response.data.data);
      } else {
        setCenters([]);
      }
    } catch (error) {
      console.error("Error refreshing centers:", error);
      setCenters([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle opening modal for adding new center
  const handleAddCenter = () => {
    setSelectedCenter(null);
    setIsModalOpen(true);
  };

  // Handle opening modal for editing center
  const handleEditCenter = (center: Center) => {
    setSelectedCenter(center);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  // Handle opening modal for viewing center details
  const handleViewCenter = (center: Center) => {
    setSelectedCenter(center);
    setIsViewMode(true);
    setIsModalOpen(true);
  };

  // Handle closing modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCenter(null);
    setIsViewMode(false);
  };

  // Handle successful form submission
  const handleModalSuccess = () => {
    refreshCenters();
  };

  // Handle delete confirmation
  const handleDeleteClick = (center: Center) => {
    setCenterToDelete(center);
    setIsDeleteDialogOpen(true);
  };

  // Handle confirmed delete
  const handleConfirmDelete = async () => {
    if (!centerToDelete) return;

    try {
      const response = await centerService.deleteCenter(centerToDelete.id);
      if (response.success) {
        toast.success("Center deleted successfully");
        refreshCenters();
      } else {
        toast.error("Failed to delete center");
      }
    } catch (error) {
      console.error("Error deleting center:", error);
      toast.error("Error deleting center");
    } finally {
      setIsDeleteDialogOpen(false);
      setCenterToDelete(null);
    }
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setCenterToDelete(null);
  };

  // Check if action is available in module actions
  const canPerformAction = useMemo(() => {
    return (action: ActionType): boolean => {
      return moduleActions.includes(action);
    };
  }, [moduleActions]);

  // Filter centers based on search term and status
  const filteredCenters = useMemo(() => {
    return centers.filter((center) => {
      const matchesSearch =
        center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (center.contactEmail &&
          center.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus =
        statusFilter === "all" || center.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [centers, searchTerm, statusFilter]);

  // Table columns definition
  const columns: ColumnDef<Center>[] = useMemo(
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
                {row.original.contactEmail || "No email"}
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
        accessorKey: "contactPhone",
        header: "Phone",
        cell: ({ row }) => (
          <div className="text-left">
            <TableCellViewer
              value={row.getValue("contactPhone")}
              type="phone"
            />
          </div>
        ),
        size: 130,
        maxSize: 130,
      },
      {
        accessorKey: "capacity",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="cursor-pointer"
            >
              Capacity
              <ArrowUpDown className="ml-2 h-2 w-2" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const capacity = row.getValue("capacity") as number;
          return <div className="text-left font-medium">{capacity || "-"}</div>;
        },
        size: 100,
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
        size: 110,
        maxSize: 110,
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const center = row.original;

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
                          JSON.stringify(center, null, 2)
                        );
                        toast.success("Center info copied to clipboard");
                      } catch (error) {
                        console.error("Failed to copy center info:", error);
                        toast.error("Failed to copy center info");
                      }
                    }}
                    className="cursor-pointer"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy info
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {canPerformAction(ActionType.READ) && (
                    <DropdownMenuItem
                      onClick={() => handleViewCenter(center)}
                      className="cursor-pointer"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View details
                    </DropdownMenuItem>
                  )}
                  {canPerformAction(ActionType.UPDATE) && (
                    <DropdownMenuItem
                      onClick={() => handleEditCenter(center)}
                      className="cursor-pointer"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit center
                    </DropdownMenuItem>
                  )}
                  {canPerformAction(ActionType.DELETE) && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(center)}
                        className="text-red-600 cursor-pointer"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete center
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
    data: filteredCenters,
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
              placeholder="Search centers..."
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
                <SelectItem value={CenterStatus.ACTIVE}>Active</SelectItem>
                <SelectItem value={CenterStatus.INACTIVE}>Inactive</SelectItem>
                <SelectItem value={CenterStatus.SUSPENDED}>
                  Maintenance
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
              <Button className="cursor-pointer" onClick={handleAddCenter}>
                <Building2 className="mr-2 h-4 w-4" />
                Add Center
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
                    <RegularTableRow key={row.id} row={row} />
                  ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

      </div>

      {/* Modal */}
      <CenterModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        center={selectedCenter}
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
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              center "{centerToDelete?.name}" and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}