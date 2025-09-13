/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Cohort } from "@/api/cohortTypes";
import { CohortStatus } from "@/api/cohortTypes";
import { cohortService } from "@/api/cohortService";
import { roleService } from "@/api/roleService";
import { ActionType, ModuleName } from "@/api/roleTypes";
import { toast } from "sonner";
import { useAppStore } from "@/stores/appStore";
import { CohortCard } from "@/components/cohort/CohortCard";
import CohortModal from "./CohortModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function CohortsPage() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState<Cohort | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [moduleActions, setModuleActions] = useState<ActionType[]>([]);

  // Get user data from store
  const { user } = useAppStore();

  // Debounce search term to reduce API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

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
          ModuleName.COHORT
        );

        if (!isCancelled) {
          if (response.success && response.data) {
            setModuleActions(response.data.actions || []);
          } else {
            setModuleActions([]);
            if (response.message) {
              toast.error(`Failed to fetch permissions: ${response.message}`);
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

    return () => {
      isCancelled = true;
    };
  }, [user?.role]);

  // Memoize the fetch function to prevent unnecessary re-renders
  const fetchCohorts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await cohortService.getCohorts({
        limit: 100,
        search: debouncedSearchTerm || undefined,
        status: statusFilter !== "all" ? (statusFilter as any) : undefined,
        centerId: user?.centerId,
      });

      if (response.success && response.data) {
        setCohorts(response.data.data);
      } else {
        setCohorts([]);
      }
    } catch (error) {
      console.error("Error fetching cohorts:", error);
      setCohorts([]);
      toast.error("Error loading cohorts");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, statusFilter, user?.centerId]);

  // Fetch cohorts data on component mount
  useEffect(() => {
    fetchCohorts();
  }, [fetchCohorts]);

  // Handle search with debouncing
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  // Check if action is available in module actions
  const canPerformAction = useMemo(() => {
    return (action: ActionType): boolean => {
      return moduleActions.includes(action);
    };
  }, [moduleActions]);

  // Handle modal operations
  const handleCreateCohort = () => {
    setSelectedCohort(null);
    setIsReadOnly(false);
    setIsModalOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleEditCohort = (cohort: Cohort) => {
    setSelectedCohort(cohort);
    setIsReadOnly(false);
    setIsModalOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleViewCohort = (cohort: Cohort) => {
    setSelectedCohort(cohort);
    setIsReadOnly(true);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCohort(null);
    setIsReadOnly(false);
  };

  const handleModalSuccess = () => {
    // Refresh the cohorts list using the memoized function
    fetchCohorts();
  };

  return (
    <div className="w-full px-4 py-2">
      <div className="space-y-4">
        {/* Filters and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cohorts..."
                value={searchTerm}
                onChange={(event) => handleSearchChange(event.target.value)}
                className="pl-8 max-w-sm cursor-pointer"
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
                <SelectItem value={CohortStatus.PLANNING}>Planning</SelectItem>
                <SelectItem value={CohortStatus.ENROLLING}>
                  Enrolling
                </SelectItem>
                <SelectItem value={CohortStatus.ACTIVE}>Active</SelectItem>
                <SelectItem value={CohortStatus.COMPLETED}>
                  Completed
                </SelectItem>
                <SelectItem value={CohortStatus.CANCELLED}>
                  Cancelled
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          {canPerformAction(ActionType.CREATE) && (
            <Button
              onClick={handleCreateCohort}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Cohort
            </Button>
          )}
        </div>

        {/* Cohorts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cohorts.map((cohort) => (
            <CohortCard
              key={cohort.id}
              id={cohort.id}
              name={cohort.name}
              courseName={cohort.course?.name || "Unknown Course"}
              courseCategory={cohort.course?.name || "General"}
              startDate={cohort.startDate}
              endDate={cohort.endDate}
              maxStudents={cohort.capacity || 0}
              currentStudents={cohort.enrollments?.length || 0}
              status={cohort.status}
              description={cohort.description || ""}
              enrollmentOpen={cohort.status === CohortStatus.ENROLLING}
              enrollmentCount={cohort.enrollmentCount}
            />
          ))}
        </div>

        {/* Empty State */}
        {cohorts.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold">No cohorts found</h3>
            <p className="text-gray-600 mt-2">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria"
                : "No cohorts have been created yet"}
            </p>
          </div>
        )}
      </div>

      {/* Cohort Modal */}
      <CohortModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        cohort={selectedCohort}
        onSuccess={handleModalSuccess}
        isReadOnly={isReadOnly}
        userCenterId={user?.centerId}
      />
    </div>
  );
}
