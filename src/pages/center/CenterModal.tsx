/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Center } from "@/api/centerTypes";
import {
  CenterStatus,
  CenterStatusLabels,
  CenterStatusColors,
} from "@/api/centerTypes";
import { centerService } from "@/api/centerService";

// Form validation schema
const centerFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  contactEmail: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  contactPhone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(20, "Phone number must be less than 20 digits")
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .max(200, "Address must be less than 200 characters")
    .optional(),
  city: z
    .string()
    .max(50, "City must be less than 50 characters")
    .optional(),
  state: z
    .string()
    .max(50, "State must be less than 50 characters")
    .optional(),
  country: z
    .string()
    .max(50, "Country must be less than 50 characters")
    .optional(),
  postalCode: z
    .string()
    .max(20, "Postal code must be less than 20 characters")
    .optional(),
  capacity: z
    .number()
    .min(1, "Capacity must be at least 1")
    .max(10000, "Capacity must be less than 10,000")
    .optional(),
  status: z.nativeEnum(CenterStatus),
});

type CenterFormData = z.infer<typeof centerFormSchema>;

export interface CenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  center?: Center | null;
  onSuccess: () => void;
  isReadOnly?: boolean;
}

export default function CenterModal({
  isOpen,
  onClose,
  center,
  onSuccess,
  isReadOnly = false,
}: CenterModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!center && !isReadOnly;
  const isCreating = !center && !isReadOnly;
  const isViewing = isReadOnly;

  // Form setup
  const form = useForm<CenterFormData>({
    resolver: zodResolver(centerFormSchema),
    defaultValues: {
      name: "",
      description: "",
      contactEmail: "",
      contactPhone: "",
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      capacity: undefined,
      status: CenterStatus.ACTIVE,
    },
  });

  // Reset form when center changes
  useEffect(() => {
    if (center) {
      form.reset({
        name: center.name || "",
        description: center.description || "",
        contactEmail: center.contactEmail || "",
        contactPhone: center.contactPhone || "",
        address: center.address || "",
        city: center.city || "",
        state: center.state || "",
        country: center.country || "",
        postalCode: center.postalCode || "",
        capacity: center.capacity || undefined,
        status: center.status || CenterStatus.ACTIVE,
      });
    } else {
      form.reset({
        name: "",
        description: "",
        contactEmail: "",
        contactPhone: "",
        address: "",
        city: "",
        state: "",
        country: "",
        postalCode: "",
        capacity: undefined,
        status: CenterStatus.ACTIVE,
      });
    }
  }, [center, form]);

  // Handle form submission
  const onSubmit = async (data: CenterFormData) => {
    if (isReadOnly) return;

    try {
      setIsSubmitting(true);

      // Clean up empty strings to undefined
      const cleanedData = {
        ...data,
        contactEmail: data.contactEmail || undefined,
        contactPhone: data.contactPhone || undefined,
        description: data.description || undefined,
        address: data.address || undefined,
        city: data.city || undefined,
        state: data.state || undefined,
        country: data.country || undefined,
        postalCode: data.postalCode || undefined,
      };

      let response;
      if (isEditing && center) {
        response = await centerService.updateCenter(center.id, cleanedData);
      } else {
        // Add organizationId for create requests (using a default value of 1 for now)
        const createData = {
          ...cleanedData,
          organizationId: 1, // TODO: Get from user context or organization selector
        };
        response = await centerService.createCenter(createData);
      }

      if (response.success) {
        toast.success(
          isEditing ? "Center updated successfully" : "Center created successfully"
        );
        onSuccess();
        onClose();
      } else {
        toast.error(
          response.message ||
            `Failed to ${isEditing ? "update" : "create"} center`
        );
      }
    } catch (error) {
      console.error("Error submitting center form:", error);
      toast.error(
        `Error ${isEditing ? "updating" : "creating"} center: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle dialog close
  const handleClose = () => {
    if (!isSubmitting) {
      form.reset();
      onClose();
    }
  };

  // Generate avatar initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getModalTitle = () => {
    if (isReadOnly) return "Center Details";
    if (isEditing) return "Edit Center";
    return "Create Center";
  };

  const getModalDescription = () => {
    if (isReadOnly) return "View center information and details.";
    if (isEditing) return "Update center information and settings.";
    return "Add a new center to the system.";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getModalTitle()}</DialogTitle>
          <DialogDescription>{getModalDescription()}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form id="center-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Center Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter center name"
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
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
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
                          {Object.entries(CenterStatusLabels).map(
                            ([value, label]) => (
                              <SelectItem key={value} value={value}>
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
                          placeholder="Enter center description"
                          rows={3}
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
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter center capacity"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value ? parseInt(value, 10) : undefined);
                          }}
                          disabled={isReadOnly}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
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
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
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
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Address Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address"
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
          </form>
        </Form>

        <DialogFooter>
          {isCreating && (
            <>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" form="center-form" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Center"
                )}
              </Button>
            </>
          )}

          {isEditing && (
            <>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" form="center-form" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Center"
                )}
              </Button>
            </>
          )}

          {isViewing && (
            <Button type="button" variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}