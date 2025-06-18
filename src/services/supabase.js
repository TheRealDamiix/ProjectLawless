import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wocvglxoqxmbvdnydjym.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvY3ZnbHhvcXhtYnZkbnlkanltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMTUwMzIsImV4cCI6MjA2NTc5MTAzMn0.YrCpoMpzI8SHN8kw_l2O8jb04KKIbYIXJTfaBRuTRgo';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const saveConversation = async (conversation) => {
  try {
    const conversationData = {
      id: conversation.id,
      title: conversation.title,
      preview: conversation.preview,
      domain: conversation.domain,
      messages: conversation.messages || [],
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('conversations')
      .upsert(conversationData, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase save error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error saving conversation:', error);
    // Fallback to localStorage if Supabase fails
    try {
      const conversations = JSON.parse(localStorage.getItem('lawless-conversations') || '[]');
      const existingIndex = conversations.findIndex(c => c.id === conversation.id);
      
      if (existingIndex >= 0) {
        conversations[existingIndex] = conversation;
      } else {
        conversations.unshift(conversation);
      }
      
      localStorage.setItem('lawless-conversations', JSON.stringify(conversations));
      return conversation;
    } catch (localError) {
      console.error('Fallback localStorage error:', localError);
      throw error;
    }
  }
};

export const loadConversations = async () => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Supabase load error:', error);
      throw error;
    }

    // Transform the data to match the expected format
    const transformedData = data.map(conv => ({
      id: conv.id,
      title: conv.title,
      preview: conv.preview,
      domain: conv.domain,
      messages: conv.messages || [],
      timestamp: new Date(conv.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));

    return transformedData;
  } catch (error) {
    console.error('Error loading conversations:', error);
    // Fallback to localStorage if Supabase fails
    try {
      const conversations = JSON.parse(localStorage.getItem('lawless-conversations') || '[]');
      return conversations;
    } catch (localError) {
      console.error('Fallback localStorage error:', localError);
      return [];
    }
  }
};

export const deleteConversation = async (conversationId) => {
  try {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (error) {
      console.error('Supabase delete error:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error deleting conversation:', error);
    // Fallback to localStorage if Supabase fails
    try {
      const conversations = JSON.parse(localStorage.getItem('lawless-conversations') || '[]');
      const filtered = conversations.filter(c => c.id !== conversationId);
      localStorage.setItem('lawless-conversations', JSON.stringify(filtered));
      return true;
    } catch (localError) {
      console.error('Fallback localStorage error:', localError);
      throw error;
    }
  }
};

export const isSupabaseConnected = () => {
  return supabase !== null;
};

// Test connection function
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Connection test failed:', error);
      return false;
    }
    
    console.log('Supabase connection successful!');
    return true;
  } catch (error) {
    console.error('Connection test error:', error);
    return false;
  }
};