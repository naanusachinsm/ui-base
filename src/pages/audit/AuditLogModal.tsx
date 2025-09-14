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
import { Separator } from "@/components/ui/separator";
import {
  User,
  Activity,
  Calendar,
  FileText,
  Database,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import type { AuditLog } from "@/api/auditTypes";
import {
  AuditActionLabels,
  AuditStatusLabels,
  AuditStatusColors,
  AuditActionColors,
} from "@/api/auditTypes";

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditLog: AuditLog;
}

export default function AuditLogModal({
  isOpen,
  onClose,
  auditLog,
}: AuditLogModalProps) {
  const getStatusIcon = (status?: string) => {
    if (!status) return <Activity className="h-4 w-4 text-gray-600" />;
    switch (status) {
      case "SUCCESS":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "FAILED":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatJsonValue = (value: any) => {
    if (typeof value === "object" && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Audit Log Details
          </DialogTitle>
          <DialogDescription>
            View detailed information about this audit log entry.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Performed By
              </label>
              <div className="p-3 border rounded-md bg-muted/50">
                <div className="font-medium">
                  {auditLog.performedByEmployee?.name || "Unknown User"}
                </div>
                <div className="text-sm text-muted-foreground">
                  {auditLog.performedByEmployee?.email || "No email available"}
                </div>
                <div className="text-xs text-muted-foreground">
                  ID: {auditLog.performedByEmployee?.id || "N/A"}
                </div>
                {auditLog.performedByEmployee?.role && (
                  <div className="text-xs text-muted-foreground">
                    Role: {auditLog.performedByEmployee.role}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Action & Module
              </label>
              <div className="p-3 border rounded-md bg-muted/50 space-y-2">
                <div className="flex items-center gap-2">
                  {auditLog.action ? (
                    <Badge className={AuditActionColors[auditLog.action]}>
                      {AuditActionLabels[auditLog.action]}
                    </Badge>
                  ) : (
                    <Badge variant="outline">N/A</Badge>
                  )}
                  <span className="text-sm text-muted-foreground">on</span>
                  {auditLog.module ? (
                    <Badge variant="outline">{auditLog.module}</Badge>
                  ) : (
                    <Badge variant="outline">N/A</Badge>
                  )}
                </div>
                {auditLog.recordId && (
                  <div className="text-sm text-muted-foreground">
                    Record ID: {auditLog.recordId}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status and Message */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                {getStatusIcon(auditLog.status)}
                Status
              </label>
              <div className="p-3 border rounded-md bg-muted/50">
                {auditLog.status ? (
                  <Badge className={AuditStatusColors[auditLog.status]}>
                    {AuditStatusLabels[auditLog.status]}
                  </Badge>
                ) : (
                  <Badge variant="outline">N/A</Badge>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Description
              </label>
              <div className="p-3 border rounded-md bg-muted/50 min-h-[60px]">
                {auditLog.description || "No description provided"}
              </div>
            </div>
          </div>

          {/* Center Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Database className="h-5 w-5" />
              Center Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Center Name
                </label>
                <div className="p-3 border rounded-md bg-muted/50">
                  {auditLog.center?.name || "N/A"}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Location
                </label>
                <div className="p-3 border rounded-md bg-muted/50">
                  {auditLog.center
                    ? `${auditLog.center.city}, ${auditLog.center.state}`
                    : "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Event Details */}
          {auditLog.details && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Event Details
              </h3>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Details
                </label>
                <div className="p-3 border rounded-md bg-muted/50 min-h-[120px] max-h-60 overflow-y-auto">
                  <pre className="text-xs font-mono whitespace-pre-wrap">
                    {formatJsonValue(auditLog.details)}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Data Changes */}
          {(auditLog.oldValues || auditLog.newValues) && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Changes
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {auditLog.oldValues && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Previous Values
                    </label>
                    <div className="p-3 border rounded-md bg-muted/50 min-h-[120px] max-h-60 overflow-y-auto">
                      <pre className="text-xs font-mono whitespace-pre-wrap">
                        {formatJsonValue(auditLog.oldValues)}
                      </pre>
                    </div>
                  </div>
                )}

                {auditLog.newValues && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      New Values
                    </label>
                    <div className="p-3 border rounded-md bg-muted/50 min-h-[120px] max-h-60 overflow-y-auto">
                      <pre className="text-xs font-mono whitespace-pre-wrap">
                        {formatJsonValue(auditLog.newValues)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Event Timestamp
              </label>
              <div className="p-3 border rounded-md bg-muted/50">
                {new Date(auditLog.eventTimestamp).toLocaleString()}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Created
              </label>
              <div className="p-3 border rounded-md bg-muted/50">
                {new Date(auditLog.createdAt).toLocaleString()}
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
