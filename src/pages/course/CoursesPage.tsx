/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Course } from "@/api/courseTypes";
import { CourseStatus, CourseDifficulty } from "@/api/courseTypes";
import { courseService } from "@/api/courseService";
import { toast } from "sonner";
import { useAppStore } from "@/stores/appStore";
import { CourseCard } from "@/components/course";

export function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");

  // Get user data from store
  const { user } = useAppStore();

  // Fetch courses data on component mount
  useEffect(() => {
    let isCancelled = false;

    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await courseService.getCourses({
          limit: 100,
          search: searchTerm || undefined,
          status: statusFilter !== "all" ? (statusFilter as any) : undefined,
          difficulty:
            difficultyFilter !== "all" ? (difficultyFilter as any) : undefined,
          centerId: user?.centerId,
        });

        // Only update state if component is still mounted
        if (!isCancelled) {
          if (response.success && response.data) {
            setCourses(response.data.data);
          } else {
            setCourses([]);
          }
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        // Only show error if component is still mounted
        if (!isCancelled) {
          setCourses([]);
          toast.error("Error loading courses");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchCourses();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isCancelled = true;
    };
  }, [searchTerm, statusFilter, difficultyFilter, user?.centerId]);

  // Handle search with debouncing
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  // Handle difficulty filter change
  const handleDifficultyFilterChange = (value: string) => {
    setDifficultyFilter(value);
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
                placeholder="Search courses..."
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
                <SelectItem value={CourseStatus.ACTIVE}>Active</SelectItem>
                <SelectItem value={CourseStatus.INACTIVE}>Inactive</SelectItem>
                <SelectItem value={CourseStatus.DRAFT}>Draft</SelectItem>
                <SelectItem value={CourseStatus.ARCHIVED}>Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={difficultyFilter}
              onValueChange={handleDifficultyFilterChange}
            >
              <SelectTrigger className="w-[180px] cursor-pointer">
                <SelectValue placeholder="Filter by difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulty</SelectItem>
                <SelectItem value={CourseDifficulty.BEGINNER}>
                  Beginner
                </SelectItem>
                <SelectItem value={CourseDifficulty.INTERMEDIATE}>
                  Intermediate
                </SelectItem>
                <SelectItem value={CourseDifficulty.ADVANCED}>
                  Advanced
                </SelectItem>
                <SelectItem value={CourseDifficulty.EXPERT}>Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              id={course.id}
              name={course.name}
              category={course.category?.name || "General"}
              tags={Array.isArray(course.tags) ? course.tags.join(", ") : ""}
              price={
                typeof course.price === "number" ? course.price.toString() : "0"
              }
              duration={
                typeof course.duration === "number" ? course.duration : 0
              }
              prerequisite={
                Array.isArray(course.prerequisites) &&
                course.prerequisites.length > 0
                  ? course.prerequisites[0]
                  : "None"
              }
              minQualifications="High School"
              rating={
                typeof course.rating === "number"
                  ? course.rating.toFixed(1)
                  : "0.0"
              }
              avatarUrl=""
              description={course.shortDescription || course.description || ""}
              status={course.status}
            />
          ))}
        </div>

        {/* Empty State */}
        {courses.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold">No courses found</h3>
          </div>
        )}
      </div>
    </div>
  );
}
