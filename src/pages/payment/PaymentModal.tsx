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
import type {
  Payment,
  CreatePaymentRequest,
  UpdatePaymentRequest,
} from "@/api/paymentTypes";
import {
  PaymentMethod,
  PaymentStatus,
  PaymentMethodLabels,
  PaymentStatusLabels,
} from "@/api/paymentTypes";
import { toast } from "sonner";
import { paymentService } from "@/api/paymentService";
import { studentService } from "@/api/studentService";
import { enrollmentService } from "@/api/enrollmentService";
import { courseService } from "@/api/courseService";
import { cohortService } from "@/api/cohortService";
import { centerService } from "@/api/centerService";
import { employeeService } from "@/api/employeeService";
import type { Student } from "@/api/studentTypes";
import type { Enrollment } from "@/api/enrollmentTypes";
import type { Course } from "@/api/courseTypes";
import type { Cohort } from "@/api/cohortTypes";
import type { Center } from "@/api/centerTypes";
import type { Employee } from "@/api/employeeTypes";

// Simplified Zod schema for payment form validation
const paymentFormSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  enrollmentId: z.string().min(1, "Enrollment is required"),
  courseId: z.string().min(1, "Course is required"),
  cohortId: z.string().min(1, "Cohort is required"),
  centerId: z.string().min(1, "Center is required"),
  processedByEmployeeId: z.string().min(1, "Processed by employee is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  balance: z.number().min(0, "Balance cannot be negative"),
  paymentMethod: z.nativeEnum(PaymentMethod),
  transactionId: z.string().optional(),
  paymentDate: z.date({
    message: "Payment date is required",
  }),
  status: z.nativeEnum(PaymentStatus),
  description: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentFormSchema>;

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment?: Payment | null;
  onSuccess: () => void;
  isReadOnly?: boolean;
}

