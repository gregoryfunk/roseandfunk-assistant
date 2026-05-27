import { useState, useEffect, useRef } from "react";

const TABS = ["Chat", "Estimator", "Furnishings", "Knowledge Base", "Procedures"];

const C = {
  bg: "#0f0e0c", surface: "#1a1814", border: "#2a2620",
  gold: "#c8a96e", text: "#f0ebe3", muted: "#d4cdc4",
  dim: "#8a7a65", faint: "#3a3028", red: "#c0614a"
};

const ROOMS = [
  { id: "3d", label: "3D Rendering", cost: 1750 },
  { id: "a", label: "A - Exterior", cost: 2500 },
  { id: "b", label: "B - Foyer", cost: 1500 },
  { id: "c", label: "C - Staircase", cost: 2500 },
  { id: "d", label: "D - Living Room", cost: 2000 },
  { id: "e", label: "E - Dining Room", cost: 2000 },
  { id: "f", label: "F - Powder Room", cost: 1750 },
  { id: "g", label: "G - Office", cost: 2500 },
  { id: "h", label: "H - Kitchen", cost: 5000 },
  { id: "i", label: "I - Prep Kitchen", cost: 3500 },
  { id: "j", label: "J - Pantry", cost: 2500 },
  { id: "k", label: "K - Eating Nook", cost: 1250 },
  { id: "l", label: "L - Family/Living", cost: 3000 },
  { id: "m", label: "M - Mudroom", cost: 2500 },
  { id: "n", label: "N - Laundry", cost: 2500 },
  { id: "o", label: "O - Laundry (small)", cost: 1500 },
  { id: "p", label: "P - Primary Bedroom", cost: 2500 },
  { id: "q", label: "Q - Primary Ensuite", cost: 3500 },
  { id: "r", label: "R - Primary WIC", cost: 2500 },
  { id: "s", label: "S - Bedroom", cost: 1750 },
  { id: "t", label: "T - Bedroom (small)", cost: 250 },
  { id: "u", label: "U - Bathroom (3pc)", cost: 2000 },
  { id: "v", label: "V - Bathroom (4pc)", cost: 2500 },
  { id: "w", label: "W - Media Room", cost: 2750 },
  { id: "x", label: "X - Bar", cost: 3500 },
  { id: "y", label: "Y - Gym", cost: 1500 },
  { id: "z1", label: "Z - Suite | Bedroom", cost: 250 },
  { id: "z2", label: "Z - Suite | Bath", cost: 1750 },
  { id: "z3", label: "Z - Suite | Kitchen", cost: 2000 },
  { id: "z4", label: "Z - Suite | Living", cost: 750 },
  { id: "zz1", label: "ZZ - Outdoor Kitchen", cost: 2000 },
  { id: "zz2", label: "ZZ - Outdoor Living", cost: 1500 },
];

const PHASES = [
  { label: "Phase 1", pct: 0.15 },
  { label: "Phase 2", pct: 0.275 },
  { label: "Phase 3", pct: 0.20 },
  { label: "Phase 4", pct: 0.25 },
  { label: "Phase 5", pct: 0.125 },
];

const FURN_ROOMS = [
  { id: "foyer", label: "Foyer", basePrice: 2000 },
  { id: "living", label: "Living Room", basePrice: 3750 },
  { id: "family", label: "Family/Living", basePrice: 3250 },
  { id: "dining", label: "Dining Room", basePrice: 3000 },
  { id: "nook", label: "Eating Nook", basePrice: 1750 },
  { id: "kitchen", label: "Kitchen", basePrice: 1750 },
  { id: "pantry", label: "Pantry", basePrice: 800 },
  { id: "office", label: "Office", basePrice: 2650 },
  { id: "primary_bed", label: "Primary Bedroom", basePrice: 2650 },
  { id: "primary_bath", label: "Primary Ensuite", basePrice: 800 },
  { id: "primary_wic", label: "Primary WIC", basePrice: 800 },
  { id: "bedroom", label: "Bedroom", basePrice: 2000 },
  { id: "bedroom_sm", label: "Bedroom (small)", basePrice: 800 },
  { id: "powder", label: "Powder Room", basePrice: 1000 },
  { id: "bathroom", label: "Bathroom", basePrice: 800 },
  { id: "mudroom", label: "Mudroom", basePrice: 800 },
  { id: "laundry", label: "Laundry", basePrice: 800 },
  { id: "media", label: "Media Room", basePrice: 2750 },
  { id: "bar", label: "Bar", basePrice: 2000 },
  { id: "gym", label: "Gym", basePrice: 1500 },
  { id: "outdoor_lg", label: "Outdoor (large)", basePrice: 2000 },
  { id: "outdoor_sm", label: "Outdoor (small)", basePrice: 1200 },
  { id: "suite", label: "Suite", basePrice: 2500 },
  { id: "staircase", label: "Staircase", basePrice: 1000 },
];

const CLASS_FACTORS = { Major: 1.0, Secondary: 0.5, Styling: 0.3 };
const MAJOR_DISCOUNT = [1.0, 0.8, 0.6, 0.5];
const ANCHOR_FEE = 6500;

