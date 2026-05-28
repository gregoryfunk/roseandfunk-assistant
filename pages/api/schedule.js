// pages/api/schedule.js
export const config = { maxDuration: 60 };

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const SCHEDULE_RULES = `
SCHEDULING RULES:
- No meetings on Mondays
- Client meetings: Tuesday–Friday only
- Design blocks: Monday–Friday
- Big presentations (Concept Elevation 4hr, Material Confirmation 3hr, Final Review 3hr): prefer 11:00 or 13:00 start, prefer Friday
- Aesthetic Direction Meeting (1.5hr): 10:00 or 13:00 start
- Initial Meeting (1.5hr): 10:00 or 13:00 start
- Gregory attends all client meetings
- Skip BC Day (first Mon Aug), Labour Day (first Mon Sep), Thanksgiving (second Mon Oct)
- Gregory away Jun 24–26 (no meetings those dates)
`;

const ID_SEQUENCE = `
ID CONSTRUCTION — use these EXACT phase names and sequence:

"Pre-Design": Initial Drawing Set Up (2 days, design block)

"Phase 1": 
  Initial Meeting (meeting, 1.5hr)
  Aesthetic Direction x2 days (design block, 2 days)
  Aesthetic Direction Meeting (meeting, 1.5hr)
  Appliance & Plumbing Meeting (meeting, 4hr)

"Phase 2":
  Team Material Concept x2 days (design block, 2 days)
  Complete Material Boards x2 days (design block, 2 days)
  Lighting Concept Boards (design block, 1 day)
  Sketch Elevations (design block, 1 day)
  Elevations in AutoCAD x2 days (design block, 2 days)
  Concept Elevation & Material Meeting (meeting, 4hr)

"Phase 3":
  Concept Revisions & Material Boards x2 days (design block, 2 days)
  Documentation x3 days (design block, 3 days)
  Concept Exterior (design block, 1 day)
  Material Confirmation Meeting (meeting, 3hr)

"Phase 4":
  [15 calendar day 3D rendering window — no work needed]
  Material Confirmation Revisions (design block, 1 day)
  Complete Remaining Elevations x3 days (design block, 3 days)
  Drawing Details (design block, 1 day)
  Dimensioning & Noting Elevations x2 days (design block, 2 days)
  Plan Layouts x5 days (design block, 5 days)
  Final Review Meeting (meeting, 3hr)

"Post Final":
  Make Client Adjustments (design block, 1 day)
  Final Adjustments Send to Print (design block, 1 day)
  Review Drawings & Gather (design block, 1 day)
  All Final Edits Send to Client x3 days (design block, 3 days)
`;

const FURN_SEQUENCE = `
FURNISHINGS — use these EXACT phase names and sequence:

"Pre-Design": Drawing File Set-Up (design block, 2 days)

"Phase 1 | Concept":
  Initial Meeting (meeting, 1.5hr)
  Sourcing x2 days (design block, 2 days, Gregory OFF)
  Furniture Mood Boards x3 days (design block, 3 days)
  Furniture Pricing (design block, 1 day)
  Furniture Meeting (meeting, 2hr)
  Furniture Revisions (design block, 1 day)

"Phase 2 | Finalize":
  Enter Selections into Gather (design block, 1 day)
  Order Samples (design block, 1 day)
  Fabric Confirmation Meeting on site (meeting, 1.5hr)
  Fabric Confirmation Revisions (design block, 1 day)

"Phase 3 | Accessories":
  Art Sourcing x2 days (design block, 2 days, Gregory OFF)
  Art & Accessory Concept Boards x2 days (design block, 2 days)
  Art & Accessory Meeting (meeting, 1.5hr)
  Art & Accessory Revisions (design block, 1 day)

"Phase 4 | Installation":
  Furniture Setup Day (design block, 1 day)
  Accessory Install Day (design block, 1 day)
  Photoshoot (design block, 1 day)
`;

