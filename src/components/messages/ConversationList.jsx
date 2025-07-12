import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";
import { MoreVertical, Archive, Trash2, User, MessageSquare } from "lucide-react";
import { useState } from "react";
import AvatarGenerator from "../ui/AvatarGenerator";

export default function ConversationList({ 
  conversations, 
  activeConversation, 
  onSelectConversation, 
  getOtherParticipant, 
  getUnreadCount,
  currentEmployee,
  getConnectionStatus,
  realTimeUpdate,
  onViewProfile
}) {
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffHours = (now - date) / (1000 * 60 * 60);
      
      if (diffHours < 24) {
        return format(date, 'HH:mm');
      } else if (diffHours < 168) { // 7 jours
        return format(date, 'EEE', { locale: fr });
      } else {
        return format(date, 'dd/MM', { locale: fr });
      }
    } catch (error) {
      console.error('Error formatting time:', error);
      return "";
    }
  };

  const handleConversationAction = (e, conversation, action) => {
    e.stopPropagation();
    setSelectedConversation(conversation);
    
    if (action === 'delete') {
      setShowDeleteDialog(true);
    } else if (action === 'profile') {
      const otherParticipant = getOtherParticipant(conversation);
      if (otherParticipant) {
        onViewProfile(otherParticipant);
      }
    }
  };

  const handleDelete = () => {
    // TODO: Implémenter la suppression de conversation
    console.log('Delete conversation:', selectedConversation?.id);
    setShowDeleteDialog(false);
    setSelectedConversation(null);
  };

  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="text-lg font-semibold text-gray-600">Aucune conversation</h3>
          <p className="text-sm text-gray-500">
            Commencez par envoyer un message à un collègue
          </p>
        </div>  
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1 p-2">
          {conversations.map((conversation) => {
            const otherParticipant = getOtherParticipant(conversation);
            const unreadCount = getUnreadCount(conversation);
            const isActive = activeConversation?.id === conversation.id;
            const connectionStatus = getConnectionStatus(otherParticipant);
            
            if (!otherParticipant) {
              console.warn('No other participant found for conversation:', conversation.id);
              return null;
            }

            return (
              <motion.div
                key={`${conversation.id}-${realTimeUpdate}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-xl cursor-pointer transition-all relative group ${
                  isActive 
                    ? 'bg-blue-100 border-l-4 border-blue-500' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => onSelectConversation(conversation)}
              >
                {/* Menu contextuel */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 bg-white hover:bg-gray-100 shadow-sm border"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem 
                        onClick={(e) => handleConversationAction(e, conversation, 'profile')}
                        className="cursor-pointer"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Voir le profil
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600 focus:text-red-600 cursor-pointer"
                        onClick={(e) => handleConversationAction(e, conversation, 'delete')}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-start gap-3 pr-8">
                  <div className="relative">
                    <AvatarGenerator
                      firstName={otherParticipant.first_name}
                      lastName={otherParticipant.last_name}
                      email={otherParticipant.email}
                      department={otherParticipant.department}
                      profilePicture={otherParticipant.profile_picture}
                      size="default"
                      style={otherParticipant.avatar_style || 'auto'}
                      className="w-12 h-12"
                    />
                    {/* Indicateur de connexion */}
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                      connectionStatus.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                    }`}></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`font-semibold text-sm truncate ${
                        isActive ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {otherParticipant.first_name} {otherParticipant.last_name}
                      </h4>
                      <div className="flex items-center gap-2">
                        {conversation.last_message_at && (
                          <span className="text-xs text-gray-500">
                            {formatTime(conversation.last_message_at)}
                          </span>
                        )}
                        {unreadCount > 0 && (
                          <Badge className="bg-red-500 text-white text-xs h-5 w-5 flex items-center justify-center rounded-full">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className={`text-sm truncate mb-1 ${
                      unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'
                    }`}>
                      {conversation.last_message_by === currentEmployee?.id && "Vous: "}
                      {conversation.last_message || "Nouvelle conversation"}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-400 truncate">
                        {otherParticipant.department} • {otherParticipant.position}
                      </p>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${
                          connectionStatus.isOnline ? 'bg-green-500' : 'bg-gray-400'
                        }`}></div>
                        <span className={`text-xs ${connectionStatus.color}`}>
                          {connectionStatus.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              Supprimer la conversation
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette conversation avec{' '}
              <strong>
                {selectedConversation && getOtherParticipant(selectedConversation)?.first_name}{' '}
                {selectedConversation && getOtherParticipant(selectedConversation)?.last_name}
              </strong> ?
              <br /><br />
              ⚠️ <strong>Cette action est irréversible</strong> - tous les messages seront définitivement supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}