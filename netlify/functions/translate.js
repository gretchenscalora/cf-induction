exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { text, lang, langName } = JSON.parse(event.body);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: 'You are a professional translator for workplace safety documents used on Australian farms. Translate the provided text into ' + langName + '. Use simple, clear language appropriate for workers who may have limited formal education. Keep all numbers, email addresses, and phone numbers exactly as they appear. Do not use any dashes or hyphens. Do not add any preamble. Just provide the translation.',
      messages: [{ role: 'user', content: 'Translate this farm safety induction content:\n\n' + text }]
    })
  });

  const data = await response.json();
  const translated = data.content && data.content[0] && data.content[0].text
    ? data.content[0].text
    : 'Translation unavailable. Please try again.';

  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
    body: JSON.stringify({ translated })
  };
};
