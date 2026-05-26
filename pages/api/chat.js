export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages, knowledge } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid request" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1000,
        system: `You are an expert business assistant for Rose and Funk Interiors, an interior design studio in Fort Langley, BC. Help the team with day-to-day operations, client management, design decisions, and business improvement. Be practical, warm, and direct.

KNOWLEDGE BASE:
${knowledge}`,
        messages: messages.map(m => ({ role: m.role, content: m.content }))
      })
    });

    const data = await response.json();
    console.log("Anthropic response:", JSON.stringify(data));
    
    if (data.error) {
      console.error("Anthropic error:", data.error);
      return res.status(200).json({ reply: `Error: ${data.error.message}` });
    }

    const reply = data.content?.[0]?.text || "Sorry, I couldn't get a response.";
    res.status(200).json({ reply });
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
}
