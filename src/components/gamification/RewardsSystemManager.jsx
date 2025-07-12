
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Gift, 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  Crown, 
  Zap, 
  Target,
  Save,
  Award,
  DollarSign,
  Coffee,
  Users // Added Users import
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const DEFAULT_REWARDS = [
  {
    id: 1,
    name: "Bon d'achat 50€",
    description: "Bon d'achat de 50€ utilisable en magasin",
    type: "voucher",
    value: "50€",
    points_required: 500,
    icon: "Gift",
    color: "bg-green-100 text-green-800",
    is_active: true,
    stock: 10,
    claimed: 2
  },
  {
    id: 2,
    name: "Jour de congé supplémentaire",
    description: "Une journée de congé bonus à utiliser quand vous voulez",
    type: "time_off",
    value: "1 jour",
    points_required: 800,
    icon: "Star",
    color: "bg-blue-100 text-blue-800",
    is_active: true,
    stock: 5,
    claimed: 1
  },
  {
    id: 3,
    name: "Place de parking VIP",
    description: "Place de parking réservée pendant 1 mois",
    type: "privilege",
    value: "1 mois",
    points_required: 300,
    icon: "Crown",
    color: "bg-purple-100 text-purple-800",
    is_active: true,
    stock: 2,
    claimed: 0
  },
  {
    id: 4,
    name: "Petit-déjeuner offert",
    description: "Petit-déjeuner offert à toute l'équipe",
    type: "team_benefit",
    value: "Équipe",
    points_required: 1000,
    icon: "Coffee",
    color: "bg-orange-100 text-orange-800",
    is_active: true,
    stock: 3,
    claimed: 0
  }
];

const REWARD_TYPES = {
  voucher: { name: "Bon d'achat", icon: Gift },
  time_off: { name: "Congé", icon: Star },
  privilege: { name: "Privilège", icon: Crown },
  team_benefit: { name: "Avantage équipe", icon: Users },
  cash: { name: "Prime", icon: DollarSign },
  experience: { name: "Expérience", icon: Zap }
};

