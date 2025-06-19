// /api/generate.js

export default async function handler(request, response) {
  // We only want to handle POST requests to this endpoint
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Log environment variables (redacted for security)
    console.log("API Key exists:", !!process.env.OPENROUTER_API_KEY);
    
    const { message, conversationHistory } = await request.json();

    // Prepare the conversation in the format OpenRouter expects
    const messages = conversationHistory.map(msg => ({
      role: msg.isUser ? 'user' : 'assistant',
      content: msg.text,
    }));
    messages.push({ role: 'user', content: message });


    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`, // Remember to add OPENROUTER_API_KEY to your environment variables
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "huggingfaceh4/zephyr-7b-beta", // Using a Hugging Face model via OpenRouter
        "messages": messages
      })
    });

    if (!openRouterResponse.ok) {
      const errorBody = await openRouterResponse.json();
      console.error("OpenRouter API Error:", errorBody);
      const errorMessage = errorBody.error?.message || "Failed to get response from OpenRouter.";
      return response.status(openRouterResponse.status).json({ error: errorMessage });
    }

    const data = await openRouterResponse.json();
    const generatedText = data.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

    response.status(200).json({ result: generatedText });

  } catch (error) {
    console.error('API Route Error:', error);
    // More detailed error response
    response.status(500).json({ 
      error: 'Internal server error.', 
      details: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
}
