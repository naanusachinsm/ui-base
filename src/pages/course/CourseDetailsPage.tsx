import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Clock,
  Star,
  Users,
  Award,
  Play,
  FileText,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { courseService } from "@/api/courseService";
import { toast } from "sonner";

interface Chapter {
  id: number;
  name: string;
  description: string;
  resources: {
    links: string[];
    documents: string[];
  };
  videos: Record<string, string>;
  sequence: number;
  status: string;
}

interface Module {
  id: number;
  name: string;
  description: string;
  duration: number;
  sequence: number;
  status: string;
  chapters: Chapter[];
}

interface CourseDetails {
  id: number;
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
  modules: Module[];
}

export function CourseDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await courseService.getCourseById(parseInt(id));

        if (response.success && response.data) {
          setCourse(response.data);
        } else {
          toast.error("Failed to load course details");
          navigate("/dashboard/courses");
        }
      } catch (error) {
        console.error("Error fetching course details:", error);
        toast.error("Error loading course details");
        navigate("/dashboard/courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="w-full px-4 py-2">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="w-full px-4 py-2">
        <div className="text-center py-16">
          <h3 className="text-xl font-semibold">Course not found</h3>
        </div>
      </div>
    );
  }

  const tagArray = course.tags ? course.tags.split(", ") : [];

  return (
    <div className="w-full px-4 py-2">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{course.name}</h1>
          <p className="text-gray-600">{course.description}</p>
        </div>

        {/* Course Info */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{course.category}</Badge>
                <Badge
                  variant={course.status === "ACTIVE" ? "default" : "secondary"}
                >
                  {course.status}
                </Badge>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration} hours</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{course.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{course.prerequisite}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  <span>{course.minQualifications}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                ${course.price}
              </div>
              <div className="text-sm text-gray-500">One-time payment</div>
            </div>
          </div>

          {tagArray.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tagArray.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700"
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Modules */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Course Modules</h2>
          <Accordion type="multiple" className="w-full space-y-2">
            {course.modules.map((module, index) => (
              <AccordionItem
                key={module.id}
                value={`module-${module.id}`}
                className={`border border-gray-200 rounded-lg ${
                  index === course.modules.length - 1 ? "!border-b" : ""
                }`}
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline cursor-pointer">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="text-left">
                          <span className="font-medium">{module.name}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              Module {module.sequence}
                            </Badge>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Clock className="w-3 h-3" />
                              <span>{module.duration} hours</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {module.chapters.length} chapters
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-3">
                  <p className="text-gray-600 text-sm mb-3">
                    {module.description}
                  </p>

                  {/* Chapters Accordion */}
                  <Accordion type="multiple" className="w-full space-y-1">
                    {module.chapters.map((chapter, chapterIndex) => (
                      <AccordionItem
                        key={chapter.id}
                        value={`chapter-${chapter.id}`}
                        className={`border border-gray-200 rounded-md ${
                          chapterIndex === module.chapters.length - 1
                            ? "!border-b"
                            : ""
                        }`}
                      >
                        <AccordionTrigger className="px-3 py-2 hover:no-underline cursor-pointer">
                          <div className="flex items-center justify-between w-full pr-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {chapter.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              {chapter.videos &&
                                Object.keys(chapter.videos).length > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Play className="w-3 h-3 text-red-500" />
                                    <span>
                                      {Object.keys(chapter.videos).length}
                                    </span>
                                  </div>
                                )}
                              {chapter.resources.documents &&
                                chapter.resources.documents.length > 0 && (
                                  <div className="flex items-center gap-1">
                                    <FileText className="w-3 h-3 text-blue-500" />
                                    <span>
                                      {chapter.resources.documents.length}
                                    </span>
                                  </div>
                                )}
                              {chapter.resources.links &&
                                chapter.resources.links.length > 0 && (
                                  <div className="flex items-center gap-1">
                                    <ExternalLink className="w-3 h-3 text-green-500" />
                                    <span>
                                      {chapter.resources.links.length}
                                    </span>
                                  </div>
                                )}
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-3 pb-2">
                          <p className="text-sm text-gray-600 mb-2">
                            {chapter.description}
                          </p>

                          {/* Resources */}
                          <div className="space-y-1">
                            {chapter.videos &&
                              Object.keys(chapter.videos).length > 0 && (
                                <div className="flex items-center gap-2">
                                  <Play className="w-3 h-3 text-red-500" />
                                  <span className="text-xs text-gray-600">
                                    {Object.keys(chapter.videos).length}{" "}
                                    video(s)
                                  </span>
                                </div>
                              )}

                            {chapter.resources.documents &&
                              chapter.resources.documents.length > 0 && (
                                <div className="flex items-center gap-2">
                                  <FileText className="w-3 h-3 text-blue-500" />
                                  <span className="text-xs text-gray-600">
                                    {chapter.resources.documents.length}{" "}
                                    document(s)
                                  </span>
                                </div>
                              )}

                            {chapter.resources.links &&
                              chapter.resources.links.length > 0 && (
                                <div className="flex items-center gap-2">
                                  <ExternalLink className="w-3 h-3 text-green-500" />
                                  <span className="text-xs text-gray-600">
                                    {chapter.resources.links.length} link(s)
                                  </span>
                                </div>
                              )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