export default function RewardsSystemManager({ settings, employees, onUpdate }) {
  const [rewards, setRewards] = useState(DEFAULT_REWARDS);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [rewardForm, setRewardForm] = useState({
    name: "",
    description: "",
    type: "voucher",
    value: "",
    points_required: 100,
    icon: "Gift",
    color: "bg-green-100 text-green-800",
    is_active: true,
    stock: 10
  });
  const { toast } = useToast();

  const handleCreateReward = async () => {
    try {
      if (!rewardForm.name || !rewardForm.description || !rewardForm.points_required) {
        toast({
          title: "Erreur",
          description: "Veuillez remplir tous les champs obligatoires",
          variant: "destructive"
        });
        return;
      }

      const newReward = {
        ...rewardForm,
        id: Date.now(),
        claimed: 0
      };

      if (selectedReward) {
        // Modification
        setRewards(rewards.map(r => r.id === selectedReward.id ? { ...newReward, id: selectedReward.id } : r));
        toast({
          title: "✅ Récompense modifiée",
          description: `La récompense "${rewardForm.name}" a été mise à jour`,
          duration: 3000
        });
      } else {
        // Création
        setRewards([...rewards, newReward]);
        toast({
          title: "✅ Récompense créée",
          description: `La récompense "${rewardForm.name}" a été créée avec succès`,
          duration: 3000
        });
      }

      setIsCreateModalOpen(false);
      setSelectedReward(null);
      resetForm();

    } catch (error) {
      console.error("Error creating reward:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la récompense",
        variant: "destructive"
      });
    }
  };

  const handleDeleteReward = (rewardId) => {
    setRewards(rewards.filter(r => r.id !== rewardId));
    toast({
      title: "🗑️ Récompense supprimée",
      description: "La récompense a été supprimée avec succès",
      duration: 3000
    });
  };

  const resetForm = () => {
    setRewardForm({
      name: "",
      description: "",
      type: "voucher",
      value: "",
      points_required: 100,
      icon: "Gift",
      color: "bg-green-100 text-green-800",
      is_active: true,
      stock: 10
    });
  };

  const getRewardStats = () => {
    const totalRewards = rewards.length;
    const activeRewards = rewards.filter(r => r.is_active).length;
    const totalClaimed = rewards.reduce((sum, r) => sum + r.claimed, 0);
    const totalStock = rewards.reduce((sum, r) => sum + r.stock, 0);

    return { totalRewards, activeRewards, totalClaimed, totalStock };
  };

  const stats = getRewardStats();

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-0 shadow-lg">
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-600 rounded-xl flex items-center justify-center">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                Système de Récompenses
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Gérez les récompenses et prix à échanger contre des points
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Stats rapides */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-600">{stats.totalRewards}</div>
                  <div className="text-xs text-gray-500">Récompenses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.activeRewards}</div>
                  <div className="text-xs text-gray-500">Actives</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalClaimed}</div>
                  <div className="text-xs text-gray-500">Réclamées</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.totalStock}</div>
                  <div className="text-xs text-gray-500">En stock</div>
                </div>
              </div>
              
              <Button 
                onClick={() => {
                  setSelectedReward(null);
                  resetForm();
                  setIsCreateModalOpen(true);
                }}
                className="bg-pink-600 hover:bg-pink-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle Récompense
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Récompenses par catégorie */}
      <div className="space-y-6">
        {Object.entries(REWARD_TYPES).map(([typeKey, typeInfo]) => {
          const typeRewards = rewards.filter(r => r.type === typeKey);
          
          if (typeRewards.length === 0) return null;

          return (
            <Card key={typeKey} className="border-l-4 border-l-pink-500">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                    <typeInfo.icon className="w-5 h-5 text-pink-600" />
                  </div>
                  {typeInfo.name}
                  <Badge variant="outline">{typeRewards.length}</Badge>
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {typeRewards.map((reward) => (
                      <motion.div
                        key={reward.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200"
                      >
                        {/* Header de la carte */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${reward.color}`}>
                              {/* Assuming icon prop corresponds to an imported Lucide icon component */}
                              {typeInfo.icon && React.createElement(typeInfo.icon, { className: "w-6 h-6" })}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">{reward.name}</h4>
                              <p className="text-sm text-gray-600">{reward.value}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedReward(reward);
                                setRewardForm(reward);
                                setIsCreateModalOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteReward(reward.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-600 mb-4">
                          {reward.description}
                        </p>

                        {/* Métriques */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Points requis:</span>
                            <Badge className="bg-blue-100 text-blue-800 font-bold">
                              {reward.points_required} pts
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Stock:</span>
                            <Badge variant="outline">
                              {reward.stock - reward.claimed} / {reward.stock}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Réclamées:</span>
                            <Badge className="bg-green-100 text-green-800">
                              {reward.claimed}
                            </Badge>
                          </div>
                        </div>

                        {/* Barre de progression du stock */}
                        <div className="mt-4">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Disponibilité</span>
                            <span>{Math.round(((reward.stock - reward.claimed) / reward.stock) * 100)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${((reward.stock - reward.claimed) / reward.stock) * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* Statut */}
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                          <Badge className={reward.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                            {reward.is_active ? "Actif" : "Inactif"}
                          </Badge>
                          
                          <Switch
                            checked={reward.is_active}
                            onCheckedChange={(checked) => {
                              setRewards(rewards.map(r => 
                                r.id === reward.id ? { ...r, is_active: checked } : r
                              ));
                            }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal de création/édition */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              {selectedReward ? "Modifier la récompense" : "Créer une nouvelle récompense"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nom de la récompense</Label>
                <Input
                  placeholder="Ex: Bon d'achat Amazon 50€"
                  value={rewardForm.name}
                  onChange={(e) => setRewardForm({...rewardForm, name: e.target.value})}
                />
              </div>
              
              <div>
                <Label>Valeur</Label>
                <Input
                  placeholder="Ex: 50€, 1 jour, VIP"
                  value={rewardForm.value}
                  onChange={(e) => setRewardForm({...rewardForm, value: e.target.value})}
                />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="Décrivez en détail cette récompense..."
                value={rewardForm.description}
                onChange={(e) => setRewardForm({...rewardForm, description: e.target.value})}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Type</Label>
                <Select 
                  value={rewardForm.type} 
                  onValueChange={(value) => setRewardForm({...rewardForm, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(REWARD_TYPES).map(([key, type]) => (
                      <SelectItem key={key} value={key}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Points requis</Label>
                <Input
                  type="number"
                  value={rewardForm.points_required}
                  onChange={(e) => setRewardForm({...rewardForm, points_required: parseInt(e.target.value)})}
                  min="1"
                />
              </div>

              <div>
                <Label>Stock disponible</Label>
                <Input
                  type="number"
                  value={rewardForm.stock}
                  onChange={(e) => setRewardForm({...rewardForm, stock: parseInt(e.target.value)})}
                  min="1"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={rewardForm.is_active}
                onCheckedChange={(checked) => setRewardForm({...rewardForm, is_active: checked})}
              />
              <Label>Récompense active et disponible</Label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setSelectedReward(null);
                  resetForm();
                }}
              >
                Annuler
              </Button>
              <Button onClick={handleCreateReward}>
                <Save className="w-4 h-4 mr-2" />
                {selectedReward ? "Modifier" : "Créer"} la récompense
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
