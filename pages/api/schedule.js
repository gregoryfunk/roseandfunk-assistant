const SCHEDULE_RULES = `
You are Jenny's scheduling assistant for Rose & Funk Interiors. You have full knowledge of the scheduling rules:

GLOBAL RULES:
- NO meetings on Mondays ever
- Client meetings: Tuesday to Friday only
- Big presentations (4hr meetings): 11am or 13:00 start, never later than 14:00
- Design blocks (Gregory off): 09:00-17:00
- All times are America/Vancouver (Pacific)
- Designers for ID Construction: Chloe + Stephanie
- Designer for Furnishings: Lillian

ID CONSTRUCTION SCHEDULE SEQUENCE (42 days / 8.5 weeks):
PRE-DESIGN:
- 3 days: Drawing Set-up (design block)

PHASE 1:
- Initial Meeting (1.5 hrs) - CLIENT MEETING - options needed
- 2 days: Aesthetic Direction (Gregory OFF 9-4, design block)
- Aesthetic Direction Meeting (1.5 hrs) - CLIENT MEETING - options needed
- Appliance + Plumbing Meeting (4 hrs) - CLIENT MEETING - options needed
- 1 rest day

PHASE 2:
- 2 days: Team Material Concept (Gregory OFF, design block)
- 2 days: Complete Material Boards (design block)
- 2 days: Lighting Concept Boards (design block)
- 1 day: Sketch Elevations (Gregory OFF, design block)
- 2 days: Elevations in AutoCAD (design block)
- Concept Elevation + Material Meeting (4 hrs) - CLIENT MEETING - options needed - PREFER FRIDAY BUT ANY TUE-FRI IS FINE
- 1 rest day

PHASE 3:
- 2 days: Concept Revisions + Material Boards (design block)
- 3 days: Documentation (design block)
- 1 day: Concept Exterior (design block)
- Material Confirmation Meeting (3 hrs) - CLIENT MEETING - options needed - PREFER FRIDAY BUT ANY TUE-FRI IS FINE
- 1 rest day

PHASE 4:
- 15 working days: 3D Rendering period (external wait, no team blocks)
- 1 day: Material Confirmation Revisions (design block)
- 3 days: client review window (no blocks)
- 3 days: Complete Remaining Elevations (design block)
- 1 day: Drawing Details (design block)
- 2 days: Dimension + Noting Elevations (design block)
- 5 days: Plan Layouts (design block)
- Final Review Meeting (3 hrs) - CLIENT MEETING - options needed - PREFER FRIDAY BUT ANY TUE-FRI IS FINE
- 2 rest days

POST FINAL:
- 1 day: Client Adjustments (design block)
- 3 days: client review window
- 2 days: Final Adjustments + Send to Print (design block)
- 1 day: Review Drawings + Gather (Gregory OFF, design block)
- 3 days: All Final Edits + Send to Client (design block)

FURNISHINGS SCHEDULE SEQUENCE:
PRE-DESIGN:
- 1 day: Drawing File Set-up (admin block)

PHASE 1 | CONCEPT (3 weeks):
- Initial Meeting (1.5 hrs) - CLIENT MEETING - options needed
- 2 days: Sourcing (Gregory OFF both days, design block)
- 3 days: Furniture Mood Boards (design block)
- 1 day: Furniture Pricing (design block)
- Furniture Meeting (2 hrs) - CLIENT MEETING - options needed
- 1 day: Furniture Meeting Revisions (design block)

PHASE 2 | FINALIZE (4-5 weeks):
- 1 day: Enter Selections into Gather (design block)
- 1 day: Order Samples (design block)
- Furniture + Fabric Confirmation Meeting (1.5 hrs) - ON SITE CLIENT MEETING - options needed
- 1 day: Confirmation Meeting Revisions (design block)

PHASE 3 | ACCESSORIES (3 weeks):
- 1 day: Art Sourcing (Gregory OFF, design block)
- 1 day: Accessory + Art Concept Boards (design block)
- Accessory + Art Concept Meeting (1.5 hrs) - CLIENT MEETING - options needed
- 3 business days: client review window
- 1 day: Accessory Board Revisions (design block)

PHASE 4 | INSTALLATION:
- Furniture Set-Up Day (7 hrs) - CLIENT MEETING - options needed - full day on site
- Accessory Install Day (7 hrs) - CLIENT MEETING - options needed - full day on site
- Photoshoot Day (6 hrs) - CLIENT MEETING - options needed

EVENT NAMING RULES:
- Client meetings must be named: "RF [ClientName] | [Meeting Name]"
- Design/admin blocks must be named: "Design [ClientName] | [Block Name]"

IMPORTANT: For each CLIENT MEETING provide exactly 3 date options (all Tuesday-Friday).
Space the 3 options across the same week or adjacent days.
Design blocks should be placed sequentially working forward from the contract date.

RESPOND ONLY WITH VALID JSON - no markdown, no explanation, just the JSON object:
{
  "conflicts_found": ["description of any conflicts noted"],
  "schedule": [
    {
      "phase": "Phase name",
      "type": "meeting",
      "label": "RF ClientName | Meeting Name",
      "date": "YYYY-MM-DD",
      "startTime": "HH:MM",
      "endTime": "HH:MM",
      "days": 1,
      "notes": "Gregory + Designer + Client · X hrs · notes",
      "options": ["YYYY-MM-DD", "YYYY-MM-DD", "YYYY-MM-DD"],
      "selectedOption": 0
    },
    {
      "phase": "Phase name",
      "type": "block",
      "label": "Design ClientName | Block Name",
      "date": "YYYY-MM-DD",
      "startTime": "09:00",
      "endTime": "17:00",
      "days": 2,
      "notes": "Designer · details"
    }
  ]
}`;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { action, clientName, projectType, contractDate, events } = req.body;

  if (action === "generate_schedule") {
    try {
      const prompt = `Contract signed: ${contractDate}
Client name: ${clientName}
Project type: ${projectType === "id" ? "ID Construction (Large Project)" : "Furnishings"}
Today's date: ${new Date().toISOString().split("T")[0]}

Generate the complete project schedule starting from the contract date.
Work strictly through the phase sequence for this project type.
Never schedule anything on a Monday.
For big presentations (4hr meetings) always use 11:00 or 13:00 start times. Friday is preferred but Tuesday-Friday are all acceptable.
For 1.5-2hr meetings use 10:00 or 11:00 start times.
For install/full-day events use 09:00-17:00.
Provide exactly 3 date options for every client meeting, spaced across Tue-Fri.`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 4000,
          system: SCHEDULE_RULES,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      const text = data.content[0].text;
      let schedule;
      try {
        const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        schedule = JSON.parse(clean);
      } catch (e) {
        const match = text.match(/\{[\s\S]*\}/);
        if (match) schedule = JSON.parse(match[0]);
        else throw new Error("Could not parse schedule JSON");
      }

      return res.status(200).json({
        success: true,
        schedule: schedule.schedule || schedule,
        conflicts: schedule.conflicts_found || [],
      });
    } catch (err) {
      console.error("Schedule generation error:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  if (action === "finalize_schedule") {
    try {
      const confirmedMeetings = (events || []).filter(e => e.type === "meeting");
      const prompt = `Client: ${clientName}, Project: ${projectType}
Jenny has confirmed these meeting dates:
${confirmedMeetings.map(e => `- ${e.label}: ${e.options?.[e.selectedOption] || e.date}`).join("\n")}

Now generate the complete finalized schedule with ALL events — both the confirmed client meetings AND all design blocks properly placed in sequence around them.
Follow the exact phase sequence. Never put anything on a Monday.
Return the complete JSON schedule.`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 4000,
          system: SCHEDULE_RULES,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      const text = data.content[0].text;
      let schedule;
      try {
        const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const parsed = JSON.parse(clean);
        schedule = parsed.schedule || parsed;
      } catch (e) {
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          schedule = parsed.schedule || parsed;
        } else throw new Error("Could not parse finalized schedule");
      }

      return res.status(200).json({ success: true, schedule });
    } catch (err) {
      console.error("Finalize error:", err);
      return res.status(500).json({ error: err.message });
    }
  }


  if (action === "revise_schedule") {
    try {
      const currentSchedule = JSON.stringify(events || [], null, 2);
      const prompt = `Current schedule for ${clientName} (${projectType}):
${currentSchedule}

Jenny's revision request: "${revision}"

Apply the requested changes to the schedule. Keep all events that aren't affected.
Maintain all scheduling rules (no Mondays, correct phase sequence, presentation times).
Return the complete updated schedule JSON plus a brief plain-English message explaining what you changed.

Respond with JSON:
{
  "message": "Brief description of what changed",
  "schedule": [ ...complete updated schedule... ]
}`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 4000,
          system: SCHEDULE_RULES,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      const text = data.content[0].text;
      let result;
      try {
        const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        result = JSON.parse(clean);
      } catch (e) {
        const match = text.match(/\{[\s\S]*\}/);
        if (match) result = JSON.parse(match[0]);
        else throw new Error("Could not parse revised schedule");
      }

      return res.status(200).json({
        success: true,
        schedule: result.schedule || result,
        message: result.message || "Schedule updated.",
      });
    } catch (err) {
      console.error("Revise error:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(400).json({ error: "Unknown action" });
}

export const config = {
  maxDuration: 60,
};

// Note: revise_schedule action added above export config
