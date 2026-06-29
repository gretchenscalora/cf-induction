exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { text, lang, langName } = JSON.parse(event.body);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
'x-api-key': 'sk-ant-api03-h6bgJA8_RDdgInb7wjruVfX7zmGVmCG_c-pN7NjwHmNVXd5VMSQ8wLqJFUG30WawimUaEooJO2iGSUQAA',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: 'You are a professional translator for workplace safety documents used on Australian farms. Translate the provided text into ' + langName + '. Use simple, clear language appropriate for workers who may have limited formal education. Keep all numbers, email addresses, and phone numbers exactly as they appear. Do not use any dashes or hyphens. Do not add any preamble. Just provide the translation.',
        messages: [{ role: 'user', content: 'Translate this farm safety induction content:\n\n' + text }]
      })
    });

    const raw = await response.text();

    let data;
    try { data = JSON.parse(raw); } catch(e) {
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ translated: 'Parse error: ' + raw.substring(0, 300) })
      };
    }

    if (!response.ok) {
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ translated: 'API error ' + response.status + ': ' + JSON.stringify(data) })
      };
    }

    const translated = data.content && data.content[0] && data.content[0].text
      ? data.content[0].text
      : 'Empty response: ' + JSON.stringify(data);

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ translated })
    };

  } catch(err) {
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ translated: 'Function error: ' + err.message })
    };
  }
};
