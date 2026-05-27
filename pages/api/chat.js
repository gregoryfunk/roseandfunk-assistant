import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages, action, content } = req.body;

  if (action === "save_knowledge") {
    const { error } = await supabase.from("knowledge").update({ content, updated_at: new Date() }).eq("id", 1);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  if (action === "load_knowledge") {
    const { data, error } = await supabase.from("knowledge").select("content").eq("id", 1).single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ content: data?.content || "" });
  }

  if (action === "save_document") {
    const { name, text } = req.body;
    const { error } = await supabase.from("documents").insert({ name, content: text });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  if (action === "load_documents") {
    const { data, error } = await supabase.from("documents").select("id, name, content").order("created_at", { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ documents: data || [] });
  }

  if (action === "delete_document") {
    const { id } = req.body;
    const { error } = await supabase.from("documents").delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  if (action === "save_search") {
    const { session_id, question } = req.body;
    await supabase.from("searches").insert({ session_id, question });
    return res.status(200).json({ success: true });
  }

  if (action === "load_searches") {
    const { session_id } = req.body;
    const { data, error } = await supabase.from("searches").select("id, question").eq("session_id", session_id).order("created_at", { ascending: false }).limit(50);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ searches: data || [] });
  }

  if (action === "delete_search") {
    const { id } = req.body;
    await supabase.from("searches").delete().eq("id", id);
    return res.status(200).json({ success: true });
  }

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid request" });
  }

  const { data: kb } = await supabase.from("knowledge").select("content").eq("id", 1).single();
  const { data: docs } = await supabase.from("documents").select("name, content");

  const knowledgeText = kb?.content || "";
  const docsText = docs?.length ? docs.map(d => `--- ${d.name} ---\n${d.content}`).join("\n\n") : "";

  const systemPrompt = `You are an expert business assistant for Rose and Funk Interiors, an interior design studio in Fort Langley, BC. Help the team with day-to-day operations, client management, design decisions, and business improvement. Be practical, warm, and direct.

CLARIFYING QUESTIONS:
When a question is vague, incomplete, or could have multiple interpretations, ask as many clarifying questions as needed before answering. Present them as a short numbered list. Only do this when genuinely needed — if the question is clear and specific, answer it directly without asking anything first.

Examples of when to ask clarifying questions:
- "How should I handle this client?" → ask who the client is, what the issue is, what stage the project is at
- "What should our pricing be?" → ask what service, what scope, what market they're comparing to
- "Help me write an email" → ask who it's to, what the goal is, what the tone should be

Examples of when NOT to ask — just answer directly:
- "What's the standard ceiling height for pendants?" → just answer
- "How do I onboard a new client?" → just answer from the procedures
- "What are our studio hours?" → just answer from the knowledge base

KNOWLEDGE BASE:
${knowledgeText}

${docsText ? `UPLOADED DOCUMENTS:\n${docsText}` : ""}`;

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
        system: systemPrompt,
        messages: messages.map(m => ({ role: m.role, content: m.content }))
      })
    });

    const data = await response.json();
    if (data.error) return res.status(200).json({ reply: `Error: ${data.error.message}` });
    const reply = data.content?.[0]?.text || "Sorry, I couldn't get a response.";
    res.status(200).json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong." });
  }
}
