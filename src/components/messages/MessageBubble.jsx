import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import {
  MoreVertical,
  Trash2,
  Download,
  Check,
  CheckCheck,
  Clock,
  Paperclip
} from "lucide-react";

export default function MessageBubble({ 
  message, 
  isOwn, 
  showAvatar, 
  otherParticipant, 
  currentEmployee,
  onDelete 
}) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = () => {
    onDelete(message.id);
    setShowDeleteDialog(false);
  };

  const formatTime = (timestamp) => {
    return format(new Date(timestamp), 'HH:mm', { locale: fr });
  };

  const isFileMessage = message.message_type === 'file' && message.attachment_url;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`flex gap-3 group ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
      >
        {/* Avatar pour les messages de l'autre personne */}
        {!isOwn && showAvatar && (
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarImage src={otherParticipant?.profile_picture} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
              {otherParticipant?.first_name?.[0]}{otherParticipant?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
        )}
        
        {/* Espace pour aligner les messages sans avatar */}
        {!isOwn && !showAvatar && <div className="w-8"></div>}

        <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
          {/* Bulle de message */}
          <div 
            className={`relative px-4 py-2 rounded-2xl break-words ${
              isOwn 
                ? 'bg-blue-500 text-white rounded-br-md' 
                : 'bg-gray-100 text-gray-900 rounded-bl-md'
            }`}
          >
            {/* Menu contextuel pour les messages propres */}
            {isOwn && (
              <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 bg-white/80 hover:bg-white">
                      <MoreVertical className="w-3 h-3 text-gray-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      className="text-red-600 focus:text-red-600"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Contenu du message */}
            {isFileMessage ? (
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4" />
                <a 
                  href={message.attachment_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`text-sm hover:underline ${isOwn ? 'text-blue-100' : 'text-blue-600'}`}
                >
                  {message.content}
                </a>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => window.open(message.attachment_url, '_blank')}
                >
                  <Download className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            )}
          </div>

          {/* Métadonnées du message */}
          <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${
            isOwn ? 'flex-row-reverse' : 'flex-row'
          }`}>
            <span>{formatTime(message.created_date)}</span>
            
            {/* Indicateur de lecture pour les messages envoyés */}
            {isOwn && (
              <div className="flex items-center">
                {message.is_read ? (
                  <CheckCheck className="w-3 h-3 text-blue-500" title="Lu" />
                ) : (
                  <Check className="w-3 h-3 text-gray-400" title="Envoyé" />
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le message</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce message ? Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}