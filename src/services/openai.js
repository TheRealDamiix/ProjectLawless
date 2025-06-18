// This service now calls our own secure backend function

export const generateAIResponse = async (message, domain, conversationHistory = []) => {
  try {
    // We are calling our own API route, which is /api/generate
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        domain, // Domain is still sent and can be used to customize prompts server-side if needed
        conversationHistory: conversationHistory.slice(-10), // Send the recent history
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      // Throw an error with the message from our serverless function
      throw new Error(errorData.error || 'The AI service failed to respond.');
    }

    const data = await response.json();
    return data.result; // Return the AI's generated text

  } catch (error) {
    console.error('Error fetching from /api/generate:', error);
    // Re-throw the error so the UI can catch it and display a message
    throw error;
  }
};
