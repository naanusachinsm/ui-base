"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import type { Feedback } from "@/api/feedbackTypes";
import {
  FeedbackStatusLabels,
  FeedbackStatusColors,
} from "@/api/feedbackTypes";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedback: Feedback;
}

export default function FeedbackModal({
  isOpen,
  onClose,
  feedback,
}: FeedbackModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Feedback Details</DialogTitle>
          <DialogDescription>
            View feedback information below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Student
              </label>
              <div className="p-3 border rounded-md bg-muted/50">
                <div className="font-medium">
                  {feedback.student?.name || "Unknown Student"}
                </div>
                {feedback.student?.email && (
                  <div className="text-sm text-muted-foreground">
                    {feedback.student.email}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Course
              </label>
              <div className="p-3 border rounded-md bg-muted/50">
                {feedback.course?.name || "No course selected"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Cohort
              </label>
              <div className="p-3 border rounded-md bg-muted/50">
                {feedback.cohort
                  ? `${feedback.cohort.name} (${feedback.cohort.code})`
                  : "No cohort selected"}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Status
              </label>
              <div className="p-3 border rounded-md bg-muted/50">
                <Badge className={FeedbackStatusColors[feedback.status]}>
                  {FeedbackStatusLabels[feedback.status]}
                </Badge>
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Rating
            </label>
            <div className="p-3 border rounded-md bg-muted/50">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="text-lg font-semibold">
                  {(typeof feedback.rating === "number"
                    ? feedback.rating
                    : parseFloat(feedback.rating as string) || 0
                  ).toFixed(1)}
                  /5.0
                </span>
              </div>
            </div>
          </div>

          {/* Feedback Content */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Feedback Content</h3>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Comment
              </label>
              <div className="p-3 border rounded-md bg-muted/50 min-h-[100px]">
                {feedback.comment || "No comment provided"}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Description
              </label>
              <div className="p-3 border rounded-md bg-muted/50 min-h-[100px]">
                {feedback.description || "No description provided"}
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Created
              </label>
              <div className="p-3 border rounded-md bg-muted/50">
                {new Date(feedback.createdAt).toLocaleString()}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Last Updated
              </label>
              <div className="p-3 border rounded-md bg-muted/50">
                {new Date(feedback.updatedAt).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="cursor-pointer"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
