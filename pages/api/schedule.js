// pages/api/schedule.js
export const config = { maxDuration: 60 };

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// ── BC Holidays 2026 ──────────────────────────────────────────────────────────
const HOLIDAYS = new Set([
  "2026-01-01","2026-02-16","2026-04-03","2026-05-18",
  "2026-07-01","2026-08-03","2026-09-07","2026-10-12",
  "2026-11-11","2026-12-25","2026-12-26",
]);

const toYMD = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// Valid meeting day: Tue–Fri, no holidays
const isMeetingDay = (d) => {
  const day = d.getDay();
  return day >= 2 && day <= 5 && !HOLIDAYS.has(toYMD(d));
};

// Advance to next valid meeting day (Tue–Fri, no holidays)
const nextMeetingDay = (date) => {
  const d = new Date(date);
  while (!isMeetingDay(d)) d.setDate(d.getDate() + 1);
  return d;
};

// Next Friday that's a valid meeting day (within 10 days)
const nextFriday = (date) => {
  const d = new Date(date);
  for (let i = 0; i < 10; i++) {
    if (d.getDay() === 5 && isMeetingDay(d)) return d;
    d.setDate(d.getDate() + 1);
  }
  return nextMeetingDay(date);
};

// Add n work days (Tue–Fri, no holidays, optionally skip bookedDays)
const addWorkDays = (date, n, bookedDays = []) => {
  const d = new Date(date);
  let added = 0;
  while (added < n) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();
    const ymd = toYMD(d);
    if (day >= 2 && day <= 5 && !HOLIDAYS.has(ymd) && !bookedDays.includes(ymd)) {
      added++;
    }
  }
  return d;
};

// Get 3 meeting date options — always Tue–Fri, no holidays, no gregory away
const getMeetingOptions = (baseDate, gregoryAbsences = []) => {
  const options = [];
  let d = nextMeetingDay(new Date(baseDate));
  while (gregoryAbsences.includes(toYMD(d))) {
    d.setDate(d.getDate() + 1);
    d = nextMeetingDay(d);
  }
  while (options.length < 3) {
    if (isMeetingDay(d) && !gregoryAbsences.includes(toYMD(d))) {
      options.push(toYMD(d));
    }
    // Always advance through nextMeetingDay to guarantee Tue-Fri
    d.setDate(d.getDate() + 1);
    d = nextMeetingDay(d);
  }
  return options;
};

// ── Supabase ──────────────────────────────────────────────────────────────────
async function fetchAvailability(designer, startDate, endDate) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return { bookedDays: [], absences: [] };
  try {
    const url = `${SUPABASE_URL}/rest/v1/designer_availability?designer=eq.${designer.toLowerCase()}&date=gte.${startDate}&date=lte.${endDate}&select=date,type&order=date.asc`;
    const res = await fetch(url, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
    if (!res.ok) return { bookedDays: [], absences: [] };
    const data = await res.json();
    return {
      bookedDays: data.filter(d => d.type === "design_block").map(d => d.date),
      absences: data.filter(d => d.type === "absence").map(d => d.date),
    };
  } catch { return { bookedDays: [], absences: [] }; }
}

