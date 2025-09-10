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
import type {
  Student,
  CreateStudentRequest,
  UpdateStudentRequest,
} from "@/api/studentTypes";
import {
  StudentStatus,
  StudentStatusLabels,
} from "@/api/studentTypes";
import { toast } from "sonner";
import { studentService } from "@/api/studentService";

// Simplified Zod schema for student form validation
const studentFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  status: z.nativeEnum(StudentStatus),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  education: z.string().optional(),
  profession: z.string().optional(),
  interests: z.string().optional(),
  description: z.string().optional(),
  avatarUrl: z.string().optional(),
  centerId: z.string().optional(),
});

type StudentFormData = z.infer<typeof studentFormSchema>;

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student?: Student | null;
  onSuccess: () => void;
  isReadOnly?: boolean;
  userCenterId?: number;
}

export default function StudentModal({
  isOpen,
  onClose,
  student,
  onSuccess,
  isReadOnly = false,
  userCenterId,
}: StudentModalProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!student;
  const isCreating = !student && !isReadOnly;

  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      status: StudentStatus.ACTIVE,
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      education: "",
      profession: "",
      interests: "",
      description: "",
      avatarUrl: "",
      centerId: userCenterId?.toString() || "",
    },
  });

  // Reset form when student changes
  useEffect(() => {
    if (student) {
        form.reset({
          name: student.name || "",
          email: student.email || "",
          phone: student.phone || "",
          status: student.status || StudentStatus.ACTIVE,
          avatarUrl: student.avatarUrl || "",
          street: student.street || "",
          city: student.city || "",
          state: student.state || "",
          postalCode: student.postalCode || "",
          country: student.country || "",
          education: student.education || "",
          profession: student.profession || "",
          interests: student.interests || "",
          description: student.description || "",
        });
    } else {
      form.reset({
        name: "",
        email: "",
        phone: "",
        status: StudentStatus.ACTIVE,
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        education: "",
        profession: "",
        interests: "",
        description: "",
        avatarUrl: "",
        centerId: userCenterId?.toString() || "",
      });
    }
  }, [student, form, userCenterId]);

  const onSubmit = async (data: StudentFormData) => {
    if (isReadOnly) return;

    try {
      setLoading(true);

      // Convert centerId to number
      const centerId = data.centerId ? parseInt(data.centerId, 10) : userCenterId;
      if (!centerId) {
        toast.error("Center ID is required");
        return;
      }

      const nameParts = data.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Convert empty strings to null
      const cleanedData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          typeof value === 'string' && value.trim() === '' ? null : value
        ])
      );

      const requestData = {
        ...cleanedData,
        centerId,
      };

      let response;
      if (isEditing && student) {
        response = await studentService.updateStudent(
          student.id,
          requestData as UpdateStudentRequest
        );
      } else {
        response = await studentService.createStudent(
          requestData as CreateStudentRequest
        );
      }

      if (response.success) {
        toast.success(
          isEditing ? "Student updated successfully" : "Student created successfully"
        );
        onSuccess();
        onClose(); // Close modal after successful operation
      }
      // Error toasts are handled automatically by apiService
    } catch (error) {
      console.error("Error saving student:", error);
      // Error toasts are handled automatically by apiService
    } finally {
      setLoading(false);
    }
  };

  const getModalTitle = () => {
    if (isReadOnly) return "Student Details";
    if (isEditing) return "Edit Student";
    return "Create Student";
  };

  const getModalDescription = () => {
    if (isReadOnly) return "View student information and details.";
    if (isEditing) return "Update student information and settings.";
    return "Add a new student to the system.";
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
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="md:col-span-3">
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter full name"
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
                  name="email"
                  render={({ field }) => (
                    <FormItem className="md:col-span-3">
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter email address"
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
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="md:col-span-3">
                      <FormLabel>Phone *</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="Enter phone number"
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
                  name="status"
                  render={({ field }) => (
                    <FormItem className="md:col-span-3">
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isReadOnly}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(StudentStatusLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
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
                  name="avatarUrl"
                  render={({ field }) => (
                    <FormItem className="md:col-span-6">
                      <FormLabel>Avatar URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter avatar image URL"
                          {...field}
                          disabled={isReadOnly}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Address Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter street address"
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
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter city"
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
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter state"
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
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter postal code"
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
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter country"
                          {...field}
                          disabled={isReadOnly}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Academic & Professional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Academic & Professional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="education"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Education</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter educational background"
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
                  name="profession"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profession</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter profession"
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
                  name="interests"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Interests</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter interests and hobbies"
                          {...field}
                          disabled={isReadOnly}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter additional description"
                          {...field}
                          disabled={isReadOnly}
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {!isReadOnly && (
              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading
                    ? "Saving..."
                    : isEditing
                    ? "Update Student"
                    : "Create Student"}
                </Button>
              </DialogFooter>
            )}

            {isReadOnly && (
              <DialogFooter>
                <Button type="button" onClick={onClose}>
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