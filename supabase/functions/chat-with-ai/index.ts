
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { callOpenAI, callAnthropic, callGemini } from './aiProviders.ts';
import { parseOfferFromResponse } from './offerParser.ts';
import { buildSystemPrompt } from './systemPrompt.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 20; // 20 requests per minute
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase configuration');
    return new Response(
      JSON.stringify({ error: 'Server configuration error' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log('=== CHAT-WITH-AI FUNCTION START ===');
    
    const { message, context } = await req.json();
    console.log('Request received:', { 
      messageLength: message?.length, 
      contextLength: Array.isArray(context) ? context.length : 0 
    });

    if (!message || typeof message !== 'string') {
      console.error('Invalid message format:', typeof message);
      return new Response(JSON.stringify({ error: 'Invalid message format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Enhanced input validation
    if (message.length > 4000) {
      console.error('Message too long:', message.length);
      return new Response(JSON.stringify({ error: 'Message too long. Please keep messages under 4000 characters.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user from authorization header
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    
    if (authHeader) {
      try {
        console.log('Checking user authentication...');
        const { data: { user }, error } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        if (!error && user) {
          userId = user.id;
          console.log('User authenticated:', userId);
        }
      } catch (error) {
        console.log('Auth validation failed:', error);
      }
    }

    // Apply rate limiting for authenticated users
    if (userId && !checkRateLimit(userId)) {
      console.error('Rate limit exceeded for user:', userId);
      return new Response(JSON.stringify({ 
        error: 'Rate limit exceeded. Please wait before sending another message.' 
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Processing message:', message.substring(0, 100) + '...');
    console.log('Context items:', Array.isArray(context) ? context.length : 0);

    // Get AI service configuration with error handling
    let configs;
    try {
      console.log('Fetching AI service configuration...');
      const { data, error } = await supabase
        .from('ai_service_config')
        .select('*')
        .eq('service_name', 'OpenAI')
        .single();
      
      if (error) {
        console.error('Error fetching AI config:', error);
        // Fallback to default OpenAI configuration
        configs = {
          service_name: 'OpenAI',
          endpoint_url: 'https://api.openai.com/v1/chat/completions',
          api_key_name: 'OPENAI_API_KEY'
        };
        console.log('Using fallback OpenAI configuration');
      } else {
        configs = data;
        console.log('Using database AI configuration:', configs.service_name);
      }
    } catch (error) {
      console.error('Database error:', error);
      // Fallback configuration
      configs = {
        service_name: 'OpenAI',
        endpoint_url: 'https://api.openai.com/v1/chat/completions',
        api_key_name: 'OPENAI_API_KEY'
      };
      console.log('Using emergency fallback configuration');
    }

    // Verify API key is available
    const apiKey = Deno.env.get(configs.api_key_name);
    if (!apiKey) {
      console.error(`API key ${configs.api_key_name} not found in environment`);
      return new Response(JSON.stringify({ 
        error: 'AI service configuration incomplete. Please contact support.' 
      }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log('API key found for:', configs.api_key_name);

    // Get knowledge base for context with error handling
    let knowledgeBase = [];
    try {
      console.log('Fetching knowledge base...');
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('title, content, category')
        .limit(10);
      
      if (!error && data) {
        knowledgeBase = data;
        console.log('Knowledge base loaded:', knowledgeBase.length, 'entries');
      }
    } catch (error) {
      console.error('Error fetching knowledge base:', error);
    }

    // Build system prompt with knowledge base
    const systemPrompt = buildSystemPrompt(knowledgeBase);
    console.log('System prompt built, length:', systemPrompt.length);
    
    // Prepare messages for AI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(Array.isArray(context) ? context : []),
      { role: 'user', content: message }
    ];

    console.log('Calling AI provider:', configs.service_name);
    let aiResponse;
    
    // Enhanced AI provider selection with fallback
    try {
      switch (configs.service_name) {
        case 'OpenAI':
          aiResponse = await callOpenAI(messages, configs);
          break;
        case 'Anthropic':
          aiResponse = await callAnthropic(messages, configs);
          break;
        case 'Gemini':
          aiResponse = await callGemini(messages, configs);
          break;
        default:
          // Fallback to OpenAI
          console.log('Unknown service, falling back to OpenAI');
          aiResponse = await callOpenAI(messages, {
            endpoint_url: 'https://api.openai.com/v1/chat/completions',
            api_key_name: 'OPENAI_API_KEY'
          });
      }
    } catch (providerError) {
      console.error(`Primary AI provider failed:`, providerError);
      
      // Fallback to OpenAI if primary provider fails
      if (configs.service_name !== 'OpenAI') {
        try {
          console.log('Attempting fallback to OpenAI...');
          aiResponse = await callOpenAI(messages, {
            endpoint_url: 'https://api.openai.com/v1/chat/completions',
            api_key_name: 'OPENAI_API_KEY'
          });
        } catch (fallbackError) {
          console.error('Fallback AI provider also failed:', fallbackError);
          throw new Error('AI service temporarily unavailable');
        }
      } else {
        throw providerError;
      }
    }

    if (!aiResponse || !aiResponse.message) {
      console.error('No response received from AI service');
      throw new Error('No response received from AI service');
    }

    console.log('AI response received, length:', aiResponse.message.length);

    // Parse potential offer from response
    const offer = parseOfferFromResponse(aiResponse.message);
    if (offer) {
      console.log('Offer detected in response');
    }

    // Log successful interaction for analytics
    if (userId) {
      try {
        await supabase
          .from('admin_audit_log')
          .insert({
            admin_user_id: userId,
            action: 'AI_CHAT_SUCCESS',
            table_name: 'chat_interactions',
            new_values: {
              message_length: message.length,
              response_length: aiResponse.message.length,
              has_offer: !!offer,
              provider: configs.service_name
            }
          });
      } catch (logError) {
        console.error('Failed to log interaction:', logError);
        // Don't fail the request if logging fails
      }
    }

    const response = {
      message: aiResponse.message,
      offer: offer,
      usage: aiResponse.usage
    };

    console.log('=== CHAT-WITH-AI FUNCTION SUCCESS ===');
    
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('=== CHAT-WITH-AI FUNCTION ERROR ===');
    console.error('Error in chat-with-ai function:', error);
    
    // Enhanced error categorization
    let statusCode = 500;
    let errorMessage = 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
    
    if (error.message?.includes('Rate limit')) {
      statusCode = 429;
      errorMessage = 'Zu viele Anfragen. Bitte warten Sie einen Moment.';
    } else if (error.message?.includes('API key')) {
      statusCode = 503;
      errorMessage = 'KI-Service ist vorübergehend nicht verfügbar.';
    } else if (error.message?.includes('timeout')) {
      statusCode = 504;
      errorMessage = 'Anfrage dauerte zu lange. Bitte versuchen Sie es erneut.';
    } else if (error.message?.includes('Invalid message')) {
      statusCode = 400;
      errorMessage = error.message;
    } else if (error.message?.includes('temporarily unavailable')) {
      statusCode = 503;
      errorMessage = 'KI-Service ist vorübergehend nicht verfügbar.';
    }

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
