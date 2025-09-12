import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Clock } from "lucide-react";

interface CourseCardProps {
  name: string;
  category: string;
  tags: string;
  price: string;
  duration: number;
  prerequisite: string;
  minQualifications: string;
  rating: string;
  avatarUrl: string;
  description: string;
  status: string;
}

export function CourseCard({
  name,
  category,
  tags,
  duration,
  rating,
  description,
  status,
}: CourseCardProps) {
  const tagArray = tags && tags.trim() ? tags.split(", ") : [];

  return (
    <Card className="relative overflow-hidden bg-white border border-gray-200 cursor-pointer">
      <CardContent>
        {/* Header */}
        <div className="">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-xs">
              {category}
            </Badge>
            <Badge
              variant={status === "ACTIVE" ? "default" : "secondary"}
              className="text-xs"
            >
              {status}
            </Badge>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 leading-tight mb-2">
            {name}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
            {description}
          </p>
        </div>

        {/* Tags */}
        {tagArray.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tagArray.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
              >
                {tag.trim()}
              </span>
            ))}
          </div>
        )}

        {/* Course Info Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4 text-gray-500" />
            <span>{duration} hours</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Star className="w-4 h-4 fill-black-400 text-black-400" />
            <span>{rating}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