async function getDesignerAvailability(designer, startDate, endDate) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  try {
    const url = `${SUPABASE_URL}/rest/v1/designer_availability?designer=eq.${designer.toLowerCase()}&date=gte.${startDate}&date=lte.${endDate}&select=date,type,project,notes&order=date.asc`;
    const res = await fetch(url, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

async function getGregoryAbsences(startDate, endDate) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return [];
  try {
    const url = `${SUPABASE_URL}/rest/v1/designer_availability?designer=eq.gregory&date=gte.${startDate}&date=lte.${endDate}&type=eq.absence&select=date&order=date.asc`;
    const res = await fetch(url, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.map(d => d.date);
  } catch { return []; }
}

async function getLastSyncTime() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  try {
    const url = `${SUPABASE_URL}/rest/v1/designer_availability?select=synced_at&order=synced_at.desc&limit=1`;
    const res = await fetch(url, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
    if (!res.ok) return null;
    const data = await res.json();
    return data[0]?.synced_at || null;
  } catch { return null; }
}

function formatCalendarContext(designerData, gregoryAbsences, designer, lastSync) {
  if (!designerData || designerData.length === 0) {
    return lastSync ? `${designer} has no booked days in this period.` : `Calendar not synced.`;
  }
  const blocks = designerData.filter(d => d.type === "design_block");
  const absent = designerData.filter(d => d.type === "absence");
  let text = "";
  if (absent.length > 0) text += `${designer} AWAY: ${absent.map(d => d.date).join(", ")}\n`;
  if (blocks.length > 0) {
    const byProject = {};
    blocks.forEach(d => { const p = d.project || "Other"; if (!byProject[p]) byProject[p] = []; byProject[p].push(d.date); });
    text += `${designer} BOOKED (skip these for design blocks):\n`;
    Object.entries(byProject).forEach(([proj, dates]) => { text += `  ${proj}: ${dates.join(", ")}\n`; });
  }
  if (gregoryAbsences.length > 0) text += `GREGORY AWAY (no meetings): ${gregoryAbsences.join(", ")}\n`;
  return text || `${designer} is free.`;
}

function buildPrompt(clientName, projectType, contractDate, designer, calendarContext) {
  const isFurn = projectType === "furnishings";
  return `Generate a complete project schedule. Reply ONLY with valid JSON — no markdown, no backticks, no explanation.

Client: ${clientName}
Contract: ${contractDate}
Designer: ${designer}
Type: ${isFurn ? "Furnishings" : "ID Construction"}

${SCHEDULE_RULES}

${isFurn ? FURN_SEQUENCE : ID_SEQUENCE}

NAMING:
- Meetings: "RF ${clientName} | [Meeting Name]"
- Design blocks: "Design ${clientName} | [Phase#]-[Block Name]"

CALENDAR — avoid these dates for design blocks, avoid gregory away for meetings:
${calendarContext}

OUTPUT FORMAT — return this exact JSON structure:
{
  "schedule": [
    {
      "phase": "Pre-Design",
      "label": "Design ${clientName} | Initial Drawing Set Up",
      "type": "design",
      "date": "YYYY-MM-DD",
      "days": 2,
      "notes": "2 days"
    },
    {
      "phase": "Phase 1",
      "label": "RF ${clientName} | Initial Meeting",
      "type": "meeting",
      "date": "YYYY-MM-DD",
      "startTime": "10:00",
      "endTime": "11:30",
      "days": 1,
      "notes": "1.5hr",
      "options": ["YYYY-MM-DD", "YYYY-MM-DD", "YYYY-MM-DD"]
    }
  ],
  "conflicts": []
}

Rules:
- Every design block: phase, label, type="design", date (first day), days (count), notes
- Every meeting: phase, label, type="meeting", date, startTime (HH:MM 24hr), endTime (HH:MM 24hr), days=1, notes, options (3 conflict-free alternative dates)
- Use the EXACT phase names from the sequence above
- No Monday meetings
- Skip designer booked days for design blocks
- For multi-day design blocks, use the start date; skip weekends and holidays`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { action, clientName, projectType, contractDate, designer, events, revision } = req.body;

  // ── generate_schedule ─────────────────────────────────────────────────────
  if (action === "generate_schedule") {
    const startDate = contractDate;
    const endDate = new Date(new Date(contractDate).getTime() + 200 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const [designerData, gregoryAbsences, lastSync] = await Promise.all([
      getDesignerAvailability(designer, startDate, endDate),
      getGregoryAbsences(startDate, endDate),
      getLastSyncTime(),
    ]);

    const calendarContext = formatCalendarContext(designerData, gregoryAbsences, designer, lastSync);
    const calendarNote = lastSync
      ? `✓ Calendar synced ${new Date(lastSync).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}`
      : "⚠ Not synced — say 'sync calendar' in Chat";

    const prompt = buildPrompt(clientName, projectType, contractDate, designer, calendarContext);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-5", max_tokens: 4000, messages: [{ role: "user", content: prompt }] }),
    });

    const data = await response.json();
    const text = data.content?.find(b => b.type === "text")?.text || "{}";
    try {
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      return res.status(200).json({ ...parsed, calendarNote });
    } catch {
      return res.status(200).json({ schedule: [], conflicts: [], calendarNote, error: "Parse error" });
    }
  }

  // ── finalize_schedule ─────────────────────────────────────────────────────
  if (action === "finalize_schedule") {
    // Just return the events as-is — the frontend has already handled date selection
    return res.status(200).json({ schedule: events || [] });
  }

  // ── revise_schedule ───────────────────────────────────────────────────────
  if (action === "revise_schedule") {
    const currentJson = JSON.stringify((events || []).slice(0, 25));
    const prompt = `You are a scheduling assistant for Rose & Funk interior design studio.

Current schedule (JSON):
${currentJson}

Revision request: "${revision}"

${SCHEDULE_RULES}

If the request involves moving dates, return updated JSON with the same structure.
If just answering a question, return a message only.

Reply with JSON if updating schedule:
{"schedule": [...same structure as input with updated dates...], "message": "What changed"}

Or just reply with plain text if no schedule change needed.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-5", max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    const text = data.content?.find(b => b.type === "text")?.text || "";

    try {
      const jsonMatch = text.match(/\{[\s\S]*"schedule"[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return res.status(200).json({ schedule: parsed.schedule, message: parsed.message || "Schedule updated." });
      }
    } catch { /* fall through */ }

    return res.status(200).json({ message: text });
  }

  return res.status(400).json({ error: "Unknown action" });
}