export default function PaymentModal({
  isOpen,
  onClose,
  payment,
  onSuccess,
  isReadOnly = false,
}: PaymentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingCohorts, setLoadingCohorts] = useState(false);
  const [loadingCenters, setLoadingCenters] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const isEditing = !!payment && !isReadOnly;

  const form = useForm<PaymentFormData>({
    resolver: isReadOnly ? undefined : zodResolver(paymentFormSchema),
    defaultValues: {
      studentId: "",
      enrollmentId: "",
      courseId: "",
      cohortId: "",
      centerId: "",
      processedByEmployeeId: "",
      amount: 0,
      balance: 0,
      paymentMethod: PaymentMethod.OTHER,
      transactionId: "",
      paymentDate: new Date(),
      status: PaymentStatus.PENDING,
      description: "",
    },
  });

  // Fetch data for dropdowns
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

      // Fetch enrollments
      setLoadingEnrollments(true);
      try {
        const enrollmentsResponse = await enrollmentService.getEnrollments({
          limit: 1000,
        });
        if (enrollmentsResponse.success && enrollmentsResponse.data) {
          setEnrollments(enrollmentsResponse.data.data);
        }
      } catch (error) {
        console.error("Error fetching enrollments:", error);
        toast.error("Failed to load enrollments");
      } finally {
        setLoadingEnrollments(false);
      }

      // Fetch courses
      setLoadingCourses(true);
      try {
        const coursesResponse = await courseService.getCourses({
          limit: 1000,
        });
        if (coursesResponse.success && coursesResponse.data) {
          setCourses(coursesResponse.data.data);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error("Failed to load courses");
      } finally {
        setLoadingCourses(false);
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

      // Fetch centers
      setLoadingCenters(true);
      try {
        const centersResponse = await centerService.getCenters({
          limit: 1000,
        });
        if (centersResponse.success && centersResponse.data) {
          setCenters(centersResponse.data.data);
        }
      } catch (error) {
        console.error("Error fetching centers:", error);
        toast.error("Failed to load centers");
      } finally {
        setLoadingCenters(false);
      }

      // Fetch employees
      setLoadingEmployees(true);
      try {
        const employeesResponse = await employeeService.getEmployees({
          limit: 1000,
        });
        if (employeesResponse.success && employeesResponse.data) {
          setEmployees(employeesResponse.data.data);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
        toast.error("Failed to load employees");
      } finally {
        setLoadingEmployees(false);
      }
    };

    fetchData();
  }, [isOpen]);

  // Reset form when modal opens/closes or payment changes
  useEffect(() => {
    if (isOpen) {
      if (payment) {
        // Editing existing payment
        form.reset({
          studentId: payment.studentId.toString(),
          enrollmentId: payment.enrollmentId.toString(),
          courseId: payment.courseId.toString(),
          cohortId: payment.cohortId.toString(),
          centerId: payment.centerId.toString(),
          processedByEmployeeId: payment.processedByEmployeeId.toString(),
          amount: payment.amount,
          balance: payment.balance,
          paymentMethod: payment.paymentMethod,
          transactionId: payment.transactionId || "",
          paymentDate: new Date(payment.paymentDate),
          status: payment.status,
          description: payment.description || "",
        });
      } else {
        // Adding new payment
        form.reset({
          studentId: "",
          enrollmentId: "",
          courseId: "",
          cohortId: "",
          centerId: "",
          processedByEmployeeId: "",
          amount: 0,
          balance: 0,
          paymentMethod: PaymentMethod.OTHER,
          transactionId: "",
          paymentDate: new Date(),
          status: PaymentStatus.PENDING,
          description: "",
        });
      }
    }
  }, [isOpen, payment, form]);

  const onSubmit = async (data: PaymentFormData) => {
    try {
      setIsSubmitting(true);

      // Clean up empty strings and convert to proper types
      const cleanData = {
        studentId: parseInt(data.studentId),
        enrollmentId: parseInt(data.enrollmentId),
        courseId: parseInt(data.courseId),
        cohortId: parseInt(data.cohortId),
        centerId: parseInt(data.centerId),
        processedByEmployeeId: parseInt(data.processedByEmployeeId),
        amount: data.amount,
        balance: data.balance,
        paymentMethod: data.paymentMethod,
        transactionId: data.transactionId || undefined,
        paymentDate: data.paymentDate.toISOString().split("T")[0],
        status: data.status,
        description: data.description || undefined,
      };

      if (isEditing && payment) {
        // Update existing payment
        const updateData: UpdatePaymentRequest = cleanData;

        const response = await paymentService.updatePayment(
          payment.id,
          updateData
        );

        if (response.success) {
          toast.success("Payment updated successfully");
          onSuccess();
          onClose();
        } else {
          toast.error("Failed to update payment");
        }
      } else {
        // Create new payment
        const createData: CreatePaymentRequest = cleanData;

        const response = await paymentService.createPayment(createData);

        if (response.success) {
          toast.success("Payment created successfully");
          onSuccess();
          onClose();
        } else {
          toast.error("Failed to create payment");
        }
      }
    } catch (error) {
      console.error("Error submitting payment form:", error);
      toast.error("An error occurred while saving the payment");
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
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isReadOnly
              ? "Payment Details"
              : isEditing
              ? "Edit Payment"
              : "Add New Payment"}
          </DialogTitle>
          <DialogDescription>
            {isReadOnly
              ? "View payment information below."
              : isEditing
              ? "Update the payment information below."
              : "Fill in the details to create a new payment."}
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
                name="enrollmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enrollment *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isReadOnly || loadingEnrollments}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full cursor-pointer">
                          <SelectValue
                            placeholder={
                              loadingEnrollments
                                ? "Loading enrollments..."
                                : "Select enrollment"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {enrollments.map((enrollment) => (
                          <SelectItem
                            key={enrollment.id}
                            value={enrollment.id.toString()}
                            className="cursor-pointer"
                          >
                            {enrollment.student?.name} -{" "}
                            {enrollment.cohort?.name}
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
                name="courseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isReadOnly || loadingCourses}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full cursor-pointer">
                          <SelectValue
                            placeholder={
                              loadingCourses
                                ? "Loading courses..."
                                : "Select course"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem
                            key={course.id}
                            value={course.id.toString()}
                            className="cursor-pointer"
                          >
                            {course.name}
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
                name="centerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Center *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isReadOnly || loadingCenters}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full cursor-pointer">
                          <SelectValue
                            placeholder={
                              loadingCenters
                                ? "Loading centers..."
                                : "Select center"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {centers.map((center) => (
                          <SelectItem
                            key={center.id}
                            value={center.id.toString()}
                            className="cursor-pointer"
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

              <FormField
                control={form.control}
                name="processedByEmployeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Processed By Employee *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isReadOnly || loadingEmployees}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full cursor-pointer">
                          <SelectValue
                            placeholder={
                              loadingEmployees
                                ? "Loading employees..."
                                : "Select employee"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem
                            key={employee.id}
                            value={employee.id.toString()}
                            className="cursor-pointer"
                          >
                            {employee.name} ({employee.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Payment Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Payment Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Enter amount"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                          readOnly={isReadOnly}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="balance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Balance *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Enter balance"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
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
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isReadOnly}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full cursor-pointer">
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(PaymentMethodLabels).map(
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
                  name="transactionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transaction ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter transaction ID"
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
                  name="paymentDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Payment Date *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={`w-full pl-3 text-left font-normal ${
                                !field.value && "text-muted-foreground"
                              } ${
                                isReadOnly
                                  ? "cursor-not-allowed opacity-50"
                                  : "cursor-pointer"
                              }`}
                              disabled={isReadOnly}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        {!isReadOnly && (
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() ||
                                date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        )}
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter payment description or notes"
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
                >
                  {isSubmitting
                    ? isEditing
                      ? "Updating..."
                      : "Creating..."
                    : isEditing
                    ? "Update Payment"
                    : "Create Payment"}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
