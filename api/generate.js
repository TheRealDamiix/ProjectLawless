// This is a secure, server-side function.
// It will run on Vercel's servers, not in the user's browser.

export default async function handler(request, response) {
  // We only want to handle POST requests to this endpoint
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { message, conversationHistory } = await request.json();

    // Prepare the conversation in the format Hugging Face expects
    const formattedHistory = conversationHistory.map(msg => ({
      role: msg.isUser ? 'user' : 'assistant',
      content: msg.text,
    }));

    const payload = {
      inputs: {
        past_user_inputs: formattedHistory.filter(m => m.role === 'user').map(m => m.content),
        generated_responses: formattedHistory.filter(m => m.role === 'assistant').map(m => m.content),
        text: message
      },
      parameters: {
        return_full_text: false,
        max_new_tokens: 500,
      }
    };
    
    const hfResponse = await fetch(
      // Using a powerful, free conversational model
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`, // Securely using the environment variable
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(payload),
      }
    );

    if (!hfResponse.ok) {
        const errorBody = await hfResponse.json();
        console.error("Hugging Face API Error:", errorBody);
        const errorMessage = errorBody.error || "Failed to get response from Hugging Face.";
        return response.status(hfResponse.status).json({ error: errorMessage });
    }

    const data = await hfResponse.json();
    // The response is an array, we get the generated text from the first item
    const generatedText = data[0]?.generated_text || "I'm sorry, I couldn't generate a response.";

    response.status(200).json({ result: generatedText });

  } catch (error) {
    console.error('API Route Error:', error);
    response.status(500).json({ error: 'Internal server error.' });
  }
}
