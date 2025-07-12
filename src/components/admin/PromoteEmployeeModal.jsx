import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  User as UserIcon, 
  Mail, 
  Calendar,
  AlertTriangle,
  Crown,
  CheckCircle
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

export default function PromoteEmployeeModal({ isOpen, onClose, onPromote, employeeToPromote, employeeDetails }) {
  const [isPromoting, setIsPromoting] = useState(false);
  const { toast } = useToast();

  const handlePromote = async () => {
    if (!employeeToPromote) return;
    
    setIsPromoting(true);
    try {
      await onPromote(employeeToPromote.id);
      
      toast({ 
        title: "Promotion Réussie", 
        description: `${employeeToPromote.full_name || employeeToPromote.email} a été promu administrateur.`,
      });
      
      onClose();
    } catch (error) {
      console.error("Error in promotion:", error);
      toast({ 
        title: "Erreur", 
        description: "Impossible de promouvoir l'employé.",
        variant: "destructive" 
      });
    } finally {
      setIsPromoting(false);
    }
  };

  if (!employeeToPromote) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Crown className="w-6 h-6 text-amber-500" />
            Promouvoir en Administrateur
          </DialogTitle>
          <DialogDescription>
            Vous êtes sur le point d'accorder des privilèges administrateur complets à cet employé.
          </DialogDescription>
        </DialogHeader>
        
        {/* Employee Info Card */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={employeeDetails?.profile_picture} />
              <AvatarFallback className="bg-blue-600 text-white text-lg font-bold">
                {employeeToPromote.full_name?.[0] || employeeToPromote.email?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 text-lg">
                {employeeToPromote.full_name || 'Utilisateur'}
              </h3>
              <p className="text-sm text-blue-700">{employeeToPromote.email}</p>
              {employeeDetails && (
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {employeeDetails.department}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {employeeDetails.position}
                  </Badge>
                </div>
              )}
              <p className="text-xs text-blue-600 mt-1">
                Membre depuis {format(new Date(employeeToPromote.created_date), 'dd/MM/yyyy')}
              </p>
            </div>
          </div>
        </div>

        {/* Warning Section */}
        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-900 mb-2">Privilèges Administrateur</h4>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• Accès complet à tous les modules RH</li>
                <li>• Gestion des employés et utilisateurs</li>
                <li>• Approbation des congés et demandes</li>
                <li>• Accès aux données financières</li>
                <li>• Configuration système et paramètres</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button 
            onClick={handlePromote}
            disabled={isPromoting}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
          >
            {isPromoting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Promotion...
              </>
            ) : (
              <>
                <Crown className="w-4 h-4 mr-2" />
                Confirmer Promotion
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}