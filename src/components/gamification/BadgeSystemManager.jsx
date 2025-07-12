
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge as UIBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Award, 
  Star, 
  Trophy, 
  Crown, 
  Shield, 
  Target, 
  Zap, 
  Clock,
  Users,
  MessageSquare,
  BookOpen,
  CheckCircle,
  TrendingUp,
  Calendar,
  Flame,
  Heart,
  Lightbulb,
  Coffee,
  Gift
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthService } from '@/api/supabaseEntities';
import { format } from "date-fns";

// Configuration intelligente des badges avec icônes et couleurs
const BADGE_CONFIG = {
  // Badges de Ponctualité
  PUNCTUALITY_NOVICE: {
    name: "Ponctuel Débutant",
    description: "5 arrivées à l'heure",
    icon: Clock,
    color: "from-blue-400 to-blue-600",
    category: "punctuality",
    tier: "bronze",
    rarity: "common"
  },
  PUNCTUALITY_EXPERT: {
    name: "Maître du Temps",
    description: "20 arrivées à l'heure",
    icon: Clock,
    color: "from-blue-500 to-blue-700",
    category: "punctuality",
    tier: "silver",
    rarity: "uncommon"
  },
  EARLY_BIRD: {
    name: "Lève-Tôt",
    description: "10 arrivées en avance",
    icon: Coffee,
    color: "from-orange-400 to-orange-600",
    category: "punctuality",
    tier: "gold",
    rarity: "rare"
  },
  
  // Badges de Performance
  POINTS_MILESTONE_100: {
    name: "Centurion",
    description: "100 points atteints",
    icon: Target,
    color: "from-green-400 to-green-600",
    category: "performance",
    tier: "bronze",
    rarity: "common"
  },
  POINTS_MILESTONE_500: {
    name: "Champion",
    description: "500 points atteints",
    icon: Trophy,
    color: "from-yellow-400 to-yellow-600",
    category: "performance",
    tier: "gold",
    rarity: "rare"
  },
  POINTS_MILESTONE_1000: {
    name: "Légende",
    description: "1000 points atteints",
    icon: Crown,
    color: "from-purple-400 to-purple-600",
    category: "performance",
    tier: "platinum",
    rarity: "legendary"
  },
  
  // Badges de Collaboration
  TEAM_PLAYER: {
    name: "Joueur d'Équipe",
    description: "Première collaboration",
    icon: Users,
    color: "from-teal-400 to-teal-600",
    category: "collaboration",
    tier: "bronze",
    rarity: "common"
  },
  COMMUNICATOR: {
    name: "Communicateur",
    description: "50 messages envoyés",
    icon: MessageSquare,
    color: "from-indigo-400 to-indigo-600",
    category: "collaboration",
    tier: "silver",
    rarity: "uncommon"
  },
  MENTOR: {
    name: "Mentor",
    description: "Aide 5 collègues",
    icon: Heart,
    color: "from-pink-400 to-pink-600",
    category: "collaboration",
    tier: "gold",
    rarity: "rare"
  },
  
  // Badges d'Engagement
  ANNOUNCEMENT_READER: {
    name: "Lecteur Actif",
    description: "Lit toutes les annonces",
    icon: BookOpen,
    color: "from-cyan-400 to-cyan-600",
    category: "engagement",
    tier: "bronze",
    rarity: "common"
  },
  MOTIVATOR: {
    name: "Motivateur",
    description: "Encourage l'équipe",
    icon: Zap,
    color: "from-amber-400 to-amber-600",
    category: "engagement",
    tier: "silver",
    rarity: "uncommon"
  },
  
  // Badges Spéciaux
  VETERAN: {
    name: "Vétéran",
    description: "6 mois d'ancienneté",
    icon: Shield,
    color: "from-gray-500 to-gray-700",
    category: "special",
    tier: "platinum",
    rarity: "epic"
  },
  INNOVATOR: {
    name: "Innovateur",
    description: "Propose des améliorations",
    icon: Lightbulb,
    color: "from-yellow-300 to-orange-500",
    category: "innovation",
    tier: "gold",
    rarity: "rare"
  },
  STREAK_MASTER: {
    name: "Maître des Séries",
    description: "30 jours consécutifs",
    icon: Flame,
    color: "from-red-400 to-red-600",
    category: "consistency",
    tier: "platinum",
    rarity: "epic"
  }
};

