import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CohortHelpers } from "@/api/cohortTypes";

interface CohortCardProps {
  id: number;
  name: string;
  courseName: string;
  courseCategory: string;
  startDate: string;
  endDate: string;
  maxStudents: number;
  currentStudents: number;
  status: string;
  description: string;
  enrollmentOpen: boolean;
  enrollmentCount?: number;
}

export function CohortCard({
  id,
  name,
  courseCategory,
  startDate,
  endDate,
  maxStudents,
  currentStudents,
  status,
  enrollmentCount,
}: CohortCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/dashboard/cohorts/${id}`);
  };

  const actualEnrollmentCount = enrollmentCount ?? currentStudents;
  const enrollmentProgress =
    maxStudents > 0
      ? Math.round((actualEnrollmentCount / maxStudents) * 100)
      : 0;
  const dateRange = CohortHelpers.formatDateRange(startDate, endDate);
  const formattedDuration = CohortHelpers.formatDuration(startDate, endDate);

  return (
    <Card
      className="relative overflow-hidden bg-white border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleClick}
    >
      <CardContent>
        {/* Header */}
        <div className="">
          <div className="flex items-center gap-1 mb-1">
            <Badge variant="outline" className="text-[10px] px-1 py-0">
              {courseCategory}
            </Badge>
            <Badge
              variant={status === "ACTIVE" ? "default" : "secondary"}
              className="text-[10px] px-1 py-0"
            >
              {status}
            </Badge>
          </div>
          <h3 className="text-md font-semibold text-gray-900 leading-tight mb-2">
            {name}
          </h3>
        </div>

        {/* Course Info Grid */}
        <div className="grid grid-cols-2 gap-1 mb-2">
          <div className="flex items-center gap-1 text-gray-600">
            <Calendar className="w-3 h-3 text-gray-500" />
            <span className="text-[10px]">{dateRange}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Clock className="w-3 h-3 text-gray-500" />
            <span className="text-[10px]">{formattedDuration}</span>
          </div>
        </div>

        {/* Enrollment Progress */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1 text-gray-600">
              <Users className="w-3 h-3 text-gray-500" />
              <span className="text-[10px]">
                {actualEnrollmentCount}/{maxStudents}
              </span>
            </div>
            <span className="text-[10px] text-gray-500">
              {enrollmentProgress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
            <div
              className={`bg-black h-1 rounded-full transition-all duration-300 ${
                enrollmentProgress === 0
                  ? "w-0"
                  : enrollmentProgress <= 25
                  ? "w-1/4"
                  : enrollmentProgress <= 50
                  ? "w-1/2"
                  : enrollmentProgress <= 75
                  ? "w-3/4"
                  : "w-full"
              }`}
            ></div>
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center justify-between">
          <div className="text-[10px] text-gray-500">
            {status === "PLANNING" && "Planning phase"}
            {status === "ENROLLING" && "Open for enrollment"}
            {status === "ACTIVE" && "Currently running"}
            {status === "COMPLETED" && "Course completed"}
            {status === "CANCELLED" && "Course cancelled"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
