"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Save, ArrowLeft, Mail } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  EnquirySource,
  EnquiryStatus,
  Gender,
  ModeOfLearning,
  EnquirySourceLabels,
  EnquiryStatusLabels,
  GenderLabels,
  ModeOfLearningLabels,
} from "@/api/enquiryTypes";
import { enquiryService } from "@/api/enquiryService";
import { courseService } from "@/api/courseService";

// Comprehensive Zod schema for enquiry form validation
const enquiryFormSchema = z.object({
  // Basic Information
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone number is required"),
  enquiryDate: z.date({
    message: "Enquiry date is required",
  }),
  description: z.string().optional(),
  centerId: z.number().optional(),
  courseId: z.number().min(1, "Course is required"),
  assignedEmployeeId: z.number().optional(),
  source: z.enum(Object.values(EnquirySource) as [string, ...string[]]),
  status: z.enum(Object.values(EnquiryStatus) as [string, ...string[]]),

  // Address Information
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),

  // Personal Information
  dateOfBirth: z.date().optional(),
  gender: z.enum(Object.values(Gender) as [string, ...string[]], {
    message: "Gender is required",
  }),
  whatsappNumber: z.string().optional(),
  nationality: z.string().optional(),

  // Emergency Contact
  emergencyContactName: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
  emergencyContactNumber: z.string().optional(),

  // Educational Background
  education: z.string().optional(),
  collegeUniversity: z.string().optional(),
  yearOfCompletion: z.number().optional(),
  specializedSubjects: z.string().optional(),

  // Professional Details
  profession: z.string().optional(),
  companyOrganization: z.string().optional(),
  designation: z.string().optional(),
  yearsOfExperience: z.number().optional(),
  industry: z.string().optional(),
  currentSkillsTools: z.string().optional(),
  currentSalaryRange: z.string().optional(),
  careerGoalAfterCourse: z.string().optional(),

  // Course Preferences
  programApplyingFor: z.string().optional(),
  preferredBatchTiming: z.string().optional(),
  modeOfLearning: z.enum(
    Object.values(ModeOfLearning) as [string, ...string[]],
    {
      message: "Mode of learning is required",
    }
  ),

  // Technical Requirements
  hasLaptopPc: z.boolean().optional(),
  hasInternetConnectivity: z.boolean().optional(),

  // Additional Information
  whyLearnDigitalMarketing: z.string().optional(),

  // Payment Information
  paymentPreference: z.string().optional(),
  preferredPaymentMethod: z.string().optional(),

  // Document Management
  hasIdProof: z.boolean().optional(),
  hasPassportPhoto: z.boolean().optional(),
  hasEducationalCertificate: z.boolean().optional(),

  // Declaration & Signature
  preferredJobRole: z.string().optional(),
  signature: z.string().optional(),
  declarationDate: z.date().optional(),
});

type EnquiryFormData = z.infer<typeof enquiryFormSchema>;

