// pages/api/schedule.js
export const config = { maxDuration: 60 };

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
- "Gregory OFF" days: no client meetings, no design team days. Design blocks can still happen if designer is working.
- Gregory away Jun 24–26 (no meetings those dates)

FURNISHINGS SEQUENCE:
Pre-Design: Drawing File Set-Up (2 days designer only)
Phase 1 Concept: Initial Meeting (1.5hr) → Sourcing (2 days, Gregory OFF) → Mood Boards (3 days) → Pricing (1 day) → Furniture Meeting (2hr) → Revisions (1 day)
Phase 2 Finalize: Enter Gather (1 day) → Order Samples (1 day) → Fabric Confirmation Meeting on site (1.5hr) → Revisions (1 day) → Sign-off → Order
Phase 3 Accessories: Art Sourcing (2 days, Gregory OFF) → Concept Boards (2 days) → Art Meeting (1.5hr) → Revisions (1 day) → Sign-off → Order
Phase 4 Install: Furniture Setup Day → Accessory Install Day → Photoshoot

ID CONSTRUCTION SEQUENCE:
Pre-Design: Initial Drawing Set Up (2 days)
Phase 1: Initial Meeting (1.5hr) → Aesthetic Direction (2 days) → Aesthetic Direction Meeting (1.5hr) → Appliance & Plumbing Meeting (4hr)
Phase 2: Team Material Concept (2 days, Gregory + designer) → Complete Material Boards (2 days) → Lighting Concept Boards (1 day) → Sketch Elevations (1 day) → Elevations in AutoCAD (2 days) → Concept Elevation & Material Meeting (4hr)
Phase 3: Concept Revisions & Material Boards (2 days) → Documentation (3 days) → Concept Exterior (1 day) → Material Confirmation Meeting (3hr)
Phase 4: [15 day 3D rendering window, design continues] → Material Confirmation Revisions (1 day) → Complete Remaining Elevations (3 days) → Drawing Details (1 day) → Dimensioning & Noting Elevations (2 days) → Plan Layouts (5 days) → Final Review Meeting (3hr)
Post Final: Make Client Adjustments + Send to Client (1 day) → Make Final Adjustments + Send to Print (1 day) → Review Drawings & Gather (1 day) → All Final Edits + Send to Client (3 days)

EVENT NAMING:
- Client meetings: "RF [ClientName] | [Meeting Name]"
- Design blocks: "Design [ClientName] | [Phase#]-[Block Name]"

