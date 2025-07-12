import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, Clock } from "lucide-react";
import { motion } from "framer-motion";

const categoryColors = {
  Documentation: "bg-blue-100 text-blue-800",
  Workspace: "bg-green-100 text-green-800",
  "IT Setup": "bg-purple-100 text-purple-800",
  Training: "bg-amber-100 text-amber-800",
  Social: "bg-pink-100 text-pink-800",
  Culture: "bg-cyan-100 text-cyan-800"
};

export default function OnboardingTaskCard({ task, isCompleted, onToggle }) {
  const Icon = task.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`transition-all duration-300 ${
        isCompleted 
          ? 'bg-green-50 border-green-200' 
          : 'bg-white hover:bg-slate-50'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className={`mt-1 ${
                isCompleted 
                  ? 'text-green-600 hover:text-green-700' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {isCompleted ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <Circle className="w-5 h-5" />
              )}
            </Button>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Icon className="w-4 h-4 text-slate-600" />
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium ${
                    isCompleted ? 'text-green-900 line-through' : 'text-slate-900'
                  }`}>
                    {task.title}
                    {task.mandatory && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </h4>
                  <p className="text-sm text-slate-600">{task.description}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={categoryColors[task.category]}>
                  {task.category}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock className="w-3 h-3" />
                  {task.estimated_time}
                </div>
                {task.mandatory && (
                  <Badge variant="outline" className="text-red-600 border-red-200">
                    Required
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}