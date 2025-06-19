
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple rate limiting
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10;
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

async function callOpenAI(messages: any[]) {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    console.error('OpenAI API key not configured');
    throw new Error('OpenAI API key not configured');
  }

  console.log('Calling OpenAI with', messages.length, 'messages');

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    console.log('OpenAI response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI response received successfully');
    
    return data.choices[0]?.message?.content || 'Keine Antwort erhalten';
  } catch (error) {
    console.error('Error in callOpenAI:', error);
    throw error;
  }
}

function parseOfferFromResponse(content: string) {
  // Simple offer detection - look for structured offer data
  const offerMatch = content.match(/\[OFFER\](.*?)\[\/OFFER\]/s);
  if (!offerMatch) return null;

  try {
    return JSON.parse(offerMatch[1]);
  } catch (error) {
    console.log('Failed to parse offer from response');
    return null;
  }
}

serve(async (req) => {
  console.log('=== CHAT-WITH-AI FUNCTION START ===');
  console.log('Method:', req.method);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const { message, context } = requestBody;

    console.log('Request received:', { 
      messageLength: message?.length, 
      contextLength: Array.isArray(context) ? context.length : 0 
    });

    // Basic validation
    if (!message || typeof message !== 'string') {
      console.error('Invalid message:', message);
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (message.length > 4000) {
      console.error('Message too long:', message.length);
      return new Response(JSON.stringify({ error: 'Message too long' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Simple rate limiting with anonymous user
    const userId = 'anonymous';
    if (!checkRateLimit(userId)) {
      console.log('Rate limit exceeded for user:', userId);
      return new Response(JSON.stringify({ 
        error: 'Zu viele Anfragen. Bitte warten Sie einen Moment.' 
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build system prompt
    const systemPrompt = `Du bist ein hilfsreicher KI-Berater für eine Beratungsfirma. 
Beantworte Fragen professionell und hilfsreich auf Deutsch. 
Wenn du ein Angebot erstellen möchtest, formatiere es als [OFFER]{"title":"Titel","description":"Beschreibung","price":100}[/OFFER].`;

    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(Array.isArray(context) ? context : []),
      { role: 'user', content: message }
    ];

    console.log('Calling OpenAI with', messages.length, 'total messages');

    // Call OpenAI
    const aiResponse = await callOpenAI(messages);
    
    // Parse potential offer
    const offer = parseOfferFromResponse(aiResponse);
    const cleanResponse = aiResponse.replace(/\[OFFER\].*?\[\/OFFER\]/s, '').trim();

    const response = {
      message: cleanResponse || aiResponse,
      offer: offer
    };

    console.log('=== CHAT-WITH-AI FUNCTION SUCCESS ===');
    console.log('Response:', { hasMessage: !!response.message, hasOffer: !!response.offer });
    
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('=== CHAT-WITH-AI FUNCTION ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    let statusCode = 500;
    let errorMessage = 'Ein unerwarteter Fehler ist aufgetreten.';
    
    if (error.message?.includes('API key')) {
      statusCode = 503;
      errorMessage = 'KI-Service ist nicht verfügbar.';
    } else if (error.message?.includes('OpenAI API')) {
      statusCode = 502;
      errorMessage = 'Fehler beim KI-Service.';
    }

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
