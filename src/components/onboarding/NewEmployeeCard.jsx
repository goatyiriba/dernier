import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function NewEmployeeCard({ 
  employee, 
  progress, 
  completedTasks, 
  totalTasks, 
  isSelected, 
  onSelect 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={`cursor-pointer transition-all duration-300 ${
          isSelected 
            ? 'bg-blue-50 border-blue-200 shadow-md' 
            : 'bg-white hover:bg-slate-50 hover:shadow-md'
        }`}
        onClick={onSelect}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {employee.first_name?.[0]}{employee.last_name?.[0]}
              </span>
            </div>
            
            <div className="flex-1 space-y-2">
              <div>
                <h4 className="font-medium text-slate-900">
                  {employee.first_name} {employee.last_name}
                </h4>
                <p className="text-sm text-slate-600">{employee.position}</p>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Calendar className="w-3 h-3" />
                <span>Started {format(new Date(employee.start_date), "MMM d, yyyy")}</span>
              </div>
              
              <Badge variant="outline" className="text-xs">
                {employee.department}
              </Badge>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Progress</span>
                  <span className="font-medium">{completedTasks}/{totalTasks}</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}