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

SOURCE TRANSPARENCY — IMPORTANT:
Always be clear about where your answer is coming from:
- If the answer comes from the Rose & Funk knowledge base or uploaded documents, start with: "Based on your Rose & Funk documents..." or "According to your studio standards..."
- If the answer is NOT in the knowledge base and you're drawing from general knowledge, clearly say: "This isn't in your Rose & Funk knowledge base yet, but generally speaking..." or "I don't see this in your studio documents, but as a general guideline..."
- If you have partial information from the knowledge base but are filling in gaps, say: "Your documents mention X, and more generally..."
This helps the team know when to trust the answer as a Rose & Funk standard vs. general industry knowledge.

CLARIFYING QUESTIONS — VERY IMPORTANT:
When a question is vague, about a specific situation, involves a client, or where the best answer depends on context — ask clarifying questions before answering.

When asking clarifying questions, you MUST respond in this exact JSON format and nothing else:
{
  "type": "clarifying",
  "intro": "A short friendly sentence introducing the questions",
  "questions": [
    {
      "question": "The question text",
      "options": ["Option 1", "Option 2", "Option 3", "Other"]
    }
  ]
}

When giving a normal answer (no clarifying questions needed), respond in this exact JSON format:
{
  "type": "answer",
  "text": "Your full answer here"
}

WHEN TO ASK clarifying questions:
- Question involves a specific client, project, or situation
- The answer depends on context not provided
- Pricing, proposals, or contracts — ask about scope, client type, budget
- Writing emails or documents — ask who it's for, goal, tone
- Multiple valid answers exist depending on circumstances
- When in doubt, ask

WHEN TO ANSWER directly:
- One clear factual answer with no variables
- Fixed internal process with no client-specific context needed
- Enough context already provided to give a specific useful answer

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
    if (data.error) return res.status(200).json({ type: "answer", text: `Error: ${data.error.message}` });

    const raw = data.content?.[0]?.text || "";

    try {
      const cleaned = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return res.status(200).json(parsed);
    } catch {
      return res.status(200).json({ type: "answer", text: raw });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong." });
  }
}
