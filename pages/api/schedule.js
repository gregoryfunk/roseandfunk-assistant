// pages/api/schedule.js
export const config = { maxDuration: 60 };

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const SCHEDULE_RULES = `
SCHEDULING RULES — follow these exactly:
- No meetings on Mondays ever
- Client meetings: Tuesday–Friday only
- Design block days: Monday–Friday (design work can happen Monday, meetings cannot)
- Big presentations (Concept Elevation 4hr, Material Confirmation 3hr, Final Review 3hr): prefer 11am or 1pm start, prefer Friday but not required
- Aesthetic Direction Meeting (1.5hr): 10am or 1pm start
- Initial Meeting (1.5hr): 10am or 1pm start
- ONE designer per project — Gregory attends all client meetings
- Skip Canadian holidays: BC Day (first Mon Aug), Labour Day (first Mon Sep), Thanksgiving (second Mon Oct)
- Gregory away Jun 24–26 (no meetings those dates)

ID CONSTRUCTION SEQUENCE:
Pre-Design: Initial Drawing Set Up (2 days)
Phase 1: Initial Meeting (1.5hr) → Aesthetic Direction (2 days) → Aesthetic Direction Meeting (1.5hr) → Appliance & Plumbing Meeting (4hr)
Phase 2: Team Material Concept (2 days, Gregory + designer) → Complete Material Boards (2 days) → Lighting Concept Boards (1 day) → Sketch Elevations (1 day) → Elevations in AutoCAD (2 days) → Concept Elevation & Material Meeting (4hr)
Phase 3: Concept Revisions & Material Boards (2 days) → Documentation (3 days) → Concept Exterior (1 day) → Material Confirmation Meeting (3hr)
Phase 4: [15 day 3D rendering window] → Material Confirmation Revisions (1 day) → Complete Remaining Elevations (3 days) → Drawing Details (1 day) → Dimensioning & Noting Elevations (2 days) → Plan Layouts (5 days) → Final Review Meeting (3hr)
Post Final: Make Client Adjustments (1 day) → Final Adjustments Send to Print (1 day) → Review Drawings & Gather (1 day) → All Final Edits Send to Client (3 days)

FURNISHINGS SEQUENCE:
Pre-Design: Drawing File Set-Up (2 days)
Phase 1: Initial Meeting (1.5hr) → Sourcing (2 days, Gregory OFF) → Mood Boards (3 days) → Pricing (1 day) → Furniture Meeting (2hr) → Revisions (1 day)
Phase 2: Enter Gather (1 day) → Order Samples (1 day) → Fabric Confirmation Meeting on site (1.5hr) → Revisions (1 day)
Phase 3: Art Sourcing (2 days, Gregory OFF) → Concept Boards (2 days) → Art Meeting (1.5hr) → Revisions (1 day)
Phase 4: Furniture Setup Day → Accessory Install Day → Photoshoot

EVENT NAMING:
- Client meetings: "RF [ClientName] | [Meeting Name]"
- Design blocks: "Design [ClientName] | [Phase#]-[Block Name]"
`;

