import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Settings, History, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';

const Sidebar = ({ conversations, activeConversation, onNewConversation, onSelectConversation, onDeleteConversation }) => {
  const handleSettings = () => {
    toast({
      title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
    });
  };

  const handleHistory = () => {
    // Show all conversations as chat history
    if (conversations.length === 0) {
      toast({
        title: "No chat history",
        description: "Start a conversation to see your chat history here!",
      });
    } else {
      toast({
        title: "Chat History",
        description: `You have ${conversations.length} conversation${conversations.length === 1 ? '' : 's'} saved.`,
      });
    }
  };

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="w-80 h-full bg-card border-r flex flex-col"
    >
      <div className="p-4 border-b">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg gradient-text">Lawless AI</h2>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground mb-4">By lost souls</p>
        
        <Button 
          onClick={onNewConversation}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Conversation
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto scrollbar-hide p-4">
        {conversations.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">No conversations yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Start a new conversation to see your chat history</p>
          </div>
        ) : (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <History className="w-4 h-4" />
              Chat History ({conversations.length})
            </h3>
            {conversations.map((conversation) => (
              <motion.div
                key={conversation.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group"
              >
                <Card 
                  className={`cursor-pointer transition-all duration-200 ${
                    activeConversation === conversation.id 
                      ? 'ring-2 ring-primary bg-primary/10' 
                      : 'hover:bg-accent/50'
                  }`}
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{conversation.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {conversation.preview}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {conversation.domain && (
                            <Badge variant="secondary" className="text-xs">
                              {conversation.domain}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {conversation.timestamp}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteConversation(conversation.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-4 border-t space-y-2">
        <Button 
          variant="ghost" 
          className="w-full justify-start"
          onClick={handleHistory}
        >
          <History className="w-4 h-4 mr-2" />
          Chat History
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start"
          onClick={handleSettings}
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>
    </motion.div>
  );
};

export default Sidebar;