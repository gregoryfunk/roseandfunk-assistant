// pages/api/schedule.js
export const config = { maxDuration: 60 };

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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

function formatCalendarContext(designerData, gregoryAbsences, designer) {
  if (!designerData || designerData.length === 0) return `${designer} has no booked days in this period.`;
  const blocks = designerData.filter(d => d.type === "design_block");
  const absent = designerData.filter(d => d.type === "absence");
  let text = "";
  if (absent.length > 0) text += `${designer} AWAY (no work): ${absent.map(d => d.date).join(", ")}\n`;
  if (blocks.length > 0) {
    const byProject = {};
    blocks.forEach(d => { const p = d.project || "Other"; if (!byProject[p]) byProject[p] = []; byProject[p].push(d.date); });
    text += `${designer} BOOKED design days (do not schedule design blocks on these):\n`;
    Object.entries(byProject).forEach(([proj, dates]) => { text += `  ${proj}: ${dates.join(", ")}\n`; });
  }
  if (gregoryAbsences.length > 0) text += `GREGORY AWAY (no client meetings): ${gregoryAbsences.join(", ")}\n`;
  return text || `${designer} is free in this period.`;
}

function extractJSON(text) {
  // Try direct parse first
  try { return JSON.parse(text.trim()); } catch {}
  // Strip markdown fences
  const stripped = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  try { return JSON.parse(stripped); } catch {}
  // Find first { to last }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    try { return JSON.parse(text.slice(start, end + 1)); } catch {}
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { action, clientName, projectType, contractDate, designer, events, revision } = req.body;

  // ── generate_schedule ─────────────────────────────────────────────────────
  if (action === "generate_schedule") {
    const startDate = contractDate;
    const endDate = new Date(new Date(contractDate).getTime() + 200 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const isFurn = projectType === "furnishings";

    const [designerData, gregAbsences, lastSync] = await Promise.all([
      getDesignerAvailability(designer, startDate, endDate),
      getGregoryAbsences(startDate, endDate),
      getLastSyncTime(),
    ]);

    const calendarContext = formatCalendarContext(designerData, gregAbsences, designer);
    const calendarNote = lastSync
      ? `✓ Calendar synced ${new Date(lastSync).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}`
      : "⚠ Not synced";

    const phaseNames = isFurn
      ? ["Pre-Design", "Phase 1 | Concept", "Phase 2 | Finalize", "Phase 3 | Accessories", "Phase 4 | Installation"]
      : ["Pre-Design", "Phase 1", "Phase 2", "Phase 3", "Phase 4", "Post Final"];

    const sequence = isFurn ? `
Pre-Design: Drawing File Set-Up (design block, 2 days)
Phase 1 | Concept: Initial Meeting (meeting 1.5hr), Sourcing (design 2 days), Furniture Mood Boards (design 3 days), Furniture Pricing (design 1 day), Furniture Meeting (meeting 2hr), Furniture Revisions (design 1 day)
Phase 2 | Finalize: Enter Selections into Gather (design 1 day), Order Samples (design 1 day), Fabric Confirmation Meeting on site (meeting 1.5hr), Fabric Confirmation Revisions (design 1 day)
Phase 3 | Accessories: Art Sourcing (design 2 days), Art & Accessory Concept Boards (design 2 days), Art & Accessory Meeting (meeting 1.5hr), Art & Accessory Revisions (design 1 day)
Phase 4 | Installation: Furniture Setup Day (design 1 day), Accessory Install Day (design 1 day), Photoshoot (design 1 day)
` : `
Pre-Design: Initial Drawing Set Up (design block, 2 days)
Phase 1: Initial Meeting (meeting 1.5hr), Aesthetic Direction (design 2 days), Aesthetic Direction Meeting (meeting 1.5hr), Appliance & Plumbing Meeting (meeting 4hr)
Phase 2: Team Material Concept (design 2 days), Complete Material Boards (design 2 days), Lighting Concept Boards (design 1 day), Sketch Elevations (design 1 day), Elevations in AutoCAD (design 2 days), Concept Elevation & Material Meeting (meeting 4hr)
Phase 3: Concept Revisions & Material Boards (design 2 days), Documentation (design 3 days), Concept Exterior (design 1 day), Material Confirmation Meeting (meeting 3hr)
Phase 4: [skip 15 days for 3D rendering], Material Confirmation Revisions (design 1 day), Complete Remaining Elevations (design 3 days), Drawing Details (design 1 day), Dimensioning & Noting Elevations (design 2 days), Plan Layouts (design 5 days), Final Review Meeting (meeting 3hr)
Post Final: Make Client Adjustments (design 1 day), Final Adjustments Send to Print (design 1 day), Review Drawings & Gather (design 1 day), All Final Edits Send to Client (design 3 days)
`;

    const prompt = `You are a project scheduler for Rose & Funk interior design studio.

Generate a complete ${isFurn ? "Furnishings" : "ID Construction"} schedule for client "${clientName}".
Contract date: ${contractDate}. Designer: ${designer}.

RULES:
- No meetings on Mondays
- Client meetings Tuesday–Friday only  
- Design blocks Monday–Friday
- 4hr meetings: prefer 11:00 or 13:00 start
- 1.5hr/2hr/3hr meetings: 10:00 or 13:00 start
- Skip BC Day (first Mon Aug 2026 = Aug 3), Labour Day (first Mon Sep 2026 = Sep 7), Thanksgiving (second Mon Oct 2026 = Oct 12)
- Gregory away Jun 24-26, no meetings those days

SEQUENCE:
${sequence}

CALENDAR DATA:
${calendarContext}

NAMING RULES:
- Client meetings: "RF ${clientName} | [Meeting Name]"  
- Design blocks: "Design ${clientName} | [Block Name]"

OUTPUT: Return ONLY a JSON object. No markdown. No explanation. Just the JSON.

{
  "schedule": [
    {
      "phase": "Pre-Design",
      "label": "Design ${clientName} | Initial Drawing Set Up",
      "type": "design",
      "date": "2026-07-07",
      "days": 2,
      "notes": "2 days"
    },
    {
      "phase": "Phase 1",
      "label": "RF ${clientName} | Initial Meeting",
      "type": "meeting",
      "date": "2026-07-09",
      "startTime": "10:00",
      "endTime": "11:30",
      "days": 1,
      "notes": "1.5hr",
      "options": ["2026-07-09", "2026-07-10", "2026-07-14"]
    }
  ],
  "conflicts": []
}

Use these exact phase values: ${phaseNames.map(p => `"${p}"`).join(", ")}
Generate the FULL schedule following the sequence above. Start from ${contractDate}.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 4000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    const text = data.content?.find(b => b.type === "text")?.text || "";
    console.log("Schedule API raw response:", text.slice(0, 200));

    const parsed = extractJSON(text);
    if (parsed && Array.isArray(parsed.schedule)) {
      return res.status(200).json({ ...parsed, calendarNote });
    }

    // If parse failed, return error with raw for debugging
    return res.status(200).json({ schedule: [], conflicts: [], calendarNote, error: `Parse failed: ${text.slice(0, 100)}` });
  }

  // ── finalize_schedule ─────────────────────────────────────────────────────
  if (action === "finalize_schedule") {
    return res.status(200).json({ schedule: events || [] });
  }

  // ── revise_schedule ───────────────────────────────────────────────────────
  if (action === "revise_schedule") {
    const currentJson = JSON.stringify((events || []).slice(0, 20));

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 2000,
        system: `You are a scheduling assistant for Rose & Funk. Help adjust project schedules. No meetings on Mondays. Client meetings Tue-Fri only. Be concise and give specific dates.`,
        messages: [{ role: "user", content: `Current schedule: ${currentJson}\n\nRevision: ${revision}\n\nIf updating schedule, reply with JSON: {"schedule": [...], "message": "what changed"}. Otherwise reply with plain text.` }],
      }),
    });

    const data = await response.json();
    const text = data.content?.find(b => b.type === "text")?.text || "";
    const parsed = extractJSON(text);
    if (parsed?.schedule) {
      return res.status(200).json({ schedule: parsed.schedule, message: parsed.message || "Schedule updated." });
    }
    return res.status(200).json({ message: text });
  }

  return res.status(400).json({ error: "Unknown action" });
}
