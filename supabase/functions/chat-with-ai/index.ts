
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context, provider, config } = await req.json();

    // Get the API key from environment or config
    let apiKey = Deno.env.get(config.api_key_name);
    if (!apiKey && config.api_key) {
      // Use API key from database if not found in environment
      apiKey = config.api_key;
    }
    
    if (!apiKey) {
      throw new Error(`API key ${config.api_key_name} not found in environment or config`);
    }

    // Prepare messages for the AI
    const messages = [
      { role: 'system', content: config.system_prompt || 'Sie sind ein hilfsreicher KI-Berater.' }
    ];

    // Add context messages
    context.forEach((msg: Message) => {
      messages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    });

    // Add current message
    messages.push({ role: 'user', content: message });

    let aiMessage = '';

    // Handle different providers
    if (provider === 'openai') {
      const response = await fetch(config.endpoint_url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // Use default model
          messages: messages,
          max_tokens: 1000, // Use default max_tokens
          temperature: 0.7, // Use default temperature
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      aiMessage = data.choices[0].message.content;
    } else if (provider === 'anthropic') {
      // Anthropic format is different - system message is separate
      const systemMessage = config.system_prompt || 'Sie sind ein hilfsreicher KI-Berater.';
      const anthropicMessages = messages.slice(1); // Remove system message

      const response = await fetch(config.endpoint_url, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229', // Use default model
          max_tokens: 1000, // Use default max_tokens
          temperature: 0.7, // Use default temperature
          system: systemMessage,
          messages: anthropicMessages,
        }),
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      aiMessage = data.content[0].text;
    } else if (provider === 'gemini') {
      // Gemini format is different
      const response = await fetch(`${config.endpoint_url}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: message
            }]
          }],
          generationConfig: {
            temperature: 0.7, // Use default temperature
            maxOutputTokens: 1000, // Use default max_tokens
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      aiMessage = data.candidates[0].content.parts[0].text;
    }

    // Check if we should generate an offer
    let offer = null;
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes("angebot") || lowerMessage.includes("preis") || 
        lowerMessage.includes("kosten") || context.length > 3) {
      
      offer = {
        id: `offer-${Date.now()}`,
        title: "Maßgeschneiderte Beratungslösung",
        description: "Basierend auf Ihren Anforderungen haben wir folgendes Angebot zusammengestellt:",
        items: [
          {
            name: "Initial-Beratung",
            description: "Umfassende Analyse Ihrer aktuellen Situation",
            price: 150,
            quantity: 2,
          },
          {
            name: "Strategieentwicklung",
            description: "Entwicklung einer maßgeschneiderten Strategie",
            price: 300,
            quantity: 1,
          },
          {
            name: "Implementierungsunterstützung",
            description: "Begleitung bei der Umsetzung",
            price: 200,
            quantity: 3,
          },
        ],
        totalPrice: 1500,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      };
    }

    return new Response(JSON.stringify({ 
      message: aiMessage,
      offer: offer
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chat-with-ai function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      message: "Entschuldigung, es gab einen Fehler bei der Verarbeitung Ihrer Anfrage. Bitte versuchen Sie es erneut."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
