import React, { useState, useEffect } from 'react';
import { Bell, MessageCircle, X } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { Message, Employee } from "@/api/supabaseEntities";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

export default function MessageNotificationSystem({ currentUser }) {
  const [unreadMessages, setUnreadMessages] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    if (currentUser) {
      initializeMessageNotifications();
      
      // Vérifier les nouveaux messages toutes les 10 secondes
      const interval = setInterval(checkForNewMessages, 10000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const initializeMessageNotifications = async () => {
    try {
      // Récupérer l'employé actuel
      const employeeList = await Employee.list();
      setEmployees(employeeList);
      
      const currentEmp = employeeList.find(emp => emp.email === currentUser.email);
      setCurrentEmployee(currentEmp);
      
      if (currentEmp) {
        await checkForNewMessages(currentEmp);
      }
    } catch (error) {
      console.error("Erreur initialisation notifications messages:", error);
    }
  };

  const checkForNewMessages = async (empData = currentEmployee) => {
    if (!empData) return;

    try {
      // Récupérer tous les messages non lus pour cet employé
      const unreadMsgs = await Message.filter({
        receiver_id: empData.id,
        is_read: false
      }, "-created_date");

      // Grouper par conversation et prendre le plus récent de chaque
      const conversationMap = new Map();
      
      for (const msg of unreadMsgs) {
        if (!conversationMap.has(msg.conversation_id) || 
            new Date(msg.created_date) > new Date(conversationMap.get(msg.conversation_id).created_date)) {
          conversationMap.set(msg.conversation_id, msg);
        }
      }

      const latestUnreadMessages = Array.from(conversationMap.values()).slice(0, 5);
      setUnreadMessages(latestUnreadMessages);

    } catch (error) {
      console.error("Erreur vérification nouveaux messages:", error);
    }
  };

  const getMessageSender = (message) => {
    return employees.find(emp => emp.id === message.sender_id);
  };

  const markAllAsRead = async () => {
    try {
      for (const msg of unreadMessages) {
        await Message.update(msg.id, {
          is_read: true,
          read_at: new Date().toISOString()
        });
      }
      setUnreadMessages([]);
      setShowNotifications(false);
    } catch (error) {
      console.error("Erreur marquage messages lus:", error);
    }
  };

  const formatMessageTime = (timestamp) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffMinutes = Math.floor((now - messageTime) / (1000 * 60));
    
    if (diffMinutes < 1) return "À l'instant";
    if (diffMinutes < 60) return `${diffMinutes}min`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h`;
    return format(messageTime, 'dd/MM', { locale: fr });
  };

  const totalUnreadCount = unreadMessages.length;

  return (
    <div className="relative">
      {/* Bouton de notification */}
      <Button
        variant="ghost"
        size="sm"
        className="relative hover:bg-gray-100 p-2 rounded-full"
        onClick={() => setShowNotifications(!showNotifications)}
      >
        <MessageCircle className="w-5 h-5 text-gray-600" />
        
        {/* Badge de notification */}
        {totalUnreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1"
          >
            <Badge className="bg-red-500 text-white text-xs h-5 w-5 flex items-center justify-center rounded-full animate-pulse">
              {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
            </Badge>
          </motion.div>
        )}
      </Button>

      {/* Panneau de notifications */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-12 w-80 z-50"
          >
            <Card className="bg-white shadow-2xl border-0 rounded-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    <h3 className="font-semibold">Messages</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {totalUnreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={markAllAsRead}
                        className="text-white hover:bg-white/20 text-xs"
                      >
                        Tout marquer lu
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNotifications(false)}
                      className="text-white hover:bg-white/20 p-1"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <CardContent className="p-0 max-h-96 overflow-y-auto">
                {unreadMessages.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm">Aucun nouveau message</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {unreadMessages.map((message) => {
                      const sender = getMessageSender(message);
                      
                      return (
                        <Link
                          key={message.id}
                          to={createPageUrl("Messages")}
                          onClick={() => setShowNotifications(false)}
                          className="block"
                        >
                          <motion.div
                            whileHover={{ backgroundColor: "#f8fafc" }}
                            className="p-4 cursor-pointer transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <div className="relative">
                                <Avatar className="w-10 h-10">
                                  <AvatarImage src={sender?.profile_picture} />
                                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                                    {sender?.first_name?.[0]}{sender?.last_name?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="font-medium text-gray-900 text-sm truncate">
                                    {sender?.first_name} {sender?.last_name}
                                  </p>
                                  <span className="text-xs text-gray-500">
                                    {formatMessageTime(message.created_date)}
                                  </span>
                                </div>
                                
                                <p className="text-sm text-gray-600 truncate">
                                  {message.message_type === 'file' ? '📎 Fichier joint' : message.content}
                                </p>
                                
                                <div className="flex items-center justify-between mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    {sender?.department}
                                  </Badge>
                                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </Link>
                      );
                    })}
                  </div>
                )}
                
                {/* Bouton voir tous les messages */}
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                  <Link to={createPageUrl("Messages")} onClick={() => setShowNotifications(false)}>
                    <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                      Voir tous les messages
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay pour fermer en cliquant à l'extérieur */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
}