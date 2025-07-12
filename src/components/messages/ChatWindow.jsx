import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Phone,
  Video,
  MoreVertical,
  Smile,
  Paperclip,
  Check,
  CheckCheck,
  Clock,
  X,
  Download,
  Trash2,
  Archive,
  User,
  UserCheck
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
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

import MessageBubble from "./MessageBubble";
import EmojiPicker from "./EmojiPicker";

export default function ChatWindow({ 
  conversation, 
  messages, 
  otherParticipant, 
  currentEmployee,
  newMessage,
  setNewMessage,
  onSendMessage,
  onDeleteMessage,
  onDeleteConversation,
  onArchiveConversation,
  onViewProfile,
  messagesEndRef,
  showEmojiPicker,
  setShowEmojiPicker,
  onAddEmoji,
  selectedFile,
  onFileSelect,
  onRemoveFile,
  fileInputRef,
  isUploading,
  getConnectionStatus,
  formatLastSeen,
  realTimeUpdate
}) {
  
  const [showDeleteConversationDialog, setShowDeleteConversationDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);

  const handleSend = (e) => {
    e.preventDefault();
    if ((newMessage.trim() || selectedFile) && !isUploading) {
      onSendMessage();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const handleDeleteConversation = () => {
    onDeleteConversation(conversation.id);
    setShowDeleteConversationDialog(false);
  };

  const handleArchiveConversation = () => {
    onArchiveConversation(conversation.id);
    setShowArchiveDialog(false);
  };

  const connectionStatus = getConnectionStatus(otherParticipant);

  return (
    <>
      {/* Header du chat */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative cursor-pointer" onClick={() => onViewProfile(otherParticipant)}>
              <Avatar className="w-12 h-12 hover:ring-2 hover:ring-blue-500 transition-all">
                <AvatarImage src={otherParticipant?.profile_picture} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {otherParticipant?.first_name?.[0]}{otherParticipant?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                connectionStatus?.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`}></div>
            </div>
            
            <div>
              <h2 className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => onViewProfile(otherParticipant)}>
                {otherParticipant?.first_name} {otherParticipant?.last_name}
              </h2>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {otherParticipant?.department}
                </Badge>
                <span className={`text-xs ${connectionStatus?.color} flex items-center gap-1`}>
                  <div className={`w-2 h-2 rounded-full ${
                    connectionStatus?.isOnline ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                  {connectionStatus?.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {connectionStatus?.isOnline ? 'En ligne maintenant' : `Vu ${formatLastSeen(otherParticipant)}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" title="Appel vocal">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" title="Appel vidéo">
              <Video className="w-4 h-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onViewProfile(otherParticipant)}>
                  <User className="w-4 h-4 mr-2" />
                  Voir le profil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowArchiveDialog(true)}>
                  <Archive className="w-4 h-4 mr-2" />
                  Archiver la conversation
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600 focus:text-red-600"
                  onClick={() => setShowDeleteConversationDialog(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer la conversation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Zone des messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50/50 to-white/50">
        <AnimatePresence>
          {messages.map((message, index) => (
            <MessageBubble
              key={`${message.id}-${realTimeUpdate}`}
              message={message}
              isOwn={message.sender_id === currentEmployee?.id}
              showAvatar={
                index === 0 || 
                messages[index - 1]?.sender_id !== message.sender_id
              }
              otherParticipant={otherParticipant}
              currentEmployee={currentEmployee}
              onDelete={onDeleteMessage}
            />
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Zone de saisie */}
      <div className="bg-white/90 backdrop-blur-sm border-t border-gray-200 p-6">
        {/* Fichier sélectionné */}
        {selectedFile && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-800">{selectedFile.name}</span>
              <span className="text-xs text-blue-600">
                ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
            <Button
              onClick={onRemoveFile}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        <form onSubmit={handleSend} className="flex items-end gap-3">
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={selectedFile ? "Ajouter un message (optionnel)..." : "Tapez votre message..."}
              className="pr-20 min-h-[44px] rounded-full"
              disabled={isUploading}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={onFileSelect}
                className="hidden"
                accept="*/*"
              />
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="p-1 h-8 w-8"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              <div className="relative">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="p-1 h-8 w-8"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <Smile className="w-4 h-4" />
                </Button>
                {showEmojiPicker && (
                  <div className="absolute bottom-10 right-0 z-50">
                    <EmojiPicker onEmojiSelect={onAddEmoji} />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <Button 
            type="submit" 
            disabled={(!newMessage.trim() && !selectedFile) || isUploading}
            className="bg-blue-600 hover:bg-blue-700 rounded-full h-11 w-11 p-0"
          >
            {isUploading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>

      {/* Dialog de confirmation de suppression de conversation */}
      <AlertDialog open={showDeleteConversationDialog} onOpenChange={setShowDeleteConversationDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette conversation avec {otherParticipant?.first_name} {otherParticipant?.last_name} ? 
              Tous les messages seront définitivement supprimés et cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConversation}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de confirmation d'archivage */}
      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archiver la conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Voulez-vous archiver cette conversation avec {otherParticipant?.first_name} {otherParticipant?.last_name} ? 
              La conversation sera masquée de votre liste principale mais pourra être restaurée plus tard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleArchiveConversation}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Archiver
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}