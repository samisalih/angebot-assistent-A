
interface Message {
  role: string;
  content: string;
}

interface AIConfig {
  endpoint_url: string;
  system_prompt?: string;
}

export async function callOpenAI(apiKey: string, config: AIConfig, messages: Message[]): Promise<string> {
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
  return data.choices[0].message.content;
}

export async function callAnthropic(apiKey: string, config: AIConfig, messages: Message[], systemPrompt: string): Promise<string> {
  console.log('Calling Anthropic API');
  // Anthropic format is different - system message is separate
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
      system: systemPrompt,
      messages: anthropicMessages,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Anthropic API error:', response.status, errorText);
    throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

export async function callGemini(apiKey: string, config: AIConfig, message: string): Promise<string> {
  console.log('Calling Gemini API');
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
  return data.candidates[0].content.parts[0].text;
}
