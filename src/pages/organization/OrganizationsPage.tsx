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
import type { Organization } from "@/api/organizationTypes";
import {
  OrganizationStatus,
  OrganizationStatusLabels,
  OrganizationStatusColors,
} from "@/api/organizationTypes";
import { organizationService } from "@/api/organizationService";
import { roleService } from "@/api/roleService";
import { ActionType, ModuleName } from "@/api/roleTypes";
import { toast } from "sonner";
import OrganizationModal from "./OrganizationModal";
import { useAppStore } from "@/stores/appStore";

// Regular table row component
const RegularTableRow = ({ row }: { row: Row<Organization> }) => {
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
      const status = value as OrganizationStatus;
      return (
        <Badge variant="outline" className={OrganizationStatusColors[status]}>
          {OrganizationStatusLabels[status]}
        </Badge>
      );
    }
    case "text":
    default:
      return <span className="text-sm">{value as string}</span>;
  }
};

export function OrganizationsPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [organizationToDelete, setOrganizationToDelete] =
    useState<Organization | null>(null);

  const [moduleActions, setModuleActions] = useState<ActionType[]>([]);

  // Get user data from store
  const { user } = useAppStore();

  // Fetch organizations data on component mount
  useEffect(() => {
    let isCancelled = false;

    const fetchOrganizations = async () => {
      try {
        setLoading(true);
        const response = await organizationService.getOrganizations({
          limit: 100,
        });

        // Only update state if component is still mounted
        if (!isCancelled) {
          if (response.success && response.data) {
            setOrganizations(response.data.data);
          } else {
            setOrganizations([]);
          }
        }
      } catch (error) {
        console.error("Error fetching organizations:", error);
        // Only show error if component is still mounted
        if (!isCancelled) {
          setOrganizations([]);
          toast.error("Error loading organizations");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchOrganizations();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isCancelled = true;
    };
  }, []); // Only run on mount

  // Fetch module actions when user is available
  useEffect(() => {
    let isCancelled = false;

    const fetchModuleActions = async () => {
      if (!user?.role) {
        if (!isCancelled) {
          setModuleActions([]);
        }
        return;
      }

      try {
        const response = await roleService.getRoleActions(
          user.role,
          ModuleName.ORGANIZATION
        );

        // Only update state if component is still mounted
        if (!isCancelled) {
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
        }
      } catch (error) {
        if (!isCancelled) {
          setModuleActions([]);
          toast.error(
            `Failed to fetch module actions: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }
      }
    };

    fetchModuleActions();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isCancelled = true;
    };
  }, [user?.role]); // Only run when user.role changes, not the entire user object

  // Refresh organizations data
  const refreshOrganizations = async () => {
    try {
      setLoading(true);
      const response = await organizationService.getOrganizations({
        limit: 100,
      });

      if (response.success && response.data) {
        setOrganizations(response.data.data);
      } else {
        setOrganizations([]);
      }
    } catch (error) {
      console.error("Error refreshing organizations:", error);
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle opening modal for adding new organization
  const handleAddOrganization = () => {
    setSelectedOrganization(null);
    setIsModalOpen(true);
  };

  // Handle opening modal for editing organization
  const handleEditOrganization = (organization: Organization) => {
    setSelectedOrganization(organization);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  // Handle opening modal for viewing organization details
  const handleViewOrganization = (organization: Organization) => {
    setSelectedOrganization(organization);
    setIsViewMode(true);
    setIsModalOpen(true);
  };

  // Handle closing modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrganization(null);
    setIsViewMode(false);
  };

  // Handle successful form submission
  const handleModalSuccess = () => {
    refreshOrganizations();
  };

  // Handle delete confirmation
  const handleDeleteClick = (organization: Organization) => {
    setOrganizationToDelete(organization);
    setIsDeleteDialogOpen(true);
  };

  // Handle confirmed delete
  const handleConfirmDelete = async () => {
    if (!organizationToDelete) return;

    try {
      const response = await organizationService.deleteOrganization(
        organizationToDelete.id
      );
      if (response.success) {
        toast.success("Organization deleted successfully");
        refreshOrganizations();
      } else {
        toast.error("Failed to delete organization");
      }
    } catch (error) {
      console.error("Error deleting organization:", error);
      toast.error("Error deleting organization");
    } finally {
      setIsDeleteDialogOpen(false);
      setOrganizationToDelete(null);
    }
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setOrganizationToDelete(null);
  };

  // Check if action is available in module actions
  const canPerformAction = useMemo(() => {
    return (action: ActionType): boolean => {
      return moduleActions.includes(action);
    };
  }, [moduleActions]);

  // Filter organizations based on search term and status
  const filteredOrganizations = useMemo(() => {
    return organizations.filter((organization) => {
      const matchesSearch =
        organization.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (organization.contactEmail &&
          organization.contactEmail
            .toLowerCase()
            .includes(searchTerm.toLowerCase()));
      const matchesStatus =
        statusFilter === "all" || organization.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [organizations, searchTerm, statusFilter]);

  // Table columns definition
  const columns: ColumnDef<Organization>[] = useMemo(
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
        accessorKey: "type",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="cursor-pointer"
            >
              Type
              <ArrowUpDown className="ml-2 h-2 w-2" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const type = row.getValue("type") as string;
          return <div className="text-left font-medium">{type || "-"}</div>;
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
          const organization = row.original;

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
                          JSON.stringify(organization, null, 2)
                        );
                        toast.success("Organization info copied to clipboard");
                      } catch (error) {
                        console.error(
                          "Failed to copy organization info:",
                          error
                        );
                        toast.error("Failed to copy organization info");
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
                      onClick={() => handleViewOrganization(organization)}
                      className="cursor-pointer"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View details
                    </DropdownMenuItem>
                  )}
                  {canPerformAction(ActionType.UPDATE) && (
                    <DropdownMenuItem
                      onClick={() => handleEditOrganization(organization)}
                      className="cursor-pointer"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit organization
                    </DropdownMenuItem>
                  )}
                  {canPerformAction(ActionType.DELETE) && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(organization)}
                        className="text-red-600 cursor-pointer"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete organization
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
    data: filteredOrganizations,
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
              placeholder="Search organizations..."
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
                <SelectItem value={OrganizationStatus.ACTIVE}>
                  Active
                </SelectItem>
                <SelectItem value={OrganizationStatus.INACTIVE}>
                  Inactive
                </SelectItem>
                <SelectItem value={OrganizationStatus.SUSPENDED}>
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
              <Button
                className="cursor-pointer"
                onClick={handleAddOrganization}
              >
                <Building2 className="mr-2 h-4 w-4" />
                Add Organization
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
                  .rows.map((row) => <RegularTableRow key={row.id} row={row} />)
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
      <OrganizationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        organization={selectedOrganization}
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
              organization "{organizationToDelete?.name}" and remove all
              associated data.
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
