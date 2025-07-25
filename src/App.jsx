// /src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Brain, Zap, Database, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import { toast } from '@/components/ui/use-toast';
import Sidebar from '@/components/Sidebar';
import DomainSelector from '@/components/DomainSelector';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import TypingIndicator from '@/components/TypingIndicator';
import { generateAIResponse } from '@/services/ai';
import { saveConversation, loadConversations, deleteConversation, testConnection } from '@/services/supabase';

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState('legal');
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Test Supabase connection and load conversations
    const initializeApp = async () => {
      try {
        // Check if environment variables are available
        const envVarsAvailable = !!import.meta.env.VITE_SUPABASE_URL && 
                                !!import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (!envVarsAvailable) {
          console.warn('Supabase environment variables are missing');
          toast({
            title: "Local Mode Active",
            description: "Running with local storage only. Your data won't be synced.",
            variant: "warning"
          });
          setSupabaseConnected(false);
          
          // Still try to load from localStorage
          const localConversations = JSON.parse(localStorage.getItem('lawless-conversations') || '[]');
          setConversations(localConversations);
          
          if (localConversations.length > 0) {
            const firstConversation = localConversations[0];
            setActiveConversation(firstConversation.id);
            setMessages(firstConversation.messages || []);
            setSelectedDomain(firstConversation.domain || 'legal');
          }
          return;
        }
        
        // Test connection if env vars are available
        const connected = await testConnection();
        setSupabaseConnected(connected);
        
        if (connected) {
          toast({
            title: "Database Connected! 🚀",
            description: "Your conversations are now synced across all devices.",
          });
        } else {
          toast({
            title: "Local Mode Active",
            description: "Database connection failed. Your data won't be synced.",
            variant: "warning"
          });
        }

        const savedConversations = await loadConversations();
        setConversations(savedConversations);
        
        if (savedConversations.length > 0) {
          const firstConversation = savedConversations[0];
          setActiveConversation(firstConversation.id);
          setMessages(firstConversation.messages || []);
          setSelectedDomain(firstConversation.domain || 'legal');
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        setSupabaseConnected(false);
        toast({
          title: "Error Connecting",
          description: "Failed to initialize app: " + error.message,
          variant: "destructive"
        });
      }
    };
    
    initializeApp();
  }, []);

  useEffect(() => {
    // Save conversations to storage whenever they change
    if (activeConversation) {
      const currentConversation = conversations.find(c => c.id === activeConversation);
      if (currentConversation) {
        saveConversation(currentConversation).catch(error => {
          console.error('Error saving conversation:', error);
        });
      }
    }
  }, [conversations, activeConversation]);

  const handleNewConversation = () => {
    const newConversation = {
      id: Date.now().toString(),
      title: 'New Conversation',
      preview: 'Start a new conversation...',
      domain: selectedDomain,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messages: []
    };
    
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversation(newConversation.id);
    setMessages([]);
    // Return the new conversation so it can be used immediately
    return newConversation; 
  };

  const handleSelectConversation = (conversationId) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setActiveConversation(conversationId);
      setMessages(conversation.messages || []);
      setSelectedDomain(conversation.domain || 'legal');
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    try {
      await deleteConversation(conversationId);
      const remainingConversations = conversations.filter(c => c.id !== conversationId);
      setConversations(remainingConversations);
      
      if (activeConversation === conversationId) {
        if (remainingConversations.length > 0) {
          handleSelectConversation(remainingConversations[0].id);
        } else {
          setActiveConversation(null);
          setMessages([]);
        }
      }
      toast({
        title: "Conversation deleted",
        description: "The conversation has been removed successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete conversation. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSendMessage = async (message) => {
    let currentConversationId = activeConversation;

    // If there's no active conversation, create one first.
    if (!currentConversationId) {
      const newConv = handleNewConversation();
      currentConversationId = newConv.id;
    }

    const userMessage = {
      id: Date.now().toString(),
      text: message,
      isUser: true,
      domain: selectedDomain,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    setConversations(prev => prev.map(conv => 
      conv.id === currentConversationId
        ? { 
            ...conv, 
            messages: newMessages,
            title: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
            preview: message.slice(0, 100) + (message.length > 100 ? '...' : ''),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        : conv
    ));

    try {
      const aiResponseText = await generateAIResponse(message, selectedDomain, newMessages);
      
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        isUser: false,
        domain: selectedDomain,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const finalMessages = [...newMessages, aiResponse];
      setMessages(finalMessages);
      
      setConversations(prev => prev.map(conv => 
        conv.id === currentConversationId 
          ? { ...conv, messages: finalMessages }
          : conv
      ));
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate AI response. Please try again.",
        variant: "destructive"
      });
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
        isUser: false,
        domain: selectedDomain,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const messagesWithErr = [...newMessages, errorMessage];
      setMessages(messagesWithErr);
      
      setConversations(prev => prev.map(conv => 
        conv.id === currentConversationId 
          ? { ...conv, messages: messagesWithErr }
          : conv
      ));
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex overflow-hidden">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <Sidebar
              conversations={conversations}
              activeConversation={activeConversation}
              onNewConversation={handleNewConversation}
              onSelectConversation={handleSelectConversation}
              onDeleteConversation={handleDeleteConversation}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-background/80 backdrop-blur-sm border-b p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center floating">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-xl gradient-text">Lawless AI</h1>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
              supabaseConnected 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              <Database className="w-3 h-3" />
              <span className="text-xs font-medium">
                {supabaseConnected ? 'Synced' : 'Local'}
              </span>
            </div>
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-400">
              <div className="w-2 h-2 rounded-full bg-green-400 pulse-ring"></div>
              <span className="text-xs font-medium">Online</span>
            </div>
            <Button variant="ghost" size="icon">
              <Zap className="w-5 h-5" />
            </Button>
          </div>
        </motion.header>

        {/* Domain Selector */}
        <div className="p-4 bg-background/50">
          <DomainSelector
            selectedDomain={selectedDomain}
            onDomainChange={setSelectedDomain}
          />
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full flex items-center justify-center p-8"
            >
              <div className="text-center max-w-2xl">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center mx-auto mb-6 floating">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold gradient-text mb-8">
                  Welcome to Lawless AI
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  I'm here to help you with legal research, business strategy, and coding challenges. 
                  Select a domain above and start our conversation!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="p-4 rounded-lg glass-effect">
                    <h3 className="font-semibold mb-2">Legal Expertise</h3>
                    <p className="text-muted-foreground">Contract analysis, compliance guidance, legal research</p>
                  </div>
                  <div className="p-4 rounded-lg glass-effect">
                    <h3 className="font-semibold mb-2">Business Intelligence</h3>
                    <p className="text-muted-foreground">Strategy planning, market analysis, financial modeling</p>
                  </div>
                  <div className="p-4 rounded-lg glass-effect">
                    <h3 className="font-semibold mb-2">Coding Support</h3>
                    <p className="text-muted-foreground">Code review, debugging, architecture design</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message.text}
                  isUser={message.isUser}
                  domain={message.domain}
                  timestamp={message.timestamp}
                />
              ))}
              {isLoading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Chat Input */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          selectedDomain={selectedDomain}
        />

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-6 py-2 border-t border-border/30"
        >
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground/50">
            <AlertTriangle className="w-3 h-3 text-yellow-500/70" />
            <span>
              Lawless AI can make mistakes. Double check the responses, and seek a lawyer for legal advice.
            </span>
          </div>
        </motion.div>
      </div>

      <Toaster />
    </div>
  );
};

export default App;
