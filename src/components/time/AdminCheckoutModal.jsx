import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Clock, User, Calendar, MapPin, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

export default function AdminCheckoutModal({ isOpen, onClose, onSubmit, entry, employeeName }) {
  const [checkoutData, setCheckoutData] = useState({
    checkout_time: format(new Date(), 'HH:mm'),
    address: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(checkoutData);
    setCheckoutData({
      checkout_time: format(new Date(), 'HH:mm'),
      address: '',
      notes: ''
    });
  };

  const calculateWorkHours = () => {
    if (!entry?.check_in_time || !checkoutData.checkout_time) return "0h 0m";
    
    const checkin = new Date(`${entry.date}T${entry.check_in_time}`);
    const checkout = new Date(`${entry.date}T${checkoutData.checkout_time}`);
    const diffMs = checkout - checkin;
    
    if (diffMs < 0) return "Erreur: Heure invalide";
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (!entry) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Clock className="w-6 h-6 text-blue-600" />
            Définir l'heure de sortie
          </DialogTitle>
        </DialogHeader>
        
        {/* Informations de l'employé */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <div>
                <div className="text-xs text-gray-600">Employé</div>
                <div className="font-semibold">{employeeName}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <div>
                <div className="text-xs text-gray-600">Date</div>
                <div className="font-semibold">{format(new Date(entry.date), 'dd/MM/yyyy')}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-600" />
              <div>
                <div className="text-xs text-gray-600">Entrée</div>
                <div className="font-semibold text-green-700">{entry.check_in_time}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-600" />
              <div>
                <div className="text-xs text-gray-600">Lieu d'entrée</div>
                <div className="font-semibold text-xs">{entry.address || 'Non défini'}</div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Heure de sortie */}
          <div className="space-y-2">
            <Label htmlFor="checkout_time" className="text-sm font-medium">
              Heure de sortie *
            </Label>
            <Input
              id="checkout_time"
              type="time"
              value={checkoutData.checkout_time}
              onChange={(e) => setCheckoutData(prev => ({ ...prev, checkout_time: e.target.value }))}
              required
              className="h-12 text-lg font-mono"
            />
            
            {/* Calcul automatique des heures travaillées */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Durée calculée:</span>
                <span className="font-bold text-lg text-blue-600">{calculateWorkHours()}</span>
              </div>
            </div>
          </div>

          {/* Adresse de sortie (optionnel) */}
          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium">
              Lieu de sortie (optionnel)
            </Label>
            <Input
              id="address"
              placeholder="ex: Bureau principal, Domicile..."
              value={checkoutData.address}
              onChange={(e) => setCheckoutData(prev => ({ ...prev, address: e.target.value }))}
              className="h-10"
            />
          </div>

          {/* Notes administrateur */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Notes administrateur (optionnel)
            </Label>
            <Textarea
              id="notes"
              placeholder="Raison du checkout manuel, informations complémentaires..."
              value={checkoutData.notes}
              onChange={(e) => setCheckoutData(prev => ({ ...prev, notes: e.target.value }))}
              className="h-20 resize-none"
            />
          </div>

          {/* Avertissement */}
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-800">Action administrative</p>
                <p className="text-amber-700">
                  Cette action sera enregistrée dans les notes du pointage. 
                  L'employé pourra voir que la sortie a été définie par un administrateur.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Clock className="w-4 h-4 mr-2" />
              Confirmer la sortie
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}