export default function PublicEnquiryFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isEditing = !!id && id !== "new";
  const isViewing = searchParams.get("mode") === "view";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState<Array<{ id: number; name: string }>>(
    []
  );

  const form = useForm<EnquiryFormData>({
    resolver: isViewing ? undefined : zodResolver(enquiryFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      enquiryDate: new Date(),
      description: "",
      centerId: undefined,
      courseId: undefined,
      assignedEmployeeId: undefined,
      source: "OTHER" as EnquirySource,
      status: "NEW" as EnquiryStatus,
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      dateOfBirth: undefined,
      gender: undefined,
      whatsappNumber: "",
      nationality: "",
      emergencyContactName: "",
      emergencyContactRelationship: "",
      emergencyContactNumber: "",
      education: "",
      collegeUniversity: "",
      yearOfCompletion: undefined,
      specializedSubjects: "",
      profession: "",
      companyOrganization: "",
      designation: "",
      yearsOfExperience: undefined,
      industry: "",
      currentSkillsTools: "",
      currentSalaryRange: "",
      careerGoalAfterCourse: "",
      programApplyingFor: "",
      preferredBatchTiming: "",
      modeOfLearning: undefined,
      hasLaptopPc: false,
      hasInternetConnectivity: false,
      whyLearnDigitalMarketing: "",
      paymentPreference: "",
      preferredPaymentMethod: "",
      hasIdProof: false,
      hasPassportPhoto: false,
      hasEducationalCertificate: false,
      preferredJobRole: "",
      signature: "",
      declarationDate: undefined,
    },
  });

  // Fetch courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await courseService.getCourses({ limit: 100 });
        if (response.success && response.data) {
          setCourses(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchCourses();
  }, []);

  // Load enquiry data when editing
  useEffect(() => {
    if (isEditing && id) {
      const loadEnquiry = async () => {
        setIsLoading(true);
        try {
          const response = await enquiryService.getEnquiryById(Number(id));
          if (response.success && response.data) {
            const enquiry = response.data;
            console.log("Enquiry data:", enquiry);
            console.log("Enquiry date from API:", enquiry.enquiryDate);

            // More robust date parsing
            let parsedEnquiryDate = new Date();
            if (enquiry.enquiryDate) {
              try {
                parsedEnquiryDate = new Date(enquiry.enquiryDate);
                // Check if the date is valid
                if (isNaN(parsedEnquiryDate.getTime())) {
                  console.warn("Invalid date from API, using current date");
                  parsedEnquiryDate = new Date();
                }
              } catch (error) {
                console.warn("Error parsing date, using current date:", error);
                parsedEnquiryDate = new Date();
              }
            }
            console.log("Final parsed enquiry date:", parsedEnquiryDate);

            form.reset({
              name: enquiry.name,
              phone: enquiry.phone || "",
              enquiryDate: parsedEnquiryDate,
              description: enquiry.description || "",
              centerId: enquiry.centerId || undefined,
              courseId: enquiry.courseId || undefined,
              assignedEmployeeId: enquiry.assignedEmployeeId || undefined,
              source: enquiry.source,
              status: enquiry.status,
              street: enquiry.street || "",
              city: enquiry.city || "",
              state: enquiry.state || "",
              postalCode: enquiry.postalCode || "",
              country: enquiry.country || "",
              dateOfBirth: enquiry.dateOfBirth
                ? (() => {
                    try {
                      const parsedDate = new Date(enquiry.dateOfBirth);
                      return isNaN(parsedDate.getTime())
                        ? undefined
                        : parsedDate;
                    } catch (error) {
                      console.warn("Error parsing dateOfBirth:", error);
                      return undefined;
                    }
                  })()
                : undefined,
              gender: enquiry.gender || "",
              whatsappNumber: enquiry.whatsappNumber || "",
              nationality: enquiry.nationality || "",
              emergencyContactName: enquiry.emergencyContactName || "",
              emergencyContactRelationship:
                enquiry.emergencyContactRelationship || "",
              emergencyContactNumber: enquiry.emergencyContactNumber || "",
              education: enquiry.education || "",
              collegeUniversity: enquiry.collegeUniversity || "",
              yearOfCompletion: enquiry.yearOfCompletion,
              specializedSubjects: enquiry.specializedSubjects || "",
              profession: enquiry.profession || "",
              companyOrganization: enquiry.companyOrganization || "",
              designation: enquiry.designation || "",
              yearsOfExperience: enquiry.yearsOfExperience,
              industry: enquiry.industry || "",
              currentSkillsTools: enquiry.currentSkillsTools || "",
              currentSalaryRange: enquiry.currentSalaryRange || "",
              careerGoalAfterCourse: enquiry.careerGoalAfterCourse || "",
              programApplyingFor: enquiry.programApplyingFor || "",
              preferredBatchTiming: enquiry.preferredBatchTiming || "",
              modeOfLearning: enquiry.modeOfLearning || "",
              hasLaptopPc: Boolean(enquiry.hasLaptopPc),
              hasInternetConnectivity: Boolean(enquiry.hasInternetConnectivity),
              whyLearnDigitalMarketing: enquiry.whyLearnDigitalMarketing || "",
              paymentPreference: enquiry.paymentPreference || "",
              preferredPaymentMethod: enquiry.preferredPaymentMethod || "",
              hasIdProof: Boolean(enquiry.hasIdProof),
              hasPassportPhoto: Boolean(enquiry.hasPassportPhoto),
              hasEducationalCertificate: Boolean(
                enquiry.hasEducationalCertificate
              ),
              preferredJobRole: enquiry.preferredJobRole || "",
              signature: enquiry.signature || "",
              declarationDate: enquiry.declarationDate
                ? (() => {
                    try {
                      const parsedDate = new Date(enquiry.declarationDate);
                      return isNaN(parsedDate.getTime())
                        ? undefined
                        : parsedDate;
                    } catch (error) {
                      console.warn("Error parsing declarationDate:", error);
                      return undefined;
                    }
                  })()
                : undefined,
            });
          }
        } catch (error) {
          console.error("Error loading enquiry:", error);
          toast.error("Failed to load enquiry data");
        } finally {
          setIsLoading(false);
        }
      };

      loadEnquiry();
    }
  }, [id, isEditing, form]);

  const onSubmit = async (data: EnquiryFormData) => {
    try {
      setIsSubmitting(true);

      console.log("Form data on submit:", data);

      // Clean up data and convert to proper types
      const cleanData = {
        name: data.name,
        phone: data.phone || undefined,
        enquiryDate: data.enquiryDate.toISOString().split("T")[0],
        description: data.description || undefined,
        centerId: data.centerId || undefined,
        courseId: data.courseId || undefined,
        assignedEmployeeId: data.assignedEmployeeId || undefined,
        source: data.source as EnquirySource,
        status: "NEW" as EnquiryStatus,
        street: data.street || undefined,
        city: data.city || undefined,
        state: data.state || undefined,
        postalCode: data.postalCode || undefined,
        country: data.country || undefined,
        dateOfBirth: data.dateOfBirth?.toISOString().split("T")[0] || undefined,
        gender: (data.gender as Gender) || undefined,
        whatsappNumber: data.whatsappNumber || undefined,
        nationality: data.nationality || undefined,
        emergencyContactName: data.emergencyContactName || undefined,
        emergencyContactRelationship:
          data.emergencyContactRelationship || undefined,
        emergencyContactNumber: data.emergencyContactNumber || undefined,
        education: data.education || undefined,
        collegeUniversity: data.collegeUniversity || undefined,
        yearOfCompletion: data.yearOfCompletion || undefined,
        specializedSubjects: data.specializedSubjects || undefined,
        profession: data.profession || undefined,
        companyOrganization: data.companyOrganization || undefined,
        designation: data.designation || undefined,
        yearsOfExperience: data.yearsOfExperience || undefined,
        industry: data.industry || undefined,
        currentSkillsTools: data.currentSkillsTools || undefined,
        currentSalaryRange: data.currentSalaryRange || undefined,
        careerGoalAfterCourse: data.careerGoalAfterCourse || undefined,
        programApplyingFor: data.programApplyingFor || undefined,
        preferredBatchTiming: data.preferredBatchTiming || undefined,
        modeOfLearning: (data.modeOfLearning as ModeOfLearning) || undefined,
        hasLaptopPc: data.hasLaptopPc,
        hasInternetConnectivity: data.hasInternetConnectivity,
        whyLearnDigitalMarketing: data.whyLearnDigitalMarketing || undefined,
        paymentPreference: data.paymentPreference || undefined,
        preferredPaymentMethod: data.preferredPaymentMethod || undefined,
        hasIdProof: data.hasIdProof,
        hasPassportPhoto: data.hasPassportPhoto,
        hasEducationalCertificate: data.hasEducationalCertificate,
        preferredJobRole: data.preferredJobRole || undefined,
        signature: data.signature || undefined,
        declarationDate:
          data.declarationDate?.toISOString().split("T")[0] || undefined,
      };

      if (isEditing) {
        // Update existing enquiry
        const response = await enquiryService.updateEnquiry(
          Number(id),
          cleanData
        );
        if (response.success) {
          toast.success("Enquiry updated successfully");
          navigate("/");
        } else {
          toast.error("Failed to update enquiry");
        }
      } else {
        // Create new enquiry
        const response = await enquiryService.createEnquiry(cleanData);
        if (response.success) {
          toast.success(
            "Enquiry submitted successfully! We'll get back to you soon."
          );
          navigate("/");
        } else {
          toast.error("Failed to submit enquiry");
        }
      }
    } catch (error) {
      console.error("Error submitting enquiry form:", error);
      toast.error("An error occurred while submitting the enquiry");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        {/* Header */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
          <div className="w-full px-6 py-6">
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    SendTrail
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                    Loading Enquiry...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="w-full px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-lg text-slate-600 dark:text-slate-400">
                Loading enquiry data...
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        <div className="w-full px-6 py-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  SendTrail
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                  {isEditing
                    ? "Edit Enquiry"
                    : isViewing
                    ? "View Enquiry"
                    : "Submit Enquiry"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="w-full px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Single Form Card */}
              <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <CardContent className="p-8 space-y-8">
                  {/* Basic Information Section */}
                  <div className="space-y-4">
                    <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                        Basic Information
                      </h2>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Essential details about the enquiry
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter full name"
                                {...field}
                                readOnly={isViewing}
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
                              onValueChange={(value) =>
                                field.onChange(
                                  value === "none" ? undefined : Number(value)
                                )
                              }
                              value={field.value?.toString() || "none"}
                              disabled={isViewing}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full cursor-pointer">
                                  <SelectValue placeholder="Select course" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem
                                  value="none"
                                  className="cursor-pointer"
                                >
                                  No course selected
                                </SelectItem>
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter phone number"
                                {...field}
                                readOnly={isViewing}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="enquiryDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Enquiry Date *</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={`w-full pl-3 text-left font-normal ${
                                      !field.value && "text-muted-foreground"
                                    } ${
                                      isViewing
                                        ? "cursor-not-allowed opacity-50"
                                        : "cursor-pointer"
                                    }`}
                                    disabled={isViewing}
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
                              {!isViewing && (
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="source"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Source *</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              disabled={isViewing}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full cursor-pointer">
                                  <SelectValue placeholder="Select source" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(EnquirySourceLabels).map(
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
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status *</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              disabled={true}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full cursor-not-allowed opacity-50">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(EnquiryStatusLabels).map(
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
                              placeholder="Enter enquiry description or notes"
                              className="min-h-[80px]"
                              {...field}
                              readOnly={isViewing}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Address Information Section */}
                  <div className="space-y-4">
                    <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                        Address Information
                      </h2>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Contact and location details
                      </p>
                    </div>
                    <FormField
                      control={form.control}
                      name="street"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter street address"
                              {...field}
                              readOnly={isViewing}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                readOnly={isViewing}
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
                            <FormLabel>State/Province</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter state"
                                {...field}
                                readOnly={isViewing}
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
                                readOnly={isViewing}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

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
                              readOnly={isViewing}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Personal Information Section */}
                  <div className="space-y-4">
                    <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                        Personal Information
                      </h2>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Personal details and contact information
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Date of Birth</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={`w-full pl-3 text-left font-normal ${
                                      !field.value && "text-muted-foreground"
                                    } ${
                                      isViewing
                                        ? "cursor-not-allowed opacity-50"
                                        : "cursor-pointer"
                                    }`}
                                    disabled={isViewing}
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
                              {!isViewing && (
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
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
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender *</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              disabled={isViewing}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full cursor-pointer">
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(GenderLabels).map(
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
                        name="nationality"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nationality</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter nationality"
                                {...field}
                                readOnly={isViewing}
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
                        name="whatsappNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>WhatsApp Number</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter WhatsApp number"
                                {...field}
                                readOnly={isViewing}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="emergencyContactNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Emergency Contact Number</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter emergency contact number"
                                {...field}
                                readOnly={isViewing}
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
                        name="emergencyContactName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Emergency Contact Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter emergency contact name"
                                {...field}
                                readOnly={isViewing}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="emergencyContactRelationship"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Relationship</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter relationship"
                                {...field}
                                readOnly={isViewing}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Course Preferences Section */}
                  <div className="space-y-4">
                    <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                        Course Preferences
                      </h2>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Information about course preferences and learning goals
                      </p>
                    </div>
                    <FormField
                      control={form.control}
                      name="programApplyingFor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Program Applying For</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter program name"
                              {...field}
                              readOnly={isViewing}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="preferredBatchTiming"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Batch Timing</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Morning, Evening"
                                {...field}
                                readOnly={isViewing}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="modeOfLearning"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mode of Learning *</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              disabled={isViewing}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full cursor-pointer">
                                  <SelectValue placeholder="Select mode" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(ModeOfLearningLabels).map(
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
                      name="whyLearnDigitalMarketing"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Why Learn Digital Marketing?</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your motivation for learning digital marketing"
                              className="min-h-[80px]"
                              {...field}
                              readOnly={isViewing}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="careerGoalAfterCourse"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Career Goal After Course</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Describe your career aspirations"
                              {...field}
                              readOnly={isViewing}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Technical Requirements Section */}
                  <div className="space-y-4">
                    <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                        Technical Requirements
                      </h2>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Technical setup and requirements
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <FormField
                        control={form.control}
                        name="hasLaptopPc"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={isViewing}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Has Laptop/PC</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="hasInternetConnectivity"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={isViewing}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Has Internet Connectivity</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Document Management Section */}
                  <div className="space-y-4">
                    <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                        Document Management
                      </h2>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Required documents and certificates
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <FormField
                        control={form.control}
                        name="hasIdProof"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={isViewing}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Has ID Proof</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="hasPassportPhoto"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={isViewing}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Has Passport Photo</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="hasEducationalCertificate"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={isViewing}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Has Educational Certificate</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Declaration & Signature Section */}
                  <div className="space-y-4">
                    <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                        Declaration & Signature
                      </h2>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Final declaration and signature details
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="preferredJobRole"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Job Role</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter preferred job role"
                                {...field}
                                readOnly={isViewing}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="declarationDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Declaration Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={`w-full pl-3 text-left font-normal ${
                                      !field.value && "text-muted-foreground"
                                    } ${
                                      isViewing
                                        ? "cursor-not-allowed opacity-50"
                                        : "cursor-pointer"
                                    }`}
                                    disabled={isViewing}
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
                              {!isViewing && (
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
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
                    </div>
                    <FormField
                      control={form.control}
                      name="signature"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Signature</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter signature or declaration text"
                              {...field}
                              readOnly={isViewing}
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {!isViewing && (
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-6 mt-8">
                      <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          <p>
                            By submitting this form, you agree to our terms and
                            conditions.
                          </p>
                          <p>
                            Your information is secure and will be kept
                            confidential.
                          </p>
                        </div>
                        <div className="flex space-x-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                            className="cursor-pointer"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="cursor-pointer"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            {isSubmitting
                              ? isEditing
                                ? "Updating..."
                                : "Submitting..."
                              : isEditing
                              ? "Update Enquiry"
                              : "Submit Enquiry"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
