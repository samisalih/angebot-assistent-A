
export async function callOpenAI(messages: any[], config: any) {
  console.log('=== CALLING OPENAI ===');
  console.log('Endpoint:', config.endpoint_url);
  
  const apiKey = Deno.env.get(config.api_key_name);
  if (!apiKey) {
    throw new Error(`API key ${config.api_key_name} not found in environment`);
  }
  
  console.log('API key found:', !!apiKey);
  console.log('Calling OpenAI API');

  try {
    const response = await fetch(config.endpoint_url, {
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI response received successfully');
    
    return {
      message: data.choices[0]?.message?.content || 'No response from AI',
      usage: data.usage,
    };
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw error;
  }
}

export async function callAnthropic(messages: any[], config: any) {
  console.log('=== CALLING ANTHROPIC ===');
  
  const apiKey = Deno.env.get(config.api_key_name);
  if (!apiKey) {
    throw new Error(`API key ${config.api_key_name} not found in environment`);
  }

  try {
    const response = await fetch(config.endpoint_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        messages: messages,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', response.status, errorText);
      throw new Error(`Anthropic API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return {
      message: data.content[0]?.text || 'No response from AI',
      usage: data.usage,
    };
  } catch (error) {
    console.error('Error calling Anthropic:', error);
    throw error;
  }
}

export async function callGemini(messages: any[], config: any) {
  console.log('=== CALLING GEMINI ===');
  
  const apiKey = Deno.env.get(config.api_key_name);
  if (!apiKey) {
    throw new Error(`API key ${config.api_key_name} not found in environment`);
  }

  try {
    const response = await fetch(`${config.endpoint_url}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: messages.map(msg => ({
          parts: [{ text: msg.content }],
          role: msg.role === 'assistant' ? 'model' : 'user'
        }))
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return {
      message: data.candidates[0]?.content?.parts[0]?.text || 'No response from AI',
      usage: data.usageMetadata,
    };
  } catch (error) {
    console.error('Error calling Gemini:', error);
    throw error;
  }
}
