import { supabase } from './supabaseClient';

// Fonctions de notification
export const sendSlackNotification = async (message, channel = 'general') => {
  // Intégration Slack via webhook (à configurer)
  const webhookUrl = import.meta.env.VITE_SLACK_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.warn('Slack webhook URL not configured');
    return false;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: message,
        channel: channel
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Error sending Slack notification:', error);
    return false;
  }
};

// Fonctions d'activité utilisateur
export const getUserActivityHistory = async (userId, limit = 50) => {
  const { data, error } = await supabase
    .from('user_activities')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
};

export const logUserActivity = async (userId, activityType, details = {}) => {
  const { data, error } = await supabase
    .from('user_activities')
    .insert({
      user_id: userId,
      activity_type: activityType,
      details: details,
      timestamp: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Fonctions de présence
export const getPresenceStatus = async (userId) => {
  const { data, error } = await supabase
    .from('user_presence')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
};

export const updatePresenceStatus = async (userId, status, location = null) => {
  const { data, error } = await supabase
    .from('user_presence')
    .upsert({
      user_id: userId,
      status: status,
      location: location,
      last_updated: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Fonctions de notification
export const notificationManager = {
  async sendNotification(userId, title, message, type = 'info') {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: title,
        message: message,
        type: type,
        read: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async markAsRead(notificationId) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserNotifications(userId, unreadOnly = false) {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (unreadOnly) {
      query = query.eq('read', false);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
};

// Fonctions de gamification
export const processEmployeeAchievements = async (employeeId, action) => {
  // Logique de gamification
  const { data, error } = await supabase
    .from('employee_achievements')
    .insert({
      employee_id: employeeId,
      action: action,
      points_earned: calculatePoints(action),
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

const calculatePoints = (action) => {
  const pointValues = {
    'login': 1,
    'complete_task': 10,
    'submit_report': 5,
    'attend_meeting': 3,
    'help_colleague': 15
  };
  
  return pointValues[action] || 1;
};

// Fonctions de reporting
export const generateActivityReport = async (startDate, endDate, userId = null) => {
  let query = supabase
    .from('user_activities')
    .select('*')
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// Fonctions de système
export const logAction = async (action, details = {}, userId = null) => {
  const { data, error } = await supabase
    .from('system_logs')
    .insert({
      action: action,
      details: details,
      user_id: userId,
      timestamp: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Fonctions de métriques système
export const getSystemMetrics = async () => {
  const { data, error } = await supabase
    .from('system_metrics')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw error;
  return data;
};

// Fonctions de sécurité
export const logSecurityEvent = async (eventType, details = {}, userId = null) => {
  const { data, error } = await supabase
    .from('security_events')
    .insert({
      event_type: eventType,
      details: details,
      user_id: userId,
      timestamp: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Fonctions de données analytiques
export const getAnalyticsData = async (metric, timeRange = '7d') => {
  const endDate = new Date();
  const startDate = new Date();
  
  switch (timeRange) {
    case '1d':
      startDate.setDate(endDate.getDate() - 1);
      break;
    case '7d':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(endDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(endDate.getDate() - 90);
      break;
    default:
      startDate.setDate(endDate.getDate() - 7);
  }

  const { data, error } = await supabase
    .from('analytics')
    .select('*')
    .eq('metric', metric)
    .gte('timestamp', startDate.toISOString())
    .lte('timestamp', endDate.toISOString())
    .order('timestamp', { ascending: true });

  if (error) throw error;
  return data;
};

// Fonctions de sauvegarde et restauration
export const createBackup = async (tables = []) => {
  const backupData = {};
  
  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*');
    
    if (error) throw error;
    backupData[table] = data;
  }

  // Sauvegarder dans le storage Supabase
  const backupName = `backup_${new Date().toISOString().split('T')[0]}.json`;
  const { data, error } = await supabase.storage
    .from('backups')
    .upload(backupName, JSON.stringify(backupData), {
      contentType: 'application/json'
    });

  if (error) throw error;
  return data;
};

// Fonctions d'export
export const exportData = async (table, format = 'json') => {
  const { data, error } = await supabase
    .from(table)
    .select('*');

  if (error) throw error;

  switch (format) {
    case 'csv':
      return convertToCSV(data);
    case 'json':
    default:
      return data;
  }
};

const convertToCSV = (data) => {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => JSON.stringify(row[header])).join(','))
  ].join('\n');
  
  return csvContent;
}; 