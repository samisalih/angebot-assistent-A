
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
    return knowledgeItems;
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
  console.log('API key configured:', !!apiKey);

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
  if (!offerMatch) return null;

  try {
    const offerData = JSON.parse(offerMatch[1]);
    console.log('Parsed offer data:', offerData);
    
    // Transform simple offer format to proper structure
    if (offerData.price && !offerData.items && !offerData.totalPrice) {
      return {
        id: `offer-${Date.now()}`,
        title: offerData.title || 'Individuelles Angebot',
        description: offerData.description || 'Professionelle Beratungsleistung',
        items: [{
          name: offerData.title || 'Beratungsleistung',
          description: offerData.description || 'Professionelle Beratung nach Ihren Anforderungen',
          price: 102.50, // Standard hourly rate
          quantity: Math.max(1, Math.round(offerData.price / 102.50)) // Calculate hours from total price
        }],
        totalPrice: offerData.price,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      };
    }
    
    // If it already has the proper structure, return as-is
    if (offerData.items && Array.isArray(offerData.items)) {
      return {
        id: offerData.id || `offer-${Date.now()}`,
        title: offerData.title,
        description: offerData.description,
        items: offerData.items,
        totalPrice: offerData.totalPrice,
        validUntil: offerData.validUntil ? new Date(offerData.validUntil) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      };
    }
    
    return offerData;
  } catch (error) {
    console.log('Failed to parse offer from response:', error);
    return null;
  }
}

function buildSystemPromptWithKnowledge(knowledgeItems: any[]) {
  let basePrompt = `Du bist ein hilfsreicher KI-Berater für eine Beratungsfirma. 
Beantworte Fragen professionell und hilfsreich auf Deutsch. 

WICHTIG FÜR ANGEBOTE: Wenn du ein Angebot erstellen möchtest, teile es IMMER in mehrere detaillierte Positionen auf. 
Verwende dieses Format:

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

Beispiel für ein Website-Projekt:
- Position 1: "Konzeption und Planung" (8-12 Stunden)
- Position 2: "Design und Layout" (15-20 Stunden) 
- Position 3: "Technische Umsetzung" (20-30 Stunden)
- Position 4: "Content Management Setup" (5-8 Stunden)
- Position 5: "Testing und Go-Live" (3-5 Stunden)

Teile NIEMALS alles in eine einzige Position auf. Verwende realistische Stundensätze und Stundenaufwände.`;

  if (knowledgeItems && knowledgeItems.length > 0) {
    basePrompt += `\n\nFIRMENWISSEN UND RICHTLINIEN:\n`;
    
    knowledgeItems.forEach((item, index) => {
      basePrompt += `\n${index + 1}. ${item.title}`;
      if (item.category) {
        basePrompt += ` (Kategorie: ${item.category})`;
      }
      basePrompt += `:\n${item.content}\n`;
    });
    
    basePrompt += `\n\nBitte berücksichtige diese Informationen bei der Beratung und Angebotserstellung. Verwende die angegebenen Preise, Richtlinien und Unternehmensdetails.`;
  }

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

    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(Array.isArray(context) ? context : []),
      { role: 'user', content: message }
    ];

    console.log('Calling OpenAI with', messages.length, 'total messages');
    console.log('Knowledge base items loaded:', knowledgeItems?.length || 0);

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
