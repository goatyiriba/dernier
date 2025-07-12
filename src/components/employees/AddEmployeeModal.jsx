
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, Info, Palette } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import AvatarGenerator from '../ui/AvatarGenerator';
import AvatarSelector from '../ui/AvatarSelector';
import { Employee } from "@/api/supabaseEntities";
import { supabase } from "@/api/supabaseClient";

// Fonction d'upload de fichier pour Supabase
const uploadFile = async (file, path) => {
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(path, file);
  
  if (error) throw error;
  return data;
};

const departments = [
  "Engineering", "Marketing", "Sales", "HR", "Finance", "Operations", "Design", "Legal"
];

const employmentTypes = [
  "Full-time", "Part-time", "Contract", "Intern"
];

export default function AddEmployeeModal({ isOpen, onClose, onSave, unlinkedUsers }) {
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
    profile_picture: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [selectedAvatarData, setSelectedAvatarData] = useState({
    profile_picture: "",
    avatar_style: "auto"
  });

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      first_name: "", last_name: "", email: "", phone: "",
      department: "", position: "", employment_type: "Full-time",
      start_date: "", salary: "", address: "", emergency_contact: "",
      status: "Active", profile_picture: ""
    });
    setSelectedAvatarData({ profile_picture: "", avatar_style: "auto" });
  };

  const handleAvatarSave = async (avatarData) => {
    setSelectedAvatarData(avatarData);
    setFormData(prev => ({
      ...prev,
      profile_picture: avatarData.profile_picture
    }));
    setShowAvatarSelector(false);
    
    toast({
      title: "Avatar sélectionné",
      description: "L'avatar sera appliqué lors de la création de l'employé",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const employeeData = {
        ...formData,
        profile_picture: selectedAvatarData.profile_picture,
        avatar_style: selectedAvatarData.avatar_style,
        employee_id: `EMP-${Date.now()}`,
        salary: formData.salary ? parseFloat(formData.salary) : undefined,
        emergency_contact: formData.emergency_contact || ""
      };

      await onSave(employeeData, null);

    } catch (error) {
      console.error("Error saving employee:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la création de l'employé",
        variant: "destructive",
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <UserPlus className="w-6 h-6" />
            Créer un Nouvel Employé
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
            
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 p-6 bg-white rounded-lg border">
              <div className="md:col-span-2 flex items-center gap-3">
                <div className="w-2 h-8 bg-indigo-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-800">Informations Personnelles</h3>
              </div>
              
              <div className="flex flex-col items-center space-y-4 md:col-span-2">
                <Label className="font-semibold">Photo de Profil</Label>
                <div className="relative">
                  <AvatarGenerator
                    firstName={formData.first_name}
                    lastName={formData.last_name}
                    email={formData.email}
                    department={formData.department}
                    profilePicture={selectedAvatarData.profile_picture}
                    size="xl"
                    style={selectedAvatarData.avatar_style}
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
                  Choisir un Avatar
                </Button>
                {!selectedAvatarData.profile_picture && formData.first_name && (
                  <p className="text-xs text-gray-500 text-center">
                    Aperçu de l'avatar automatique - Style: {selectedAvatarData.avatar_style}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="first_name">Prénom *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  required
                  className="border-gray-200 focus:border-indigo-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Nom *</Label>
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
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="border-gray-200 focus:border-indigo-300"
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="border-gray-200 focus:border-indigo-300"
                />
              </div>
               <div className="space-y-2 md:col-span-2">
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

            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 p-6 bg-white rounded-lg border">
              <div className="md:col-span-2 flex items-center gap-3">
                 <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-800">Informations Professionnelles</h3>
              </div>
              <div className="space-y-2">
                <Label>Département *</Label>
                <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)} required>
                  <SelectTrigger className="border-gray-200 focus:border-indigo-300">
                    <SelectValue placeholder="Sélectionner département" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Poste *</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  required
                  className="border-gray-200 focus:border-indigo-300"
                />
              </div>
              <div className="space-y-2">
                <Label>Type d'Emploi</Label>
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
                <Label htmlFor="start_date">Date de Début *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                  required
                  className="border-gray-200 focus:border-indigo-300"
                />
              </div>
               <div className="space-y-2 md:col-span-2">
                <Label htmlFor="salary">Salaire Annuel (€)</Label>
                <Input
                  id="salary"
                  type="number"
                  value={formData.salary}
                  onChange={(e) => handleInputChange('salary', e.target.value)}
                  placeholder="ex: 75000"
                  className="border-gray-200 focus:border-indigo-300"
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-4 p-6 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-800">Accès utilisateur</h3>
              </div>
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700 text-sm">
                  L'employé devra être invité séparément via les paramètres de l'espace de travail base44 pour pouvoir accéder à l'application.
                </AlertDescription>
              </Alert>
            </div>
          </div>

          <DialogFooter className="pt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isSubmitting ? "Création en cours..." : "Créer l'Employé"}
            </Button>
          </DialogFooter>
        </form>

        <AvatarSelector
          isOpen={showAvatarSelector}
          onClose={() => setShowAvatarSelector(false)}
          onSave={handleAvatarSave}
          currentAvatar={selectedAvatarData.profile_picture}
          firstName={formData.first_name}
          lastName={formData.last_name}
          email={formData.email}
          department={formData.department}
          currentStyle={selectedAvatarData.avatar_style}
          title="Choisir un Avatar pour l'Employé"
        />
      </DialogContent>
    </Dialog>
  );
}
