import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  User,
  Building2,
  Calendar,
  Clock,
  Target,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  MoreVertical,
  Eye,
  Edit
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import AvatarGenerator from "../ui/AvatarGenerator";

const EmployeeCard = ({ employee, timeEntries, index }) => {
  const todayEntries = timeEntries.filter(entry => 
    entry.employee_id === employee.id && 
    entry.date === format(new Date(), 'yyyy-MM-dd')
  );
  
  const isPresent = todayEntries.length > 0 && todayEntries[0].status !== 'incomplete';
  const lastEntry = todayEntries[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      <Card className="relative overflow-hidden bg-white hover:shadow-lg transition-all duration-300 border-0 shadow-md">
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-100/50 to-transparent rounded-full -translate-y-10 translate-x-10"></div>
        
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="relative">
              <AvatarGenerator
                firstName={employee.first_name}
                lastName={employee.last_name}
                email={employee.email}
                department={employee.department}
                profilePicture={employee.profile_picture}
                size="lg"
                style={employee.avatar_style || 'auto'}
                className="ring-2 ring-white shadow-lg"
              />
              {/* Status indicator */}
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                isPresent ? 'bg-green-400' : 'bg-gray-300'
              }`}></div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {employee.first_name} {employee.last_name}
                  </h3>
                  <p className="text-sm text-gray-600 truncate">{employee.position}</p>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <Badge 
                      variant="outline" 
                      className="text-xs px-2 py-0.5 bg-blue-50 border-blue-200 text-blue-700"
                    >
                      <Building2 className="w-3 h-3 mr-1" />
                      {employee.department}
                    </Badge>
                    
                    <Badge 
                      className={`text-xs px-2 py-0.5 ${
                        isPresent 
                          ? 'bg-green-100 text-green-700 border-green-200' 
                          : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}
                    >
                      {isPresent ? 'Présent' : 'Absent'}
                    </Badge>
                  </div>
                </div>
                
                <Button size="sm" variant="ghost" className="p-1 h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Quick info */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {lastEntry?.check_in_time ? `Arrivé à ${lastEntry.check_in_time}` : 'Pas de pointage'}
                    </span>
                  </div>
                  
                  {employee.employee_id && (
                    <span className="font-mono">#{employee.employee_id.slice(-4)}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const TeamStats = ({ employees, timeEntries }) => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const presentToday = timeEntries.filter(entry => 
    entry.date === today && entry.status !== 'incomplete'
  ).length;
  
  const departments = [...new Set(employees.map(emp => emp.department))].filter(Boolean);
  const departmentStats = departments.map(dept => {
    const deptEmployees = employees.filter(emp => emp.department === dept);
    const deptPresent = timeEntries.filter(entry => {
      const employee = employees.find(emp => emp.id === entry.employee_id);
      return employee?.department === dept && entry.date === today && entry.status !== 'incomplete';
    }).length;
    
    return {
      name: dept,
      total: deptEmployees.length,
      present: deptPresent,
      rate: deptEmployees.length > 0 ? Math.round((deptPresent / deptEmployees.length) * 100) : 0
    };
  });

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-blue-900">Total Équipe</span>
        </div>
        <div className="text-2xl font-bold text-blue-700">{employees.length}</div>
        <div className="text-xs text-blue-600">employés actifs</div>
      </div>
      
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-5 h-5 text-green-600" />
          <span className="font-medium text-green-900">Présents</span>
        </div>
        <div className="text-2xl font-bold text-green-700">{presentToday}</div>
        <div className="text-xs text-green-600">aujourd'hui</div>
      </div>
      
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-100">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          <span className="font-medium text-purple-900">Taux Présence</span>
        </div>
        <div className="text-2xl font-bold text-purple-700">
          {employees.length > 0 ? Math.round((presentToday / employees.length) * 100) : 0}%
        </div>
        <div className="text-xs text-purple-600">en temps réel</div>
      </div>
      
      <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border border-orange-100">
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="w-5 h-5 text-orange-600" />
          <span className="font-medium text-orange-900">Départements</span>
        </div>
        <div className="text-2xl font-bold text-orange-700">{departments.length}</div>
        <div className="text-xs text-orange-600">actifs</div>
      </div>
    </div>
  );
};

export default function TeamOverviewWidget({ employees, timeEntries, viewMode = "grid" }) {
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  const departments = [...new Set(employees.map(emp => emp.department))].filter(Boolean);
  
  const filteredEmployees = employees.filter(emp => 
    selectedDepartment === "all" || emp.department === selectedDepartment
  );

  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
      case "department":
        return (a.department || '').localeCompare(b.department || '');
      case "status":
        const aPresent = timeEntries.some(entry => 
          entry.employee_id === a.id && 
          entry.date === format(new Date(), 'yyyy-MM-dd') && 
          entry.status !== 'incomplete'
        );
        const bPresent = timeEntries.some(entry => 
          entry.employee_id === b.id && 
          entry.date === format(new Date(), 'yyyy-MM-dd') && 
          entry.status !== 'incomplete'
        );
        return bPresent - aPresent;
      default:
        return 0;
    }
  });

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            Vue d'Ensemble Équipe
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              {employees.length} membres
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm"
            >
              <option value="all">Tous les départements</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm"
            >
              <option value="name">Trier par nom</option>
              <option value="department">Trier par département</option>
              <option value="status">Trier par statut</option>
            </select>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <TeamStats employees={employees} timeEntries={timeEntries} />
        
        <div className={`grid gap-4 ${
          viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
        }`}>
          <AnimatePresence>
            {sortedEmployees.map((employee, index) => (
              <EmployeeCard
                key={employee.id}
                employee={employee}
                timeEntries={timeEntries}
                index={index}
              />
            ))}
          </AnimatePresence>
        </div>
        
        {sortedEmployees.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Aucun employé trouvé</h3>
            <p className="text-sm text-gray-600">
              {selectedDepartment !== "all" 
                ? `Aucun employé dans le département ${selectedDepartment}`
                : "Aucun employé dans l'équipe"
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}