PAYMENT SCHEDULE (ID Construction):
- Phase 1 invoice: 15 days before Phase 2 begins
- Phase 2 invoice: 15 days before Phase 3 begins
- Phase 3 invoice: 15 days before Phase 4 begins
- Phase 4 invoice: 15 days before Phase 5 begins
`;

async function getCalendarAvailability(startDate, endDate, baseUrl) {
  try {
    const res = await fetch(`${baseUrl}/api/calendar-availability`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startDate, endDate }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch calendar availability:", err);
    return null;
  }
}

function formatBusyDaysForPrompt(availability, designer) {
  if (!availability) return "Calendar data unavailable — use scheduling rules only.";

  const busyDays = availability.designerBusyDays?.[designer.toLowerCase()] || [];
  const gregoryBusy = availability.gregorBusyDays || [];

  let text = "";

  if (busyDays.length > 0) {
    text += `\n${designer} ALREADY BOOKED (design blocks on these dates — avoid scheduling additional design blocks, but client meetings are OK if Gregory is free):\n`;
    text += busyDays.join(", ") + "\n";
  } else {
    text += `\n${designer}: No existing design blocks found in this period.\n`;
  }

  if (gregoryBusy.length > 0) {
    text += `\nGREGORY AWAY (no meetings on these dates):\n`;
    text += gregoryBusy.join(", ") + "\n";
  }

  if (availability.clientMeetings?.length > 0) {
    text += `\nEXISTING CLIENT MEETINGS (for context — avoid double-booking Gregory):\n`;
    availability.clientMeetings.slice(0, 30).forEach((m) => {
      text += `  ${m.date} ${m.time !== "all-day" ? m.time : ""}: ${m.title}\n`;
    });
  }

  return text;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { action, clientName, projectType, contractDate, designer, selectedDates, messages, baseUrl } = req.body;

  // ── COMPARE: generate schedule for both designers ──────────────────────────
  if (action === "compare") {
    const startDate = contractDate;
    const endDate = new Date(new Date(contractDate).getTime() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    // Fetch real calendar availability
    const availability = await getCalendarAvailability(startDate, endDate, baseUrl || `https://${req.headers.host}`);
    const calendarNote = availability
      ? "✓ Real calendar data loaded"
      : "⚠ Calendar unavailable — using rules only";

    const designers = projectType === "furnishings"
      ? ["Chloe", "Stephanie"]
      : ["Chloe", "Stephanie"];

    const comparePromises = designers.map(async (d) => {
      const calendarContext = formatBusyDaysForPrompt(availability, d);

      const prompt = `You are scheduling a new ${projectType === "furnishings" ? "Furnishings" : "ID Construction"} project for client "${clientName}". Contract date: ${contractDate}.

Designer being evaluated: ${d}

${SCHEDULE_RULES}

REAL CALENDAR DATA FOR THIS PERIOD:
${calendarContext}

Generate a complete project schedule for ${d} starting from ${contractDate}.
- Skip any dates where ${d} already has design blocks (listed above) — those days are taken
- Skip any dates where Gregory is away for client meetings
- Follow the sequence exactly
- No meetings on Mondays
- Respect all rules above

Respond in this exact JSON format (no markdown, no backticks):
{
  "designer": "${d}",
  "completionDate": "YYYY-MM-DD",
  "totalWeeks": number,
  "phases": [
    {
      "phase": "Phase name",
      "items": [
        { "name": "Event name", "date": "YYYY-MM-DD", "type": "meeting|design|admin", "duration": "1.5hr|4hr|all-day|etc" }
      ]
    }
  ],
  "conflicts": ["Any real conflicts found with existing calendar — list them here"],
  "notes": "Any scheduling notes"
}`;

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
      const text = data.content?.find((b) => b.type === "text")?.text || "{}";
      try {
        const clean = text.replace(/```json|```/g, "").trim();
        return JSON.parse(clean);
      } catch {
        return { designer: d, error: "Failed to parse schedule", raw: text };
      }
    });

    const [schedule1, schedule2] = await Promise.all(comparePromises);
    return res.status(200).json({ schedules: [schedule1, schedule2], calendarNote });
  }

  // ── GENERATE: full schedule for chosen designer ────────────────────────────
  if (action === "generate") {
    const startDate = contractDate;
    const endDate = new Date(new Date(contractDate).getTime() + 200 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const availability = await getCalendarAvailability(startDate, endDate, baseUrl || `https://${req.headers.host}`);
    const calendarContext = formatBusyDaysForPrompt(availability, designer);

    const prompt = `You are scheduling a new ${projectType === "furnishings" ? "Furnishings" : "ID Construction"} project for client "${clientName}". Contract date: ${contractDate}. Assigned designer: ${designer}.

${SCHEDULE_RULES}

REAL CALENDAR DATA FOR THIS PERIOD:
${calendarContext}

Generate the COMPLETE project schedule. For each client meeting, provide 3 date options (option A, B, C) that are all conflict-free.

Respond in this exact JSON format (no markdown, no backticks):
{
  "designer": "${designer}",
  "clientName": "${clientName}",
  "contractDate": "${contractDate}",
  "completionDate": "YYYY-MM-DD",
  "calendarDataUsed": true,
  "conflicts": ["List any real conflicts you had to work around"],
  "phases": [
    {
      "phase": "Phase name",
      "items": [
        {
          "name": "Event name (use RF naming for client meetings, Design naming for blocks)",
          "type": "meeting|design|admin",
          "duration": "1.5hr|3hr|4hr|all-day",
          "dateOptions": ["YYYY-MM-DD", "YYYY-MM-DD", "YYYY-MM-DD"],
          "time": "10:00am|11:00am|1:00pm|all-day",
          "notes": "optional note"
        }
      ]
    }
  ]
}`;

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
    const text = data.content?.find((b) => b.type === "text")?.text || "{}";
    try {
      const clean = text.replace(/```json|```/g, "").trim();
      const schedule = JSON.parse(clean);
      return res.status(200).json({ schedule, calendarNote: availability ? "✓ Real calendar data used" : "⚠ Calendar unavailable" });
    } catch {
      return res.status(200).json({ error: "Parse error", raw: text });
    }
  }

  // ── REVISE: adjust schedule based on Jenny's feedback ─────────────────────
  if (action === "revise") {
    const systemPrompt = `You are a scheduling assistant for Rose & Funk interior design studio. 
You help adjust project schedules based on feedback. 
${SCHEDULE_RULES}
Respond conversationally but always include specific dates when suggesting changes.
If the user confirms a date, acknowledge it clearly.
Keep responses concise.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1000,
        system: systemPrompt,
        messages: messages || [],
      }),
    });

    const data = await response.json();
    const text = data.content?.find((b) => b.type === "text")?.text || "Sorry, I couldn't process that.";
    return res.status(200).json({ text });
  }

  return res.status(400).json({ error: "Unknown action" });
}