async function fetchGregoryAbsences(startDate, endDate) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return [];
  try {
    const url = `${SUPABASE_URL}/rest/v1/designer_availability?designer=eq.gregory&date=gte.${startDate}&date=lte.${endDate}&type=eq.absence&select=date`;
    const res = await fetch(url, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
    if (!res.ok) return [];
    return (await res.json()).map(d => d.date);
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

// ── ID Construction Schedule ──────────────────────────────────────────────────
function buildIDSchedule(clientName, contractDate, bookedDays, gregoryAbsences) {
  const schedule = [];
  const conflicts = [];
  // cursor tracks the END of the last event placed
  let cursor = new Date(contractDate + "T12:00:00");

  // Place a design block, advancing by `offsetDays` work days first
  const block = (phase, label, days, notes, offsetDays = 1) => {
    cursor = addWorkDays(cursor, offsetDays, bookedDays);
    // If still on a booked day, keep advancing
    while (bookedDays.includes(toYMD(cursor))) {
      conflicts.push(`${toYMD(cursor)} skipped (designer booked) for: ${label}`);
      cursor = addWorkDays(cursor, 1, bookedDays);
    }
    const startYMD = toYMD(cursor);
    // Advance cursor through remaining days of the block
    for (let i = 1; i < days; i++) {
      cursor = addWorkDays(cursor, 1, bookedDays);
    }
    schedule.push({ phase, label: `Design ${clientName} | ${label}`, type: "design", date: startYMD, days, notes });
  };

  // Place a meeting, advancing by `offsetDays` work days from cursor first
  const meeting = (phase, label, durationHrs, notes, offsetDays = 1, preferFriday = false) => {
    let base = addWorkDays(cursor, offsetDays);
    base = nextMeetingDay(base);
    while (gregoryAbsences.includes(toYMD(base))) {
      base.setDate(base.getDate() + 1);
      base = nextMeetingDay(base);
    }
    if (preferFriday) base = nextFriday(base);
    const options = getMeetingOptions(base, gregoryAbsences);
    const hour = durationHrs >= 3 ? 11 : 10;
    const endHour = hour + Math.ceil(durationHrs);
    schedule.push({
      phase, label: `RF ${clientName} | ${label}`, type: "meeting",
      date: options[0],
      startTime: `${String(hour).padStart(2,"0")}:00`,
      endTime: `${String(endHour).padStart(2,"0")}:00`,
      days: 1, notes, options, selectedOption: 0,
    });
    // cursor moves to the meeting day
    cursor = new Date(options[0] + "T12:00:00");
  };

  // PRE-DESIGN: start next work day after contract
  block("Pre-Design", "Initial Drawing Set Up", 2, "Designer — 2 days", 1);

  // PHASE 1: Initial Meeting 3 work days after drawing set up
  meeting("Phase 1", "Initial Meeting", 1.5, "Gregory + Designer + Client · 1.5 hrs", 3);
  // Aesthetic Direction work: 1 day after meeting
  block("Phase 1", "Aesthetic Direction", 2, "Gregory OFF · Designer invited", 1);
  // Aesthetic Direction Meeting: 1 day after block
  meeting("Phase 1", "Aesthetic Direction Meeting", 1.5, "Gregory + Designer + Client · 1.5 hrs", 1);
  // Appliance & Plumbing: 2 days after previous meeting
  meeting("Phase 1", "Appliance & Plumbing Meeting", 4, "Gregory + Designer + Client · 4 hrs", 2);

  // PHASE 2: 2 days after A&P meeting
  block("Phase 2", "Team Material Concept", 2, "Gregory OFF · Designer invited", 2);
  block("Phase 2", "Complete Material Boards", 2, "Designer", 1);
  block("Phase 2", "Lighting Concept Boards", 1, "Designer", 1);
  block("Phase 2", "Sketch Elevations", 1, "Gregory OFF · Designer invited", 1);
  block("Phase 2", "Elevations in AutoCAD", 2, "Designer", 1);
  // Concept Elevation meeting: 1 day after block, prefer Friday
  meeting("Phase 2", "Concept Elevation & Material Meeting", 4,
    "Gregory + Designer + Client · 4 hrs · Prefer Friday 11am or 1pm", 1, true);

  // PHASE 3: 2 days after meeting
  block("Phase 3", "Concept Revisions & Material Boards", 2, "Designer", 2);
  block("Phase 3", "Documentation", 3, "Designer", 1);
  block("Phase 3", "Concept Exterior", 1, "2 hrs Gregory", 1);
  // Material Confirmation: 1 day after block, prefer Friday
  meeting("Phase 3", "Material Confirmation Meeting", 3,
    "Gregory + Designer + Client · 3 hrs · Prefer Friday 11am or 1pm", 1, true);

  // PHASE 4: 3D rendering — 15 calendar days starting 2 days after meeting
  const renderStart = new Date(cursor);
  renderStart.setDate(renderStart.getDate() + 2);
  schedule.push({
    phase: "Phase 4", label: `Design ${clientName} | 3D Rendering (external)`,
    type: "design", date: toYMD(renderStart), days: 15,
    notes: "2–3 weeks external rendering · client review period",
  });
  // cursor jumps 15 calendar days forward
  cursor = new Date(renderStart);
  cursor.setDate(cursor.getDate() + 15);

  block("Phase 4", "Material Confirmation Revisions", 1, "Designer", 1);
  // 3 client review days before remaining elevations (offsetFromPrev: 4 in frontend)
  block("Phase 4", "Complete Remaining Elevations", 3, "Designer", 4);
  block("Phase 4", "Drawing Details", 1, "Designer", 1);
  block("Phase 4", "Dimensioning & Noting Elevations", 2, "Designer", 1);
  block("Phase 4", "Plan Layouts", 5, "Designer", 1);
  // Final Review: 1 day after last block, prefer Friday
  meeting("Phase 4", "Final Review Meeting", 3,
    "Gregory + Designer + Client · 3 hrs · Prefer Friday 11am or 1pm", 1, true);

  // POST FINAL: 3 days gap for client review
  block("Post Final", "Client Adjustments + Send for Sign-off", 1, "Designer", 3);
  // 4 days gap (3 client review days)
  block("Post Final", "Final Adjustments + Send to Print", 1, "Designer", 4);
  block("Post Final", "Review Drawings & Gather", 1, "Gregory OFF · Designer invited", 1);
  block("Post Final", "All Final Edits + Send to Client", 3, "Designer", 1);

  return { schedule, conflicts };
}

// ── Furnishings Schedule ──────────────────────────────────────────────────────
function buildFurnishingsSchedule(clientName, contractDate, bookedDays, gregoryAbsences) {
  const schedule = [];
  const conflicts = [];
  let cursor = new Date(contractDate + "T12:00:00");

  const block = (phase, label, days, notes, offsetDays = 1) => {
    cursor = addWorkDays(cursor, offsetDays, bookedDays);
    while (bookedDays.includes(toYMD(cursor))) {
      conflicts.push(`${toYMD(cursor)} skipped (designer booked) for: ${label}`);
      cursor = addWorkDays(cursor, 1, bookedDays);
    }
    const startYMD = toYMD(cursor);
    for (let i = 1; i < days; i++) cursor = addWorkDays(cursor, 1, bookedDays);
    schedule.push({ phase, label: `Design ${clientName} | ${label}`, type: "design", date: startYMD, days, notes });
  };

  const meeting = (phase, label, durationHrs, notes, offsetDays = 1, preferFriday = false) => {
    let base = addWorkDays(cursor, offsetDays);
    base = nextMeetingDay(base);
    while (gregoryAbsences.includes(toYMD(base))) { base.setDate(base.getDate() + 1); base = nextMeetingDay(base); }
    if (preferFriday) base = nextFriday(base);
    const options = getMeetingOptions(base, gregoryAbsences);
    const hour = durationHrs >= 3 ? 11 : 10;
    schedule.push({
      phase, label: `RF ${clientName} | ${label}`, type: "meeting",
      date: options[0], startTime: `${String(hour).padStart(2,"0")}:00`,
      endTime: `${String(hour + Math.ceil(durationHrs)).padStart(2,"0")}:00`,
      days: 1, notes, options, selectedOption: 0,
    });
    cursor = new Date(options[0] + "T12:00:00");
  };

  // PRE-DESIGN
  block("Pre-Design", "Drawing File Set-Up", 2, "Admin + Designer", 1);

  // PHASE 1
  meeting("Phase 1 | Concept", "Initial Meeting", 1.5, "Gregory + Designer + Client · 1.5 hrs", 3);
  block("Phase 1 | Concept", "Sourcing", 2, "Gregory OFF both days · Designer", 1);
  block("Phase 1 | Concept", "Furniture Mood Boards", 3, "Designer 3 days · 1 day Gregory review", 1);
  block("Phase 1 | Concept", "Furniture Pricing", 1, "Designer", 1);
  meeting("Phase 1 | Concept", "Furniture Meeting", 2, "Gregory + Designer + Client · 2 hrs", 1);
  block("Phase 1 | Concept", "Furniture Meeting Revisions", 1, "Designer", 1);

  // PHASE 2
  block("Phase 2 | Finalize", "Enter Selections into Gather", 1, "Designer", 1);
  block("Phase 2 | Finalize", "Order Samples", 1, "Designer", 1);
  meeting("Phase 2 | Finalize", "Furniture & Fabric Confirmation Meeting", 1.5,
    "Gregory + Designer + Client · 1.5 hrs · ON SITE", 2);
  block("Phase 2 | Finalize", "Confirmation Meeting Revisions", 1, "Designer", 1);

  // PHASE 3
  block("Phase 3 | Accessories", "Art Sourcing", 2, "Gregory OFF · Designer", 2);
  block("Phase 3 | Accessories", "Art & Accessory Concept Boards", 2, "Designer", 1);
  meeting("Phase 3 | Accessories", "Art & Accessory Concept Meeting", 1.5,
    "Gregory + Designer + Client · 1.5 hrs", 1);
  // 3 business day client review before revisions (offsetFromPrev: 4)
  block("Phase 3 | Accessories", "Art & Accessory Board Revisions", 1, "Designer", 4);

  // PHASE 4: ~14 calendar days for orders/delivery
  cursor.setDate(cursor.getDate() + 14);
  meeting("Phase 4 | Installation", "Furniture Set-Up Day", 7, "Gregory + Designer · Full day on site", 1);
  meeting("Phase 4 | Installation", "Accessory Install Day", 7, "Gregory + Designer · Full day on site", 2);
  meeting("Phase 4 | Installation", "Photoshoot Day", 6, "Gregory + Designer + Photographer", 3);

  return { schedule, conflicts };
}

// ── Handler ───────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { action, clientName, projectType, contractDate, designer, events, revision } = req.body;

  if (action === "generate_schedule") {
    const endDate = new Date(new Date(contractDate + "T12:00:00").getTime() + 220 * 24 * 60 * 60 * 1000)
      .toISOString().slice(0, 10);

    const [{ bookedDays }, gregoryAbsences, lastSync] = await Promise.all([
      fetchAvailability(designer, contractDate, endDate),
      fetchGregoryAbsences(contractDate, endDate),
      getLastSyncTime(),
    ]);

    const calendarNote = lastSync
      ? `✓ Calendar synced ${new Date(lastSync).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}`
      : "⚠ Not synced — say 'sync calendar' in Chat";

    const result = projectType === "furnishings"
      ? buildFurnishingsSchedule(clientName, contractDate, bookedDays, gregoryAbsences)
      : buildIDSchedule(clientName, contractDate, bookedDays, gregoryAbsences);

    return res.status(200).json({ ...result, calendarNote });
  }

  if (action === "finalize_schedule") {
    return res.status(200).json({ schedule: events || [] });
  }

  if (action === "revise_schedule") {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 2000,
        system: `You are a scheduling assistant for Rose & Funk interior design studio. Help adjust project schedules based on user requests. Rules: no meetings on Mondays or Sundays, client meetings Tue-Fri only, skip BC holidays. Keep responses concise and conversational. When moving dates, give the new specific dates.`,
        messages: [{
          role: "user",
          content: `Current schedule (JSON): ${JSON.stringify((events || []).slice(0, 20))}\n\nRevision request: "${revision}"\n\nIf you need to update the schedule, reply with this exact JSON structure:\n{"schedule": [...events with updated dates as YYYY-MM-DD strings...], "message": "Brief description of what changed"}\n\nOtherwise just reply with a helpful plain text message.`,
        }],
      }),
    });
    const data = await response.json();
    const text = data.content?.find(b => b.type === "text")?.text || "";
    try {
      const s = text.indexOf("{"), e = text.lastIndexOf("}");
      if (s !== -1 && e > s) {
        const parsed = JSON.parse(text.slice(s, e + 1));
        if (parsed.schedule) return res.status(200).json({ schedule: parsed.schedule, message: parsed.message || "Schedule updated." });
      }
    } catch {}
    return res.status(200).json({ message: text });
  }

  return res.status(400).json({ error: "Unknown action" });
}
