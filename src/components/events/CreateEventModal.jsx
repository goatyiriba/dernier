import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, Palette, Bell } from "lucide-react";
import { motion } from "framer-motion";

export default function CreateEventModal({ isOpen, onClose, onSubmit, employees }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_type: "other",
    event_date: "",
    event_time: "",
    location: "",
    target_audience: "all",
    department_filter: "",
    target_employee_id: "",
    priority: "normal",
    is_recurring: false,
    recurrence_type: "yearly",
    reminder_days: [1],
    color: "#3B82F6",
    rsvp_required: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const departments = [...new Set(employees.map(emp => emp.department).filter(Boolean))];

  const eventTypes = [
    { value: "birthday", label: "🎂 Anniversaire", color: "#EC4899" },
    { value: "anniversary", label: "🎉 Anniversaire d'entreprise", color: "#EF4444" },
    { value: "meeting", label: "💼 Réunion", color: "#3B82F6" },
    { value: "training", label: "🎓 Formation", color: "#10B981" },
    { value: "celebration", label: "🎊 Célébration", color: "#8B5CF6" },
    { value: "holiday", label: "✈️ Congé/Vacances", color: "#F59E0B" },
    { value: "deadline", label: "⚠️ Échéance", color: "#EF4444" },
    { value: "other", label: "📅 Autre", color: "#6B7280" }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            Créer un Nouvel Événement
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titre de l'événement *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Ex: Anniversaire de Marie, Réunion équipe..."
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Détails sur l'événement..."
                className="mt-1 h-20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type d'événement</Label>
                <Select value={formData.event_type} onValueChange={(value) => handleChange("event_type", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: type.color }}
                          />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Priorité</Label>
                <Select value={formData.priority} onValueChange={(value) => handleChange("priority", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">🔵 Faible</SelectItem>
                    <SelectItem value="normal">⚪ Normale</SelectItem>
                    <SelectItem value="high">🔴 Haute</SelectItem>
                    <SelectItem value="urgent">🚨 Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Date et heure */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Date et Heure
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="event_date">Date de l'événement *</Label>
                <Input
                  id="event_date"
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => handleChange("event_date", e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="event_time">Heure (optionnel)</Label>
                <Input
                  id="event_time"
                  type="time"
                  value={formData.event_time}
                  onChange={(e) => handleChange("event_time", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Lieu</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  placeholder="Salle de réunion, Restaurant, Bureau..."
                  className="pl-10 mt-1"
                />
              </div>
            </div>
          </div>

          {/* Audience */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5" />
              Qui est concerné ?
            </h3>
            
            <div>
              <Label>Audience cible</Label>
              <Select value={formData.target_audience} onValueChange={(value) => handleChange("target_audience", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">👥 Tous les employés</SelectItem>
                  <SelectItem value="department_specific">🏢 Département spécifique</SelectItem>
                  <SelectItem value="individual">👤 Employé individuel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.target_audience === "department_specific" && (
              <div>
                <Label>Département</Label>
                <Select value={formData.department_filter} onValueChange={(value) => handleChange("department_filter", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choisir un département" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.target_audience === "individual" && (
              <div>
                <Label>Employé</Label>
                <Select value={formData.target_employee_id} onValueChange={(value) => handleChange("target_employee_id", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choisir un employé" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.first_name} {emp.last_name} - {emp.department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Options avancées */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Options Avancées
            </h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Événement récurrent</Label>
                  <p className="text-sm text-gray-500">Se répète chaque année</p>
                </div>
                <Switch
                  checked={formData.is_recurring}
                  onCheckedChange={(checked) => handleChange("is_recurring", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Confirmation requise</Label>
                  <p className="text-sm text-gray-500">RSVP demandée</p>
                </div>
                <Switch
                  checked={formData.rsvp_required}
                  onCheckedChange={(checked) => handleChange("rsvp_required", checked)}
                />
              </div>
            </div>

            <div>
              <Label>Couleur de l'événement</Label>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => handleChange("color", e.target.value)}
                  className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer"
                />
                <Badge style={{ backgroundColor: formData.color, color: 'white' }}>
                  Aperçu couleur
                </Badge>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Créer l'Événement
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}