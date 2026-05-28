// pages/api/schedule.js
export const config = { maxDuration: 60 };

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// ── Date Helpers ─────────────────────────────────────────────────────────────

// BC holidays 2026
const HOLIDAYS_2026 = new Set([
  "2026-01-01", "2026-02-16", "2026-04-03", "2026-05-18",
  "2026-07-01", "2026-08-03", "2026-09-07", "2026-10-12",
  "2026-11-11", "2026-12-25", "2026-12-26",
]);

const toYMD = (d) => d.toISOString().slice(0, 10);

const isHoliday = (d) => HOLIDAYS_2026.has(toYMD(d));

// Valid work day: Tue–Fri, not a holiday
const isWorkDay = (d) => {
  const day = d.getDay();
  return day >= 2 && day <= 5 && !isHoliday(d);
};

// Valid meeting day: Tue–Fri, not a holiday
const isMeetingDay = (d) => isWorkDay(d);

// Add n work days (skips Sun, Mon, holidays)
const addWorkDays = (date, n) => {
  let d = new Date(date);
  let added = 0;
  while (added < n) {
    d.setDate(d.getDate() + 1);
    if (isWorkDay(d)) added++;
  }
  return d;
};

// Next valid meeting day on or after date (prefer Friday for big mtgs)
const nextMeetingDay = (date, preferFriday = false) => {
  let d = new Date(date);
  if (preferFriday) {
    let search = new Date(d);
    for (let i = 0; i < 7; i++) {
      if (search.getDay() === 5 && isMeetingDay(search)) return search;
      search.setDate(search.getDate() + 1);
    }
  }
  while (!isMeetingDay(d)) d.setDate(d.getDate() + 1);
  return d;
};

// 3 meeting date options spaced out, all Tue–Fri, no holidays
const getMeetingOptions = (baseDate, count = 3) => {
  const options = [];
  let d = nextMeetingDay(new Date(baseDate));
  for (let i = 0; i < count; i++) {
    options.push(toYMD(d));
    // Space next option: if Fri skip to Tue, else add 2 days
    d = new Date(d);
    d.setDate(d.getDate() + (d.getDay() === 5 ? 4 : 2));
    while (!isMeetingDay(d)) d.setDate(d.getDate() + 1);
  }
  return options;
};

// Check if designer is booked on a date
const isDesignerBooked = (dateStr, bookedDays) => bookedDays.includes(dateStr);

// Next available work day for designer
const nextAvailableWorkDay = (date, bookedDays) => {
  let d = new Date(date);
  while (!isWorkDay(d) || isDesignerBooked(toYMD(d), bookedDays)) {
    d.setDate(d.getDate() + 1);
  }
  return d;
};

// ── Supabase helpers ─────────────────────────────────────────────────────────

