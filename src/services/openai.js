import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: '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',
  dangerouslyAllowBrowser: true
});

const getDomainSystemPrompt = (domain) => {
  const prompts = {
    legal: `You are Lawless AI, a specialized legal AI assistant created by Lost Souls. You provide expert legal guidance, contract analysis, compliance advice, and legal research assistance. Always remind users that your responses are for informational purposes only and not a substitute for professional legal advice. Be thorough, cite relevant laws when possible, and maintain a professional yet approachable tone.`,
    
    business: `You are Lawless AI, a specialized business AI assistant created by Lost Souls. You excel at business strategy, market analysis, financial modeling, and operational guidance. Provide actionable insights, data-driven recommendations, and strategic thinking. Help users navigate complex business challenges with practical solutions.`,
    
    coding: `You are Lawless AI, a specialized coding AI assistant created by Lost Souls. You're an expert in software development, code review, debugging, architecture design, and best practices across multiple programming languages and frameworks. Provide clean, efficient code solutions with proper explanations and error handling.`
  };
  
  return prompts[domain] || prompts.legal;
};

export const generateAIResponse = async (message, domain, conversationHistory = []) => {
  try {
    const systemPrompt = getDomainSystemPrompt(domain);
    
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10).map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.text
      })),
      { role: 'user', content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    if (error.status === 401) {
      throw new Error('Invalid API key. Please check your OpenAI API key.');
    } else if (error.status === 429) {
      throw new Error('Rate limit exceeded. Please try again in a moment.');
    } else if (error.status === 500) {
      throw new Error('OpenAI service is temporarily unavailable. Please try again later.');
    } else {
      throw new Error('Failed to generate AI response. Please try again.');
    }
  }
};