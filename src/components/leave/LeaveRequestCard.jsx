import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, FileText, CheckCircle, XCircle } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { motion } from "framer-motion";

const statusColors = {
  Pending: "bg-amber-100 text-amber-800",
  Approved: "bg-green-100 text-green-800",
  Denied: "bg-red-100 text-red-800",
  Cancelled: "bg-slate-100 text-slate-800"
};

const leaveTypeColors = {
  Vacation: "bg-blue-100 text-blue-800",
  Sick: "bg-red-100 text-red-800",
  Personal: "bg-purple-100 text-purple-800",
  Maternity: "bg-pink-100 text-pink-800",
  Paternity: "bg-cyan-100 text-cyan-800",
  Bereavement: "bg-slate-100 text-slate-800",
  Other: "bg-gray-100 text-gray-800"
};

export default function LeaveRequestCard({ request, employeeName, onStatusUpdate }) {
  const daysDifference = differenceInDays(new Date(request.end_date), new Date(request.start_date)) + 1;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Main Info */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{employeeName}</h3>
                  <p className="text-sm text-slate-600">{request.leave_type} Leave</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge className={leaveTypeColors[request.leave_type] || "bg-slate-100 text-slate-800"}>
                  {request.leave_type}
                </Badge>
                <Badge className={statusColors[request.status]}>
                  {request.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">
                    {format(new Date(request.start_date), "MMM d")} - {format(new Date(request.end_date), "MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">{daysDifference} days</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">Requested {format(new Date(request.created_date), "MMM d")}</span>
                </div>
              </div>
              
              {request.reason && (
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                  <span className="font-medium">Reason:</span> {request.reason}
                </p>
              )}
            </div>
            
            {/* Actions */}
            {request.status === "Pending" && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStatusUpdate(request.id, "Approved")}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStatusUpdate(request.id, "Denied")}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Deny
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}