const fmt = (n) => n.toLocaleString("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });

const PROCEDURES = [
  {
    category: "Onboarding",
    items: [
      {
        title: "Client Intake & Discovery", owner: "ADMIN + PRINCIPAL",
        steps: [
          { text: "Client completes Intake Form on website. If client contacts directly via call or email, send them the Keap link.", owner: "CLIENT" },
          { text: "Immediately send client follow-up email to book Discovery Call via Keap (automatic).", owner: "AUTOMATIC" },
          { text: "Client books Discovery Call using Keap link. Timeblock these to certain days and times.", owner: "CLIENT" },
          { text: "Immediately send Discovery Call booking confirmation. Request project info, inspiration, or plans if not included in intake form (automatic).", owner: "AUTOMATIC" },
          { text: "Send Discovery Call reminder 24 hours prior via Keap (automatic).", owner: "AUTOMATIC" },
          { text: "DISCOVERY CALL (15–30 min) via Zoom or Google Meet. Determine services they're interested in, gather project scope details, and book a consultation if needed.", owner: "PRINCIPAL" },
          { text: "Send client follow-up email next day (automatic).", owner: "AUTOMATIC" },
          { text: "Within 3 days of Discovery Call, send link to schedule Proposal Review via Keap.", owner: "AUTOMATIC" },
          { text: "Client books Proposal Review via Keap link.", owner: "CLIENT" },
          { text: "Immediately send Proposal Booking Confirmation Email (automatic).", owner: "AUTOMATIC" },
          { text: "Send reminder for Proposal Review 24 hours prior. Include proposal and general scope of work for client to review before meeting (automatic).", owner: "AUTOMATIC" },
        ]
      },
      {
        title: "Proposal Review & Contract", owner: "PRINCIPAL + ADMIN",
        steps: [
          { text: "PROPOSAL REVIEW (60–90 min). Gather details needed to provide a proposal. Book a time to review the SOW/proposal on a virtual meeting a week out.", owner: "PRINCIPAL" },
          { text: "Send follow-up email to client after Proposal Review the next day.", owner: "ADMIN" },
          { text: "Client emails confirmation of wanting design services. If client doesn't sign, follow up after 5–7 days. Recommend putting an expiration date on proposals.", owner: "CLIENT" },
          { text: "Immediately following confirmation, send Welcome Book and next steps (contract signatures, scheduling, invoices). Outline scope + custom design fee proposal. Put an expiration date (7–14 days).", owner: "ADMIN" },
          { text: "Same day as Welcome Book, send DocuSign.", owner: "ADMIN" },
          { text: "Receive signed contract. Set up project in Harvest, QB, and Drive.", owner: "ADMIN" },
          { text: "Immediately send follow-up email thanking client for signed contract. Let them know retainer invoice is going out today. Ask availability for meetings and request floor plans for initial drawing setup.", owner: "ADMIN" },
          { text: "Send Retainer Invoice upon receipt of signed contract.", owner: "ADMIN" },
          { text: "Within 24 hours of signed contract, schedule project in calendar following Calendar Process. Send client their first initial meeting date.", owner: "ADMIN" },
          { text: "Within 3 days of signed contract, send client proposed meeting dates with payment schedule. List all meeting dates and payment schedule.", owner: "ADMIN" },
          { text: "Within 3 days of signed contract, send invoice for Phase 1.", owner: "ADMIN" },
          { text: "Initial drawing set up (3 days).", owner: "DESIGNER" },
          { text: "Send client reminder email 24 hours before Initial Meeting via Keap (automatic).", owner: "AUTOMATIC" },
        ]
      },
      {
        title: "Initial Meeting", owner: "PRINCIPAL + DESIGNER",
        steps: [
          { text: "INITIAL MEETING 1.1 (60–90 min). Review welcome book, questionnaire, scope, budget, and inspiration images.", owner: "PRINCIPAL, DESIGNER, CLIENT" },
          { text: "Send Follow Up Email with Recap and outline of next steps 1–2 days after Initial Meeting.", owner: "DESIGNER" },
          { text: "Set up Builder Phone Call meeting. Engage with builder, build connection, ask for budget number and main trades.", owner: "ADMIN" },
          { text: "BUILDER PHONE CALL (30 min).", owner: "PRINCIPAL, DESIGNER" },
          { text: "Send Follow Up Email with Recap and outline of next steps 1–2 days after builder call.", owner: "DESIGNER" },
        ]
      },
    ]
  },
  {
    category: "Concept Phase",
    items: [
      {
        title: "Aesthetic Direction", owner: "PRINCIPAL + DESIGNER",
        steps: [
          { text: "Send Phase 2 Invoice 15 days before Phase 2 design begins.", owner: "ADMIN" },
          { text: "Create Aesthetic Direction Boards with team (2 days). Can be inspiration images, a few specific selections, floorplan/layout, etc.", owner: "PRINCIPAL, DESIGNER" },
          { text: "Send reminder for Aesthetic Direction Meeting 24 hours before with meeting outline via Keap (automatic).", owner: "AUTOMATIC" },
          { text: "AESTHETIC DIRECTION MEETING (60–90 min).", owner: "PRINCIPAL, DESIGNER, CLIENT" },
          { text: "Send boards and meeting notes 1–2 days after Aesthetic Direction Meeting.", owner: "DESIGNER" },
          { text: "Send Follow Up Email with outline of next steps including meeting notes.", owner: "ADMIN" },
        ]
      },
      {
        title: "Appliance & Plumbing Meeting", owner: "PRINCIPAL + DESIGNER",
        steps: [
          { text: "Send reminder email for Appliance and Plumbing Meeting 24 hours before. Review design concept as a team to ensure all details are ready to present. Principal designer sign off (automatic).", owner: "AUTOMATIC" },
          { text: "APPLIANCE & PLUMBING MEETING (4 hours).", owner: "PRINCIPAL, DESIGNER, CLIENT" },
          { text: "Send Follow Up Email with Recap and outline of next steps 1–2 days after meeting. Include meeting notes.", owner: "DESIGNER" },
          { text: "Send out Appliance Package for Feedback once received from rep. Don't send until we have pricing and specs.", owner: "DESIGNER" },
          { text: "Send Phase 3 Invoice 15 days before Phase 3 design begins.", owner: "ADMIN" },
        ]
      },
      {
        title: "Concept Elevation & Material Meeting", owner: "PRINCIPAL + DESIGNER",
        steps: [
          { text: "Create Material Concept Boards with team (4–5 weeks for full design process).", owner: "PRINCIPAL, DESIGNER" },
          { text: "Complete Material Boards (2–3 days).", owner: "DESIGNER" },
          { text: "Lighting Concept Boards (1 day).", owner: "DESIGNER" },
          { text: "Sketch Elevations (1 day).", owner: "PRINCIPAL, DESIGNER" },
          { text: "Elevations in AutoCad — add to concept board (2 days).", owner: "DESIGNER" },
          { text: "Send reminder email for Concept Elevation & Material Meeting 24 hours before (automatic).", owner: "AUTOMATIC" },
          { text: "Prepare all presentation details for client meeting: design presentation, renderings, drawings, samples, and budgets.", owner: "DESIGNER" },
          { text: "CONCEPT ELEVATION & MATERIAL MEETING (4 hours). Review design selections with client.", owner: "PRINCIPAL, DESIGNER, CLIENT" },
          { text: "Send Phase 4 Invoice 15 days before Phase 4 design begins.", owner: "ADMIN" },
          { text: "Same day, send recap of meeting with Design Presentation and Sign-off. Ask for feedback within 3 days. Clearly state how many rounds of revisions client will receive. 72 hours for additional feedback.", owner: "DESIGNER" },
          { text: "Client submits feedback and notes within 3 days.", owner: "CLIENT" },
          { text: "Within 24 hours of receiving feedback, send Feedback Received Email stating revisions will be made.", owner: "DESIGNER" },
        ]
      },
    ]
  },
  {
    category: "Documentation Phase",
    items: [
      {
        title: "Documentation & Revisions", owner: "DESIGNER",
        steps: [
          { text: "Documentation (3 days): Update design boards, drawings, pricing, and all other documentation.", owner: "DESIGNER" },
          { text: "Concept Revisions & Concept Material Boards (2–3 days). Double check feasibility and budget before completing revisions.", owner: "DESIGNER" },
          { text: "Concept Exterior: Complete Mood Boards.", owner: "DESIGNER" },
        ]
      },
      {
        title: "Material Confirmation Meeting", owner: "PRINCIPAL + DESIGNER",
        steps: [
          { text: "Send Email Reminder for Material Confirmation Meeting 1 week before and outline what to expect. If 2 rounds of revisions in scope, note that any revisions after this point should be billed hourly (automatic).", owner: "ADMIN, AUTOMATIC" },
          { text: "MATERIAL CONFIRMATION MEETING (3 hours). Request written approval if possible.", owner: "PRINCIPAL, DESIGNER, CLIENT" },
          { text: "Send Follow Up Email with Recap 1–2 days after. Attach Design Presentation, meeting notes, and next steps. Ask for feedback within 3 days. 72 hours for additional feedback. NO SIGN OFF at this stage.", owner: "DESIGNER" },
          { text: "Final Board Revisions.", owner: "DESIGNER" },
          { text: "Within 1–2 weeks of Final Design Approval, send final material boards with sign-off. Send via Design Software or deliver Construction Binder (digital presentation with selections, elevations, renderings, and finish schedules).", owner: "DESIGNER" },
          { text: "Clients sign off within 3 business days.", owner: "CLIENT" },
          { text: "Receive Client Sign-off.", owner: "ADMIN" },
          { text: "Immediately send Follow Up Email confirming sign-off received.", owner: "ADMIN" },
          { text: "Send off for 3D Renderings (1–2 weeks): kitchen, great room, primary ensuite.", owner: "DESIGNER" },
        ]
      },
    ]
  },
  {
    category: "Construction Documentation",
    items: [
      {
        title: "Drawings & Final Package", owner: "DESIGNER + ADMIN",
        steps: [
          { text: "Complete Remaining Elevations (3–4 days).", owner: "DESIGNER" },
          { text: "Drawing Details (1 day). Designer and Procurement review all specifications, quantities, etc. to ensure all details are correct before ordering.", owner: "DESIGNER" },
          { text: "Dimensioning & Noting Elevations (1–2 days).", owner: "DESIGNER" },
          { text: "Plan Layouts (4–5 days).", owner: "DESIGNER" },
          { text: "Send client reminder email for Final Review Meeting (automatic).", owner: "ADMIN, AUTOMATIC" },
          { text: "FINAL REVIEW MEETING (3 hours).", owner: "PRINCIPAL, DESIGNER, CLIENT" },
          { text: "Send follow-up with recap of meeting notes and next steps. Do NOT send drawings or specs.", owner: "DESIGNER" },
          { text: "Send Phase 5 Invoice 15 days before Phase 5 begins.", owner: "ADMIN" },
          { text: "Make client adjustments (1 day).", owner: "DESIGNER" },
          { text: "Within 72 hours of making adjustments, send drawings package to client. NOTE: Preliminary Drawings — in title block under revisions.", owner: "DESIGNER" },
          { text: "Send client sign-off for final drawing package along with drawings package.", owner: "ADMIN" },
          { text: "Receive client sign-off.", owner: "ADMIN" },
          { text: "Send drawings to print: For Gather — print spec package double-sided. Drawing sheets print on 24\" x 36\", staple, colour, 20lbs.", owner: "DESIGNER" },
          { text: "Review Drawings & Gather (1 day).", owner: "DESIGNER" },
          { text: "Complete All Final Edits (3 days).", owner: "DESIGNER" },
          { text: "Send Final Package to Clients & Builders.", owner: "DESIGNER" },
          { text: "Send client email explaining next steps: billing for construction phase, what to anticipate, how to get the most value from design package, and getting builder pricing started. Make it look like it's from Gregory.", owner: "ADMIN" },
          { text: "Next week, send next steps email for Construction Site Visits — Framing Site Visit. Inform Jenny to set up call re: Construction Phase (automatic).", owner: "AUTOMATIC, ADMIN" },
        ]
      },
      {
        title: "Site Visits", owner: "PRINCIPAL + DESIGNER",
        steps: [
          { text: "FRAMING SITE VISIT (1.5 hours).", owner: "PRINCIPAL, DESIGNER, CLIENT" },
          { text: "Send meeting notes to client and builder.", owner: "DESIGNER" },
          { text: "1 week post framing site meeting, send email to client and builder re: when to book Pre-Drywall Site Visit.", owner: "ADMIN" },
          { text: "Send client reminder email to schedule Pre-Drywall Site Meeting (4 weeks out, automatic).", owner: "AUTOMATIC" },
          { text: "PRE-DRYWALL SITE VISIT (1.5 hours).", owner: "PRINCIPAL, DESIGNER, CLIENT" },
          { text: "Send meeting notes to client and builder 1–2 days after Pre-Drywall Site Visit.", owner: "DESIGNER" },
          { text: "Send client email to schedule Post-Drywall Site Meeting.", owner: "ADMIN" },
          { text: "Send client reminder email 24 hours prior to Post-Drywall Site Visit (automatic).", owner: "AUTOMATIC" },
          { text: "POST-DRYWALL SITE VISIT (1.5 hours).", owner: "PRINCIPAL, DESIGNER, CLIENT" },
          { text: "Send meeting notes to client and builder 1–2 days after Post-Drywall Site Visit.", owner: "DESIGNER" },
        ]
      },
      {
        title: "Cabinetry & Finishing Review", owner: "PRINCIPAL + DESIGNER",
        steps: [
          { text: "Send client email to confirm cabinet maker and timeline.", owner: "DESIGNER" },
          { text: "CABINETRY REVIEW (2–6 hours). Designer and Procurement review all specifications, quantities, etc. to ensure all details are correct before ordering.", owner: "PRINCIPAL, DESIGNER" },
          { text: "Cabinetry Review communication 1–2 weeks.", owner: "DESIGNER" },
          { text: "Send revisions to Cabinet Supplier, Builder, and Client.", owner: "DESIGNER" },
          { text: "Send client email to schedule Finishing Review Site Meeting.", owner: "ADMIN" },
          { text: "Send client reminder email 24 hours before Finishing Review Site Meeting.", owner: "ADMIN" },
          { text: "FINISHING REVIEW SITE MEETING (1.5 hours).", owner: "PRINCIPAL, DESIGNER, CLIENT" },
          { text: "Send meeting notes to client and builder 1–2 days after Finishing Review.", owner: "DESIGNER" },
        ]
      },
    ]
  },
  {
    category: "Wrap-Up & Install",
    items: [
      {
        title: "Install Preparation", owner: "ADMIN + DESIGNER",
        steps: [
          { text: "30–60 days prior to install, email client to schedule install. Confirm completion date with contractor and schedule install date. Confirm spaces will be cleaned and cleared beforehand.", owner: "ADMIN" },
          { text: "30–60 days prior to install, schedule delivery date and handyman/art installer.", owner: "ADMIN" },
          { text: "30–60 days prior to install, schedule photographer and stylist if photographing project.", owner: "ADMIN" },
          { text: "2 weeks prior to install, prepare for install: print room labels, floor plans, product lists. Have linens laundered, light bulbs and pillow inserts ready, schedule lunch delivery, get cash for tips, pack install day kit, order florals.", owner: "DESIGNER, ADMIN" },
          { text: "1 week prior to install, photoshoot prep: confirm shot list, styling items, headshot poses and outfits, weather, etc.", owner: "DESIGNER" },
        ]
      },
      {
        title: "Install & Photoshoot", owner: "DESIGNER + PRINCIPAL",
        steps: [
          { text: "INSTALL (1–3+ days). Deliver, install, place, and style all items.", owner: "DESIGNER, PRINCIPAL" },
          { text: "PHOTOSHOOT after install (1–2+ days).", owner: "DESIGNER, PRINCIPAL" },
          { text: "CLIENT FINAL WALK-THROUGH (1–2 hours). Walk through all spaces with client. Create list of outstanding tasks. Mostly for construction projects.", owner: "PRINCIPAL, DESIGNER, CLIENT" },
          { text: "Day of walk-through: create list of outstanding tasks to be completed ideally within 30–90 days.", owner: "DESIGNER, PRINCIPAL" },
        ]
      },
      {
        title: "Project Close-Out", owner: "ADMIN + DESIGNER",
        steps: [
          { text: "Within 30–90 days of install, complete all outstanding tasks. Send weekly emails to client with status updates on any outstanding items.", owner: "DESIGNER" },
          { text: "Within 30–90 days of install, send Project Completion Email to client with feedback request. Send client gift if possible.", owner: "ADMIN" },
        ]
      },
    ]
  },
];

const ownerColor = (owner = "") => {
  if (owner.includes("GREGORY") || owner.includes("PRINCIPAL")) return C.gold;
  if (owner === "JENNY" || owner === "ADMIN") return "#6a9ab0";
  if (owner === "ALL" || owner === "AUTOMATIC") return "#7a9a7a";
  if (owner === "DESIGNER") return "#a0896a";
  if (owner === "CLIENT") return "#9a7aaa";
  return "#8a8a8a";
};

const api = (body) => fetch("/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body)
}).then(r => r.json());

