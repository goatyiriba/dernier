import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Edit, Users, Calendar, Target, X } from "lucide-react";

export default function EditProjectModal({ isOpen, onClose, onSubmit, project, employees }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "planning",
    priority: "medium",
    start_date: "",
    end_date: "",
    team_members: [],
    budget: "",
    color: "#3B82F6",
    progress: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || "",
        description: project.description || "",
        status: project.status || "planning",
        priority: project.priority || "medium",
        start_date: project.start_date || "",
        end_date: project.end_date || "",
        team_members: project.team_members || [],
        budget: project.budget || "",
        color: project.color || "#3B82F6",
        progress: project.progress || 0
      });
    }
  }, [project]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTeamMember = (employeeId) => {
    if (!formData.team_members.includes(employeeId)) {
      setFormData({
        ...formData,
        team_members: [...formData.team_members, employeeId]
      });
    }
  };

  const removeTeamMember = (employeeId) => {
    setFormData({
      ...formData,
      team_members: formData.team_members.filter(id => id !== employeeId)
    });
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : '';
  };

  const colors = [
    "#3B82F6", "#EF4444", "#10B981", "#F59E0B", 
    "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Edit className="w-5 h-5 text-white" />
            </div>
            Modifier le Projet
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nom du projet *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Entrez le nom du projet..."
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Décrivez le projet en détail..."
                rows={4}
              />
            </div>
          </div>

          {/* Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Statut</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planification</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="on_hold">En pause</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priorité</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Faible</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="high">Haute</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Progression */}
          <div>
            <Label htmlFor="progress">Progression ({formData.progress}%)</Label>
            <Input
              id="progress"
              type="range"
              min="0"
              max="100"
              value={formData.progress}
              onChange={(e) => setFormData({...formData, progress: parseInt(e.target.value)})}
              className="w-full"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Date de début</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="end_date">Date de fin</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({...formData, end_date: e.target.value})}
              />
            </div>
          </div>

          {/* Budget */}
          <div>
            <Label htmlFor="budget">Budget (optionnel)</Label>
            <Input
              id="budget"
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({...formData, budget: e.target.value})}
              placeholder="0"
            />
          </div>

          {/* Couleur */}
          <div>
            <Label>Couleur du projet</Label>
            <div className="flex gap-2 mt-2">
              {colors.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${
                    formData.color === color ? 'border-gray-400 scale-110' : 'border-gray-200'
                  } transition-all`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({...formData, color})}
                />
              ))}
            </div>
          </div>

          {/* Équipe */}
          <div>
            <Label>Membres de l'équipe</Label>
            <Select onValueChange={addTeamMember}>
              <SelectTrigger>
                <SelectValue placeholder="Ajouter un membre..." />
              </SelectTrigger>
              <SelectContent>
                {employees
                  .filter(emp => !formData.team_members.includes(emp.id))
                  .map(employee => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.first_name} {employee.last_name} - {employee.department}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            {formData.team_members.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.team_members.map(memberId => (
                  <Badge
                    key={memberId}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <Users className="w-3 h-3" />
                    {getEmployeeName(memberId)}
                    <button
                      type="button"
                      onClick={() => removeTeamMember(memberId)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.name.trim()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Mise à jour...
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Mettre à jour
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}