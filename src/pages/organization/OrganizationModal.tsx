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
import type { Organization } from "@/api/organizationTypes";
import {
  OrganizationStatus,
  OrganizationType,
  Currency,
  OrganizationStatusLabels,
  OrganizationTypeLabels,
  CurrencyLabels,
  CommonTimezones,
} from "@/api/organizationTypes";
import { organizationService } from "@/api/organizationService";

// Form validation schema
const organizationFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name must be less than 255 characters"),
  code: z
    .string()
    .min(2, "Code must be at least 2 characters")
    .max(50, "Code must be less than 50 characters")
    .regex(
      /^[A-Z0-9_-]+$/,
      "Code must contain only uppercase letters, numbers, hyphens, and underscores"
    ),
  type: z.nativeEnum(OrganizationType),
  address: z
    .string()
    .max(1000, "Address must be less than 1000 characters")
    .optional(),
  contactEmail: z.string().email("Invalid email address"),
  contactPhone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(20, "Phone number must be less than 20 digits")
    .optional()
    .or(z.literal("")),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  logoUrl: z.string().url("Invalid logo URL").optional().or(z.literal("")),
  establishedDate: z.string().optional(),
  status: z.nativeEnum(OrganizationStatus),
  currency: z.nativeEnum(Currency),
  timezone: z.string().min(1, "Timezone is required"),
});

type OrganizationFormData = z.infer<typeof organizationFormSchema>;

export interface OrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization?: Organization | null;
  onSuccess: () => void;
  isReadOnly?: boolean;
}

export default function OrganizationModal({
  isOpen,
  onClose,
  organization,
  onSuccess,
  isReadOnly = false,
}: OrganizationModalProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      name: "",
      code: "",
      type: OrganizationType.UNIVERSITY,
      address: "",
      contactEmail: "",
      contactPhone: "",
      website: "",
      logoUrl: "",
      establishedDate: "",
      status: OrganizationStatus.ACTIVE,
      currency: Currency.INR,
      timezone: "UTC",
    },
  });

  // Reset form when organization changes
  useEffect(() => {
    if (organization) {
      form.reset({
        name: organization.name,
        code: organization.code,
        type: organization.type,
        address: organization.address || "",
        contactEmail: organization.contactEmail,
        contactPhone: organization.contactPhone || "",
        website: organization.website || "",
        logoUrl: organization.logoUrl || "",
        establishedDate: organization.establishedDate || "",
        status: organization.status,
        currency: organization.currency,
        timezone: organization.timezone,
      });
    } else {
      form.reset({
        name: "",
        code: "",
        type: OrganizationType.UNIVERSITY,
        address: "",
        contactEmail: "",
        contactPhone: "",
        website: "",
        logoUrl: "",
        establishedDate: "",
        status: OrganizationStatus.ACTIVE,
        currency: Currency.INR,
        timezone: "UTC",
      });
    }
  }, [organization, form]);

  const onSubmit = async (data: OrganizationFormData) => {
    try {
      setLoading(true);

      // Clean up empty strings
      const cleanedData = {
        ...data,
        address: data.address || undefined,
        contactPhone: data.contactPhone || undefined,
        website: data.website || undefined,
        logoUrl: data.logoUrl || undefined,
        establishedDate: data.establishedDate || undefined,
      };

      let response;
      if (organization) {
        response = await organizationService.updateOrganization(
          organization.id,
          cleanedData
        );
      } else {
        response = await organizationService.createOrganization(cleanedData);
      }

      if (response.success) {
        toast.success(
          organization
            ? "Organization updated successfully"
            : "Organization created successfully"
        );
        onSuccess();
        onClose();
      } else {
        toast.error(
          organization
            ? "Failed to update organization"
            : "Failed to create organization"
        );
      }
    } catch (error) {
      console.error("Error saving organization:", error);
      toast.error("An error occurred while saving the organization");
    } finally {
      setLoading(false);
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
            {organization
              ? isReadOnly
                ? "View Organization"
                : "Edit Organization"
              : "Create New Organization"}
          </DialogTitle>
          <DialogDescription>
            {organization
              ? isReadOnly
                ? "View organization details and information"
                : "Update organization information and settings"
              : "Add a new organization to the system"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter organization name"
                        {...field}
                        disabled={isReadOnly}
                      />
                    </FormControl>
                    {!isReadOnly && <FormMessage />}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Code *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ORG-001"
                        {...field}
                        disabled={isReadOnly}
                        className="uppercase"
                      />
                    </FormControl>
                    {!isReadOnly && (
                      <FormDescription>
                        Unique identifier for the organization
                      </FormDescription>
                    )}
                    {!isReadOnly && <FormMessage />}
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Type *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isReadOnly}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select organization type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(OrganizationTypeLabels).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    {!isReadOnly && <FormMessage />}
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
                        {Object.entries(OrganizationStatusLabels).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    {!isReadOnly && <FormMessage />}
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter organization address"
                      {...field}
                      disabled={isReadOnly}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="contact@organization.com"
                        {...field}
                        disabled={isReadOnly}
                      />
                    </FormControl>
                    {!isReadOnly && <FormMessage />}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Phone</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        {...field}
                        disabled={isReadOnly}
                      />
                    </FormControl>
                    {!isReadOnly && <FormMessage />}
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://www.organization.com"
                        {...field}
                        disabled={isReadOnly}
                      />
                    </FormControl>
                    {!isReadOnly && <FormMessage />}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://example.com/logo.png"
                        {...field}
                        disabled={isReadOnly}
                      />
                    </FormControl>
                    {!isReadOnly && <FormMessage />}
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="establishedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Established Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} disabled={isReadOnly} />
                    </FormControl>
                    {!isReadOnly && <FormMessage />}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isReadOnly}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(CurrencyLabels).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    {!isReadOnly && <FormMessage />}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timezone *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isReadOnly}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CommonTimezones.map((timezone) => (
                          <SelectItem key={timezone} value={timezone}>
                            {timezone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!isReadOnly && <FormMessage />}
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              {!isReadOnly && (
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {organization ? "Update Organization" : "Create Organization"}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
