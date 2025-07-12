import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Calendar, Clock, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function PendingApprovals({ pendingLeaves, incompleteEntries }) {
  const totalPending = pendingLeaves.length + incompleteEntries.length;

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-slate-900">Pending Items</CardTitle>
          {totalPending > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {totalPending} Items
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {totalPending === 0 ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-green-700 font-medium">All caught up!</p>
            <p className="text-sm text-green-600">No pending approvals</p>
          </div>
        ) : (
          <>
            {/* Pending Leave Requests */}
            {pendingLeaves.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <h4 className="font-medium text-slate-900">Leave Requests</h4>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700">
                    {pendingLeaves.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {pendingLeaves.slice(0, 3).map((leave) => (
                    <div key={leave.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-amber-900 truncate">
                          {leave.leave_type} Leave
                        </p>
                        <p className="text-sm text-amber-700">
                          {format(new Date(leave.start_date), "MMM d")} - {format(new Date(leave.end_date), "MMM d")}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-amber-600" />
                    </div>
                  ))}
                  {pendingLeaves.length > 3 && (
                    <p className="text-xs text-amber-600 text-center">
                      +{pendingLeaves.length - 3} more requests
                    </p>
                  )}
                </div>
                <Link to={createPageUrl("LeaveManagement")}>
                  <Button size="sm" className="w-full bg-amber-600 hover:bg-amber-700">
                    Review Leave Requests
                  </Button>
                </Link>
              </div>
            )}

            {/* Incomplete Time Entries */}
            {incompleteEntries.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <h4 className="font-medium text-slate-900">Incomplete Time Entries</h4>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {incompleteEntries.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {incompleteEntries.slice(0, 3).map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-blue-900">
                          Check-in only
                        </p>
                        <p className="text-sm text-blue-700">
                          {format(new Date(entry.date), "MMM d")} at {entry.check_in_time}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-blue-600" />
                    </div>
                  ))}
                  {incompleteEntries.length > 3 && (
                    <p className="text-xs text-blue-600 text-center">
                      +{incompleteEntries.length - 3} more entries
                    </p>
                  )}
                </div>
                <Link to={createPageUrl("TimeTracking")}>
                  <Button size="sm" variant="outline" className="w-full border-blue-300 hover:bg-blue-50">
                    View Time Entries
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}