const extractPdfText = async (arrayBuffer) => {
  if (!window.pdfjsLib) {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    await new Promise((res, rej) => { script.onload = res; script.onerror = rej; document.head.appendChild(script); });
  }
  const pdfjsLib = window.pdfjsLib;
  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(item => item.str).join(" ") + "\n";
  }
  return text;
};

const getSessionId = () => {
  let id = localStorage.getItem("rf_session_id");
  if (!id) { id = Math.random().toString(36).slice(2); localStorage.setItem("rf_session_id", id); }
  return id;
};

const PinGate = ({ children }) => {
  const [entered, setEntered] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const submit = () => {
    if (pin === "1199") { setEntered(true); setError(""); }
    else { setError("Incorrect PIN. Please try again."); setPin(""); }
  };
  if (entered) return children;
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "32px 40px", textAlign: "center", width: 280 }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: C.dim, marginBottom: 20 }}>ENTER PIN TO ACCESS ESTIMATOR</div>
        <input type="password" value={pin} onChange={e => setPin(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()}
          placeholder="••••" maxLength={4} style={{
            width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6,
            color: C.text, padding: "12px", fontSize: 20, textAlign: "center", outline: "none",
            fontFamily: "Georgia, serif", boxSizing: "border-box", marginBottom: 12, letterSpacing: 8
          }} />
        {error && <div style={{ fontSize: 12, color: C.red, marginBottom: 10 }}>{error}</div>}
        <button onClick={submit} style={{
          background: C.gold, color: C.bg, border: "none", borderRadius: 6,
          padding: "10px 28px", cursor: "pointer", fontSize: 13, fontFamily: "Georgia, serif", width: "100%"
        }}>Enter</button>
      </div>
    </div>
  );
};