async function getDesignerAvailability(designer, startDate, endDate) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  try {
    const url = `${SUPABASE_URL}/rest/v1/designer_availability?designer=eq.${designer.toLowerCase()}&date=gte.${startDate}&date=lte.${endDate}&select=date,type,project,notes&order=date.asc`;
    const res = await fetch(url, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

async function getGregoryAbsences(startDate, endDate) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return [];
  try {
    const url = `${SUPABASE_URL}/rest/v1/designer_availability?designer=eq.gregory&date=gte.${startDate}&date=lte.${endDate}&type=eq.absence&select=date&order=date.asc`;
    const res = await fetch(url, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.map(d => d.date);
  } catch { return []; }
}

async function getLastSyncTime() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  try {
    const url = `${SUPABASE_URL}/rest/v1/designer_availability?select=synced_at&order=synced_at.desc&limit=1`;
    const res = await fetch(url, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data[0]?.synced_at || null;
  } catch { return null; }
}

function formatAvailabilityForPrompt(designerData, gregoryAbsences, designer, lastSync) {
  if (!designerData || designerData.length === 0) {
    return lastSync
      ? `${designer} has no conflicts in this period. (Synced: ${new Date(lastSync).toLocaleDateString("en-CA")})`
      : `Calendar not yet synced — scheduling by rules only.`;
  }
  const designBlocks = designerData.filter(d => d.type === "design_block");
  const absences = designerData.filter(d => d.type === "absence");
  let text = "";
  if (absences.length > 0) {
    text += `\n${designer} AWAY (no work): ${absences.map(d => d.date).join(", ")}\n`;
  }
  if (designBlocks.length > 0) {
    text += `\n${designer} BOOKED DESIGN DAYS (avoid scheduling additional blocks on these dates):\n`;
    const byProject = {};
    designBlocks.forEach(d => {
      const p = d.project || "Other";
      if (!byProject[p]) byProject[p] = [];
      byProject[p].push(d.date);
    });
    Object.entries(byProject).forEach(([proj, dates]) => {
      text += `  ${proj}: ${dates.join(", ")}\n`;
    });
  }
  if (gregoryAbsences.length > 0) {
    text += `\nGREGORY AWAY (no client meetings): ${gregoryAbsences.join(", ")}\n`;
  }
  if (lastSync) {
    text += `\n(Calendar synced: ${new Date(lastSync).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })})\n`;
  }
  return text || `${designer} has no conflicts in this period.`;
}

const SCHEDULE_JSON_FORMAT = `
Respond ONLY with valid JSON (no markdown, no backticks, no extra text).
The JSON must have this exact shape:
{
  "schedule": [
    {
      "phase": "Pre-Design",
      "label": "RF Clark | Initial Meeting",
      "type": "meeting",
      "date": "2026-07-07",
      "startTime": "10:00",
      "endTime": "11:30",
      "days": 1,
      "notes": "1.5hr",
      "options": ["2026-07-07", "2026-07-08", "2026-07-09"]
    }
  ],
  "conflicts": [],
  "calendarNote": "✓ Calendar synced May 28"
}

Rules for the schedule array:
- Every event needs: phase, label, type (meeting|design|admin), date, days, notes
- Meetings need: startTime (HH:MM), endTime (HH:MM), options (3 conflict-free date strings)
- Design blocks need: days (number of consecutive days), no startTime/endTime needed
- Use RF [ClientName] | [Meeting Name] for client meetings
- Use Design [ClientName] | [Phase]-[BlockName] for design blocks
- dates are YYYY-MM-DD strings
`;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { action, clientName, projectType, contractDate, designer, events, revision, messages } = req.body;

  // ── generate_schedule ─────────────────────────────────────────────────────
  if (action === "generate_schedule") {
    const startDate = contractDate;
    const endDate = new Date(new Date(contractDate).getTime() + 200 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const [designerData, gregoryAbsences, lastSync] = await Promise.all([
      getDesignerAvailability(designer, startDate, endDate),
      getGregoryAbsences(startDate, endDate),
      getLastSyncTime(),
    ]);

    const calendarContext = formatAvailabilityForPrompt(designerData, gregoryAbsences, designer, lastSync);
    const calendarNote = lastSync
      ? `✓ Calendar synced ${new Date(lastSync).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}`
      : "⚠ Not synced — say 'sync calendar' in Chat to enable conflict checking";

    const prompt = `Generate a complete ${projectType === "furnishings" ? "Furnishings" : "ID Construction"} project schedule.

Client: ${clientName}
Contract date: ${contractDate}
Designer: ${designer}

${SCHEDULE_RULES}

REAL CALENDAR DATA — avoid scheduling on these dates:
${calendarContext}

${SCHEDULE_JSON_FORMAT}

Important:
- For each CLIENT MEETING provide 3 conflict-free date options in the "options" array
- Skip designer's booked days for design blocks
- Skip Gregory's away days for meetings
- No meetings on Mondays
- Follow the sequence exactly for ${projectType === "furnishings" ? "Furnishings" : "ID Construction"}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 4000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    const text = data.content?.find(b => b.type === "text")?.text || "{}";
    try {
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      return res.status(200).json({ ...parsed, calendarNote });
    } catch {
      return res.status(200).json({ error: "Parse error", schedule: [], calendarNote });
    }
  }

  // ── finalize_schedule ─────────────────────────────────────────────────────
  if (action === "finalize_schedule") {
    const eventsJson = JSON.stringify(events?.slice(0, 30) || []);

    const prompt = `You are finalizing a project schedule for ${clientName}. The user has reviewed and selected dates for all meetings. 

Here are the confirmed events (some may have selectedOption set to indicate which date was chosen):
${eventsJson}

Return the finalized schedule with all events having their final confirmed dates.

${SCHEDULE_JSON_FORMAT.replace('"options": ["2026-07-07", "2026-07-08", "2026-07-09"]', '"options": []')}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 4000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    const text = data.content?.find(b => b.type === "text")?.text || "{}";
    try {
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      return res.status(200).json(parsed);
    } catch {
      // If parse fails just return the events as-is
      return res.status(200).json({ schedule: events || [] });
    }
  }

  // ── revise_schedule ───────────────────────────────────────────────────────
  if (action === "revise_schedule") {
    const systemPrompt = `You are a scheduling assistant for Rose & Funk interior design studio. Help adjust project schedules based on feedback.
${SCHEDULE_RULES}
When asked to move or change events, return an updated schedule JSON.
If just answering a question, return a message only.
Be concise and specific with dates.`;

    const currentScheduleJson = JSON.stringify(events?.slice(0, 20) || []);
    const userMessage = `Current schedule: ${currentScheduleJson}\n\nRevision request: ${revision}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    const data = await response.json();
    const text = data.content?.find(b => b.type === "text")?.text || "";

    // Try to extract JSON schedule from response
    try {
      const jsonMatch = text.match(/\{[\s\S]*"schedule"[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return res.status(200).json({ schedule: parsed.schedule, message: "Schedule updated." });
      }
    } catch { /* fall through to text response */ }

    return res.status(200).json({ message: text });
  }

  return res.status(400).json({ error: "Unknown action" });
}
