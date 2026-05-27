import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const DESIGNERS = {
  id: ["chloe@roseandfunk.com", "stephanien@roseandfunk.com"],
  furnishings: ["lillian@roseandfunk.com"],
  gregory: "gregory@roseandfunk.com",
};

const SCHEDULE_RULES = `
You are Jenny's scheduling assistant for Rose & Funk Interiors. You have full knowledge of the scheduling rules:

GLOBAL RULES:
- NO meetings on Mondays ever
- Client meetings: Tuesday to Friday only
- Big presentations (4hr meetings): 11am or 1pm start, never later than 2pm
- Design blocks (Gregory off): 9am–4pm
- All times are America/Vancouver (Pacific)

ID CONSTRUCTION SCHEDULE SEQUENCE (42 days / 8.5 weeks):
PRE-DESIGN:
- 3 days: Drawing Set-up (Design block)

PHASE 1:
- Initial Meeting (1.5 hrs) - client meeting
- 2 days: Aesthetic Direction (Gregory OFF 9-4, designer block)
- Aesthetic Direction Meeting (1.5 hrs) - client meeting
- Appliance + Plumbing Meeting (4 hrs) - client meeting  
- 1 rest day after meeting

PHASE 2:
- 2 days: Team Material Concept (Gregory OFF 9-4, designer block)
- 2 days: Complete Material Boards (designer block)
- 2 days: Lighting Concept Boards (designer block)
- 1 day: Sketch Elevations (Gregory OFF 9-4, designer block)
- 2 days: Elevations in AutoCAD (designer block)
- Concept Elevation + Material Meeting (4 hrs) - client meeting - PREFER FRIDAY
- 1 rest day after meeting

PHASE 3:
- 2 days: Concept Revisions + Material Boards (1 day Gregory OFF, designer block)
- 3 days: Documentation (designer block)
- 1 day: Concept Exterior - 2 hrs Gregory (designer block)
- Material Confirmation Meeting (3 hrs) - client meeting - PREFER FRIDAY
- 1 rest day after meeting

PHASE 4:
- 15 days: 3D Rendering period (external, no team blocks needed)
- 1 day: Material Confirmation Revisions (designer block)
- 3 days: client review window
- 3 days: Complete Remaining Elevations (designer block)
- 1 day: Drawing Details (designer block)
- 2 days: Dimension + Noting Elevations (designer block)
- 5 days: Plan Layouts (designer block)
- Final Review Meeting (3 hrs) - client meeting - PREFER FRIDAY
- 2 rest days after meeting

POST FINAL:
- 1 day: Client Adjustments (designer block)
- 3 days: client review window
- 2 days: Final Adjustments + Send to Print (designer block)
- 1 day: Review Drawings + Gather (Gregory OFF 9-4, designer block)
- 3 days: All Final Edits + Send to Client (designer block)

FURNISHINGS SCHEDULE SEQUENCE:
PRE-DESIGN:
- 1 day: Drawing File Set-up (admin block)

PHASE 1 | CONCEPT (3 weeks):
- Initial Meeting (1.5 hrs) - client meeting
- 2 days: Sourcing (Gregory OFF both days, designer block)
- 3 days: Furniture Mood Boards (designer + 1 day Gregory review)
- 1 day: Furniture Pricing (designer block)
- Furniture Meeting (2 hrs) - client meeting
- 1 day: Furniture Meeting Revisions (designer block)

PHASE 2 | FINALIZE (4-5 weeks):
- 1 day: Enter Selections into Gather (designer block)
- 1 day: Order Samples (designer block)
- Furniture + Fabric Confirmation Meeting (1.5 hrs) - ON SITE client meeting
- 1 day: Confirmation Meeting Revisions (designer block)

PHASE 3 | ACCESSORIES (3 weeks):
- 1 day: Art Sourcing (Gregory OFF, designer block)
- 1 day: Accessory + Art Concept Boards (designer block)
- Accessory + Art Concept Meeting (1.5 hrs) - client meeting
- 3 business days: client review window
- 1 day: Accessory Board Revisions (designer block)

PHASE 4 | INSTALLATION (3-4 weeks):
- Furniture Set-Up Day (7 hrs) - on site, schedule after orders placed
- Accessory Install Day (7 hrs) - on site
- Photoshoot Day (6 hrs)

EVENT NAMING:
- Client meetings: "RF [ClientName] | [Meeting Name]"
- Design blocks: "Design [ClientName] | [Block Name]"

FOR EACH CLIENT MEETING, provide exactly 3 date options spaced 1-2 days apart (all Tue-Fri).
Design blocks auto-schedule around confirmed meeting dates.

RESPONSE FORMAT - respond ONLY with valid JSON, no markdown, no explanation:
{
  "conflicts_found": [],
  "schedule": [
    {
      "phase": "Phase name",
      "type": "meeting|block",
      "label": "Event label",
      "date": "YYYY-MM-DD",
      "startTime": "HH:MM",
      "endTime": "HH:MM",
      "days": 1,
      "notes": "Attendees and notes",
      "options": ["YYYY-MM-DD", "YYYY-MM-DD", "YYYY-MM-DD"],
      "selectedOption": 0
    }
  ]
}
Only include "options" array for client meetings (3 date choices).
For blocks, just include "date", "startTime", "endTime", "days".
`;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { action, clientName, projectType, contractDate, events } = req.body;

  // ── Generate initial schedule with conflict checking ──────────────────────
  if (action === "generate_schedule") {
    try {
      // 1. Fetch calendar events for the next 6 months
      const startDate = new Date(contractDate);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 6);

      // Use Google Calendar API via fetch (using the access token from env)
      // Since we can't use the MCP tool directly, we'll use the Anthropic API
      // with a prompt that includes the scheduling rules and asks Claude to
      // generate a conflict-aware schedule

      const calendarContext = `
Contract signed: ${contractDate}
Client name: ${clientName}
Project type: ${projectType === "id" ? "ID Construction (Large Project)" : "Furnishings"}
Today's date: ${new Date().toISOString().split("T")[0]}
Designers assigned: ${projectType === "id" ? "Chloe + Stephanie" : "Lillian"}

Generate a complete project schedule starting from the contract date.
Follow the sequence exactly as specified in the rules.
Avoid scheduling anything on Mondays.
Space client meeting options across Tue-Fri of the same week where possible.
For presentations (4hr meetings), always use 11:00 or 13:00 start times.
For 1.5-2hr meetings, use 10:00 or 11:00 start times.
For install/setup days, use 09:00 start.
Design blocks always run 09:00-17:00.
`;

      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 8000,
        system: SCHEDULE_RULES,
        messages: [{ role: "user", content: calendarContext }],
      });

      const text = response.content[0].text;

      // Parse JSON from response
      let schedule;
      try {
        const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        schedule = JSON.parse(clean);
      } catch (e) {
        // Try to extract JSON from text
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          schedule = JSON.parse(match[0]);
        } else {
          throw new Error("Could not parse schedule JSON");
        }
      }

      return res.status(200).json({ success: true, schedule: schedule.schedule || schedule, conflicts: schedule.conflicts_found || [] });
    } catch (err) {
      console.error("Schedule generation error:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  // ── Finalize schedule after Jenny picks meeting dates ─────────────────────
  if (action === "finalize_schedule") {
    try {
      const prompt = `
The following is a proposed project schedule for ${clientName} (${projectType}).
Jenny has selected her preferred meeting dates. 
Re-generate the complete schedule with all design blocks properly placed around the confirmed meeting dates.
Follow all the same rules. Return the same JSON format with all events including confirmed client meetings and all design blocks.

Selected meetings:
${JSON.stringify(events.filter(e => e.type === "meeting"), null, 2)}

Return ONLY the complete JSON schedule with all events (meetings + blocks) properly sequenced.
`;

      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 8000,
        system: SCHEDULE_RULES,
        messages: [{ role: "user", content: prompt }],
      });

      const text = response.content[0].text;
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
        } else {
          throw new Error("Could not parse finalized schedule");
        }
      }

      return res.status(200).json({ success: true, schedule });
    } catch (err) {
      console.error("Finalize error:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(400).json({ error: "Unknown action" });
}