const ClarifyingMessage = ({ data, onAnswer }) => {
  const [selections, setSelections] = useState({});
  const select = (qi, option) => setSelections(s => ({ ...s, [qi]: option }));
  const allAnswered = data.questions.every((_, i) => selections[i]);
  const submit = () => {
    const answer = data.questions.map((q, i) => `${q.question}: ${selections[i]}`).join("\n");
    onAnswer(answer);
  };
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "16px 18px", maxWidth: "80%" }}>
      {data.intro && <div style={{ fontSize: 14, color: C.text, marginBottom: 14, lineHeight: 1.5 }}>{data.intro}</div>}
      {data.questions.map((q, qi) => (
        <div key={qi} style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 8, lineHeight: 1.4 }}>{q.question}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {q.options.map((opt, oi) => (
              <button key={oi} onClick={() => select(qi, opt)} style={{
                background: selections[qi] === opt ? C.gold : C.faint,
                color: selections[qi] === opt ? C.bg : C.muted,
                border: `1px solid ${selections[qi] === opt ? C.gold : C.border}`,
                borderRadius: 20, padding: "5px 14px", cursor: "pointer",
                fontSize: 12, fontFamily: "Georgia, serif", transition: "all 0.15s"
              }}>{opt}</button>
            ))}
          </div>
        </div>
      ))}
      {allAnswered && (
        <button onClick={submit} style={{
          background: C.gold, color: C.bg, border: "none", borderRadius: 6,
          padding: "8px 20px", cursor: "pointer", fontSize: 13, fontFamily: "Georgia, serif", marginTop: 4
        }}>Get Answer →</button>
      )}
    </div>
  );
};

