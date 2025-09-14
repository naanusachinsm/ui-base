/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { classService } from "@/api/classService";
import { cohortService } from "@/api/cohortService";
import { centerService } from "@/api/centerService";
import { employeeService } from "@/api/employeeService";
import type {
  Class,
  CreateClassRequest,
  UpdateClassRequest,
  ClassMode,
  ClassStatus,
} from "@/api/classTypes";
import { classFormSchema } from "@/api/classTypes";
import type { Cohort } from "@/api/cohortTypes";
import type { Center } from "@/api/centerTypes";
import type { Employee } from "@/api/employeeTypes";

// type ClassFormData = z.infer<typeof classFormSchema>;

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  class?: Class | null;
  onSuccess: () => void;
  isReadOnly?: boolean;
  userCenterId?: number;
}

export default function ClassModal({
  isOpen,
  onClose,
  class: classData,
  onSuccess,
  isReadOnly = false,
  userCenterId,
}: ClassModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [instructors, setInstructors] = useState<Employee[]>([]);

  const form = useForm({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      cohortId: 0,
      centerId: userCenterId || 0,
      instructorEmployeeId: 0,
      name: "",
      startTime: "",
      endTime: "",
      mode: "IN PERSON" as ClassMode,
      meetingUrl: "",
      resourceUrl: "",
      videoUrl: "",
      avatarUrl: "",
      description: "",
      status: "SCHEDULED" as ClassStatus,
    },
  });

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load cohorts
        const cohortsResponse = await cohortService.getCohorts({
          centerId: userCenterId,
        });
        if (cohortsResponse.success && cohortsResponse.data) {
          setCohorts(cohortsResponse.data.data);
        }

        // Load centers
        const centersResponse = await centerService.getCenters();
        if (centersResponse.success && centersResponse.data) {
          setCenters(centersResponse.data.data);
        }

        // Load instructors (employees with instructor role)
        const instructorsResponse = await employeeService.getEmployees({
          centerId: userCenterId,
        });
        if (instructorsResponse.success && instructorsResponse.data) {
          setInstructors(instructorsResponse.data.data);
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
        toast.error("Failed to load form data");
      }
    };

    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen, userCenterId]);

  // Populate form when class data changes
  useEffect(() => {
    if (classData) {
      form.reset({
        cohortId: classData.cohortId,
        centerId: classData.centerId || userCenterId || 0,
        instructorEmployeeId: classData.instructorEmployeeId || 0,
        name: classData.name,
        startTime: classData.startTime,
        endTime: classData.endTime || "",
        mode: classData.mode,
        meetingUrl: classData.meetingUrl || "",
        resourceUrl: classData.resourceUrl || "",
        videoUrl: classData.videoUrl || "",
        avatarUrl: classData.avatarUrl || "",
        description: classData.description || "",
        status: classData.status,
      });
    } else {
      form.reset({
        cohortId: 0,
        centerId: userCenterId || 0,
        instructorEmployeeId: 0,
        name: "",
        startTime: "",
        endTime: "",
        mode: "IN PERSON" as ClassMode,
        meetingUrl: "",
        resourceUrl: "",
        videoUrl: "",
        avatarUrl: "",
        description: "",
        status: "SCHEDULED" as ClassStatus,
      });
    }
  }, [classData, form, userCenterId]);

  const onSubmit = async (data: any) => {
    setIsLoading(true);

    try {
      // Convert form data to API format
      const apiData: CreateClassRequest | UpdateClassRequest = {
        cohortId: data.cohortId,
        centerId: data.centerId || undefined,
        instructorEmployeeId: data.instructorEmployeeId || undefined,
        name: data.name,
        startTime: data.startTime,
        endTime: data.endTime || undefined,
        mode: data.mode,
        meetingUrl: data.meetingUrl || undefined,
        resourceUrl: data.resourceUrl || undefined,
        videoUrl: data.videoUrl || undefined,
        avatarUrl: data.avatarUrl || undefined,
        description: data.description || undefined,
        status: data.status,
      };

      let response;
      if (classData) {
        // Update existing class
        response = await classService.updateClass(classData.id, apiData);
      } else {
        // Create new class
        response = await classService.createClass(
          apiData as CreateClassRequest
        );
      }

      if (response.success) {
        toast.success(
          classData
            ? "Class updated successfully"
            : "Class created successfully"
        );
        onSuccess();
      } else {
        toast.error(response.message || "Failed to save class");
      }
    } catch (error) {
      console.error("Error saving class:", error);
      toast.error("Failed to save class");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isReadOnly
              ? "View Class"
              : classData
              ? "Edit Class"
              : "Add New Class"}
          </DialogTitle>
          <DialogDescription>
            {isReadOnly
              ? "View class details"
              : classData
              ? "Update class information"
              : "Create a new class"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Class Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Class Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter class name"
                        {...field}
                        disabled={isReadOnly}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Cohort */}
              <FormField
                control={form.control}
                name="cohortId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cohort *</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                      disabled={isReadOnly}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select cohort" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cohorts.map((cohort) => (
                          <SelectItem
                            key={cohort.id}
                            value={cohort.id.toString()}
                          >
                            {cohort.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Center */}
              <FormField
                control={form.control}
                name="centerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Center</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                      disabled={isReadOnly}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select center" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {centers.map((center) => (
                          <SelectItem
                            key={center.id}
                            value={center.id.toString()}
                          >
                            {center.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Instructor */}
              <FormField
                control={form.control}
                name="instructorEmployeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructor</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                      disabled={isReadOnly}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select instructor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {instructors.map((instructor) => (
                          <SelectItem
                            key={instructor.id}
                            value={instructor.id.toString()}
                          >
                            {instructor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Start Time */}
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                            disabled={isReadOnly}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value
                              ? format(new Date(field.value), "PPP")
                              : "Pick a date"}
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
                              field.onChange(date.toISOString());
                            }
                          }}
                          disabled={(date) => date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* End Time */}
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                            disabled={isReadOnly}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value
                              ? format(new Date(field.value), "PPP")
                              : "Pick a date"}
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
                              field.onChange(date.toISOString());
                            }
                          }}
                          disabled={(date) => date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Mode */}
              <FormField
                control={form.control}
                name="mode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mode *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isReadOnly}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select mode" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ONLINE">Online</SelectItem>
                        <SelectItem value="IN PERSON">In Person</SelectItem>
                        <SelectItem value="HYBRID">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isReadOnly}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Meeting URL */}
              <FormField
                control={form.control}
                name="meetingUrl"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Meeting URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://meet.google.com/..."
                        {...field}
                        disabled={isReadOnly}
                      />
                    </FormControl>
                    <FormDescription>
                      URL for online meetings (required for online/hybrid
                      classes)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Resource URL */}
              <FormField
                control={form.control}
                name="resourceUrl"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Resource URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://drive.google.com/..."
                        {...field}
                        disabled={isReadOnly}
                      />
                    </FormControl>
                    <FormDescription>
                      URL to class resources or materials
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Video URL */}
              <FormField
                control={form.control}
                name="videoUrl"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Video URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://youtube.com/watch?v=..."
                        {...field}
                        disabled={isReadOnly}
                      />
                    </FormControl>
                    <FormDescription>
                      URL to recorded class video
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Avatar URL */}
              <FormField
                control={form.control}
                name="avatarUrl"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Avatar URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/avatar.jpg"
                        {...field}
                        disabled={isReadOnly}
                      />
                    </FormControl>
                    <FormDescription>
                      URL to class thumbnail or avatar image
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter class description..."
                        className="min-h-[100px]"
                        {...field}
                        disabled={isReadOnly}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                {isReadOnly ? "Close" : "Cancel"}
              </Button>
              {!isReadOnly && (
                <Button type="submit" disabled={isLoading}>
                  {isLoading
                    ? "Saving..."
                    : classData
                    ? "Update Class"
                    : "Create Class"}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
