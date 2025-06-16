
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

    console.log('=== NEW CHAT REQUEST ===');
    console.log('Provider:', provider);
    console.log('Config name:', config.name);
    console.log('API key name:', config.api_key_name);
    console.log('Message preview:', message.substring(0, 100) + '...');

    // Check if the requested provider has an available API key
    console.log('=== API KEY VALIDATION ===');
    let apiKey = null;
    
    if (config.api_key_name) {
      apiKey = Deno.env.get(config.api_key_name);
      console.log(`Looking for API key: ${config.api_key_name}, found: ${!!apiKey}`);
    }
    
    // If no specific API key, try common fallbacks based on provider
    if (!apiKey) {
      console.log('No API key found with specified name, trying fallbacks...');
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
    
    // If still no API key for the requested provider, return an error indicating fallback to frontend
    if (!apiKey) {
      console.warn(`=== NO API KEY FOR PROVIDER ${provider.toUpperCase()} ===`);
      console.warn(`No API key found for provider ${provider}. Available keys:`, Object.keys(Deno.env.toObject()).filter(key => key.includes('API_KEY')));
      
      return new Response(JSON.stringify({ 
        error: `NO_API_KEY_${provider.toUpperCase()}`,
        message: `Kein API-Schlüssel für ${provider} verfügbar. Das System wird auf Mock-Antworten zurückgreifen.`,
        shouldUseMock: true
      }), {
        status: 200, // Return 200 so frontend can handle gracefully
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Log API key format for debugging (first and last 4 characters only)
    if (apiKey.length > 8) {
      console.log(`API key format: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);
    }

    console.log(`=== CALLING AI SERVICE: ${provider.toUpperCase()} ===`);

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

    console.log('Prepared messages count:', messages.length);

    let aiMessage = '';

    // Handle different providers
    if (provider === 'openai') {
      console.log('=== CALLING OPENAI ===');
      console.log('Endpoint:', config.endpoint_url);
      aiMessage = await callOpenAI(apiKey, config, messages);
      console.log('OpenAI response received, length:', aiMessage.length);
    } else if (provider === 'anthropic') {
      console.log('=== CALLING ANTHROPIC ===');
      aiMessage = await callAnthropic(apiKey, config, messages, enhancedSystemPrompt);
      console.log('Anthropic response received, length:', aiMessage.length);
    } else if (provider === 'gemini') {
      console.log('=== CALLING GEMINI ===');
      aiMessage = await callGemini(apiKey, config, message);
      console.log('Gemini response received, length:', aiMessage.length);
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    console.log('=== AI RESPONSE PROCESSING ===');
    console.log('Raw AI message preview:', aiMessage.substring(0, 200) + '...');

    // Parse offer from AI response
    const { offer, cleanMessage } = parseOfferFromMessage(aiMessage);

    console.log('=== OFFER PARSING RESULT ===');
    console.log('Offer detected:', !!offer);
    if (offer) {
      console.log('Offer title:', offer.title);
      console.log('Offer items count:', offer.items.length);
      console.log('Offer total price:', offer.totalPrice);
    }
    console.log('Clean message preview:', cleanMessage.substring(0, 200) + '...');

    console.log('=== FINAL RESPONSE ===');
    const finalResponse = { 
      message: cleanMessage,
      offer: offer
    };
    console.log('Sending response with offer:', !!finalResponse.offer);

    return new Response(JSON.stringify(finalResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('=== ERROR IN CHAT FUNCTION ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      message: "Entschuldigung, es gab einen Fehler bei der Verarbeitung Ihrer Anfrage. Das System wird auf Mock-Antworten zurückgreifen.",
      shouldUseMock: true
    }), {
      status: 200, // Return 200 so frontend can handle gracefully
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
