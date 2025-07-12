import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users } from "lucide-react";

export default function DepartmentOverview({ employees }) {
  const departmentCounts = employees.reduce((acc, employee) => {
    const dept = employee.department || 'Unassigned';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  const sortedDepartments = Object.entries(departmentCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 6);

  const departmentColors = [
    'from-blue-500 to-indigo-600',
    'from-emerald-500 to-green-600', 
    'from-purple-500 to-indigo-600',
    'from-amber-500 to-orange-500',
    'from-pink-500 to-rose-600',
    'from-teal-500 to-cyan-600'
  ];

  return (
    <Card className="gemini-card hover:shadow-2xl transition-all duration-300">
      <CardHeader className="pb-4 border-b border-gray-100">
        <CardTitle className="text-2xl font-bold gemini-title flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          Department Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {sortedDepartments.length > 0 ? (
            sortedDepartments.map(([department, count], index) => (
              <div key={department} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 gemini-fade-in">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 bg-gradient-to-br ${departmentColors[index % departmentColors.length]} rounded-xl flex items-center justify-center`}>
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-gray-900 text-lg">{department}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <Badge className="gemini-badge font-semibold">
                    {count}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <p className="text-gray-500 gemini-subtitle text-lg">No departments yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}