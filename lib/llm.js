// lib/llm.js
import { supabase } from './supabase';

export async function cachedLLM(prompt, provider = 'anthropic') {
  // cache hit?
  const { data } = await supabase
    .from('llm_cache')
    .select('response')
    .eq('prompt', prompt)
    .eq('provider', provider)
    .maybeSingle();

  if (data?.response) return data.response;

  // ---- Anthropic call (replace with your key) ----
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const json = await res.json();
  const response = json.content?.[0]?.text || '';
  // ------------------------------------------------

  // cache miss → store
  await supabase
    .from('llm_cache')
    .upsert({ prompt, provider, response });

  return response;
}