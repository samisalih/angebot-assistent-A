
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const { message, context, endpointId } = await req.json();

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the endpoint configuration
    const { data: endpoint, error: endpointError } = await supabase
      .from('ai_endpoints')
      .select('*')
      .eq('id', endpointId)
      .eq('is_active', true)
      .single();

    if (endpointError || !endpoint) {
      throw new Error('Endpoint not found or inactive');
    }

    // Get the API key from environment
    const apiKey = Deno.env.get(endpoint.api_key_name);
    if (!apiKey) {
      throw new Error(`API key ${endpoint.api_key_name} not found in environment`);
    }

    // Prepare messages for the AI
    const messages = [
      { role: 'system', content: endpoint.system_prompt || 'Sie sind ein hilfsreicher KI-Berater.' }
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

    // Call the AI API
    const response = await fetch(endpoint.endpoint_url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: endpoint.model,
        messages: messages,
        max_tokens: endpoint.max_tokens,
        temperature: endpoint.temperature,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const aiMessage = data.choices[0].message.content;

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
