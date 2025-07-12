import React, { useState, useEffect } from "react";
import { Message, Conversation, Employee } from "@/api/supabaseEntities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageCircle,
  Search,
  TrendingUp,
  Users,
  Clock,
  BarChart3,
  Activity,
  Filter,
  Calendar,
  Eye,
  ArrowUpRight
} from "lucide-react";
import { format, startOfDay, endOfDay, subDays } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("7days");

  useEffect(() => {
    loadData();
    
    // Actualiser toutes les 30 secondes
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [messagesData, conversationsData, employeesData] = await Promise.all([
        Message.list("-created_date"),
        Conversation.list("-last_message_at"),
        Employee.list()
      ]);

      setMessages(messagesData);
      setConversations(conversationsData);
      setEmployees(employeesData);
    } catch (error) {
      console.error("Erreur chargement données admin messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeName = (employeeId) => {
    const emp = employees.find(e => e.id === employeeId);
    return emp ? `${emp.first_name} ${emp.last_name}` : 'Employé inconnu';
  };

  // Statistiques générales
  const totalMessages = messages.length;
  const activeConversations = conversations.filter(c => 
    c.last_message_at && new Date(c.last_message_at) > subDays(new Date(), 7)
  ).length;
  const avgMessagesPerDay = Math.round(totalMessages / 30);
  const unreadMessages = messages.filter(m => !m.is_read).length;

  // Données pour les graphiques
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayMessages = messages.filter(m => {
      const msgDate = new Date(m.created_date);
      return msgDate >= startOfDay(date) && msgDate <= endOfDay(date);
    });
    
    return {
      date: format(date, 'dd/MM'),
      messages: dayMessages.length,
      conversations: new Set(dayMessages.map(m => m.conversation_id)).size
    };
  });

  // Top employés par messages
  const employeeMessageCounts = employees.map(emp => {
    const sentMessages = messages.filter(m => m.sender_id === emp.id).length;
    const receivedMessages = messages.filter(m => m.receiver_id === emp.id).length;
    
    return {
      employee: emp,
      sent: sentMessages,
      received: receivedMessages,
      total: sentMessages + receivedMessages
    };
  }).sort((a, b) => b.total - a.total).slice(0, 10);

  // Messages récents
  const recentMessages = messages
    .filter(m => m.content.toLowerCase().includes(searchTerm.toLowerCase()) || 
                 getEmployeeName(m.sender_id).toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(0, 20);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              📊 Analyse des Messages
            </h1>
            <p className="text-gray-600">
              Surveillance du trafic et des communications internes
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher dans les messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
            <Button onClick={loadData} variant="outline">
              <Activity className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Messages</p>
                    <p className="text-3xl font-bold">{totalMessages.toLocaleString()}</p>
                    <p className="text-blue-100 text-xs mt-1">Tous les temps</p>
                  </div>
                  <MessageCircle className="w-12 h-12 text-blue-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
            <Card className="bg-gradient-to-br from-emerald-500 to-green-600 text-white border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm font-medium">Conversations Actives</p>
                    <p className="text-3xl font-bold">{activeConversations}</p>
                    <p className="text-emerald-100 text-xs mt-1">7 derniers jours</p>
                  </div>
                  <Users className="w-12 h-12 text-emerald-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
            <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-100 text-sm font-medium">Moyenne/Jour</p>
                    <p className="text-3xl font-bold">{avgMessagesPerDay}</p>
                    <p className="text-amber-100 text-xs mt-1">Messages par jour</p>
                  </div>
                  <BarChart3 className="w-12 h-12 text-amber-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
            <Card className="bg-gradient-to-br from-red-500 to-pink-600 text-white border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm font-medium">Messages Non Lus</p>
                    <p className="text-3xl font-bold">{unreadMessages}</p>
                    <p className="text-red-100 text-xs mt-1">En attente de lecture</p>
                  </div>
                  <Clock className="w-12 h-12 text-red-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Graphiques */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Évolution des messages */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="shadow-xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Évolution sur 7 jours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={last7Days}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="messages" 
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.2}
                      name="Messages"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top employés */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="shadow-xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-600" />
                  Top Employés Actifs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {employeeMessageCounts.slice(0, 5).map((item, index) => (
                    <div key={item.employee.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-gray-400 w-6">
                        #{index + 1}
                      </div>
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={item.employee.profile_picture} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {item.employee.first_name?.[0]}{item.employee.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {item.employee.first_name} {item.employee.last_name}
                        </p>
                        <p className="text-sm text-gray-500">{item.employee.department}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-blue-600">{item.total}</p>
                        <p className="text-xs text-gray-500">
                          {item.sent}↗ {item.received}↙
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Messages récents */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-purple-600" />
                Messages Récents
                <Badge className="ml-auto">{recentMessages.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentMessages.map((message) => (
                  <div key={message.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {getEmployeeName(message.sender_id).split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-gray-900">
                          {getEmployeeName(message.sender_id)}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {format(new Date(message.created_date), 'dd/MM HH:mm')}
                          </span>
                          {!message.is_read && (
                            <Badge className="bg-red-500 text-white text-xs">Non lu</Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        À: {getEmployeeName(message.receiver_id)}
                      </p>
                      <p className="text-sm text-gray-800 mt-1 line-clamp-2">
                        {message.message_type === 'file' ? '📎 Fichier joint' : message.content}
                      </p>
                    </div>
                  </div>
                ))}
                
                {recentMessages.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p>Aucun message trouvé</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}