import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  created_at: Date; // Changed from timestamp to created_at to match Supabase schema
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  created_at: Date;
  updated_at: Date;
}

class ChatStorage {
  constructor() {
    // No longer need localStorage logic here, as Supabase handles persistence
  }

  async getAllChats(): Promise<Chat[]> {
    const { data: chatsData, error: chatsError } = await supabase
      .from('chats')
      .select('id, title, created_at, updated_at')
      .order('updated_at', { ascending: false });

    if (chatsError) {
      console.error('Error fetching all chats:', chatsError);
      return [];
    }

    if (!chatsData) {
      return [];
    }

    const chatIds = chatsData.map((chat) => chat.id);
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select('id, type, content, created_at, chat_id')
      .in('chat_id', chatIds)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error fetching messages for chats:', messagesError);
      // Return chats without messages if messages fail to load
      return chatsData.map(chat => ({
        ...chat,
        created_at: new Date(chat.created_at),
        updated_at: new Date(chat.updated_at),
        messages: [],
      }));
    }

    const messagesByChatId = messagesData.reduce((acc, message) => {
      if (!acc[message.chat_id]) {
        acc[message.chat_id] = [];
      }
      acc[message.chat_id].push({
        ...message,
        created_at: new Date(message.created_at),
      });
      return acc;
    }, {} as Record<string, Message[]>);

    const chatsWithMessages = chatsData.map((chat) => ({
      ...chat,
      created_at: new Date(chat.created_at),
      updated_at: new Date(chat.updated_at),
      messages: messagesByChatId[chat.id] || [],
    }));

    return chatsWithMessages;
  }

  async getChat(chatId: string): Promise<Chat | null> {
    const { data: chatData, error: chatError } = await supabase
      .from('chats')
      .select('id, title, created_at, updated_at')
      .eq('id', chatId)
      .single();

    if (chatError) {
      console.error('Error fetching chat:', chatError);
      return null;
    }
    if (!chatData) return null;

    const messages = await this.getMessagesForChat(chatId);

    return {
      ...chatData,
      created_at: new Date(chatData.created_at),
      updated_at: new Date(chatData.updated_at),
      messages,
    };
  }

  private async getMessagesForChat(chatId: string): Promise<Message[]> {
    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .select('id, type, content, created_at')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (messageError) {
      console.error('Error fetching messages for chat:', messageError);
      return [];
    }

    return messageData.map((msg) => ({
      ...msg,
      created_at: new Date(msg.created_at),
    }));
  }

  async createChat(title?: string): Promise<Chat> {
    const newChatId = uuidv4();
    const now = new Date();

    const { data: chatData, error: chatError } = await supabase
      .from('chats')
      .insert({
        id: newChatId,
        title: title || `Chat ${now.toLocaleString()}`,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      })
      .select()
      .single();

    if (chatError) {
      console.error('Error creating chat:', chatError);
      throw chatError;
    }

    // Add initial assistant message
    const initialAssistantMessageContent =
      "Hello! I'm your AI coding assistant. I can help you generate, modify, and explain code. What would you like to work on?";
    const initialMessage = await this.addMessage(newChatId, {
      type: 'assistant',
      content: initialAssistantMessageContent,
    });

    return {
      ...chatData,
      created_at: new Date(chatData.created_at),
      updated_at: new Date(chatData.updated_at),
      messages: initialMessage ? [initialMessage] : [],
    };
  }

  async updateChat(chatId: string, updates: Partial<Chat>): Promise<Chat | null> {
    const now = new Date();
    const { data: updatedChatData, error } = await supabase
      .from('chats')
      .update({ updated_at: now.toISOString() })
      .eq('id', chatId)
      .select()
      .single();

    if (error) {
      console.error('Error updating chat:', error);
      return null;
    }
    if (!updatedChatData) return null;

    const messages = await this.getMessagesForChat(chatId);

    return {
      ...updatedChatData,
      created_at: new Date(updatedChatData.created_at),
      updated_at: new Date(updatedChatData.updated_at),
      messages,
    };
  }

  async deleteChat(chatId: string): Promise<boolean> {
    const { error } = await supabase
      .from('chats')
      .delete()
      .eq('id', chatId);

    if (error) {
      console.error('Error deleting chat:', error);
      return false;
    }
    return true;
  }

  async addMessage(chatId: string, message: Omit<Message, 'id' | 'created_at'>): Promise<Message | null> {
    const now = new Date();
    const { data: newMessageData, error } = await supabase
      .from('messages')
      .insert({
        id: uuidv4(),
        chat_id: chatId,
        type: message.type,
        content: message.content,
        created_at: now.toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding message:', error);
      return null;
    }

    // Update chat's updated_at timestamp
    await supabase
      .from('chats')
      .update({ updated_at: now.toISOString() })
      .eq('id', chatId);

    return {
      ...newMessageData,
      created_at: new Date(newMessageData.created_at),
    };
  }
}

export const chatStorage = new ChatStorage();
export type { Chat, Message };