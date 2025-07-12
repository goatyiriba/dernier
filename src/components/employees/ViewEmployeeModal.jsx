
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Briefcase, 
  Calendar,
  MapPin,
  AlertCircle,
  DollarSign,
  Edit
} from "lucide-react";
import { format } from "date-fns";
import AvatarGenerator from '../ui/AvatarGenerator';

const statusColors = {
  Active: "bg-green-50 text-green-700 border-green-200",
  Inactive: "bg-gray-50 text-gray-700 border-gray-200",
  "On Leave": "bg-amber-50 text-amber-700 border-amber-200",
  Terminated: "bg-red-50 text-red-700 border-red-200"
};

export default function ViewEmployeeModal({ isOpen, onClose, employee }) {
  if (!employee) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Profil Employé
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          {/* Header Card */}
          <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                {/* CORRECTION: Utilisation du générateur d'avatar */}
                <AvatarGenerator
                  firstName={employee.first_name}
                  lastName={employee.last_name}
                  email={employee.email}
                  department={employee.department}
                  profilePicture={employee.profile_picture}
                  size="2xl"
                  style="gradient"
                  className="ring-4 ring-white shadow-lg"
                />
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {employee.first_name} {employee.last_name}
                  </h2>
                  <p className="text-lg text-indigo-600 font-medium">{employee.position}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant="outline" className="font-normal">
                      {employee.department}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`font-normal ${statusColors[employee.status] || statusColors.Inactive}`}
                    >
                      {employee.status}
                    </Badge>
                    <Badge variant="outline" className="font-normal">
                      {employee.employment_type}
                    </Badge>
                  </div>
                  {!employee.profile_picture && (
                    <p className="text-xs text-gray-500 mt-2">
                      Avatar généré automatiquement
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{employee.email}</p>
                  </div>
                </div>
                {employee.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{employee.phone}</p>
                    </div>
                  </div>
                )}
                {employee.address && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium">{employee.address}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Employment Details */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Employment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-medium">{employee.department}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="font-medium">
                      {format(new Date(employee.start_date), 'MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
                {employee.salary && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Annual Salary</p>
                      <p className="font-medium">${employee.salary.toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Additional Information */}
          {employee.emergency_contact && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{employee.emergency_contact}</p>
              </CardContent>
            </Card>
          )}

          {/* System Information */}
          <Card className="border-0 shadow-sm bg-gray-50">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Employee ID</p>
                  <p className="font-medium">{employee.employee_id}</p>
                </div>
                <div>
                  <p className="text-gray-500">Created Date</p>
                  <p className="font-medium">
                    {format(new Date(employee.created_date), 'MMM d, yyyy')}
                  </p>
                </div>
                {employee.last_login && (
                  <div>
                    <p className="text-gray-500">Last Login</p>
                    <p className="font-medium">
                      {format(new Date(employee.last_login), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
