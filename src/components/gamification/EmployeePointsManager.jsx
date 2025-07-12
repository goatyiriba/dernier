
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, 
  Plus, 
  Minus, 
  Award, 
  Target, 
  TrendingUp,
  Crown,
  Star,
  Zap,
  Edit,
  Save
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { AuthService } from "@/api/supabaseEntities";

export default function EmployeePointsManager({ employees, employeePoints, badges, onUpdate }) {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [pointsAdjustment, setPointsAdjustment] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [isPointsModalOpen, setIsPointsModalOpen] = useState(false);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Filtrer les employés selon le terme de recherche
  const filteredEmployees = employees.filter(emp => 
    emp.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Obtenir les points d'un employé
  const getEmployeePoints = (employeeId) => {
    const points = employeePoints.find(p => p.employee_id === employeeId);
    return points ? points.total_points : 0;
  };

  // Obtenir les badges d'un employé
  const getEmployeeBadges = (employeeId) => {
    return badges.filter(b => b.employee_id === employeeId);
  };

  // Ajuster les points d'un employé
  const handleAdjustPoints = async () => {
    if (!selectedEmployee || pointsAdjustment === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un employé et saisir un montant",
        variant: "destructive"
      });
      return;
    }

    try {
      const existingPoints = employeePoints.find(p => p.employee_id === selectedEmployee.id);
      
      if (existingPoints) {
        await AuthService.updateEmployeePoints(existingPoints.id, {
          total_points: Math.max(0, existingPoints.total_points + pointsAdjustment),
          points_this_month: existingPoints.points_this_month + (pointsAdjustment > 0 ? pointsAdjustment : 0)
        });
      } else {
        await AuthService.createEmployeePoints({
          employee_id: selectedEmployee.id,
          total_points: Math.max(0, pointsAdjustment),
          level: 1,
          points_this_month: pointsAdjustment > 0 ? pointsAdjustment : 0,
          points_this_week: pointsAdjustment > 0 ? pointsAdjustment : 0
        });
      }

      toast({
        title: "✅ Points ajustés",
        description: `${pointsAdjustment > 0 ? '+' : ''}${pointsAdjustment} points pour ${selectedEmployee.first_name} ${selectedEmployee.last_name}`,
        duration: 3000
      });

      setIsPointsModalOpen(false);
      setPointsAdjustment(0);
      setAdjustmentReason("");
      onUpdate();

    } catch (error) {
      console.error("Error adjusting points:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajuster les points",
        variant: "destructive"
      });
    }
  };

  // Attribuer un badge à un employé
  const handleAwardBadge = async () => {
    if (!selectedEmployee || !selectedBadge) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un employé et un badge",
        variant: "destructive"
      });
      return;
    }

    try {
      const badgeData = JSON.parse(selectedBadge);
      
      await AuthService.createBadge({
        employee_id: selectedEmployee.id,
        badge_id: badgeData.badge_id,
        badge_name: badgeData.badge_name,
        badge_description: badgeData.badge_description,
        badge_icon: badgeData.badge_icon,
        badge_category: badgeData.badge_category,
        badge_tier: badgeData.badge_tier,
        points_value: badgeData.points_value,
        earned_at: new Date().toISOString(),
        criteria_met: { manual_award: true, awarded_by: "admin" }
      });

      // Ajouter les points du badge
      const existingPoints = employeePoints.find(p => p.employee_id === selectedEmployee.id);
      if (existingPoints) {
        await AuthService.updateEmployeePoints(existingPoints.id, {
          total_points: existingPoints.total_points + badgeData.points_value,
          badges_count: (existingPoints.badges_count || 0) + 1
        });
      }

      toast({
        title: "🏆 Badge attribué",
        description: `Badge "${badgeData.badge_name}" attribué à ${selectedEmployee.first_name} ${selectedEmployee.last_name}`,
        duration: 3000
      });

      setIsBadgeModalOpen(false);
      setSelectedBadge("");
      onUpdate();

    } catch (error) {
      console.error("Error awarding badge:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'attribuer le badge",
        variant: "destructive"
      });
    }
  };

  // Badges disponibles (templates)
  const availableBadges = [
    {
      badge_id: "punctuality_master",
      badge_name: "Maître de la Ponctualité",
      badge_description: "Toujours à l'heure",
      badge_icon: "Clock",
      badge_category: "attendance",
      badge_tier: "gold",
      points_value: 50
    },
    {
      badge_id: "team_player",
      badge_name: "Esprit d'Équipe",
      badge_description: "Excellent collaborateur",
      badge_icon: "Users",
      badge_category: "collaboration",
      badge_tier: "silver",
      points_value: 30
    },
    {
      badge_id: "innovator",
      badge_name: "Innovateur",
      badge_description: "Idées créatives",
      badge_icon: "Zap",
      badge_category: "innovation",
      badge_tier: "platinum",
      points_value: 75
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Users className="w-8 h-8 text-purple-600" />
            Gestion des Points & Badges Employés
          </CardTitle>
          <p className="text-gray-600">
            Ajustez les points et attribuez des badges à vos employés
          </p>
        </CardHeader>
      </Card>

      {/* Barre de recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Rechercher un employé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <div className="flex gap-2">
              <Button 
                onClick={() => setIsPointsModalOpen(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Target className="w-4 h-4 mr-2" />
                Ajuster Points
              </Button>
              <Button 
                onClick={() => setIsBadgeModalOpen(true)}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                <Award className="w-4 h-4 mr-2" />
                Attribuer Badge
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des employés */}
      <div className="grid gap-4">
        {filteredEmployees.map((employee) => {
          const points = getEmployeePoints(employee.id);
          const employeeBadges = getEmployeeBadges(employee.id);
          
          return (
            <motion.div
              key={employee.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {employee.first_name?.[0]}{employee.last_name?.[0]}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {employee.first_name} {employee.last_name}
                        </h3>
                        <p className="text-gray-600">{employee.position}</p>
                        <Badge variant="outline" className="mt-1">
                          {employee.department}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                      <div className="text-center lg:text-right">
                        <div className="text-3xl font-bold text-green-600">{points}</div>
                        <div className="text-sm text-gray-500">Points total</div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {employeeBadges.slice(0, 3).map((badge, index) => (
                          <Badge key={index} className="bg-yellow-100 text-yellow-800">
                            <Award className="w-3 h-3 mr-1" />
                            {badge.badge_name}
                          </Badge>
                        ))}
                        {employeeBadges.length > 3 && (
                          <Badge variant="outline">
                            +{employeeBadges.length - 3} autres
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setIsPointsModalOpen(true);
                          }}
                        >
                          <Target className="w-4 h-4 mr-1" />
                          Points
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setIsBadgeModalOpen(true);
                          }}
                        >
                          <Award className="w-4 h-4 mr-1" />
                          Badge
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Modal d'ajustement des points */}
      <Dialog open={isPointsModalOpen} onOpenChange={setIsPointsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              Ajuster les Points
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Employé sélectionné</Label>
              <div className="p-3 bg-gray-100 rounded-lg">
                {selectedEmployee ? 
                  `${selectedEmployee.first_name} ${selectedEmployee.last_name}` : 
                  "Aucun employé sélectionné"
                }
              </div>
            </div>
            
            <div>
              <Label>Ajustement des points</Label>
              <Input
                type="number"
                value={pointsAdjustment}
                onChange={(e) => setPointsAdjustment(parseInt(e.target.value) || 0)}
                placeholder="Entrez le nombre de points (+ ou -)"
              />
              <p className="text-sm text-gray-500 mt-1">
                Utilisez des nombres négatifs pour retirer des points
              </p>
            </div>
            
            <div>
              <Label>Raison (optionnel)</Label>
              <Textarea
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                placeholder="Pourquoi ajustez-vous ces points ?"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsPointsModalOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleAdjustPoints} className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                Confirmer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal d'attribution de badge */}
      <Dialog open={isBadgeModalOpen} onOpenChange={setIsBadgeModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-600" />
              Attribuer un Badge
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Employé sélectionné</Label>
              <div className="p-3 bg-gray-100 rounded-lg">
                {selectedEmployee ? 
                  `${selectedEmployee.first_name} ${selectedEmployee.last_name}` : 
                  "Aucun employé sélectionné"
                }
              </div>
            </div>
            
            <div>
              <Label>Badge à attribuer</Label>
              <Select value={selectedBadge} onValueChange={setSelectedBadge}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisissez un badge" />
                </SelectTrigger>
                <SelectContent>
                  {availableBadges.map((badge) => (
                    <SelectItem key={badge.badge_id} value={JSON.stringify(badge)}>
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        {badge.badge_name} ({badge.points_value} pts)
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsBadgeModalOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleAwardBadge} className="bg-yellow-600 hover:bg-yellow-700">
                <Award className="w-4 h-4 mr-2" />
                Attribuer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
