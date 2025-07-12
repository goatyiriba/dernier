import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  Send, 
  Search, 
  Plus, 
  Users, 
  Clock,
  CheckCircle,
  AlertCircle,
  Loader,
  RefreshCw
} from "lucide-react";
import { Message, Conversation, Employee } from '@/api/entities';
import { User as AuthService } from '@/api/entities';
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/components/ui/use-toast";

import ChatWindow from "../components/messages/ChatWindow";
import ConversationList from "../components/messages/ConversationList";
import NewMessageModal from "../components/messages/NewMessageModal";
import UserProfileModal from "../components/messages/UserProfileModal";
import AvatarGenerator from "../components/ui/AvatarGenerator";

export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedEmployeeProfile, setSelectedEmployeeProfile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileInputRef, setFileInputRef] = useState(null);
  const [messagesEndRef, setMessagesEndRef] = useState(null);
  const [realTimeUpdate, setRealTimeUpdate] = useState(0);
  const [error, setError] = useState(null);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    console.log('🚀 Messages component mounted');
    initializeMessages();
  }, []);

  useEffect(() => {
    if (currentEmployee) {
      console.log('⏰ Setting up refresh interval for employee:', currentEmployee.id);
      const interval = setInterval(() => {
        refreshConversations();
        setRealTimeUpdate(prev => prev + 1);
      }, 10000);

      return () => {
        console.log('🧹 Cleaning up refresh interval');
        clearInterval(interval);
      };
    }
  }, [currentEmployee]);

  useEffect(() => {
    if (messagesEndRef) {
      messagesEndRef.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const initializeMessages = async () => {
    try {
      console.log('💬 Initializing Messages...');
      setIsLoading(true);
      setError(null);
      
      // Step 1: Authentication
      console.log('🔐 Step 1: Authenticating user...');
      const user = await AuthService.me();
      console.log('✅ User authenticated:', {
        id: user.id,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
        employee_id: user.employee_id
      });
      
      setCurrentUser(user);
      
      if (!user.is_active) {
        console.log('❌ User not active');
        setError('Votre compte n\'est pas encore activé. Contactez votre administrateur.');
        return;
      }
      
      // Step 2: Load base data
      console.log('📊 Step 2: Loading base data...');
      await loadBaseData(user);
      
    } catch (error) {
      console.error('❌ Error initializing messages:', error);
      setError(`Erreur de connexion: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBaseData = async (user) => {
    try {
      console.log('📊 Loading employees and users...');
      
      // Load employees and users in parallel with error handling
      const [employeesData, usersData] = await Promise.all([
        Employee.list("-created_date", 200).catch(err => {
          console.warn('⚠️ Error loading employees:', err);
          return [];
        }),
        AuthService.list("-created_date", 200).catch(err => {
          console.warn('⚠️ Error loading users:', err);
          return [];
        })
      ]);

      console.log(`✅ Data loaded:`, {
        employees: employeesData?.length || 0,
        users: usersData?.length || 0
      });
      
      setEmployees(employeesData || []);
      setUsers(usersData || []);

      // Step 3: Find current employee
      console.log('👤 Step 3: Finding current employee...');
      let employee = null;
      
      // Try by employee_id first
      if (user.employee_id) {
        console.log('🔍 Searching by employee_id:', user.employee_id);
        employee = employeesData?.find(emp => emp.id === user.employee_id);
        if (employee) {
          console.log('✅ Found employee by ID:', employee.first_name, employee.last_name);
        }
      }
      
      // Try by email if not found
      if (!employee && user.email) {
        console.log('🔍 Searching by email:', user.email);
        employee = employeesData?.find(emp => emp.email === user.email);
        if (employee) {
          console.log('✅ Found employee by email:', employee.first_name, employee.last_name);
        }
      }

      if (employee) {
        setCurrentEmployee(employee);
        console.log('👤 Current employee set:', {
          id: employee.id,
          name: `${employee.first_name} ${employee.last_name}`,
          email: employee.email,
          department: employee.department
        });
        
        // Step 4: Load conversations
        console.log('💬 Step 4: Loading conversations...');
        await loadConversations(employee.id);
      } else {
        console.warn('⚠️ No employee record found for user');
        setError('Aucun profil employé trouvé. Contactez votre administrateur.');
      }
      
    } catch (error) {
      console.error('❌ Error in loadBaseData:', error);
      throw error;
    }
  };

  const loadConversations = async (employeeId) => {
    try {
      console.log('💬 Loading conversations for employee:', employeeId);
      
      // Load all conversations with error handling
      const allConversations = await Conversation.list("-last_message_at", 100).catch(err => {
        console.warn('⚠️ Error loading conversations:', err);
        return [];
      });
      
      console.log(`📊 Total conversations in system: ${allConversations?.length || 0}`);
      
      // Filter conversations for this employee
      const userConversations = (allConversations || []).filter(conv => 
        conv.participant_1 === employeeId || conv.participant_2 === employeeId
      );

      console.log(`✅ User conversations found: ${userConversations.length}`);
      setConversations(userConversations);

      // Auto-select first conversation if available
      if (userConversations.length > 0 && !activeConversation) {
        console.log('🎯 Auto-selecting first conversation');
        setActiveConversation(userConversations[0]);
        await loadMessages(userConversations[0].id);
      } else if (userConversations.length === 0) {
        console.log('📭 No conversations found for this employee');
      }

    } catch (error) {
      console.error('❌ Error loading conversations:', error);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      console.log('📨 Loading messages for conversation:', conversationId);
      
      const conversationMessages = await Message.filter({
        conversation_id: conversationId
      }).catch(err => {
        console.warn('⚠️ Error loading messages:', err);
        return [];
      });

      // Sort messages by date
      const sortedMessages = (conversationMessages || []).sort(
        (a, b) => new Date(a.created_date) - new Date(b.created_date)
      );

      console.log(`✅ Messages loaded: ${sortedMessages.length}`);
      setMessages(sortedMessages);

      // Mark messages as read
      await markMessagesAsRead(conversationId);

    } catch (error) {
      console.error('❌ Error loading messages:', error);
    }
  };

  const markMessagesAsRead = async (conversationId) => {
    try {
      if (!currentEmployee) return;

      console.log('📖 Marking messages as read for conversation:', conversationId);

      const unreadMessages = messages.filter(
        msg => !msg.is_read && msg.receiver_id === currentEmployee.id
      );

      console.log(`📖 Found ${unreadMessages.length} unread messages`);

      for (const message of unreadMessages) {
        await Message.update(message.id, { 
          is_read: true, 
          read_at: new Date().toISOString() 
        }).catch(err => {
          console.warn('⚠️ Error updating message read status:', err);
        });
      }

      // Update conversation unread count
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation) {
        const isParticipant1 = conversation.participant_1 === currentEmployee.id;
        const updateData = isParticipant1 
          ? { unread_count_p1: 0 }
          : { unread_count_p2: 0 };
        
        await Conversation.update(conversationId, updateData).catch(err => {
          console.warn('⚠️ Error updating conversation unread count:', err);
        });
      }

    } catch (error) {
      console.error('❌ Error marking messages as read:', error);
    }
  };

  const handleSelectConversation = async (conversation) => {
    console.log('🎯 Selecting conversation:', conversation.id);
    setActiveConversation(conversation);
    await loadMessages(conversation.id);
  };

  const handleSendMessage = async (content = newMessage, attachmentUrl = null) => {
    try {
      if (!activeConversation || !currentEmployee || (!content?.trim() && !attachmentUrl)) {
        console.log('❌ Cannot send message - missing data');
        return;
      }

      console.log('📤 Sending message:', { content: content?.substring(0, 50), hasAttachment: !!attachmentUrl });
      setIsUploading(true);

      // Determine receiver
      const receiverId = activeConversation.participant_1 === currentEmployee.id
        ? activeConversation.participant_2
        : activeConversation.participant_1;

      // Create message
      const newMessageData = await Message.create({
        sender_id: currentEmployee.id,
        receiver_id: receiverId,
        conversation_id: activeConversation.id,
        content: content?.trim() || '',
        message_type: attachmentUrl ? 'file' : 'text',
        attachment_url: attachmentUrl,
        is_read: false
      });

      console.log('✅ Message created:', newMessageData.id);

      // Update conversation
      const isParticipant1 = activeConversation.participant_1 === currentEmployee.id;
      const unreadCountUpdate = isParticipant1 
        ? { unread_count_p2: (activeConversation.unread_count_p2 || 0) + 1 }
        : { unread_count_p1: (activeConversation.unread_count_p1 || 0) + 1 };

      await Conversation.update(activeConversation.id, {
        last_message: content?.trim() || 'Fichier',
        last_message_at: new Date().toISOString(),
        last_message_by: currentEmployee.id,
        ...unreadCountUpdate
      });

      // Clear input and reload
      setNewMessage('');
      setSelectedFile(null);
      await loadMessages(activeConversation.id);
      await refreshConversations();

      toast({
        title: "Message envoyé",
        description: "Votre message a été envoyé avec succès",
      });

    } catch (error) {
      console.error('❌ Error sending message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleStartNewConversation = async (employee, initialMessage) => {
    try {
      if (!currentEmployee) return;

      console.log('🆕 Starting new conversation with:', employee.first_name, employee.last_name);
      setIsCreatingConversation(true);

      // Check if conversation already exists
      const existingConv = conversations.find(conv =>
        (conv.participant_1 === currentEmployee.id && conv.participant_2 === employee.id) ||
        (conv.participant_2 === currentEmployee.id && conv.participant_1 === employee.id)
      );

      let conversationId;

      if (existingConv) {
        console.log('✅ Using existing conversation:', existingConv.id);
        conversationId = existingConv.id;
        setActiveConversation(existingConv);
      } else {
        console.log('📝 Creating new conversation');
        const newConversation = await Conversation.create({
          participant_1: currentEmployee.id,
          participant_2: employee.id,
          last_message: initialMessage,
          last_message_at: new Date().toISOString(),
          last_message_by: currentEmployee.id,
          unread_count_p1: 0,
          unread_count_p2: 1
        });

        conversationId = newConversation.id;
        setActiveConversation(newConversation);
        await refreshConversations();
      }

      // Send initial message
      await Message.create({
        sender_id: currentEmployee.id,
        receiver_id: employee.id,
        conversation_id: conversationId,
        content: initialMessage,
        message_type: 'text',
        is_read: false
      });

      await loadMessages(conversationId);
      setShowNewMessageModal(false);

      toast({
        title: "Conversation créée",
        description: "Nouvelle conversation démarrée",
      });

    } catch (error) {
      console.error('❌ Error starting conversation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la conversation",
        variant: "destructive",
      });
    } finally {
      setIsCreatingConversation(false);
    }
  };

  const refreshConversations = async () => {
    if (!currentEmployee) return;
    
    try {
      console.log('🔄 Refreshing conversations...');
      const allConversations = await Conversation.list("-last_message_at", 100);
      const userConversations = allConversations.filter(conv => 
        conv.participant_1 === currentEmployee.id || conv.participant_2 === currentEmployee.id
      );
      setConversations(userConversations);
    } catch (error) {
      console.error('❌ Error refreshing conversations:', error);
    }
  };

  // Utility functions
  const getOtherParticipant = (conversation) => {
    if (!conversation || !currentEmployee) return null;
    
    const otherId = conversation.participant_1 === currentEmployee.id
      ? conversation.participant_2
      : conversation.participant_1;
    
    return employees.find(emp => emp.id === otherId);
  };

  const getUnreadCount = (conversation) => {
    if (!conversation || !currentEmployee) return 0;
    
    return conversation.participant_1 === currentEmployee.id
      ? conversation.unread_count_p1 || 0
      : conversation.unread_count_p2 || 0;
  };

  const getConnectionStatus = (employee) => {
    if (!employee) return { isOnline: false, status: 'Hors ligne', color: 'text-gray-500' };
    
    const user = users.find(u => u.employee_id === employee.id || u.email === employee.email);
    if (!user) return { isOnline: false, status: 'Hors ligne', color: 'text-gray-500' };
    
    if (user.last_login) {
      const lastLogin = new Date(user.last_login);
      const tenMinutesAgo = new Date(Date.now() - 600000);
      const isOnline = lastLogin > tenMinutesAgo;
      
      return {
        isOnline,
        status: isOnline ? 'En ligne' : 'Hors ligne',
        color: isOnline ? 'text-green-600' : 'text-gray-500'
      };
    }
    
    return { isOnline: false, status: 'Hors ligne', color: 'text-gray-500' };
  };

  const formatLastSeen = (employee) => {
    const user = users.find(u => u.employee_id === employee?.id || u.email === employee?.email);
    if (!user?.last_login) return 'jamais';
    
    try {
      return format(new Date(user.last_login), 'dd/MM/yyyy à HH:mm');
    } catch {
      return 'récemment';
    }
  };

  const handleViewProfile = (employee) => {
    console.log('👁️ Viewing profile:', employee.first_name, employee.last_name);
    setSelectedEmployeeProfile(employee);
    setShowProfileModal(true);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('📎 File selected:', file.name, file.size);
      setSelectedFile(file);
    }
  };

  const onRemoveFile = () => {
    console.log('🗑️ Removing selected file');
    setSelectedFile(null);
    if (fileInputRef) {
      fileInputRef.value = '';
    }
  };

  const onAddEmoji = (emoji) => {
    console.log('😀 Adding emoji:', emoji);
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Filter conversations by search term
  const filteredConversations = conversations.filter(conv => {
    if (!searchTerm) return true;
    const otherParticipant = getOtherParticipant(conv);
    if (!otherParticipant) return false;
    
    const fullName = `${otherParticipant.first_name} ${otherParticipant.last_name}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) ||
           otherParticipant.department?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Loading interface
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="w-96 p-8">
          <CardContent className="flex flex-col items-center space-y-4">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
            <h3 className="text-lg font-semibold">Chargement des messages...</h3>
            <p className="text-sm text-gray-500 text-center">
              Nous chargeons vos conversations et contacts
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error interface
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="w-96 p-8">
          <CardContent className="flex flex-col items-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <h3 className="text-lg font-semibold text-red-900">Erreur de chargement</h3>
            <p className="text-sm text-red-700 text-center">{error}</p>
            <Button onClick={initializeMessages} className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-4 h-screen flex flex-col">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-lg border border-white/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">💬 Messages</h1>
              <p className="text-gray-600">
                Communiquez avec vos collègues • {conversations.length} conversation{conversations.length > 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-white/80">
                {currentEmployee ? `${currentEmployee.first_name} ${currentEmployee.last_name}` : 'Chargement...'}
              </Badge>
              <Button
                onClick={() => setShowNewMessageModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouveau message
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Main interface */}
        <div className="flex-1 flex gap-6 min-h-0">
          
          {/* Conversations list */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-80 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 flex flex-col"
          >
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher une conversation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-50/80 border-0 focus:bg-white"
                />
              </div>
            </div>

            <ConversationList
              conversations={filteredConversations}
              activeConversation={activeConversation}
              onSelectConversation={handleSelectConversation}
              getOtherParticipant={getOtherParticipant}
              getUnreadCount={getUnreadCount}
              currentEmployee={currentEmployee}
              getConnectionStatus={getConnectionStatus}
              realTimeUpdate={realTimeUpdate}
              onViewProfile={handleViewProfile}
            />
          </motion.div>

          {/* Chat window */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50"
          >
            {activeConversation ? (
              <ChatWindow
                conversation={activeConversation}
                messages={messages}
                otherParticipant={getOtherParticipant(activeConversation)}
                currentEmployee={currentEmployee}
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                onSendMessage={handleSendMessage}
                onDeleteMessage={() => {}} // TODO: Implement
                onDeleteConversation={() => {}} // TODO: Implement
                onArchiveConversation={() => {}} // TODO: Implement
                onViewProfile={handleViewProfile}
                messagesEndRef={messagesEndRef}
                showEmojiPicker={showEmojiPicker}
                setShowEmojiPicker={setShowEmojiPicker}
                onAddEmoji={onAddEmoji}
                selectedFile={selectedFile}
                onFileSelect={handleFileSelect}
                onRemoveFile={onRemoveFile}
                fileInputRef={fileInputRef}
                isUploading={isUploading}
                getConnectionStatus={getConnectionStatus}
                formatLastSeen={formatLastSeen}
                realTimeUpdate={realTimeUpdate}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-4">
                  <MessageSquare className="w-16 h-16 text-gray-400 mx-auto" />
                  <h3 className="text-xl font-semibold text-gray-600">
                    Sélectionnez une conversation
                  </h3>
                  <p className="text-gray-500 max-w-sm">
                    Choisissez une conversation dans la liste ou démarrez une nouvelle discussion
                  </p>
                  <Button onClick={() => setShowNewMessageModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nouveau message
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Modals */}
        <NewMessageModal
          isOpen={showNewMessageModal}
          onClose={() => setShowNewMessageModal(false)}
          employees={employees.filter(emp => emp.id !== currentEmployee?.id)}
          onSelectEmployee={handleStartNewConversation}
          isCreating={isCreatingConversation}
          getConnectionStatus={getConnectionStatus}
        />

        <UserProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          employee={selectedEmployeeProfile}
          getConnectionStatus={getConnectionStatus}
          formatLastSeen={formatLastSeen}
        />
      </div>
    </div>
  );
}