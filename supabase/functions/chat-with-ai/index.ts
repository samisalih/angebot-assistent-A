
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { parseOfferFromMessage } from './offerParser.ts';
import { callOpenAI, callAnthropic, callGemini } from './aiProviders.ts';
import { createEnhancedSystemPrompt } from './systemPrompt.ts';

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

    // Enhanced system prompt for offer generation
    const enhancedSystemPrompt = createEnhancedSystemPrompt(config.system_prompt);

    // Prepare messages for the AI
    const messages = [
      { role: 'system', content: enhancedSystemPrompt }
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
      aiMessage = await callOpenAI(apiKey, config, messages);
    } else if (provider === 'anthropic') {
      aiMessage = await callAnthropic(apiKey, config, messages, enhancedSystemPrompt);
    } else if (provider === 'gemini') {
      aiMessage = await callGemini(apiKey, config, message);
    }

    console.log('AI response generated successfully');
    console.log('Raw AI message:', aiMessage);

    // Parse offer from AI response
    const { offer, cleanMessage } = parseOfferFromMessage(aiMessage);

    console.log('Final response:', { message: cleanMessage, offer });

    return new Response(JSON.stringify({ 
      message: cleanMessage,
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
