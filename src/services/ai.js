// /src/services/ai.js

export const generateAIResponse = async (message, domain, conversationHistory = []) => {
  try {
    console.log('Sending request to AI service...');
    
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

    console.log('AI service response status:', response.status);

    if (!response.ok) {
      let errorMessage = 'The AI service failed to respond.';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
        
        // Log detailed error information
        if (errorData.details) {
          console.error('API error details:', errorData.details);
        }
        if (errorData.stack) {
          console.error('API error stack:', errorData.stack);
        }
      } catch (parseError) {
        console.error('Error parsing error response:', parseError);
        // If we can't parse the JSON, try to get the text
        try {
          const errorText = await response.text();
          console.error('Raw error response:', errorText);
        } catch (textError) {
          console.error('Could not get error text:', textError);
        }
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('AI response received successfully');
    return data.result; // Return the AI's generated text

  } catch (error) {
    console.error('Error fetching from /api/generate:', error);
    // Re-throw the error so the UI can catch it and display a message
    throw error;
  }
};
