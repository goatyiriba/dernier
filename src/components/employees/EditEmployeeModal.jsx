
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Edit, Palette } from "lucide-react";
import { UploadFile } from '@/api/integrations';
import AvatarGenerator from '../ui/AvatarGenerator';
import AvatarSelector from '../ui/AvatarSelector';
import { useToast } from "@/components/ui/use-toast";

const departments = [
  "Engineering", "Marketing", "Sales", "HR", "Finance", "Operations", "Design", "Legal"
];

const employmentTypes = [
  "Full-time", "Part-time", "Contract", "Intern"
];

const statuses = [
  "Active", "Inactive", "On Leave", "Terminated"
];

export default function EditEmployeeModal({ isOpen, onClose, employee, onSave }) {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    employment_type: "Full-time",
    start_date: "",
    salary: "",
    address: "",
    emergency_contact: "",
    status: "Active",
    profile_picture: "",
    avatar_style: "auto" // Changed from "gradient" to "auto"
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

  useEffect(() => {
    if (employee && isOpen) {
      setFormData({
        first_name: employee.first_name || "",
        last_name: employee.last_name || "",
        email: employee.email || "",
        phone: employee.phone || "",
        department: employee.department || "",
        position: employee.position || "",
        employment_type: employee.employment_type || "Full-time",
        start_date: employee.start_date || "",
        salary: employee.salary || "",
        address: employee.address || "",
        emergency_contact: employee.emergency_contact || "",
        status: employee.status || "Active",
        profile_picture: employee.profile_picture || "",
        avatar_style: employee.avatar_style || "auto" // Changed from "gradient" to "auto"
      });
    }
  }, [employee, isOpen]);

  const handleAvatarSave = (avatarData) => {
    setFormData(prev => ({
      ...prev,
      profile_picture: avatarData.profile_picture,
      avatar_style: avatarData.avatar_style
    }));
    setShowAvatarSelector(false);
    
    toast({
      title: "Avatar sélectionné",
      description: "L'avatar sera appliqué lors de la sauvegarde de l'employé.",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const employeeData = {
        ...formData,
        salary: formData.salary ? parseFloat(formData.salary) : undefined,
        emergency_contact: formData.emergency_contact || ""
      };
      
      await onSave(employeeData);

    } catch (error) {
      console.error("Error updating employee:", error);
      toast({
        title: "Erreur de mise à jour",
        description: "Une erreur est survenue lors de la mise à jour de l'employé.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!employee) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <Edit className="w-6 h-6" />
            Modifier Employé
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          
          {/* Profile Picture */}
          <div className="flex flex-col items-center space-y-4">
            <Label>Photo de Profil</Label>
            <div className="relative">
              <AvatarGenerator
                firstName={formData.first_name}
                lastName={formData.last_name}
                email={formData.email}
                department={formData.department}
                profilePicture={formData.profile_picture}
                size="xl"
                style={formData.avatar_style || 'auto'} // Changed from 'gradient' to 'auto'
                className="border-4 border-white shadow-lg"
              />
              <Button
                type="button"
                size="icon"
                className="absolute bottom-0 right-0 rounded-full w-8 h-8 bg-white hover:bg-gray-100 shadow border"
                onClick={() => setShowAvatarSelector(true)}
              >
                <Palette className="w-4 h-4 text-gray-600" />
              </Button>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAvatarSelector(true)}
              className="flex items-center gap-2"
            >
              <Palette className="w-4 h-4" />
              Modifier l'Avatar
            </Button>
            {!formData.profile_picture && (formData.first_name || formData.last_name) && (
              <p className="text-xs text-gray-500 text-center">
                Avatar généré - Style: {formData.avatar_style || 'auto'} {/* Changed from 'gradient' to 'auto' */}
              </p>
            )}
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                required
                className="border-gray-200 focus:border-indigo-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                required
                className="border-gray-200 focus:border-indigo-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                className="border-gray-200 focus:border-indigo-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="border-gray-200 focus:border-indigo-300"
              />
            </div>
          </div>

          {/* Job Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Department *</Label>
              <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)} required>
                <SelectTrigger className="border-gray-200 focus:border-indigo-300">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position *</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                required
                className="border-gray-200 focus:border-indigo-300"
              />
            </div>
            <div className="space-y-2">
              <Label>Employment Type</Label>
              <Select value={formData.employment_type} onValueChange={(value) => handleInputChange('employment_type', value)}>
                <SelectTrigger className="border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {employmentTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger className="border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                required
                className="border-gray-200 focus:border-indigo-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary">Annual Salary</Label>
              <Input
                id="salary"
                type="number"
                value={formData.salary}
                onChange={(e) => handleInputChange('salary', e.target.value)}
                placeholder="e.g., 75000"
                className="border-gray-200 focus:border-indigo-300"
              />
            </div>
          </div>

          {/* Additional Information - CORRECTION du champ emergency_contact */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="border-gray-200 focus:border-indigo-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergency_contact">Contact d'Urgence</Label>
              <Input
                id="emergency_contact"
                value={formData.emergency_contact}
                onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
                placeholder="ex: Marie Dupont, 06 12 34 56 78, Épouse"
                className="border-gray-200 focus:border-indigo-300"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isSubmitting ? "Mise à jour..." : "Mettre à jour"}
            </Button>
          </DialogFooter>
        </form>

        {/* Avatar Selector Modal */}
        <AvatarSelector
          isOpen={showAvatarSelector}
          onClose={() => setShowAvatarSelector(false)}
          onSave={handleAvatarSave}
          currentAvatar={formData.profile_picture}
          firstName={formData.first_name}
          lastName={formData.last_name}
          email={formData.email}
          department={formData.department}
          currentStyle={formData.avatar_style || 'auto'} // Changed from 'gradient' to 'auto'
          title="Modifier l'Avatar de l'Employé"
        />
      </DialogContent>
    </Dialog>
  );
}
