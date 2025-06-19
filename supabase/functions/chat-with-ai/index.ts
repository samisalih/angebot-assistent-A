import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
}

async function fetchKnowledgeBase() {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.log('Supabase credentials not available');
      return null;
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: knowledgeItems, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching knowledge base:', error);
      return null;
    }

    console.log(`Loaded ${knowledgeItems?.length || 0} knowledge base items`);
    
    // Truncate knowledge items to prevent token limit issues
    const truncatedItems = knowledgeItems?.map(item => ({
      ...item,
      content: truncateText(item.content || '', 1000) // Limit each item to 1000 chars
    }));

    if (truncatedItems && truncatedItems.length > 0) {
      console.log('Knowledge base content preview:', truncatedItems.map(item => ({ 
        title: item.title, 
        category: item.category,
        contentLength: item.content?.length || 0 
      })));
    }
    return truncatedItems;
  } catch (error) {
    console.error('Error in fetchKnowledgeBase:', error);
    return null;
  }
}

async function callOpenAI(messages: any[]) {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    console.error('OpenAI API key not configured');
    throw new Error('OpenAI API key not configured');
  }

  console.log('Calling OpenAI with', messages.length, 'messages');
  console.log('System prompt length:', messages[0]?.content?.length || 0);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    console.log('OpenAI response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
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
  // Look for structured offer data in [OFFER]...[/OFFER] format
  const offerMatch = content.match(/\[OFFER\](.*?)\[\/OFFER\]/s);
  if (!offerMatch) return { offer: null, cleanMessage: content };

  try {
    const offerData = JSON.parse(offerMatch[1]);
    console.log('Parsed offer data:', offerData);
    
    // Validate and fix offer data
    if (offerData.items && Array.isArray(offerData.items)) {
      // Ensure all items have reasonable values
      let calculatedTotal = 0;
      
      offerData.items = offerData.items.map((item: any) => {
        // Ensure price is reasonable (between 50-200 EUR per hour)
        const price = Math.min(Math.max(item.price || 102.50, 50), 200);
        // Ensure quantity is reasonable (between 1-100 hours per item)
        const quantity = Math.min(Math.max(item.quantity || 1, 1), 100);
        
        calculatedTotal += price * quantity;
        
        return {
          name: item.name || 'Unbenannte Leistung',
          description: item.description || 'Beschreibung fehlt',
          price: price,
          quantity: quantity
        };
      });
      
      // Update total price to match calculated total
      offerData.totalPrice = Math.round(calculatedTotal * 100) / 100;
      
      const offer = {
        id: offerData.id || `offer-${Date.now()}`,
        title: offerData.title || 'Individuelles Angebot',
        description: offerData.description || 'Professionelle Beratungsleistung',
        items: offerData.items,
        totalPrice: offerData.totalPrice,
        validUntil: offerData.validUntil ? new Date(offerData.validUntil) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      };

      // Clean the message by removing the offer JSON completely
      const cleanMessage = content.replace(/\[OFFER\].*?\[\/OFFER\]/s, '').trim();
      
      return { offer, cleanMessage };
    }
    
    return { offer: null, cleanMessage: content };
  } catch (error) {
    console.log('Failed to parse offer from response:', error);
    return { offer: null, cleanMessage: content };
  }
}

function buildSystemPromptWithKnowledge(knowledgeItems: any[]) {
  let basePrompt = `Du bist ein hilfsreicher KI-Berater für eine Beratungsfirma. 
Beantworte Fragen professionell und hilfsreich auf Deutsch. 

WICHTIG FÜR ANGEBOTE: 
- Der Standard-Stundensatz beträgt 102,50 €
- Stundenaufwände müssen REALISTISCH sein (zwischen 1-80 Stunden pro Position)
- Jede Position sollte maximal 8.200 € kosten (80h × 102,50€)
- Das Gesamtangebot sollte zwischen 500€ und 50.000€ liegen

Wenn du ein Angebot erstellen möchtest, verwende EXAKT dieses Format:

[OFFER]{
  "title": "Titel des Angebots",
  "description": "Kurze Beschreibung des Gesamtprojekts",
  "items": [
    {
      "name": "Position 1 Name",
      "description": "Detaillierte Beschreibung der ersten Position",
      "price": 102.50,
      "quantity": 8
    },
    {
      "name": "Position 2 Name", 
      "description": "Detaillierte Beschreibung der zweiten Position",
      "price": 102.50,
      "quantity": 12
    }
  ],
  "totalPrice": 2050
}[/OFFER]

REALISTISCHE STUNDENAUFWÄNDE:
- Beratungsgespräch: 1-3 Stunden
- Konzeption: 4-12 Stunden  
- Design: 8-40 Stunden
- Frontend-Entwicklung: 20-80 Stunden
- Backend-Entwicklung: 30-80 Stunden
- Testing: 5-20 Stunden
- Projektmanagement: 5-15 Stunden

Teile NIEMALS alles in eine einzige Position auf. Verwende realistische Stundensätze und Stundenaufwände.`;

  if (knowledgeItems && knowledgeItems.length > 0) {
    basePrompt += `\n\n=== FIRMENWISSEN ===\n`;
    
    knowledgeItems.forEach((item, index) => {
      basePrompt += `${index + 1}. ${item.title}`;
      if (item.category) {
        basePrompt += ` (${item.category})`;
      }
      basePrompt += `:\n${item.content}\n\n`;
    });
    
    basePrompt += `=== ENDE FIRMENWISSEN ===\n\n`;
    basePrompt += `WICHTIG: Berücksichtige die oben genannten Informationen bei der Beratung und Angebotserstellung. 
Verwende die angegebenen Preise, Richtlinien und Unternehmensdetails. 
Die Stundenaufwände müssen realistisch sein und den Firmenvorgaben entsprechen!
NIEMALS mehr als 80 Stunden pro Position verwenden!`;
  } else {
    console.log('No knowledge base items available for system prompt');
  }

  // Ensure the final prompt is not too long
  const maxPromptLength = 8000; // Conservative limit to stay within token limits
  if (basePrompt.length > maxPromptLength) {
    basePrompt = truncateText(basePrompt, maxPromptLength);
    console.log('System prompt was truncated due to length');
  }

  console.log('Final system prompt length:', basePrompt.length);
  return basePrompt;
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

    // Fetch knowledge base
    const knowledgeItems = await fetchKnowledgeBase();

    // Build system prompt with knowledge
    const systemPrompt = buildSystemPromptWithKnowledge(knowledgeItems || []);

    // Prepare messages for OpenAI - limit context to prevent token overflow
    const limitedContext = Array.isArray(context) ? context.slice(-5) : []; // Only last 5 messages
    const messages = [
      { role: 'system', content: systemPrompt },
      ...limitedContext,
      { role: 'user', content: message }
    ];

    console.log('Calling OpenAI with', messages.length, 'total messages');
    console.log('Knowledge base items loaded:', knowledgeItems?.length || 0);

    // Call OpenAI
    const aiResponse = await callOpenAI(messages);
    
    // Parse potential offer and clean message
    const { offer, cleanMessage } = parseOfferFromResponse(aiResponse);

    const response = {
      message: cleanMessage || 'Entschuldigung, ich konnte keine Antwort generieren.',
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
