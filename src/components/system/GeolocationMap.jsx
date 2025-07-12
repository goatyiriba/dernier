import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Globe, Navigation, Wifi } from "lucide-react";

export default function GeolocationMap({ logs }) {
  // Simuler des données de géolocalisation basées sur les logs
  const generateLocationData = () => {
    const cities = [
      { name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, connections: Math.floor(Math.random() * 20) + 5 },
      { name: 'Lyon', country: 'France', lat: 45.7640, lng: 4.8357, connections: Math.floor(Math.random() * 15) + 3 },
      { name: 'Marseille', country: 'France', lat: 43.2965, lng: 5.3698, connections: Math.floor(Math.random() * 12) + 2 },
      { name: 'Toulouse', country: 'France', lat: 43.6047, lng: 1.4442, connections: Math.floor(Math.random() * 10) + 2 },
      { name: 'Nice', country: 'France', lat: 43.7102, lng: 7.2620, connections: Math.floor(Math.random() * 8) + 1 },
    ];
    
    return cities.map(city => ({
      ...city,
      isSecure: city.connections < 15,
      lastConnection: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)
    }));
  };

  const locationData = generateLocationData();
  
  // Statistiques de géolocalisation
  const geoStats = {
    totalLocations: locationData.length,
    secureConnections: locationData.filter(l => l.isSecure).length,
    riskyConnections: locationData.filter(l => !l.isSecure).length,
    totalConnections: locationData.reduce((sum, l) => sum + l.connections, 0)
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-green-600" />
          Géolocalisation des Connexions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Statistiques géographiques */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="flex items-center justify-center mb-2">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600">{geoStats.totalLocations}</p>
            <p className="text-xs text-blue-700">Localisations</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="flex items-center justify-center mb-2">
              <Navigation className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">{geoStats.secureConnections}</p>
            <p className="text-xs text-green-700">Sécurisées</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <div className="flex items-center justify-center mb-2">
              <Wifi className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-orange-600">{geoStats.riskyConnections}</p>
            <p className="text-xs text-orange-700">À Surveiller</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="flex items-center justify-center mb-2">
              <Globe className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-600">{geoStats.totalConnections}</p>
            <p className="text-xs text-purple-700">Total Connexions</p>
          </div>
        </div>

        {/* Carte représentative */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-xl border-2 border-dashed border-blue-200">
          <div className="text-center mb-4">
            <Globe className="w-12 h-12 text-blue-500 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900">Carte Interactive des Connexions</h4>
            <p className="text-sm text-gray-600">Visualisation géographique en temps réel</p>
          </div>
          
          {/* Simulation d'une carte avec des points */}
          <div className="relative bg-white rounded-lg p-6 min-h-[200px] border shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg opacity-50" />
            <div className="relative z-10">
              {locationData.map((location, index) => (
                <div
                  key={location.name}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${20 + index * 15}%`,
                    top: `${30 + (index % 3) * 20}%`
                  }}
                >
                  <div className={`w-4 h-4 rounded-full animate-pulse ${
                    location.isSecure ? 'bg-green-500' : 'bg-orange-500'
                  } shadow-lg`} />
                  <div className="absolute top-5 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-md text-xs whitespace-nowrap">
                    {location.name}
                    <br />
                    <span className="text-gray-500">{location.connections} conn.</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Liste des localisations */}
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Détails des Localisations
          </h4>
          {locationData.map((location) => (
            <div key={location.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  location.isSecure ? 'bg-green-500' : 'bg-orange-500'
                }`} />
                <div>
                  <p className="font-medium text-sm text-gray-900">
                    {location.name}, {location.country}
                  </p>
                  <p className="text-xs text-gray-500">
                    {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={
                  location.isSecure 
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-orange-50 text-orange-700 border-orange-200'
                }>
                  {location.connections} connexions
                </Badge>
                <Badge variant="outline" className={
                  location.isSecure 
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-orange-50 text-orange-700 border-orange-200'
                }>
                  {location.isSecure ? 'Sécurisé' : 'À surveiller'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}