import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, TrendingUp, User } from "lucide-react";

const getActivityIcon = (type) => {
  switch (type) {
    case 'leave':
      return Calendar;
    case 'review':
      return TrendingUp;
    default:
      return User;
  }
};

const getStatusBadge = (status) => {
  const variants = {
    Pending: "gemini-badge",
    Approved: "gemini-badge-success",
    Denied: "gemini-badge-danger",
    Draft: "bg-blue-100 text-blue-800",
    Completed: "gemini-badge-success"
  };
  
  return variants[status] || "bg-slate-100 text-slate-800";
};

export default function RecentActivity({ activities, isLoading }) {
  return (
    <Card className="gemini-card hover:shadow-2xl transition-all duration-300">
      <CardHeader className="pb-4 border-b border-gray-100">
        <CardTitle className="text-2xl font-bold gemini-title flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 gemini-skeleton">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
                <div className="h-6 bg-gray-200 rounded w-16" />
              </div>
            ))
          ) : activities.length > 0 ? (
            activities.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <div key={activity.id} className="flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-200 gemini-fade-in">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-lg">{activity.title}</h4>
                    <p className="text-gray-600 gemini-subtitle">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">{activity.time}</span>
                    </div>
                  </div>
                  <Badge className={getStatusBadge(activity.status)}>
                    {activity.status}
                  </Badge>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <p className="text-gray-500 gemini-subtitle text-lg">No recent activity</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}