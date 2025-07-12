import { supabase } from './supabaseClient';

// Upload file to Supabase Storage
export const UploadFile = async (file, path) => {
  try {
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(path);

    return { data: { publicUrl }, error: null };
  } catch (error) {
    console.error('Upload error:', error);
    return { data: null, error };
  }
};

// Generic upload function
export const uploadFile = async (file, path) => {
  return await UploadFile(file, path);
};

// Export other integration functions as needed
export const sendSlackNotification = async (message, channel) => {
  // Placeholder for Slack integration
  console.log('Slack notification:', message, channel);
  return { success: true };
};

export const sendTelegramNotification = async (message, chatId) => {
  // Placeholder for Telegram integration
  console.log('Telegram notification:', message, chatId);
  return { success: true };
};

export const testSlackNotification = async (settings) => {
  // Placeholder for Slack test
  console.log('Testing Slack notification with settings:', settings);
  return { success: true };
};

export const testTelegramNotification = async (settings) => {
  // Placeholder for Telegram test
  console.log('Testing Telegram notification with settings:', settings);
  return { success: true };
}; 