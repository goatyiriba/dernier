import { Employee, AuthService } from '@/api/supabaseEntities';

class NotificationHelper {
  
  // Test du système de notifications
  static async testNotificationSystem(userId, userName) {
    try {
      console.log('🧪 Creating test notification for user:', userId);
      
      if (!userId) {
        throw new Error('User ID is required for test notification');
      }

      const notification = await Notification.create({
        user_id: userId,
        title: "🧪 Test de Notification",
        message: `Bonjour ${userName}, ceci est une notification de test pour vérifier que le système fonctionne correctement.`,
        type: "system_alert",
        link_to: null,
        metadata: JSON.stringify({
          test: true,
          timestamp: new Date().toISOString(),
          source: 'notification_test_system'
        })
      });

      console.log('✅ Test notification created successfully:', notification);
      return notification;
      
    } catch (error) {
      console.error('❌ Error creating test notification:', error);
      throw new Error(`Failed to create test notification: ${error.message}`);
    }
  }

  // Notification d'action employé vers admin
  static async notifyAdminOfEmployeeAction(adminId, employeeName, actionType, actionData = {}) {
    try {
      console.log('📢 Creating admin notification for action:', actionType);
      
      if (!adminId) {
        throw new Error('Admin ID is required');
      }

      const actionMessages = {
        leave_request: `${employeeName} a soumis une nouvelle demande de congé`,
        time_entry: `${employeeName} a créé un nouveau pointage`,
        document_upload: `${employeeName} a téléchargé un nouveau document`,
        profile_update: `${employeeName} a mis à jour son profil`
      };

      const message = actionMessages[actionType] || `${employeeName} a effectué une action: ${actionType}`;

      const notification = await Notification.create({
        user_id: adminId,
        title: "👨‍💼 Action Employé",
        message: message,
        type: "employee_action",
        link_to: actionData.link || null,
        metadata: JSON.stringify({
          employee_name: employeeName,
          action_type: actionType,
          action_data: actionData,
          timestamp: new Date().toISOString()
        })
      });

      console.log('✅ Admin notification created:', notification);
      return notification;
      
    } catch (error) {
      console.error('❌ Error creating admin notification:', error);
      throw new Error(`Failed to notify admin: ${error.message}`);
    }
  }

  // Notification de réponse admin vers employé
  static async notifyEmployeeOfAdminResponse(employeeId, adminName, responseType, responseData = {}) {
    try {
      console.log('📢 Creating employee notification for response:', responseType);
      
      if (!employeeId) {
        throw new Error('Employee ID is required');
      }

      const responseMessages = {
        leave_approved: "✅ Votre demande de congé a été approuvée",
        leave_denied: "❌ Votre demande de congé a été refusée",
        document_approved: "✅ Votre document a été approuvé",
        profile_approved: "✅ Votre profil a été validé"
      };

      const message = responseMessages[responseType] || `${adminName} a répondu à votre demande`;

      const notification = await Notification.create({
        user_id: employeeId,
        title: "📋 Réponse Administrative",
        message: message,
        type: "admin_response",
        link_to: responseData.link || null,
        metadata: JSON.stringify({
          admin_name: adminName,
          response_type: responseType,
          response_data: responseData,
          timestamp: new Date().toISOString()
        })
      });

      console.log('✅ Employee response notification created:', notification);
      return notification;
      
    } catch (error) {
      console.error('❌ Error creating employee response notification:', error);
      throw new Error(`Failed to notify employee: ${error.message}`);
    }
  }

  // Notification de message entre employés
  static async notifyEmployeeOfMessage(receiverId, senderName, messageContent) {
    try {
      console.log('💬 Creating message notification for user:', receiverId);
      
      if (!receiverId) {
        throw new Error('Receiver ID is required');
      }

      // Tronquer le message s'il est trop long
      const truncatedMessage = messageContent.length > 100 
        ? messageContent.substring(0, 100) + '...' 
        : messageContent;

      const notification = await Notification.create({
        user_id: receiverId,
        title: `💬 Message de ${senderName}`,
        message: truncatedMessage,
        type: "message",
        link_to: "/messages", // Lien vers la messagerie
        metadata: JSON.stringify({
          sender_name: senderName,
          message_preview: truncatedMessage,
          full_message_length: messageContent.length,
          timestamp: new Date().toISOString()
        })
      });

      console.log('✅ Message notification created:', notification);
      return notification;
      
    } catch (error) {
      console.error('❌ Error creating message notification:', error);
      throw new Error(`Failed to create message notification: ${error.message}`);
    }
  }

  // Notification générique
  static async createNotification(userId, title, message, type = 'system_alert', linkTo = null, metadata = {}) {
    try {
      console.log('📢 Creating generic notification:', { userId, title, type });
      
      if (!userId) {
        throw new Error('User ID is required');
      }

      if (!title || !message) {
        throw new Error('Title and message are required');
      }

      const notification = await Notification.create({
        user_id: userId,
        title: title,
        message: message,
        type: type,
        link_to: linkTo,
        metadata: JSON.stringify({
          ...metadata,
          created_at: new Date().toISOString()
        })
      });

      console.log('✅ Generic notification created:', notification);
      return notification;
      
    } catch (error) {
      console.error('❌ Error creating generic notification:', error);
      throw new Error(`Failed to create notification: ${error.message}`);
    }
  }

  // Obtenir toutes les notifications d'un utilisateur
  static async getUserNotifications(userId, limit = 10) {
    try {
      console.log('📖 Fetching notifications for user:', userId);
      
      if (!userId) {
        throw new Error('User ID is required');
      }

      const notifications = await Notification.filter(
        { user_id: userId },
        '-created_date',
        limit
      );

      console.log(`✅ Found ${notifications.length} notifications for user`);
      return notifications;
      
    } catch (error) {
      console.error('❌ Error fetching user notifications:', error);
      throw new Error(`Failed to fetch notifications: ${error.message}`);
    }
  }

  // Marquer une notification comme lue
  static async markAsRead(notificationId) {
    try {
      console.log('✅ Marking notification as read:', notificationId);
      
      if (!notificationId) {
        throw new Error('Notification ID is required');
      }

      const updatedNotification = await Notification.update(notificationId, {
        is_read: true
      });

      console.log('✅ Notification marked as read');
      return updatedNotification;
      
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
  }
}

export default NotificationHelper;