// Composant Badge intelligent
const SmartBadgeCard = ({ badge, isNew = false, onClick }) => {
  const config = BADGE_CONFIG[badge.badge_id] || {
    name: badge.badge_name,
    description: badge.badge_description,
    icon: Award,
    color: "from-gray-400 to-gray-600",
    category: badge.badge_category,
    tier: badge.badge_tier,
    rarity: "common"
  };

  const IconComponent = config.icon;
  
  const rarityColors = {
    common: "border-gray-300",
    uncommon: "border-green-400",
    rare: "border-blue-400",
    epic: "border-purple-400",
    legendary: "border-yellow-400 animate-pulse"
  };

  const tierLabels = {
    bronze: "🥉",
    silver: "🥈", 
    gold: "🥇",
    platinum: "💎",
    diamond: "💠"
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ duration: 0.3 }}
      className={`relative cursor-pointer ${isNew ? 'animate-bounce' : ''}`}
      onClick={() => onClick && onClick(badge)}
    >
      <Card className={`border-2 ${rarityColors[config.rarity]} hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm`}>
        <CardContent className="p-4 text-center relative overflow-hidden">
          {/* Badge de nouveau */}
          {isNew && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-white text-xs font-bold">!</span>
            </div>
          )}
          
          {/* Effet de fond */}
          <div className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-10`} />
          
          {/* Icône principale */}
          <div className={`relative w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg`}>
            <IconComponent className="w-8 h-8 text-white" />
          </div>
          
          {/* Titre et tier */}
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-2 mb-2">
              <h3 className="font-bold text-gray-900 text-sm">{config.name}</h3>
              {tierLabels[config.tier] && (
                <span className="text-lg">{tierLabels[config.tier]}</span>
              )}
            </div>
            
            <p className="text-xs text-gray-600 mb-2">{config.description}</p>
            
            {/* Métadonnées */}
            <div className="flex justify-between items-center text-xs">
              <UIBadge variant="outline" className="text-xs px-2 py-0">
                {config.category}
              </UIBadge>
              <span className="text-gray-500">
                {format(new Date(badge.earned_at), 'dd/MM/yy')}
              </span>
            </div>
            
            {/* Points */}
            {badge.points_value > 0 && (
              <div className="mt-2 text-center">
                <span className="text-lg font-bold text-green-600">+{badge.points_value}</span>
                <span className="text-xs text-gray-500 ml-1">pts</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function BadgeSystemManager({ employeeId, showTitle = true }) {
  const [badges, setBadges] = useState([]);
  const [employeePoints, setEmployeePoints] = useState(null);
  const [groupedBadges, setGroupedBadges] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBadgesData();
  }, [employeeId]);

  const loadBadgesData = async () => {
    try {
      setIsLoading(true);
      
      // CORRECTION: Charger avec dédoublonnage strict
      const employeeBadges = await AuthService.getEmployeeBadges(employeeId);
      const pointsData = await AuthService.getEmployeePoints(employeeId);
      
      // Dédoublonnage des badges
      const uniqueBadges = [];
      const seenBadgeIds = new Set();
      
      (employeeBadges || []).forEach(badge => {
        // Use a composite key if badge.id is not unique across all badges but badge.badge_id is.
        // If badge.id is truly a unique primary key for each earned badge instance,
        // and we want to show all instances even if it's the same badge_id,
        // then this deduplication by badge_id should not be here.
        // Assuming the intent is to show *which types* of badges an employee has earned, uniquely by badge_id.
        if (!seenBadgeIds.has(badge.badge_id)) {
          seenBadgeIds.add(badge.badge_id);
          uniqueBadges.push(badge);
        }
      });
      
      setBadges(uniqueBadges);
      setEmployeePoints(pointsData[0] || null);
      
      // Grouper les badges uniques par catégorie
      const grouped = uniqueBadges.reduce((acc, badge) => {
        const category = badge.badge_category || 'other';
        if (!acc[category]) acc[category] = [];
        acc[category].push(badge);
        return acc;
      }, {});
      
      setGroupedBadges(grouped);
      console.log(`📊 Badges chargés: ${uniqueBadges.length} uniques sur ${(employeeBadges || []).length} total`);
      
    } catch (error) {
      console.error('Error loading badges:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    { key: 'all', label: 'Tous', icon: Award },
    { key: 'punctuality', label: 'Ponctualité', icon: Clock },
    { key: 'performance', label: 'Performance', icon: Trophy },
    { key: 'collaboration', label: 'Collaboration', icon: Users },
    { key: 'engagement', label: 'Engagement', icon: Star },
    { key: 'innovation', label: 'Innovation', icon: Lightbulb },
    { key: 'special', label: 'Spéciaux', icon: Crown }
  ];

  const filteredBadges = selectedCategory === 'all' 
    ? badges 
    : badges.filter(badge => badge.badge_category === selectedCategory);

  const totalBadges = badges.length;
  const totalPoints = badges.reduce((sum, badge) => sum + (badge.points_value || 0), 0);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement des badges...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showTitle && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900">Mes Badges & Récompenses</h2>
            <UIBadge className="bg-yellow-100 text-yellow-800">
              {totalBadges} badges
            </UIBadge>
          </div>
          <Button variant="outline" onClick={loadBadgesData}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Vérifier
          </Button>
        </div>
      )}

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
            <div className="text-2xl font-bold text-yellow-700">{totalBadges}</div>
            <div className="text-sm text-yellow-600">Badges Obtenus</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-700">{totalPoints}</div>
            <div className="text-sm text-green-600">Points Badges</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-700">{employeePoints?.level || 1}</div>
            <div className="text-sm text-blue-600">Niveau Actuel</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-4 text-center">
            <Flame className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold text-purple-700">{employeePoints?.streak_days || 0}</div>
            <div className="text-sm text-purple-600">Jours Consécutifs</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres par catégorie */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(category => {
          const Icon = category.icon;
          const count = category.key === 'all' ? totalBadges : (groupedBadges[category.key]?.length || 0);
          
          return (
            <Button
              key={category.key}
              variant={selectedCategory === category.key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.key)}
              className="flex items-center gap-2"
            >
              <Icon className="w-4 h-4" />
              {category.label}
              {count > 0 && (
                <UIBadge variant="secondary" className="ml-1 px-1 py-0 text-xs">
                  {count}
                </UIBadge>
              )}
            </Button>
          );
        })}
      </div>

      {/* Grille de badges */}
      {filteredBadges.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <AnimatePresence>
            {filteredBadges
              .sort((a, b) => new Date(b.earned_at) - new Date(a.earned_at))
              .map((badge, index) => (
                <SmartBadgeCard
                  key={badge.id}
                  badge={badge}
                  isNew={index < 3} // Marquer les 3 derniers comme nouveaux
                  onClick={(badge) => {
                    // Optionnel: Modal de détails du badge
                    console.log('Badge clicked:', badge);
                  }}
                />
              ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {selectedCategory === 'all' ? 'Aucun badge obtenu' : `Aucun badge ${categories.find(c => c.key === selectedCategory)?.label.toLowerCase()}`}
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            {selectedCategory === 'all' 
              ? "Continuez vos efforts pour débloquer vos premiers badges !" 
              : "Explorez d'autres catégories ou continuez vos efforts dans cette catégorie."
            }
          </p>
        </div>
      )}
    </div>
  );
}
