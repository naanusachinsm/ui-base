/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, Users, Clock, BookOpen, MapPin, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Cohort } from "@/api/cohortTypes";
import { cohortService } from "@/api/cohortService";
import { roleService } from "@/api/roleService";
import { ActionType, ModuleName } from "@/api/roleTypes";
import { CohortHelpers } from "@/api/cohortTypes";
import { toast } from "sonner";
import CohortModal from "./CohortModal";
import { useAppStore } from "@/stores/appStore";

export function CohortDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [moduleActions, setModuleActions] = useState<ActionType[]>([]);

  // Get user data from store
  const { user } = useAppStore();

  useEffect(() => {
    const fetchCohort = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await cohortService.getCohort(parseInt(id));

        if (response.success && response.data) {
          setCohort(response.data);
        } else {
          toast.error("Failed to load cohort details");
          navigate("/dashboard/cohorts");
        }
      } catch (error) {
        console.error("Error fetching cohort:", error);
        toast.error("Error loading cohort details");
        navigate("/dashboard/cohorts");
      } finally {
        setLoading(false);
      }
    };

    fetchCohort();
  }, [id]);

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

  // Check if action is available in module actions
  const canPerformAction = useMemo(() => {
    return (action: ActionType): boolean => {
      return moduleActions.includes(action);
    };
  }, [moduleActions]);

  if (loading) {
    return (
      <div className="w-full px-4 py-2">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!cohort) {
    return (
      <div className="w-full px-4 py-2">
        <div className="text-center py-16">
          <h3 className="text-xl font-semibold">Cohort not found</h3>
          <Button
            onClick={() => navigate("/dashboard/cohorts")}
            className="mt-4 cursor-pointer"
          >
            Back to Cohorts
          </Button>
        </div>
      </div>
    );
  }

  const enrollmentProgress =
    cohort.capacity && cohort.capacity > 0
      ? Math.round(((cohort.enrollments?.length || 0) / cohort.capacity) * 100)
      : 0;

  // Modal handlers
  const handleEditCohort = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleModalSuccess = async () => {
    // Refresh the cohort data after successful edit
    if (!id) return;

    try {
      const response = await cohortService.getCohort(parseInt(id));
      if (response.success && response.data) {
        setCohort(response.data);
      }
    } catch (error) {
      console.error("Error refreshing cohort:", error);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="w-full px-4 py-2">
      <div className="space-y-6">
        {/* Cohort Info */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{cohort.name}</h1>
              {cohort.description && (
                <p className="text-gray-700 mt-2">{cohort.description}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {canPerformAction(ActionType.UPDATE) && (
                <Button
                  onClick={handleEditCohort}
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
              <Badge
                variant={cohort.status === "ACTIVE" ? "default" : "secondary"}
                className="text-sm"
              >
                {cohort.status}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Course Info */}
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Course</p>
                <p className="text-sm text-gray-600">
                  {cohort.course?.name || "Unknown Course"}
                </p>
              </div>
            </div>

            {/* Duration */}
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Duration</p>
                <p className="text-sm text-gray-600">
                  {CohortHelpers.formatDuration(
                    cohort.startDate,
                    cohort.endDate
                  )}
                </p>
              </div>
            </div>

            {/* Dates */}
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Schedule</p>
                <p className="text-sm text-gray-600">
                  {CohortHelpers.formatDateRange(
                    cohort.startDate,
                    cohort.endDate
                  )}
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm font-medium">Center</p>
                <p className="text-sm text-gray-600">
                  {cohort.center?.name || "Unknown Center"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enrollment */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5" />
            Enrollment
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {cohort.enrollments?.length || 0} / {cohort.capacity || "∞"}{" "}
                enrollment
              </span>
              <span className="text-sm text-gray-600">
                {cohort.capacity && cohort.capacity > 0
                  ? `${enrollmentProgress}%`
                  : "Unlimited"}
              </span>
            </div>

            {/* Enrollment Table */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                      Student Name
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                      Status
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                      Enrollment Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {cohort.enrollments && cohort.enrollments.length > 0 ? (
                    cohort.enrollments.map((enrollment, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {enrollment.student?.name || "Unknown Student"}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          <Badge
                            variant={
                              enrollment.status === "ACTIVE"
                                ? "default"
                                : enrollment.status === "COMPLETED"
                                ? "secondary"
                                : "outline"
                            }
                            className="text-xs"
                          >
                            {enrollment.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {enrollment.enrollmentDate
                            ? new Date(
                                enrollment.enrollmentDate
                              ).toLocaleDateString()
                            : "N/A"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-8 text-center text-sm text-gray-500"
                      >
                        No enrollments found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Cohort Modal */}
      <CohortModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        cohort={cohort}
        onSuccess={handleModalSuccess}
        isReadOnly={false}
        userCenterId={user?.centerId}
      />
    </div>
  );
}
