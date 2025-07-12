import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Server, 
  Cpu, 
  HardDrive, 
  Network, 
  Activity, 
  Zap,
  Database,
  Cloud
} from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Area, AreaChart } from "recharts";

export default function SystemHealthDashboard({ metrics }) {
  // Simulation de données de santé système
  const systemHealth = {
    cpu: Math.floor(Math.random() * 30) + 20, // 20-50%
    memory: Math.floor(Math.random() * 40) + 30, // 30-70%
    storage: Math.floor(Math.random() * 20) + 15, // 15-35%
    network: Math.floor(Math.random() * 25) + 10, // 10-35%
    database: Math.floor(Math.random() * 20) + 25, // 25-45%
    uptime: 99.9
  };

  const performanceData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    cpu: Math.floor(Math.random() * 40) + 20,
    memory: Math.floor(Math.random() * 50) + 30,
    network: Math.floor(Math.random() * 30) + 15
  }));

  const HealthMetric = ({ title, value, icon: Icon, color, unit = "%" }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                color === 'green' ? 'bg-green-100' :
                color === 'blue' ? 'bg-blue-100' :
                color === 'purple' ? 'bg-purple-100' :
                color === 'orange' ? 'bg-orange-100' :
                'bg-gray-100'
              }`}>
                <Icon className={`w-5 h-5 ${
                  color === 'green' ? 'text-green-600' :
                  color === 'blue' ? 'text-blue-600' :
                  color === 'purple' ? 'text-purple-600' :
                  color === 'orange' ? 'text-orange-600' :
                  'text-gray-600'
                }`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <p className={`text-lg font-bold ${
                  value > 80 ? 'text-red-600' :
                  value > 60 ? 'text-orange-600' :
                  'text-green-600'
                }`}>
                  {value}{unit}
                </p>
              </div>
            </div>
            <Badge variant="outline" className={
              value > 80 ? 'border-red-200 text-red-700 bg-red-50' :
              value > 60 ? 'border-orange-200 text-orange-700 bg-orange-50' :
              'border-green-200 text-green-700 bg-green-50'
            }>
              {value > 80 ? 'Élevé' : value > 60 ? 'Moyen' : 'Normal'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-600" />
            État de Santé du Système
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <HealthMetric
              title="CPU"
              value={systemHealth.cpu}
              icon={Cpu}
              color="blue"
            />
            <HealthMetric
              title="Mémoire"
              value={systemHealth.memory}
              icon={Server}
              color="green"
            />
            <HealthMetric
              title="Stockage"
              value={systemHealth.storage}
              icon={HardDrive}
              color="purple"
            />
            <HealthMetric
              title="Réseau"
              value={systemHealth.network}
              icon={Network}
              color="orange"
            />
            <HealthMetric
              title="Base de Données"
              value={systemHealth.database}
              icon={Database}
              color="blue"
            />
            <HealthMetric
              title="Disponibilité"
              value={systemHealth.uptime}
              icon={Cloud}
              color="green"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            Performance en Temps Réel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={performanceData}>
              <XAxis dataKey="hour" />
              <YAxis />
              <Area 
                type="monotone" 
                dataKey="cpu" 
                stackId="1" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.3}
              />
              <Area 
                type="monotone" 
                dataKey="memory" 
                stackId="1" 
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.3}
              />
              <Area 
                type="monotone" 
                dataKey="network" 
                stackId="1" 
                stroke="#f59e0b" 
                fill="#f59e0b" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span className="text-sm text-gray-600">CPU</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-sm text-gray-600">Mémoire</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full" />
              <span className="text-sm text-gray-600">Réseau</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}