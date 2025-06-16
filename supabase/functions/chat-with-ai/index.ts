
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
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
      keyName: config.api_key_name
    });

    // Get the API key from Supabase secrets
    let apiKey = null;
    
    // First try to get from environment (Supabase secrets are loaded as env vars)
    if (config.api_key_name) {
      apiKey = Deno.env.get(config.api_key_name);
      console.log(`Looking for API key: ${config.api_key_name}, found: ${!!apiKey}`);
    }
    
    // If still no API key, try some common fallbacks
    if (!apiKey) {
      if (provider === 'openai') {
        apiKey = Deno.env.get('OPENAI_API_KEY');
        console.log('Fallback to OPENAI_API_KEY:', !!apiKey);
      } else if (provider === 'anthropic') {
        apiKey = Deno.env.get('ANTHROPIC_API_KEY');
        console.log('Fallback to ANTHROPIC_API_KEY:', !!apiKey);
      } else if (provider === 'gemini') {
        apiKey = Deno.env.get('GEMINI_API_KEY');
        console.log('Fallback to GEMINI_API_KEY:', !!apiKey);
      }
    }
    
    if (!apiKey) {
      console.error(`No API key found for provider ${provider}. Checked: ${config.api_key_name}`);
      throw new Error(`API key ${config.api_key_name || 'for ' + provider} not found. Please configure it in Supabase Secrets.`);
    }

    // Log API key format for debugging (first and last 4 characters only)
    if (apiKey.length > 8) {
      console.log(`API key format: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);
    }

    console.log(`Successfully found API key for ${provider}`);

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
      console.log('Calling OpenAI with API key');
      aiMessage = await callOpenAI(apiKey, config, messages);
    } else if (provider === 'anthropic') {
      console.log('Calling Anthropic with API key');
      aiMessage = await callAnthropic(apiKey, config, messages, enhancedSystemPrompt);
    } else if (provider === 'gemini') {
      console.log('Calling Gemini with API key');
      aiMessage = await callGemini(apiKey, config, message);
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
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
