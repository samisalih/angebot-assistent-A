
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

    console.log('Processing chat request:', {
      provider,
      configName: config.name,
      hasStoredKey: !!config.api_key,
      keyName: config.api_key_name
    });

    // Get the API key from stored value or environment
    let apiKey = config.api_key; // First try stored API key
    if (!apiKey) {
      apiKey = Deno.env.get(config.api_key_name); // Fallback to environment
    }
    
    if (!apiKey) {
      throw new Error(`API key ${config.api_key_name} not found in config or environment. Please configure it in the admin panel or set as environment variable.`);
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
      console.log('Calling OpenAI API');
      const response = await fetch(config.endpoint_url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: messages,
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error:', response.status, errorText);
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      aiMessage = data.choices[0].message.content;
    } else if (provider === 'anthropic') {
      console.log('Calling Anthropic API');
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
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1000,
          temperature: 0.7,
          system: systemMessage,
          messages: anthropicMessages,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Anthropic API error:', response.status, errorText);
        throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      aiMessage = data.content[0].text;
    } else if (provider === 'gemini') {
      console.log('Calling Gemini API');
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
            temperature: 0.7,
            maxOutputTokens: 1000,
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error:', response.status, errorText);
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      aiMessage = data.candidates[0].content.parts[0].text;
    }

    console.log('AI response generated successfully');

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