const Estimator = () => {
  const [qtys, setQtys] = useState({});
  const [clientName, setClientName] = useState("");
  const [savedEstimates, setSavedEstimates] = useState([]);
  const [saveStatus, setSaveStatus] = useState("");
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    api({ action: "load_estimates" }).then(d => { if (d.estimates) setSavedEstimates(d.estimates); });
  }, []);

  const setQty = (id, val) => setQtys(q => ({ ...q, [id]: Math.max(0, parseInt(val) || 0) }));
  const selectedRooms = ROOMS.filter(r => (qtys[r.id] || 0) > 0);
  const total = selectedRooms.reduce((sum, r) => sum + r.cost * qtys[r.id], 0);

  const saveEstimate = async () => {
    if (!clientName.trim()) { setSaveStatus("Please enter a client name first."); setTimeout(() => setSaveStatus(""), 2500); return; }
    if (total === 0) { setSaveStatus("Please add at least one room."); setTimeout(() => setSaveStatus(""), 2500); return; }
    const rooms = selectedRooms.map(r => ({ id: r.id, label: r.label, cost: r.cost, qty: qtys[r.id] }));
    await api({ action: "save_estimate", client_name: clientName, rooms, total });
    setSaveStatus("Estimate saved!");
    setTimeout(() => setSaveStatus(""), 2500);
    const d = await api({ action: "load_estimates" });
    if (d.estimates) setSavedEstimates(d.estimates);
  };

  const loadEstimate = (est) => {
    setClientName(est.client_name);
    const newQtys = {};
    est.rooms.forEach(r => { newQtys[r.id] = r.qty; });
    setQtys(newQtys);
    setShowSaved(false);
  };

  const deleteEstimate = async (id) => {
    await api({ action: "delete_estimate", id });
    setSavedEstimates(e => e.filter(x => x.id !== id));
  };

  const printEstimate = () => {
    const printContent = `
      <html><head><title>Rose & Funk — ${clientName || "Project"} Estimate</title>
      <style>
        body { font-family: Georgia, serif; color: #1a1814; padding: 40px; max-width: 700px; margin: 0 auto; }
        h1 { font-size: 28px; letter-spacing: 4px; margin-bottom: 4px; }
        h2 { font-size: 12px; letter-spacing: 3px; color: #8a7a65; font-weight: normal; margin-bottom: 32px; }
        .client { font-size: 18px; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        th { text-align: left; font-size: 11px; letter-spacing: 2px; color: #8a7a65; padding: 8px 0; border-bottom: 1px solid #d4cdc4; }
        td { padding: 8px 0; font-size: 13px; border-bottom: 1px solid #f0ebe3; }
        td:last-child { text-align: right; }
        .total-row td { font-size: 16px; font-weight: bold; border-top: 2px solid #1a1814; border-bottom: none; padding-top: 12px; }
        .phase { display: flex; justify-content: space-between; padding: 10px 14px; background: #f8f6f3; margin-bottom: 6px; border-radius: 4px; }
        .footer { margin-top: 48px; font-size: 11px; color: #8a7a65; letter-spacing: 1px; }
      </style></head><body>
      <h1>ROSE & FUNK</h1>
      <h2>INTERIOR DESIGN — PROJECT ESTIMATE</h2>
      <div class="client">Client: ${clientName || "—"}</div>
      <div class="client" style="font-size:13px;color:#8a7a65;">Date: ${new Date().toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}</div>
      <table>
        <tr><th>ROOM</th><th>QTY</th><th>COST</th><th>TOTAL</th></tr>
        ${selectedRooms.map(r => `<tr><td>${r.label}</td><td>${qtys[r.id]}</td><td>${fmt(r.cost)}</td><td>${fmt(r.cost * qtys[r.id])}</td></tr>`).join("")}
        <tr class="total-row"><td colspan="3">TOTAL</td><td>${fmt(total)}</td></tr>
      </table>
      <div style="font-size:11px;letter-spacing:2px;color:#8a7a65;margin-bottom:12px;">PAYMENT SCHEDULE</div>
      ${PHASES.map(p => `<div class="phase"><div>${p.label} (${(p.pct * 100).toFixed(1)}%)</div><div><strong>${fmt(total * p.pct)}</strong></div></div>`).join("")}
      <div class="footer">ROSE AND FUNK INTERIORS INC. · www.roseandfunk.com · 604.513.9118</div>
      </body></html>`;
    const win = window.open("", "_blank");
    win.document.write(printContent);
    win.document.close();
    win.print();
  };

  return (
    <div style={{ flex: 1, maxWidth: 900, width: "100%", margin: "0 auto", padding: "24px 16px", overflowY: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 2, color: C.dim }}>PROJECT ESTIMATOR — ID BY ROOM</div>
          <div style={{ fontSize: 12, color: C.dim, marginTop: 4 }}>Based on $200/hr</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setShowSaved(!showSaved)} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, color: C.muted, fontSize: 12, padding: "6px 14px", cursor: "pointer", fontFamily: "Georgia, serif" }}>Saved Estimates ({savedEstimates.length})</button>
          <button onClick={() => { setQtys({}); setClientName(""); }} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, color: C.dim, fontSize: 12, padding: "6px 14px", cursor: "pointer", fontFamily: "Georgia, serif" }}>Reset</button>
        </div>
      </div>

      {showSaved && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "16px", marginBottom: 20 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: C.dim, marginBottom: 12 }}>SAVED ESTIMATES</div>
          {savedEstimates.length === 0 ? <div style={{ color: C.dim, fontSize: 13 }}>No saved estimates yet.</div> :
            savedEstimates.map(est => (
              <div key={est.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.faint}` }}>
                <div>
                  <div style={{ fontSize: 14, color: C.text }}>{est.client_name}</div>
                  <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>{fmt(est.total)} · {new Date(est.created_at).toLocaleDateString("en-CA")}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => loadEstimate(est)} style={{ background: C.gold, color: C.bg, border: "none", borderRadius: 4, fontSize: 11, padding: "4px 12px", cursor: "pointer", fontFamily: "Georgia, serif" }}>Load</button>
                  <button onClick={() => deleteEstimate(est.id)} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 4, color: C.red, fontSize: 11, padding: "4px 12px", cursor: "pointer", fontFamily: "Georgia, serif" }}>Delete</button>
                </div>
              </div>
            ))}
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Client name…" style={{
          width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
          color: C.text, padding: "12px 14px", fontSize: 15, outline: "none",
          fontFamily: "Georgia, serif", boxSizing: "border-box"
        }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 32 }}>
        {ROOMS.map(r => (
          <div key={r.id} style={{
            background: (qtys[r.id] || 0) > 0 ? C.faint : C.surface,
            border: `1px solid ${(qtys[r.id] || 0) > 0 ? C.gold : C.border}`,
            borderRadius: 8, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center"
          }}>
            <div>
              <div style={{ fontSize: 13, color: C.text }}>{r.label}</div>
              <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>{fmt(r.cost)}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => setQty(r.id, (qtys[r.id] || 0) - 1)} style={{ width: 24, height: 24, borderRadius: "50%", background: C.faint, border: `1px solid ${C.border}`, color: C.text, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
              <span style={{ fontSize: 14, color: C.text, minWidth: 16, textAlign: "center" }}>{qtys[r.id] || 0}</span>
              <button onClick={() => setQty(r.id, (qtys[r.id] || 0) + 1)} style={{ width: 24, height: 24, borderRadius: "50%", background: C.faint, border: `1px solid ${C.border}`, color: C.text, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
            </div>
          </div>
        ))}
      </div>

      {total > 0 && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "20px 24px" }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: C.dim, marginBottom: 16 }}>ESTIMATE SUMMARY{clientName ? ` — ${clientName.toUpperCase()}` : ""}</div>
          <div style={{ marginBottom: 16 }}>
            {selectedRooms.map(r => (
              <div key={r.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.muted, padding: "4px 0", borderBottom: `1px solid ${C.faint}` }}>
                <span>{r.label} × {qtys[r.id]}</span><span>{fmt(r.cost * qtys[r.id])}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, color: C.text, marginBottom: 20, paddingTop: 8 }}>
            <span>TOTAL</span><span style={{ color: C.gold }}>{fmt(total)}</span>
          </div>
          <div style={{ fontSize: 11, letterSpacing: 2, color: C.dim, marginBottom: 12 }}>PAYMENT SCHEDULE</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {PHASES.map((p, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: C.faint, borderRadius: 6 }}>
                <div>
                  <div style={{ fontSize: 13, color: C.text }}>{p.label}</div>
                  <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>{(p.pct * 100).toFixed(1)}%</div>
                </div>
                <div style={{ fontSize: 15, color: C.gold }}>{fmt(total * p.pct)}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={saveEstimate} style={{ background: C.gold, color: C.bg, border: "none", borderRadius: 6, padding: "10px 22px", cursor: "pointer", fontSize: 13, fontFamily: "Georgia, serif" }}>Save Estimate</button>
            <button onClick={printEstimate} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, color: C.muted, padding: "10px 22px", cursor: "pointer", fontSize: 13, fontFamily: "Georgia, serif" }}>Print / Export PDF</button>
            {saveStatus && <span style={{ fontSize: 12, color: C.gold }}>{saveStatus}</span>}
          </div>
        </div>
      )}
    </div>
  );
};

const FurnishingsEstimator = () => {
  const [clientName, setClientName] = useState("");
  const [rooms, setRooms] = useState([]);
  const [installDays, setInstallDays] = useState([]);
  const [showInstall, setShowInstall] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");

  const addClass = (room) => {
    if (rooms.find(r => r.id === room.id)) return;
    setRooms(r => [...r, { ...room, roomClass: "Major" }]);
  };
  const setRoomClass = (id, roomClass) => setRooms(r => r.map(rm => rm.id === id ? { ...rm, roomClass } : rm));
  const removeRoom = (id) => setRooms(r => r.filter(rm => rm.id !== id));

  let majorCount = 0;
  const roomsWithPrices = rooms.map(r => {
    let price;
    if (r.roomClass === "Major") {
      const discountIdx = Math.min(majorCount, MAJOR_DISCOUNT.length - 1);
      price = r.basePrice * MAJOR_DISCOUNT[discountIdx];
      majorCount++;
    } else {
      price = r.basePrice * CLASS_FACTORS[r.roomClass];
    }
    return { ...r, price };
  });

  const roomsTotal = roomsWithPrices.reduce((s, r) => s + r.price, 0);
  const addInstallDay = () => setInstallDays(d => [...d, { hours: 8, admin: 0, designers: 0 }]);
  const removeInstallDay = (i) => setInstallDays(d => d.filter((_, idx) => idx !== i));
  const updateDay = (i, key, val) => setInstallDays(d => d.map((day, idx) => idx === i ? { ...day, [key]: Math.max(0, parseInt(val) || 0) } : day));
  const installTotal = installDays.reduce((sum, d) => sum + (250 * d.hours) + (125 * d.admin * d.hours) + (175 * d.designers * d.hours), 0);
  const grandTotal = ANCHOR_FEE + roomsTotal + (showInstall ? installTotal : 0);

  const printEstimate = () => {
    const printContent = `
      <html><head><title>Rose & Funk — ${clientName || "Project"} Furnishings Estimate</title>
      <style>
        body { font-family: Georgia, serif; color: #1a1814; padding: 40px; max-width: 700px; margin: 0 auto; }
        h1 { font-size: 28px; letter-spacing: 4px; margin-bottom: 4px; }
        h2 { font-size: 12px; letter-spacing: 3px; color: #8a7a65; font-weight: normal; margin-bottom: 32px; }
        .client { font-size: 18px; margin-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        th { text-align: left; font-size: 11px; letter-spacing: 2px; color: #8a7a65; padding: 8px 0; border-bottom: 1px solid #d4cdc4; }
        td { padding: 8px 0; font-size: 13px; border-bottom: 1px solid #f0ebe3; }
        td:last-child { text-align: right; }
        .fee-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0ebe3; font-size: 13px; }
        .grand { display: flex; justify-content: space-between; padding: 14px 0; font-size: 18px; font-weight: bold; border-top: 2px solid #1a1814; margin-top: 8px; }
        .section { margin-top: 24px; font-size: 11px; letter-spacing: 2px; color: #8a7a65; margin-bottom: 8px; }
        .footer { margin-top: 48px; font-size: 11px; color: #8a7a65; letter-spacing: 1px; }
      </style></head><body>
      <h1>ROSE & FUNK</h1>
      <h2>FURNISHINGS — PROJECT ESTIMATE</h2>
      <div class="client">Client: ${clientName || "—"}</div>
      <div class="client" style="font-size:13px;color:#8a7a65;margin-bottom:24px;">Date: ${new Date().toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}</div>
      <div class="section">PROJECT FEES</div>
      <div class="fee-row"><span>Anchor Fee (Project Activation)</span><span><strong>${fmt(ANCHOR_FEE)}</strong></span></div>
      <div class="section">ROOM ADD-ONS</div>
      <table>
        <tr><th>ROOM</th><th>CLASS</th><th>FEE</th></tr>
        ${roomsWithPrices.map(r => `<tr><td>${r.label}</td><td>${r.roomClass}</td><td>${fmt(r.price)}</td></tr>`).join("")}
        <tr><td colspan="2" style="font-size:12px;color:#8a7a65;">Room Total</td><td>${fmt(roomsTotal)}</td></tr>
      </table>
      ${showInstall && installTotal > 0 ? `
        <div class="section">INSTALL & STYLING</div>
        ${installDays.map((d, i) => `<div class="fee-row"><span>Day ${i + 1} — ${d.hours}hrs · ${d.admin} admin · ${d.designers} designers</span><span>${fmt((250 * d.hours) + (125 * d.admin * d.hours) + (175 * d.designers * d.hours))}</span></div>`).join("")}
      ` : ""}
      <div class="grand"><span>TOTAL FURNISHING FEE</span><span>${fmt(grandTotal)}</span></div>
      <div class="footer">ROSE AND FUNK INTERIORS INC. · www.roseandfunk.com · 604.513.9118</div>
      </body></html>`;
    const win = window.open("", "_blank");
    win.document.write(printContent);
    win.document.close();
    win.print();
  };

  return (
    <div style={{ flex: 1, maxWidth: 900, width: "100%", margin: "0 auto", padding: "24px 16px", overflowY: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 2, color: C.dim }}>FURNISHINGS ESTIMATOR</div>
          <div style={{ fontSize: 12, color: C.dim, marginTop: 4 }}>Anchor Fee {fmt(ANCHOR_FEE)} · Major/Secondary/Styling pricing</div>
        </div>
        <button onClick={() => { setRooms([]); setClientName(""); setInstallDays([]); setShowInstall(false); }} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, color: C.dim, fontSize: 12, padding: "6px 14px", cursor: "pointer", fontFamily: "Georgia, serif" }}>Reset</button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Client name…" style={{
          width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
          color: C.text, padding: "12px 14px", fontSize: 15, outline: "none",
          fontFamily: "Georgia, serif", boxSizing: "border-box"
        }} />
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.gold}`, borderRadius: 8, padding: "14px 18px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 13, color: C.text }}>Anchor Fee — Project Activation</div>
          <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>Meetings · Setup · Core Sourcing · Admin · Project Management</div>
        </div>
        <div style={{ fontSize: 16, color: C.gold }}>{fmt(ANCHOR_FEE)}</div>
      </div>

      <div style={{ fontSize: 11, letterSpacing: 2, color: C.dim, marginBottom: 10 }}>ADD ROOMS</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 24 }}>
        {FURN_ROOMS.filter(r => !rooms.find(x => x.id === r.id)).map(r => (
          <button key={r.id} onClick={() => addClass(r)} style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
            padding: "10px 14px", cursor: "pointer", textAlign: "left", fontFamily: "Georgia, serif"
          }}>
            <div style={{ fontSize: 13, color: C.text }}>{r.label}</div>
            <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>from {fmt(r.basePrice * 0.3)}</div>
          </button>
        ))}
      </div>

      {rooms.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: C.dim, marginBottom: 10 }}>SELECTED ROOMS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {roomsWithPrices.map((r, idx) => {
              const majorIdx = roomsWithPrices.filter((x, i) => x.roomClass === "Major" && i <= idx).length - 1;
              return (
                <div key={r.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: C.text }}>{r.label}</div>
                    {r.roomClass === "Major" && majorIdx >= 0 && (
                      <div style={{ fontSize: 10, color: C.dim, marginTop: 2 }}>Major #{majorIdx + 1} — {(MAJOR_DISCOUNT[Math.min(majorIdx, MAJOR_DISCOUNT.length - 1)] * 100).toFixed(0)}% rate</div>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <select value={r.roomClass} onChange={e => setRoomClass(r.id, e.target.value)} style={{
                      background: C.faint, border: `1px solid ${C.border}`, borderRadius: 4,
                      color: C.text, padding: "4px 8px", fontSize: 12, fontFamily: "Georgia, serif", cursor: "pointer"
                    }}>
                      <option value="Major">Major</option>
                      <option value="Secondary">Secondary</option>
                      <option value="Styling">Styling</option>
                    </select>
                    <div style={{ fontSize: 14, color: C.gold, minWidth: 70, textAlign: "right" }}>{fmt(r.price)}</div>
                    <button onClick={() => removeRoom(r.id)} style={{ background: "transparent", border: "none", color: C.dim, cursor: "pointer", fontSize: 16, padding: "0 4px" }}>×</button>
                  </div>
                </div>
              );
            })}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 16px", fontSize: 13, color: C.muted }}>
              <span>Rooms Subtotal</span><span>{fmt(roomsTotal)}</span>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <button onClick={() => setShowInstall(!showInstall)} style={{
          background: showInstall ? C.faint : "transparent",
          border: `1px solid ${showInstall ? C.gold : C.border}`,
          borderRadius: 8, padding: "12px 18px", cursor: "pointer",
          color: showInstall ? C.gold : C.muted, fontSize: 13, fontFamily: "Georgia, serif", width: "100%", textAlign: "left"
        }}>
          {showInstall ? "▼" : "▶"} Install & Styling Days {showInstall && installTotal > 0 ? `— ${fmt(installTotal)}` : ""}
        </button>
        {showInstall && (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "16px", marginTop: 8 }}>
            <div style={{ fontSize: 11, color: C.dim, marginBottom: 12 }}>Gregory: $250/hr · Admin: $125/hr · Designer: $175/hr</div>
            {installDays.map((d, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                <div style={{ fontSize: 13, color: C.muted, minWidth: 48 }}>Day {i + 1}</div>
                <select value={d.hours} onChange={e => updateDay(i, "hours", e.target.value)} style={{ background: C.faint, border: `1px solid ${C.border}`, borderRadius: 4, color: C.text, padding: "4px 8px", fontSize: 12, fontFamily: "Georgia, serif" }}>
                  <option value={4}>4 hrs</option>
                  <option value={8}>8 hrs</option>
                </select>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 11, color: C.dim }}>Admin</span>
                  <button onClick={() => updateDay(i, "admin", d.admin - 1)} style={{ width: 20, height: 20, borderRadius: "50%", background: C.faint, border: `1px solid ${C.border}`, color: C.text, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                  <span style={{ fontSize: 13, color: C.text, minWidth: 16, textAlign: "center" }}>{d.admin}</span>
                  <button onClick={() => updateDay(i, "admin", d.admin + 1)} style={{ width: 20, height: 20, borderRadius: "50%", background: C.faint, border: `1px solid ${C.border}`, color: C.text, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 11, color: C.dim }}>Designers</span>
                  <button onClick={() => updateDay(i, "designers", d.designers - 1)} style={{ width: 20, height: 20, borderRadius: "50%", background: C.faint, border: `1px solid ${C.border}`, color: C.text, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                  <span style={{ fontSize: 13, color: C.text, minWidth: 16, textAlign: "center" }}>{d.designers}</span>
                  <button onClick={() => updateDay(i, "designers", d.designers + 1)} style={{ width: 20, height: 20, borderRadius: "50%", background: C.faint, border: `1px solid ${C.border}`, color: C.text, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                </div>
                <div style={{ fontSize: 13, color: C.gold, marginLeft: "auto" }}>{fmt((250 * d.hours) + (125 * d.admin * d.hours) + (175 * d.designers * d.hours))}</div>
                <button onClick={() => removeInstallDay(i)} style={{ background: "transparent", border: "none", color: C.dim, cursor: "pointer", fontSize: 16 }}>×</button>
              </div>
            ))}
            <button onClick={addInstallDay} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, color: C.muted, fontSize: 12, padding: "6px 14px", cursor: "pointer", fontFamily: "Georgia, serif", marginTop: 4 }}>+ Add Day</button>
          </div>
        )}
      </div>

      {(rooms.length > 0 || (showInstall && installTotal > 0)) && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "20px 24px" }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: C.dim, marginBottom: 16 }}>TOTAL FURNISHING FEE{clientName ? ` — ${clientName.toUpperCase()}` : ""}</div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.muted, padding: "6px 0", borderBottom: `1px solid ${C.faint}` }}>
            <span>Anchor Fee</span><span>{fmt(ANCHOR_FEE)}</span>
          </div>
          {rooms.length > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.muted, padding: "6px 0", borderBottom: `1px solid ${C.faint}` }}>
              <span>Room Add-Ons</span><span>{fmt(roomsTotal)}</span>
            </div>
          )}
          {showInstall && installTotal > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.muted, padding: "6px 0", borderBottom: `1px solid ${C.faint}` }}>
              <span>Install & Styling</span><span>{fmt(installTotal)}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, color: C.gold, paddingTop: 12, marginBottom: 20 }}>
            <span>TOTAL</span><span>{fmt(grandTotal)}</span>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={printEstimate} style={{ background: C.gold, color: C.bg, border: "none", borderRadius: 6, padding: "10px 22px", cursor: "pointer", fontSize: 13, fontFamily: "Georgia, serif" }}>Print / Export PDF</button>
            {saveStatus && <span style={{ fontSize: 12, color: C.gold }}>{saveStatus}</span>}
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [tab, setTab] = useState("Chat");
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "Hi! I'm your Rose & Funk business assistant. Ask me anything about your processes, client situations, or how to handle day-to-day operations — or browse the tabs for references and documents.",
    type: "answer"
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [knowledge, setKnowledge] = useState("");
  const [kbStatus, setKbStatus] = useState("");
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [expandedProc, setExpandedProc] = useState(null);
  const [saveMsg, setSaveMsg] = useState("");
  const [searches, setSearches] = useState([]);
  const [sessionId, setSessionId] = useState("");
  const bottomRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    const sid = getSessionId();
    setSessionId(sid);
    api({ action: "load_knowledge" }).then(d => { if (d.content) setKnowledge(d.content); });
    api({ action: "load_documents" }).then(d => { if (d.documents) setDocuments(d.documents); });
    api({ action: "load_searches", session_id: sid }).then(d => { if (d.searches) setSearches(d.searches); });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessages = async (msgs) => {
    setLoading(true);
    try {
      const data = await api({ messages: msgs.filter(m => m.type !== "clarifying") });
      const newMsg = {
        role: "assistant",
        type: data.type || "answer",
        content: data.type === "clarifying" ? null : (data.text || "Sorry, no response."),
        clarifyData: data.type === "clarifying" ? data : null
      };
      setMessages([...msgs, newMsg]);
    } catch {
      setMessages([...msgs, { role: "assistant", type: "answer", content: "Something went wrong. Please try again." }]);
    }
    setLoading(false);
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    const question = input.trim();
    const userMsg = { role: "user", content: question, type: "answer" };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    api({ action: "save_search", session_id: sessionId, question }).then(() => {
      api({ action: "load_searches", session_id: sessionId }).then(d => { if (d.searches) setSearches(d.searches); });
    });
    await sendMessages(updated);
  };

  const handleClarifyAnswer = async (answer) => {
    const userMsg = { role: "user", content: answer, type: "answer" };
    const updated = [...messages, userMsg];
    setMessages(updated);
    await sendMessages(updated);
  };

  const reaskQuestion = (question) => { setInput(question); setTab("Chat"); };
  const deleteSearch = async (id) => { await api({ action: "delete_search", id }); setSearches(s => s.filter(x => x.id !== id)); };

  const saveKnowledge = async () => {
    setKbStatus("Saving…");
    const data = await api({ action: "save_knowledge", content: knowledge });
    setKbStatus(data.success ? "Saved!" : "Error saving.");
    setTimeout(() => setKbStatus(""), 2500);
  };

  const saveToKnowledge = async (content) => {
    const merged = knowledge + "\n\n" + content;
    setKnowledge(merged);
    await api({ action: "save_knowledge", content: merged });
    setSaveMsg("Saved to Knowledge Base!");
    setTimeout(() => setSaveMsg(""), 2500);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      let text = file.type === "application/pdf"
        ? await extractPdfText(await file.arrayBuffer())
        : await file.text();
      await api({ action: "save_document", name: file.name, text });
      const d = await api({ action: "load_documents" });
      if (d.documents) setDocuments(d.documents);
    } catch (err) { console.error("Upload error:", err); }
    setUploading(false);
    e.target.value = "";
  };

  const deleteDoc = async (id) => { await api({ action: "delete_document", id }); setDocuments(docs => docs.filter(d => d.id !== id)); };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "Georgia, serif", display: "flex", flexDirection: "column" }}>
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src="/logo.png" alt="Rose & Funk" style={{ height: 48, objectFit: "contain" }} />
          <div style={{ fontSize: 11, color: C.dim, letterSpacing: 2 }}>STUDIO ASSISTANT</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: tab === t ? C.gold : "transparent",
              color: tab === t ? C.bg : C.muted,
              border: `1px solid ${tab === t ? C.gold : C.border}`,
              borderRadius: 4, padding: "6px 14px", cursor: "pointer",
              fontSize: 12, letterSpacing: 1, fontFamily: "Georgia, serif"
            }}>{t.toUpperCase()}</button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <div style={{ width: 220, background: C.surface, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", overflowY: "auto", flexShrink: 0 }}>
          <div style={{ padding: "16px 14px 8px", fontSize: 10, letterSpacing: 2, color: C.dim }}>RECENT SEARCHES</div>
          {searches.length === 0 ? (
            <div style={{ padding: "8px 14px", fontSize: 12, color: C.dim }}>Your recent questions will appear here</div>
          ) : searches.map(s => (
            <div key={s.id} style={{ display: "flex", alignItems: "flex-start", gap: 4, padding: "6px 10px", borderBottom: `1px solid ${C.faint}` }}>
              <button onClick={() => reaskQuestion(s.question)} style={{ flex: 1, background: "transparent", border: "none", color: C.muted, fontSize: 12, textAlign: "left", cursor: "pointer", fontFamily: "Georgia, serif", lineHeight: 1.4, padding: "2px 0" }}>
                {s.question.length > 60 ? s.question.slice(0, 60) + "…" : s.question}
              </button>
              <button onClick={() => deleteSearch(s.id)} style={{ background: "transparent", border: "none", color: C.dim, cursor: "pointer", fontSize: 14, padding: "0 2px", flexShrink: 0 }}>×</button>
            </div>
          ))}
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {tab === "Chat" && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", maxWidth: 800, width: "100%", margin: "0 auto", padding: "0 16px" }}>
              <div style={{ flex: 1, overflowY: "auto", padding: "24px 0", display: "flex", flexDirection: "column", gap: 16 }}>
                {messages.map((m, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
                    {m.type === "clarifying" && m.clarifyData ? (
                      <ClarifyingMessage data={m.clarifyData} onAnswer={handleClarifyAnswer} />
                    ) : (
                      <div style={{
                        maxWidth: "75%", padding: "12px 16px", borderRadius: 8, lineHeight: 1.6, fontSize: 14,
                        background: m.role === "user" ? C.gold : C.surface,
                        color: m.role === "user" ? C.bg : C.text,
                        border: m.role === "assistant" ? `1px solid ${C.border}` : "none"
                      }}>
                        {(m.content || "").split("\n").map((ln, j) => <div key={j}>{ln || <br />}</div>)}
                      </div>
                    )}
                    {m.role === "assistant" && m.type === "answer" && i > 0 && (
                      <button onClick={() => saveToKnowledge(m.content)} style={{
                        marginTop: 4, background: "transparent", border: `1px solid ${C.border}`,
                        borderRadius: 4, color: C.dim, fontSize: 10, padding: "3px 10px",
                        cursor: "pointer", letterSpacing: 1, fontFamily: "Georgia, serif"
                      }}>+ SAVE TO KNOWLEDGE BASE</button>
                    )}
                  </div>
                ))}
                {loading && (
                  <div style={{ display: "flex", justifyContent: "flex-start" }}>
                    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 16px", color: C.dim, fontSize: 13 }}>Thinking…</div>
                  </div>
                )}
                {saveMsg && <div style={{ textAlign: "center", color: C.gold, fontSize: 12 }}>{saveMsg}</div>}
                <div ref={bottomRef} />
              </div>
              <div style={{ padding: "16px 0 24px", display: "flex", gap: 10, alignItems: "flex-end" }}>
                <textarea value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder="Ask anything about Rose & Funk operations, clients, or procedures…"
                  rows={3} style={{
                    flex: 1, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
                    color: C.text, padding: "12px 14px", fontSize: 14, resize: "none",
                    outline: "none", fontFamily: "Georgia, serif", lineHeight: 1.5
                  }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <button onClick={send} disabled={loading || !input.trim()} style={{
                    background: C.gold, color: C.bg, border: "none", borderRadius: 6,
                    padding: "10px 18px", cursor: "pointer", fontSize: 13, fontFamily: "Georgia, serif",
                    opacity: loading || !input.trim() ? 0.5 : 1
                  }}>Send</button>
                  <button onClick={() => setMessages([{ role: "assistant", type: "answer", content: "Hi! I'm your Rose & Funk business assistant. Ask me anything about your processes, client situations, or how to handle day-to-day operations — or browse the tabs for references and documents." }])} style={{
                    background: "transparent", color: C.dim, border: `1px solid ${C.border}`,
                    borderRadius: 6, padding: "8px 18px", cursor: "pointer", fontSize: 11, fontFamily: "Georgia, serif"
                  }}>Clear</button>
                </div>
              </div>
            </div>
          )}

          {tab === "Estimator" && <PinGate><Estimator /></PinGate>}
          {tab === "Furnishings" && <PinGate><FurnishingsEstimator /></PinGate>}

          {tab === "Knowledge Base" && (
            <PinGate>
              <div style={{ flex: 1, maxWidth: 800, width: "100%", margin: "0 auto", padding: "24px 16px", display: "flex", flexDirection: "column", gap: 24, overflowY: "auto" }}>
                <div>
                  <div style={{ fontSize: 11, letterSpacing: 2, color: C.dim, marginBottom: 10 }}>KNOWLEDGE BASE — saved to database, persists for all team members</div>
                  <textarea value={knowledge} onChange={e => setKnowledge(e.target.value)} rows={16} style={{
                    width: "100%", background: C.surface, border: `1px solid ${C.border}`,
                    borderRadius: 8, color: C.text, padding: "14px", fontSize: 13,
                    fontFamily: "monospace", lineHeight: 1.6, resize: "vertical", outline: "none", boxSizing: "border-box"
                  }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 12 }}>
                    <button onClick={saveKnowledge} style={{ background: C.gold, color: C.bg, border: "none", borderRadius: 6, padding: "10px 22px", cursor: "pointer", fontSize: 13, fontFamily: "Georgia, serif" }}>Save Knowledge Base</button>
                    {kbStatus && <span style={{ color: C.gold, fontSize: 13 }}>{kbStatus}</span>}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, letterSpacing: 2, color: C.dim, marginBottom: 10 }}>UPLOADED DOCUMENTS — the AI reads these automatically</div>
                  <div onClick={() => fileRef.current?.click()} style={{ border: `2px dashed ${C.border}`, borderRadius: 8, padding: "24px", textAlign: "center", cursor: "pointer", color: C.dim, fontSize: 14, marginBottom: 12 }}>
                    {uploading ? "Uploading and extracting text…" : "Click to upload a file (PDF, TXT, or CSV)"}
                    <input ref={fileRef} type="file" accept=".txt,.csv,.md,.pdf" onChange={handleFileUpload} style={{ display: "none" }} />
                  </div>
                  {documents.length === 0 ? (
                    <div style={{ color: C.dim, fontSize: 13, textAlign: "center" }}>No documents uploaded yet.</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {documents.map(doc => (
                        <div key={doc.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <div style={{ fontSize: 14, color: C.text }}>{doc.name}</div>
                            <div style={{ fontSize: 11, color: C.dim, marginTop: 3 }}>{doc.content.length.toLocaleString()} characters extracted</div>
                          </div>
                          <button onClick={() => deleteDoc(doc.id)} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 4, color: C.red, fontSize: 11, padding: "4px 12px", cursor: "pointer", fontFamily: "Georgia, serif" }}>Delete</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </PinGate>
          )}
            <div style={{ flex: 1, maxWidth: 800, width: "100%", margin: "0 auto", padding: "24px 16px", display: "flex", flexDirection: "column", gap: 24, overflowY: "auto" }}>
              <div>
                <div style={{ fontSize: 11, letterSpacing: 2, color: C.dim, marginBottom: 10 }}>KNOWLEDGE BASE — saved to database, persists for all team members</div>
                <textarea value={knowledge} onChange={e => setKnowledge(e.target.value)} rows={16} style={{
                  width: "100%", background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 8, color: C.text, padding: "14px", fontSize: 13,
                  fontFamily: "monospace", lineHeight: 1.6, resize: "vertical", outline: "none", boxSizing: "border-box"
                }} />
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 12 }}>
                  <button onClick={saveKnowledge} style={{ background: C.gold, color: C.bg, border: "none", borderRadius: 6, padding: "10px 22px", cursor: "pointer", fontSize: 13, fontFamily: "Georgia, serif" }}>Save Knowledge Base</button>
                  {kbStatus && <span style={{ color: C.gold, fontSize: 13 }}>{kbStatus}</span>}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, letterSpacing: 2, color: C.dim, marginBottom: 10 }}>UPLOADED DOCUMENTS — the AI reads these automatically</div>
                <div onClick={() => fileRef.current?.click()} style={{ border: `2px dashed ${C.border}`, borderRadius: 8, padding: "24px", textAlign: "center", cursor: "pointer", color: C.dim, fontSize: 14, marginBottom: 12 }}>
                  {uploading ? "Uploading and extracting text…" : "Click to upload a file (PDF, TXT, or CSV)"}
                  <input ref={fileRef} type="file" accept=".txt,.csv,.md,.pdf" onChange={handleFileUpload} style={{ display: "none" }} />
                </div>
                {documents.length === 0 ? (
                  <div style={{ color: C.dim, fontSize: 13, textAlign: "center" }}>No documents uploaded yet.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {documents.map(doc => (
                      <div key={doc.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: 14, color: C.text }}>{doc.name}</div>
                          <div style={{ fontSize: 11, color: C.dim, marginTop: 3 }}>{doc.content.length.toLocaleString()} characters extracted</div>
                        </div>
                        <button onClick={() => deleteDoc(doc.id)} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 4, color: C.red, fontSize: 11, padding: "4px 12px", cursor: "pointer", fontFamily: "Georgia, serif" }}>Delete</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === "Procedures" && (
            <div style={{ flex: 1, maxWidth: 900, width: "100%", margin: "0 auto", padding: "24px 16px", overflowY: "auto" }}>
              {PROCEDURES.map((cat, ci) => (
                <div key={ci} style={{ marginBottom: 32 }}>
                  <div style={{ fontSize: 11, letterSpacing: 3, color: C.gold, marginBottom: 14 }}>{cat.category.toUpperCase()}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {cat.items.map((proc, pi) => {
                      const key = `${ci}-${pi}`;
                      const open = expandedProc === key;
                      return (
                        <div key={pi} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
                          <div onClick={() => setExpandedProc(open ? null : key)} style={{ padding: "14px 18px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <div style={{ fontSize: 14, color: C.text }}>{proc.title}</div>
                              <div style={{ fontSize: 11, color: ownerColor(proc.owner), marginTop: 3, letterSpacing: 1 }}>{proc.owner}</div>
                            </div>
                            <div style={{ color: C.dim, fontSize: 18 }}>{open ? "−" : "+"}</div>
                          </div>
                          {open && (
                            <div style={{ borderTop: `1px solid ${C.border}`, padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
                              {proc.steps.map((step, si) => (
                                <div key={si} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: C.faint, color: C.dim, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{si + 1}</div>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{step.text}</div>
                                    <div style={{ fontSize: 10, color: ownerColor(step.owner), marginTop: 3, letterSpacing: 1 }}>{step.owner}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
