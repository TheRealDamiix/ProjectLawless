// /src/App.jsx

// ... (keep all other imports and code the same)

const App = () => {
  // ... (keep all your existing state hooks)

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
    
    // Return the new conversation object so it can be used immediately
    return newConversation; 
  };
  
  // ... (keep other functions like handleSelectConversation, etc.)

  const handleSendMessage = async (message) => {
    let currentConversationId = activeConversation;

    // If no active conversation, create one first
    if (!currentConversationId) {
      const newConversation = handleNewConversation();
      currentConversationId = newConversation.id;
    }
    
    const userMessage = {
      id: Date.now().toString(),
      text: message,
      isUser: true,
      domain: selectedDomain,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Use a function for setMessages to get the most up-to-date state
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    // Update conversation
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
      // Generate AI response
      const aiResponseText = await generateAIResponse(message, selectedDomain, messages);
      
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        isUser: false,
        domain: selectedDomain,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const updatedMessages = [...newMessages, aiResponse];
      setMessages(updatedMessages);
      setIsLoading(false);

      // Update conversation with AI response
      setConversations(prev => prev.map(conv => 
        conv.id === currentConversationId 
          ? { ...conv, messages: updatedMessages }
          : conv
      ));
    } catch (error) {
      setIsLoading(false);
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
      
      const updatedMessages = [...newMessages, errorMessage];
      setMessages(updatedMessages);
      
      setConversations(prev => prev.map(conv => 
        conv.id === currentConversationId 
          ? { ...conv, messages: updatedMessages }
          : conv
      ));
    }
  };

  // ... (the rest of your App component)
  return (
    // ... JSX remains the same
  );
};

export default App;
