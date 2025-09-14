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
import type {
  Enrollment,
  CreateEnrollmentRequest,
  UpdateEnrollmentRequest,
} from "@/api/enrollmentTypes";
import {
  EnrollmentStatus,
  PaymentStatus,
  EnrollmentStatusLabels,
  PaymentStatusLabels,
} from "@/api/enrollmentTypes";
import { toast } from "sonner";
import { enrollmentService } from "@/api/enrollmentService";
import { studentService } from "@/api/studentService";
import { cohortService } from "@/api/cohortService";
import type { Student } from "@/api/studentTypes";
import type { Cohort } from "@/api/cohortTypes";

// Simplified Zod schema for enrollment form validation
const enrollmentFormSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  cohortId: z.string().min(1, "Cohort is required"),
  enrollmentDate: z.string().min(1, "Enrollment date is required"),
  status: z.nativeEnum(EnrollmentStatus),
  paymentStatus: z.nativeEnum(PaymentStatus),
  paymentId: z.string().optional(),
  description: z.string().optional(),
});

type EnrollmentFormData = z.infer<typeof enrollmentFormSchema>;

interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  enrollment?: Enrollment | null;
  onSuccess: () => void;
  isReadOnly?: boolean;
}

export default function EnrollmentModal({
  isOpen,
  onClose,
  enrollment,
  onSuccess,
  isReadOnly = false,
}: EnrollmentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingCohorts, setLoadingCohorts] = useState(false);
  const isEditing = !!enrollment && !isReadOnly;

  const form = useForm<EnrollmentFormData>({
    resolver: isReadOnly ? undefined : zodResolver(enrollmentFormSchema),
    defaultValues: {
      studentId: "",
      cohortId: "",
      enrollmentDate: "",
      status: EnrollmentStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      paymentId: "",
      description: "",
    },
  });

  // Fetch students and cohorts for dropdowns
  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen) return;

      // Fetch students
      setLoadingStudents(true);
      try {
        const studentsResponse = await studentService.getStudents({
          limit: 1000,
        });
        if (studentsResponse.success && studentsResponse.data) {
          setStudents(studentsResponse.data.data);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        toast.error("Failed to load students");
      } finally {
        setLoadingStudents(false);
      }

      // Fetch cohorts
      setLoadingCohorts(true);
      try {
        const cohortsResponse = await cohortService.getCohorts({ limit: 1000 });
        if (cohortsResponse.success && cohortsResponse.data) {
          setCohorts(cohortsResponse.data.data);
        }
      } catch (error) {
        console.error("Error fetching cohorts:", error);
        toast.error("Failed to load cohorts");
      } finally {
        setLoadingCohorts(false);
      }
    };

    fetchData();
  }, [isOpen]);

  // Reset form when modal opens/closes or enrollment changes
  useEffect(() => {
    if (isOpen) {
      if (enrollment) {
        // Editing existing enrollment
        form.reset({
          studentId: enrollment.studentId.toString(),
          cohortId: enrollment.cohortId.toString(),
          enrollmentDate: enrollment.enrollmentDate,
          status: enrollment.status,
          paymentStatus: enrollment.paymentStatus,
          paymentId: enrollment.paymentId || "",
          description: enrollment.description || "",
        });
      } else {
        // Adding new enrollment
        form.reset({
          studentId: "",
          cohortId: "",
          enrollmentDate: new Date().toISOString().split("T")[0], // Today's date
          status: EnrollmentStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          paymentId: "",
          description: "",
        });
      }
    }
  }, [isOpen, enrollment, form]);

  const onSubmit = async (data: EnrollmentFormData) => {
    try {
      setIsSubmitting(true);

      // Clean up empty strings and convert to proper types
      const cleanData = {
        studentId: parseInt(data.studentId),
        cohortId: parseInt(data.cohortId),
        enrollmentDate: data.enrollmentDate,
        status: data.status,
        paymentStatus: data.paymentStatus,
        paymentId: data.paymentId || undefined,
        description: data.description || undefined,
      };

      if (isEditing && enrollment) {
        // Update existing enrollment
        const updateData: UpdateEnrollmentRequest = cleanData;

        const response = await enrollmentService.updateEnrollment(
          enrollment.id,
          updateData
        );

        if (response.success) {
          toast.success("Enrollment updated successfully");
          onSuccess();
          onClose();
        } else {
          toast.error("Failed to update enrollment");
          // Modal stays open on error
        }
      } else {
        // Create new enrollment
        const createData: CreateEnrollmentRequest = cleanData;

        const response = await enrollmentService.createEnrollment(createData);

        if (response.success) {
          toast.success("Enrollment created successfully");
          onSuccess();
          onClose();
        } else {
          toast.error("Failed to create enrollment");
          // Modal stays open on error
        }
      }
    } catch (error) {
      console.error("=== ERROR in onSubmit ===");
      console.error("Error submitting enrollment form:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        error,
      });
      toast.error("An error occurred while saving the enrollment");
      // Modal stays open on error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isReadOnly
              ? "Enrollment Details"
              : isEditing
              ? "Edit Enrollment"
              : "Add New Enrollment"}
          </DialogTitle>
          <DialogDescription>
            {isReadOnly
              ? "View enrollment information below."
              : isEditing
              ? "Update the enrollment information below."
              : "Fill in the details to create a new enrollment."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="studentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isReadOnly || loadingStudents}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full cursor-pointer">
                          <SelectValue
                            placeholder={
                              loadingStudents
                                ? "Loading students..."
                                : "Select student"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem
                            key={student.id}
                            value={student.id.toString()}
                            className="cursor-pointer"
                          >
                            {student.name} ({student.email})
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
                name="cohortId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cohort *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isReadOnly || loadingCohorts}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full cursor-pointer">
                          <SelectValue
                            placeholder={
                              loadingCohorts
                                ? "Loading cohorts..."
                                : "Select cohort"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cohorts.map((cohort) => (
                          <SelectItem
                            key={cohort.id}
                            value={cohort.id.toString()}
                            className="cursor-pointer"
                          >
                            {cohort.name} ({cohort.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="enrollmentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enrollment Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} readOnly={isReadOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment ID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter payment ID"
                        {...field}
                        readOnly={isReadOnly}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
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
                        {Object.entries(EnrollmentStatusLabels).map(
                          ([value, label]) => (
                            <SelectItem
                              key={value}
                              value={value}
                              className="cursor-pointer"
                            >
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
                name="paymentStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Status *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isReadOnly}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full cursor-pointer">
                          <SelectValue placeholder="Select payment status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(PaymentStatusLabels).map(
                          ([value, label]) => (
                            <SelectItem
                              key={value}
                              value={value}
                              className="cursor-pointer"
                            >
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
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Additional Information</h3>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter enrollment description or notes"
                        className="min-h-[80px]"
                        {...field}
                        readOnly={isReadOnly}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="cursor-pointer"
              >
                {isReadOnly ? "Close" : "Cancel"}
              </Button>
              {!isReadOnly && (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="cursor-pointer"
                  onClick={() => {
                    form.handleSubmit(onSubmit)();
                  }}
                >
                  {isSubmitting
                    ? isEditing
                      ? "Updating..."
                      : "Creating..."
                    : isEditing
                    ? "Update Enrollment"
                    : "Create Enrollment"}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
