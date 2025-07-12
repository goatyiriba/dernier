
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCheck, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const departments = ["Engineering", "Marketing", "Sales", "HR", "Finance", "Operations", "Design", "Legal"];
const employmentTypes = ["Full-time", "Part-time", "Contract", "Intern"];

export default function ApproveUserModal({ isOpen, onClose, onSave, userToApprove }) {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (userToApprove && isOpen) {
      // Split full name into first and last name
      const nameParts = (userToApprove.full_name || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      setFormData({
        first_name: firstName,
        last_name: lastName,
        email: userToApprove.email,
        phone: "",
        department: "",
        position: "",
        employment_type: "Full-time",
        start_date: new Date().toISOString().split('T')[0],
        salary: "",
        address: "",
        emergency_contact: "",
        status: "Active",
        employee_id: `EMP-${Date.now()}`, // Generate unique employee ID
        profile_picture: ""
      });
    }
  }, [userToApprove, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation simple
    if (!formData.first_name || !formData.last_name || !formData.department || !formData.position) {
      toast({ 
        title: "Erreur de validation", 
        description: "Veuillez remplir tous les champs obligatoires.", 
        variant: "destructive" 
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Clean up the data before sending
      const cleanedData = {
        ...formData,
        salary: formData.salary && formData.salary !== "" ? parseFloat(formData.salary) : undefined,
      };
      
      // Remove empty fields
      Object.keys(cleanedData).forEach(key => {
        if (cleanedData[key] === "" || cleanedData[key] === null) {
          delete cleanedData[key];
        }
      });

      console.log("Submitting employee data:", cleanedData);
      await onSave(cleanedData);
      
      toast({ 
        title: "Utilisateur Approuvé", 
        description: "L'utilisateur a été activé et son profil employé créé avec succès." 
      });
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast({ 
        title: "Erreur", 
        description: "Impossible d'approuver l'utilisateur.", 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!userToApprove) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <UserCheck className="w-6 h-6 text-green-600" />
            Approuver et Créer le Profil Employé
          </DialogTitle>
          <DialogDescription>
            Complétez les informations pour créer le profil employé et activer l'accès.
          </DialogDescription>
        </DialogHeader>
        
        {/* User Info Card */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-blue-600 text-white">
                {userToApprove.full_name?.[0] || userToApprove.email?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-blue-900">
                {userToApprove.full_name || 'Utilisateur'}
              </h3>
              <p className="text-sm text-blue-700">{userToApprove.email}</p>
              <p className="text-xs text-blue-600">
                Inscrit le {new Date(userToApprove.created_date).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name" className="text-sm font-medium">Prénom *</Label>
              <Input 
                id="first_name" 
                value={formData.first_name || ''} 
                onChange={e => setFormData({...formData, first_name: e.target.value})} 
                required
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name" className="text-sm font-medium">Nom *</Label>
              <Input 
                id="last_name" 
                value={formData.last_name || ''} 
                onChange={e => setFormData({...formData, last_name: e.target.value})} 
                required
                className="h-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <Input 
              id="email" 
              value={formData.email || ''} 
              disabled 
              className="h-10 bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">Téléphone</Label>
            <Input 
              id="phone" 
              value={formData.phone || ''} 
              onChange={e => setFormData({...formData, phone: e.target.value})}
              placeholder="Ex: +33 1 23 45 67 89"
              className="h-10"
            />
          </div>

          {/* Job Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Département *</Label>
              <Select onValueChange={value => setFormData({...formData, department: value})} required value={formData.department}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Sélectionner un département" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="position" className="text-sm font-medium">Poste *</Label>
              <Input 
                id="position" 
                value={formData.position || ''}
                placeholder="Ex: Développeur Front-end" 
                onChange={e => setFormData({...formData, position: e.target.value})} 
                required
                className="h-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Type d'Emploi</Label>
              <Select defaultValue="Full-time" onValueChange={value => setFormData({...formData, employment_type: value})} value={formData.employment_type}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {employmentTypes.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_date" className="text-sm font-medium">Date de Début *</Label>
              <Input 
                id="start_date" 
                type="date" 
                value={formData.start_date || ''} 
                onChange={e => setFormData({...formData, start_date: e.target.value})} 
                required
                className="h-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="salary" className="text-sm font-medium">Salaire Annuel (€)</Label>
            <Input 
              id="salary" 
              type="number" 
              value={formData.salary || ''}
              placeholder="Ex: 45000" 
              onChange={e => setFormData({...formData, salary: e.target.value})}
              className="h-10"
            />
          </div>

          <DialogFooter className="pt-6 sticky bottom-0 bg-white border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Approbation...
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Approuver et Activer
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