async function getDesignerAvailability(designer, startDate, endDate) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return [];
  try {
    const url = `${SUPABASE_URL}/rest/v1/designer_availability?designer=eq.${designer.toLowerCase()}&date=gte.${startDate}&date=lte.${endDate}&select=date,type&order=date.asc`;
    const res = await fetch(url, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
    if (!res.ok) return [];
    return await res.json();
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

// ── Schedule Builders ─────────────────────────────────────────────────────────

function buildIDSchedule(clientName, contractDate, bookedDays, gregoryAbsences) {
  const schedule = [];
  const conflicts = [];
  let cursor = new Date(contractDate + "T12:00:00");

  const block = (phase, label, days, notes) => {
    cursor = nextAvailableWorkDay(addWorkDays(cursor, 1), bookedDays);
    const start = toYMD(cursor);
    // Advance cursor by remaining days
    for (let i = 1; i < days; i++) {
      cursor = nextAvailableWorkDay(addWorkDays(cursor, 1), bookedDays);
    }
    schedule.push({ phase, label: `Design ${clientName} | ${label}`, type: "design", date: start, days, notes });
  };

  const meeting = (phase, label, durationHrs, notes, preferFriday = false) => {
    // Meetings go after current cursor, skipping gregory away days
    let base = addWorkDays(cursor, 1);
    // Skip gregory away days for meetings
    while (!isMeetingDay(base) || gregoryAbsences.includes(toYMD(base))) {
      base.setDate(base.getDate() + 1);
    }
    const options = getMeetingOptions(base);
    // Filter out gregory away days from options
    const cleanOptions = options.filter(o => !gregoryAbsences.includes(o));
    while (cleanOptions.length < 3) {
      const last = new Date(cleanOptions[cleanOptions.length - 1] || toYMD(base));
      last.setDate(last.getDate() + 2);
      while (!isMeetingDay(last) || gregoryAbsences.includes(toYMD(last))) last.setDate(last.getDate() + 1);
      cleanOptions.push(toYMD(last));
    }
    const hour = durationHrs >= 3 ? 11 : 10;
    const endHour = hour + Math.ceil(durationHrs);
    schedule.push({
      phase, label: `RF ${clientName} | ${label}`, type: "meeting",
      date: cleanOptions[0], startTime: `${String(hour).padStart(2,"0")}:00`,
      endTime: `${String(endHour).padStart(2,"0")}:00`,
      days: 1, notes, options: cleanOptions, selectedOption: 0,
    });
    cursor = new Date(cleanOptions[0] + "T12:00:00");
  };

  // PRE-DESIGN
  block("Pre-Design", "Initial Drawing Set Up", 2, "Designer — 2 days");

  // PHASE 1
  meeting("Phase 1", "Initial Meeting", 1.5, "Gregory + Designer + Client · 1.5 hrs");
  block("Phase 1", "Aesthetic Direction", 2, "Gregory OFF · Designer invited");
  meeting("Phase 1", "Aesthetic Direction Meeting", 1.5, "Gregory + Designer + Client · 1.5 hrs");
  meeting("Phase 1", "Appliance & Plumbing Meeting", 4, "Gregory + Designer + Client · 4 hrs");

  // PHASE 2
  block("Phase 2", "Team Material Concept", 2, "Gregory OFF · Designer invited");
  block("Phase 2", "Complete Material Boards", 2, "Designer");
  block("Phase 2", "Lighting Concept Boards", 1, "Designer");
  block("Phase 2", "Sketch Elevations", 1, "Gregory OFF · Designer invited");
  block("Phase 2", "Elevations in AutoCAD", 2, "Designer");
  meeting("Phase 2", "Concept Elevation & Material Meeting", 4, "Gregory + Designer + Client · 4 hrs · Prefer Friday 11am or 1pm", true);

  // PHASE 3
  block("Phase 3", "Concept Revisions & Material Boards", 2, "Designer");
  block("Phase 3", "Documentation", 3, "Designer");
  block("Phase 3", "Concept Exterior", 1, "2 hrs Gregory");
  meeting("Phase 3", "Material Confirmation Meeting", 3, "Gregory + Designer + Client · 3 hrs · Prefer Friday 11am or 1pm", true);

  // PHASE 4 — 3D rendering window (15 calendar days)
  const renderStart = addWorkDays(cursor, 2);
  const renderEnd = new Date(renderStart);
  renderEnd.setDate(renderEnd.getDate() + 15);
  cursor = renderEnd;
  schedule.push({
    phase: "Phase 4", label: `Design ${clientName} | 3D Rendering (external)`,
    type: "design", date: toYMD(renderStart), days: 15,
    notes: "2–3 weeks external rendering · client review period",
  });

  block("Phase 4", "Material Confirmation Revisions", 1, "Designer");
  block("Phase 4", "Complete Remaining Elevations", 3, "Designer");
  block("Phase 4", "Drawing Details", 1, "Designer");
  block("Phase 4", "Dimensioning & Noting Elevations", 2, "Designer");
  block("Phase 4", "Plan Layouts", 5, "Designer");
  meeting("Phase 4", "Final Review Meeting", 3, "Gregory + Designer + Client · 3 hrs · Prefer Friday 11am or 1pm", true);

  // POST FINAL
  block("Post Final", "Client Adjustments + Send for Sign-off", 1, "Designer");
  block("Post Final", "Final Adjustments + Send to Print", 1, "Designer");
  block("Post Final", "Review Drawings & Gather", 1, "Gregory OFF · Designer invited");
  block("Post Final", "All Final Edits + Send to Client", 3, "Designer");

  return { schedule, conflicts };
}

function buildFurnishingsSchedule(clientName, contractDate, bookedDays, gregoryAbsences) {
  const schedule = [];
  const conflicts = [];
  let cursor = new Date(contractDate + "T12:00:00");

  const block = (phase, label, days, notes) => {
    cursor = nextAvailableWorkDay(addWorkDays(cursor, 1), bookedDays);
    const start = toYMD(cursor);
    for (let i = 1; i < days; i++) cursor = nextAvailableWorkDay(addWorkDays(cursor, 1), bookedDays);
    schedule.push({ phase, label: `Design ${clientName} | ${label}`, type: "design", date: start, days, notes });
  };

  const meeting = (phase, label, durationHrs, notes, preferFriday = false) => {
    let base = addWorkDays(cursor, 1);
    while (!isMeetingDay(base) || gregoryAbsences.includes(toYMD(base))) base.setDate(base.getDate() + 1);
    const options = getMeetingOptions(base).filter(o => !gregoryAbsences.includes(o));
    while (options.length < 3) {
      const last = new Date(options[options.length - 1]);
      last.setDate(last.getDate() + 2);
      while (!isMeetingDay(last) || gregoryAbsences.includes(toYMD(last))) last.setDate(last.getDate() + 1);
      options.push(toYMD(last));
    }
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
  block("Pre-Design", "Drawing File Set-Up", 2, "Admin + Designer");

  // PHASE 1
  meeting("Phase 1 | Concept", "Initial Meeting", 1.5, "Gregory + Designer + Client · 1.5 hrs");
  block("Phase 1 | Concept", "Sourcing", 2, "Gregory OFF both days · Designer");
  block("Phase 1 | Concept", "Furniture Mood Boards", 3, "Designer 3 days · 1 day Gregory review");
  block("Phase 1 | Concept", "Furniture Pricing", 1, "Designer");
  meeting("Phase 1 | Concept", "Furniture Meeting", 2, "Gregory + Designer + Client · 2 hrs");
  block("Phase 1 | Concept", "Furniture Meeting Revisions", 1, "Designer");

  // PHASE 2
  block("Phase 2 | Finalize", "Enter Selections into Gather", 1, "Designer");
  block("Phase 2 | Finalize", "Order Samples", 1, "Designer");
  meeting("Phase 2 | Finalize", "Furniture & Fabric Confirmation Meeting", 1.5, "Gregory + Designer + Client · 1.5 hrs · ON SITE");
  block("Phase 2 | Finalize", "Confirmation Meeting Revisions", 1, "Designer");

  // PHASE 3
  block("Phase 3 | Accessories", "Art Sourcing", 2, "Gregory OFF · Designer");
  block("Phase 3 | Accessories", "Art & Accessory Concept Boards", 2, "Designer");
  meeting("Phase 3 | Accessories", "Art & Accessory Concept Meeting", 1.5, "Gregory + Designer + Client · 1.5 hrs");
  block("Phase 3 | Accessories", "Art & Accessory Board Revisions", 1, "Designer");

  // PHASE 4 — 14 days for delivery/orders
  cursor = addWorkDays(cursor, 14);
  meeting("Phase 4 | Installation", "Furniture Set-Up Day", 7, "Gregory + Designer · Full day on site");
  meeting("Phase 4 | Installation", "Accessory Install Day", 7, "Gregory + Designer · Full day on site");
  meeting("Phase 4 | Installation", "Photoshoot Day", 6, "Gregory + Designer + Photographer");

  return { schedule, conflicts };
}

// ── Handler ───────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { action, clientName, projectType, contractDate, designer, events, revision } = req.body;

  if (action === "generate_schedule") {
    const startDate = contractDate;
    const endDate = new Date(new Date(contractDate + "T12:00:00").getTime() + 220 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const [availData, lastSync] = await Promise.all([
      getDesignerAvailability(designer, startDate, endDate),
      getLastSyncTime(),
    ]);

    const bookedDays = availData.filter(d => d.type === "design_block").map(d => d.date);
    const gregoryAbsences = availData.filter(d => d.type === "absence" && d.designer === "gregory").map(d => d.date);

    // Also fetch gregory absences separately
    let gregAbs = [];
    if (SUPABASE_URL && SUPABASE_KEY) {
      try {
        const url = `${SUPABASE_URL}/rest/v1/designer_availability?designer=eq.gregory&date=gte.${startDate}&date=lte.${endDate}&type=eq.absence&select=date`;
        const r = await fetch(url, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
        if (r.ok) gregAbs = (await r.json()).map(d => d.date);
      } catch {}
    }

    const calendarNote = lastSync
      ? `✓ Calendar synced ${new Date(lastSync).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}`
      : "⚠ Not synced — say 'sync calendar' in Chat";

    const result = projectType === "furnishings"
      ? buildFurnishingsSchedule(clientName, contractDate, bookedDays, gregAbs)
      : buildIDSchedule(clientName, contractDate, bookedDays, gregAbs);

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
        system: `You are a scheduling assistant for Rose & Funk interior design studio. Help adjust project schedules. Rules: no meetings on Mondays, client meetings Tue-Fri only, skip BC holidays. Be concise and give specific dates.`,
        messages: [{
          role: "user",
          content: `Current schedule (JSON): ${JSON.stringify((events || []).slice(0, 20))}\n\nRevision request: "${revision}"\n\nIf updating schedule, reply with JSON: {"schedule": [...same structure with updated dates...], "message": "what changed"}. Otherwise reply with plain text.`
        }],
      }),
    });

    const data = await response.json();
    const text = data.content?.find(b => b.type === "text")?.text || "";

    try {
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      if (start !== -1 && end > start) {
        const parsed = JSON.parse(text.slice(start, end + 1));
        if (parsed.schedule) return res.status(200).json({ schedule: parsed.schedule, message: parsed.message || "Schedule updated." });
      }
    } catch {}

    return res.status(200).json({ message: text });
  }

  return res.status(400).json({ error: "Unknown action" });
}
