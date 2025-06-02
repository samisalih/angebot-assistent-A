
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

    // Enhanced system prompt for offer generation
    const enhancedSystemPrompt = `${config.system_prompt || 'Sie sind ein hilfsreicher KI-Berater.'}

WICHTIGE ANWEISUNGEN FÜR ANGEBOTSERSTELLUNG:
- Sie können Angebote erstellen, aber NUR wenn der Kunde explizit nach einem Angebot, Preis, Kostenvoranschlag oder ähnlichem fragt
- Erstellen Sie KEINE Angebote automatisch nur weil das Gespräch länger wird
- Wenn Sie ein Angebot erstellen möchten, fügen Sie am Ende Ihrer Antwort EXAKT folgendes Format hinzu:

OFFER_START
Titel: [Titel des Angebots]
Beschreibung: [Kurze Beschreibung]
Items: [Item1|Beschreibung1|Preis1|Menge1], [Item2|Beschreibung2|Preis2|Menge2]
OFFER_END

Beispiel:
OFFER_START
Titel: Website Entwicklung
Beschreibung: Professionelle Landing Page mit SEO-Optimierung
Items: Design|Responsive Website Design|800|1, SEO|Suchmaschinenoptimierung|300|1, Content|Texterstellung und Bilder|200|1
OFFER_END`;

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
      const systemMessage = enhancedSystemPrompt;
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
    console.log('Raw AI message:', aiMessage);

    // Parse offer from AI response
    let offer = null;
    let cleanMessage = aiMessage;

    // Look for the new OFFER_START/OFFER_END format
    const offerMatch = aiMessage.match(/OFFER_START([\s\S]*?)OFFER_END/);
    if (offerMatch) {
      console.log('Found offer in response, parsing...');
      const offerContent = offerMatch[1].trim();
      
      try {
        // Parse the offer content
        const titleMatch = offerContent.match(/Titel:\s*(.+)/);
        const descMatch = offerContent.match(/Beschreibung:\s*(.+)/);
        const itemsMatch = offerContent.match(/Items:\s*(.+)/);

        console.log('Title match:', titleMatch);
        console.log('Description match:', descMatch);
        console.log('Items match:', itemsMatch);

        if (titleMatch && descMatch && itemsMatch) {
          const title = titleMatch[1].trim();
          const description = descMatch[1].trim();
          const itemsStr = itemsMatch[1].trim();

          // Parse items
          const items = itemsStr.split(',').map(item => {
            const parts = item.trim().split('|');
            if (parts.length === 4) {
              return {
                name: parts[0].trim(),
                description: parts[1].trim(),
                price: parseFloat(parts[2].trim()),
                quantity: parseInt(parts[3].trim()),
              };
            }
            return null;
          }).filter(item => item !== null);

          console.log('Parsed items:', items);

          if (items.length > 0) {
            const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            offer = {
              id: `offer-${Date.now()}`,
              title,
              description,
              items,
              totalPrice,
              validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            };

            console.log('Generated offer:', offer);
          }
        }
      } catch (error) {
        console.error('Error parsing offer:', error);
      }

      // Remove the offer request from the message
      cleanMessage = aiMessage.replace(/OFFER_START[\s\S]*?OFFER_END/, '').trim();
    }

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
