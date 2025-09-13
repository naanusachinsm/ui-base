/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type {
  Cohort,
  CreateCohortRequest,
  UpdateCohortRequest,
} from "@/api/cohortTypes";
import { CohortStatus, CohortStatusLabels } from "@/api/cohortTypes";
import { toast } from "sonner";
import { cohortService } from "@/api/cohortService";
import { courseService } from "@/api/courseService";
import type { Course } from "@/api/courseTypes";

// Delivery mode options
const DeliveryMode = {
  ONLINE: "ONLINE",
  INPERSON: "INPERSON",
  HYBRID: "HYBRID",
} as const;

const DeliveryModeLabels = {
  [DeliveryMode.ONLINE]: "Online",
  [DeliveryMode.INPERSON]: "In Person",
  [DeliveryMode.HYBRID]: "Hybrid",
} as const;

// Simplified Zod schema for cohort form validation
const cohortFormSchema = z.object({
  name: z.string().min(1, "Cohort name is required"),
  description: z.string().optional(),
  courseId: z.string().min(1, "Course is required"),
  deliveryMode: z.nativeEnum(DeliveryMode),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  maxStudents: z.string().optional(),
  status: z.nativeEnum(CohortStatus),
  centerId: z.string().optional(),
});

type CohortFormData = z.infer<typeof cohortFormSchema>;

interface CohortModalProps {
  isOpen: boolean;
  onClose: () => void;
  cohort?: Cohort | null;
  onSuccess: () => void;
  isReadOnly?: boolean;
  userCenterId?: number;
}

