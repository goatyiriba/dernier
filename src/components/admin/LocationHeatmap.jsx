import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Users, 
  Building2,
  Home,
  Coffee,
  Wifi,
  Globe,
  Navigation,
  Target,
  Map
} from "lucide-react";
import { motion } from "framer-motion";

const LocationCard = ({ location, count, percentage, icon: Icon, color, isActive, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
        isActive 
          ? `${color.selected} shadow-lg` 
          : `${color.normal} hover:${color.hover}`
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color.iconBg}`}>
          <Icon className={`w-6 h-6 ${color.iconColor}`} />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{location}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-bold text-gray-900">{count}</span>
            <span className="text-sm text-gray-600">employés</span>
            <Badge className={`text-xs ${color.badge}`}>
              {percentage}%
            </Badge>
          </div>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`${color.progress} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      
      {isActive && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 pt-3 border-t border-gray-200"
        >
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-gray-600">En ligne: {Math.round(count * 0.8)}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span className="text-gray-600">Pause: {Math.round(count * 0.2)}</span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

const RegionStats = ({ regions }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {regions.map((region, index) => (
        <motion.div
          key={region.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border"
        >
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-indigo-600" />
            <span className="font-medium text-gray-900">{region.name}</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{region.count}</div>
          <div className="text-xs text-gray-600">employés dans la région</div>
        </motion.div>
      ))}
    </div>
  );
};

export default function LocationHeatmap({ employees }) {
  const [selectedLocation, setSelectedLocation] = useState('bureau');
  const [viewMode, setViewMode] = useState('locations'); // locations, regions

  // Simulation de données de localisation
  const generateLocationData = () => {
    const totalEmployees = employees.length;
    
    // Répartition simulée des localisations
    const locations = [
      {
        id: 'bureau',
        name: 'Bureau Principal',
        count: Math.round(totalEmployees * 0.6),
        icon: Building2,
        color: {
          normal: 'bg-blue-50 border-blue-200',
          hover: 'bg-blue-100 border-blue-300',
          selected: 'bg-blue-100 border-blue-400',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          badge: 'bg-blue-100 text-blue-700',
          progress: 'bg-gradient-to-r from-blue-400 to-blue-500'
        }
      },
      {
        id: 'domicile',
        name: 'Télétravail',
        count: Math.round(totalEmployees * 0.3),
        icon: Home,
        color: {
          normal: 'bg-green-50 border-green-200',
          hover: 'bg-green-100 border-green-300',
          selected: 'bg-green-100 border-green-400',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          badge: 'bg-green-100 text-green-700',
          progress: 'bg-gradient-to-r from-green-400 to-green-500'
        }
      },
      {
        id: 'coworking',
        name: 'Espace de Coworking',
        count: Math.round(totalEmployees * 0.08),
        icon: Coffee,
        color: {
          normal: 'bg-orange-50 border-orange-200',
          hover: 'bg-orange-100 border-orange-300',
          selected: 'bg-orange-100 border-orange-400',
          iconBg: 'bg-orange-100',
          iconColor: 'text-orange-600',
          badge: 'bg-orange-100 text-orange-700',
          progress: 'bg-gradient-to-r from-orange-400 to-orange-500'
        }
      },
      {
        id: 'client',
        name: 'Chez le Client',
        count: Math.round(totalEmployees * 0.02),
        icon: Navigation,
        color: {
          normal: 'bg-purple-50 border-purple-200',
          hover: 'bg-purple-100 border-purple-300',
          selected: 'bg-purple-100 border-purple-400',
          iconBg: 'bg-purple-100',
          iconColor: 'text-purple-600',
          badge: 'bg-purple-100 text-purple-700',
          progress: 'bg-gradient-to-r from-purple-400 to-purple-500'
        }
      }
    ];

    // Calculer les pourcentages
    return locations.map(location => ({
      ...location,
      percentage: totalEmployees > 0 ? Math.round((location.count / totalEmployees) * 100) : 0
    }));
  };

  const generateRegionData = () => {
    const totalEmployees = employees.length;
    
    return [
      {
        name: 'Île-de-France',
        count: Math.round(totalEmployees * 0.5),
        cities: ['Paris', 'Boulogne', 'Neuilly']
      },
      {
        name: 'Auvergne-Rhône-Alpes',
        count: Math.round(totalEmployees * 0.2),
        cities: ['Lyon', 'Grenoble', 'Annecy']
      },
      {
        name: 'Autres Régions',
        count: Math.round(totalEmployees * 0.3),
        cities: ['Marseille', 'Toulouse', 'Nantes']
      }
    ];
  };

  const locationData = generateLocationData();
  const regionData = generateRegionData();
  const selectedLocationData = locationData.find(loc => loc.id === selectedLocation);

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            Localisation des Employés
            <Badge className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
              {employees.length} employés
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={viewMode === 'locations' ? 'default' : 'outline'}
              onClick={() => setViewMode('locations')}
            >
              <MapPin className="w-4 h-4 mr-1" />
              Lieux
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'regions' ? 'default' : 'outline'}
              onClick={() => setViewMode('regions')}
            >
              <Globe className="w-4 h-4 mr-1" />
              Régions
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {viewMode === 'locations' ? (
          <>
            {/* Vue par localisation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {locationData.map((location) => (
                <LocationCard
                  key={location.id}
                  location={location.name}
                  count={location.count}
                  percentage={location.percentage}
                  icon={location.icon}
                  color={location.color}
                  isActive={selectedLocation === location.id}
                  onClick={() => setSelectedLocation(location.id)}
                />
              ))}
            </div>

            {/* Détails de la localisation sélectionnée */}
            {selectedLocationData && (
              <motion.div
                key={selectedLocation}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-indigo-200"
              >
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <selectedLocationData.icon className="w-5 h-5 text-indigo-600" />
                  Détails - {selectedLocationData.name}
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">{selectedLocationData.count}</div>
                    <div className="text-xs text-gray-600">Total employés</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{Math.round(selectedLocationData.count * 0.8)}</div>
                    <div className="text-xs text-gray-600">Connectés</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{Math.round(selectedLocationData.count * 0.15)}</div>
                    <div className="text-xs text-gray-600">En pause</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">{Math.round(selectedLocationData.count * 0.05)}</div>
                    <div className="text-xs text-gray-600">Hors ligne</div>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        ) : (
          <>
            {/* Vue par région */}
            <RegionStats regions={regionData} />
            
            {/* Carte simulée */}
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-8 text-center">
              <Map className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-700 mb-2">Carte Interactive</h3>
              <p className="text-sm text-gray-600">
                Visualisation géographique des employés par région
              </p>
              <Button className="mt-4" variant="outline" size="sm">
                <Navigation className="w-4 h-4 mr-2" />
                Voir la carte complète
              </Button>
            </div>
          </>
        )}

        {/* Footer avec statistiques globales */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Wifi className="w-4 h-4 text-green-500" />
                <span>{Math.round(employees.length * 0.85)} connectés</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="w-4 h-4 text-blue-500" />
                <span>Couverture: 100%</span>
              </div>
            </div>
            
            <div className="text-xs text-gray-500">
              Mis à jour il y a 2 minutes
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}