export default function CohortModal({
  isOpen,
  onClose,
  cohort,
  onSuccess,
  isReadOnly = false,
  userCenterId,
}: CohortModalProps) {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const isEditing = !!cohort;

  const form = useForm<CohortFormData>({
    resolver: zodResolver(cohortFormSchema),
    defaultValues: {
      name: "",
      description: "",
      courseId: "",
      deliveryMode: DeliveryMode.INPERSON,
      startDate: "",
      endDate: "",
      maxStudents: "",
      status: CohortStatus.PLANNING,
      centerId: userCenterId?.toString() || "",
    },
  });

  // Fetch courses for the dropdown
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await courseService.getCourses({
          limit: 100,
          centerId: userCenterId,
        });
        if (response.success && response.data) {
          setCourses(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    if (isOpen) {
      fetchCourses();
    }
  }, [isOpen, userCenterId]);

  // Reset form when cohort changes
  useEffect(() => {
    if (cohort) {
      form.reset({
        name: cohort.name || "",
        description: cohort.description || "",
        courseId: cohort.courseId?.toString() || "",
        deliveryMode: DeliveryMode.INPERSON, // Default value since this is a new field
        startDate: cohort.startDate
          ? new Date(cohort.startDate).toISOString().split("T")[0]
          : "",
        endDate: cohort.endDate
          ? new Date(cohort.endDate).toISOString().split("T")[0]
          : "",
        maxStudents: cohort.capacity?.toString() || "",
        status: cohort.status || CohortStatus.PLANNING,
        centerId: cohort.centerId?.toString() || userCenterId?.toString() || "",
      });
    } else {
      form.reset({
        name: "",
        description: "",
        courseId: "",
        deliveryMode: DeliveryMode.INPERSON,
        startDate: "",
        endDate: "",
        maxStudents: "",
        status: CohortStatus.PLANNING,
        centerId: userCenterId?.toString() || "",
      });
    }
  }, [cohort, userCenterId]);

  const onSubmit = async (data: CohortFormData) => {
    if (isReadOnly) return;

    try {
      setLoading(true);

      // Convert centerId to number
      const centerId = data.centerId
        ? parseInt(data.centerId, 10)
        : userCenterId;
      if (!centerId) {
        toast.error("Center ID is required");
        return;
      }

      // Convert courseId to number
      const courseId = data.courseId ? parseInt(data.courseId, 10) : null;
      if (!courseId) {
        toast.error("Course is required");
        return;
      }

      // Convert maxStudents to number if provided
      const maxStudents = data.maxStudents
        ? parseInt(data.maxStudents, 10)
        : undefined;

      // Convert empty strings to null
      const cleanedData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          typeof value === "string" && value.trim() === "" ? null : value,
        ])
      );

      const requestData = {
        ...cleanedData,
        centerId,
        courseId,
        name: data.name,
        code: data.name.replace(/\s+/g, "-").toUpperCase(), // Generate code from name
        maxStudents,
        startDate: data.startDate,
        endDate: data.endDate,
        deliveryMode: data.deliveryMode,
      };

      let response;
      if (isEditing && cohort) {
        response = await cohortService.updateCohort(
          cohort.id,
          requestData as UpdateCohortRequest
        );
      } else {
        response = await cohortService.createCohort(
          requestData as CreateCohortRequest
        );
      }

      if (response.success) {
        toast.success(
          isEditing
            ? "Cohort updated successfully"
            : "Cohort created successfully"
        );
        onSuccess();
        onClose(); // Close modal after successful operation
      }
      // Error toasts are handled automatically by apiService
    } catch (error) {
      console.error("Error saving cohort:", error);
      // Error toasts are handled automatically by apiService
    } finally {
      setLoading(false);
    }
  };

  const getModalTitle = () => {
    if (isReadOnly) return "Cohort Details";
    if (isEditing) return "Edit Cohort";
    return "Create Cohort";
  };

  const getModalDescription = () => {
    if (isReadOnly) return "View cohort information and details.";
    if (isEditing) return "Update cohort information and settings.";
    return "Add a new cohort to the system.";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getModalTitle()}</DialogTitle>
          <DialogDescription>{getModalDescription()}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cohort Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter cohort name"
                          {...field}
                          disabled={isReadOnly}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="courseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isReadOnly}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full cursor-pointer">
                            <SelectValue placeholder="Select course" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {courses.map((course) => (
                            <SelectItem
                              key={course.id}
                              value={course.id.toString()}
                            >
                              {course.name} ({course.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deliveryMode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Mode *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isReadOnly}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full cursor-pointer">
                            <SelectValue placeholder="Select delivery mode" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(DeliveryModeLabels).map(
                            ([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isReadOnly}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full cursor-pointer">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(CohortStatusLabels).map(
                            ([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxStudents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Students</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter maximum number of students"
                          {...field}
                          disabled={isReadOnly}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter cohort description"
                        {...field}
                        disabled={isReadOnly}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Schedule Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Schedule Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal cursor-pointer",
                                !field.value && "text-muted-foreground"
                              )}
                              disabled={isReadOnly}
                            >
                              {field.value ? (
                                format(new Date(field.value), "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
                            onSelect={(date) => {
                              if (date) {
                                // Use local date formatting to avoid timezone issues
                                const year = date.getFullYear();
                                const month = String(
                                  date.getMonth() + 1
                                ).padStart(2, "0");
                                const day = String(date.getDate()).padStart(
                                  2,
                                  "0"
                                );
                                field.onChange(`${year}-${month}-${day}`);
                              }
                            }}
                            disabled={(date) =>
                              date < new Date("1900-01-01") ||
                              date > new Date("2100-12-31")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal cursor-pointer",
                                !field.value && "text-muted-foreground"
                              )}
                              disabled={isReadOnly}
                            >
                              {field.value ? (
                                format(new Date(field.value), "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
                            onSelect={(date) => {
                              if (date) {
                                // Use local date formatting to avoid timezone issues
                                const year = date.getFullYear();
                                const month = String(
                                  date.getMonth() + 1
                                ).padStart(2, "0");
                                const day = String(date.getDate()).padStart(
                                  2,
                                  "0"
                                );
                                field.onChange(`${year}-${month}-${day}`);
                              }
                            }}
                            disabled={(date) =>
                              date < new Date("1900-01-01") ||
                              date > new Date("2100-12-31")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {!isReadOnly && (
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="cursor-pointer"
                >
                  {loading
                    ? "Saving..."
                    : isEditing
                    ? "Update Cohort"
                    : "Create Cohort"}
                </Button>
              </DialogFooter>
            )}

            {isReadOnly && (
              <DialogFooter>
                <Button
                  type="button"
                  onClick={onClose}
                  className="cursor-pointer"
                >
                  Close
                </Button>
              </DialogFooter>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
