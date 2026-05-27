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
  {
    category: "Furnishings — Pre Design",
    items: [
      {
        title: "Client Intake & Discovery", owner: "ADMIN + PRINCIPAL",
        steps: [
          { text: "Client completes Intake Form on website. If client contacts directly via call or email, send them the Keap link.", owner: "CLIENT" },
          { text: "Immediately send Client Follow Up Email to book Discovery Call via Keap.", owner: "AUTOMATIC" },
          { text: "Client books Discovery Call using Keap link. Timeblock these to certain days and times.", owner: "CLIENT" },
          { text: "Immediately send Discovery Call Booking Confirmation. Request project info, inspiration, or plans if not included in intake form.", owner: "AUTOMATIC" },
          { text: "Send Discovery Call Reminder 24 hours prior via Keap.", owner: "AUTOMATIC" },
          { text: "DISCOVERY CALL (15–30 min) via Zoom or Google Meet. Determine services they're interested in, gather project scope details.", owner: "PRINCIPAL" },
          { text: "Send Client Follow Up Email next day.", owner: "AUTOMATIC" },
          { text: "Create Budget Spreadsheet.", owner: "PRINCIPAL" },
          { text: "Within 3 days of Discovery Call, send link to schedule Proposal Review via Keap.", owner: "AUTOMATIC" },
          { text: "Client books Proposal Review via Keap link.", owner: "CLIENT" },
          { text: "Immediately send Proposal Booking Confirmation Email.", owner: "AUTOMATIC" },
          { text: "Send Reminder for Proposal Review 24 hours prior.", owner: "AUTOMATIC" },
        ]
      },
      {
        title: "Proposal Review & Contract", owner: "PRINCIPAL + ADMIN",
        steps: [
          { text: "PROPOSAL REVIEW (60–90 min).", owner: "PRINCIPAL" },
          { text: "Send Follow Up Email to client after Proposal Review next day.", owner: "ADMIN" },
          { text: "Client emails confirmation of wanting furniture design services.", owner: "CLIENT" },
          { text: "Immediately following confirmation, send Welcome Book & Next Steps (contract signatures, scheduling, invoices). Outline scope + custom design fee proposal. Put an expiration date (7–14 days).", owner: "ADMIN" },
          { text: "Same day as Welcome Book, send DocuSign.", owner: "ADMIN" },
          { text: "Receive signed contract. Set up project in Harvest, QB, and Drive.", owner: "ADMIN" },
          { text: "Immediately send Follow Up Email thanking client for signed contract. Let them know Retainer invoice is going out today. Ask availability for meetings.", owner: "ADMIN" },
          { text: "Send Retainer Invoice upon receipt of signed contract.", owner: "ADMIN" },
          { text: "Within 24 hours of signed contract, schedule project in calendar following Calendar Process. Send client their first initial meeting date.", owner: "ADMIN" },
          { text: "Within 3 days of signed contract, send client proposed meeting dates with payment schedule.", owner: "ADMIN" },
          { text: "Within 3 days of signed contract, send Invoice for Phase 1.", owner: "ADMIN" },
          { text: "Send client reminder email 24 hours before Initial Meeting via Keap.", owner: "AUTOMATIC" },
        ]
      },
      {
        title: "Drawing File Set-Up", owner: "DESIGNER",
        steps: [
          { text: "Receive DWG file from client or builder.", owner: "ADMIN" },
          { text: "Set up Drawing File.", owner: "DESIGNER" },
          { text: "Set up Drawing Sheets.", owner: "DESIGNER" },
          { text: "Furniture Layout in AutoCAD.", owner: "DESIGNER" },
          { text: "Set up all meeting dates in calendar: Initial Meeting, Shopping Day, Furniture Meeting, Furniture & Fabric Confirmation Meeting, Accessory & Art Meeting, Furniture & Accessory Set-Up Day.", owner: "ADMIN" },
        ]
      },
    ]
  },
  {
    category: "Furnishings — Phase 1 | Concept",
    items: [
      {
        title: "1.1 Initial Meeting", owner: "PRINCIPAL + DESIGNER",
        steps: [
          { text: "INITIAL MEETING (60–90 min). Review Welcome Book, scope, budget allowances, and inspiration images.", owner: "PRINCIPAL, DESIGNER, CLIENT" },
          { text: "Review RF Design Process with client.", owner: "PRINCIPAL" },
          { text: "Go through client wishlist.", owner: "PRINCIPAL, DESIGNER" },
          { text: "Go through client budget.", owner: "PRINCIPAL" },
          { text: "Review client inspiration photos.", owner: "PRINCIPAL, DESIGNER" },
          { text: "Send Follow Up Email with Recap and outline of next steps 1–2 days after Initial Meeting.", owner: "DESIGNER" },
        ]
      },
      {
        title: "1.2 – 1.4 Sourcing & Mood Boards", owner: "DESIGNER + PRINCIPAL",
        steps: [
          { text: "Sourcing — research and source all furniture selections.", owner: "DESIGNER, PRINCIPAL" },
          { text: "Team Shopping Day (as needed).", owner: "DESIGNER, PRINCIPAL" },
          { text: "Build Furniture Mood Boards.", owner: "DESIGNER" },
          { text: "Gregory reviews Furniture Mood Boards.", owner: "PRINCIPAL" },
        ]
      },
      {
        title: "1.5 – 1.7 Furniture Pricing, Meeting & Revisions", owner: "DESIGNER + PRINCIPAL",
        steps: [
          { text: "Compile Furniture Pricing. Note all requested revisions.", owner: "DESIGNER" },
          { text: "Send Phase 2 Invoice.", owner: "ADMIN" },
          { text: "Send reminder email for Furniture Meeting via Keap.", owner: "AUTOMATIC" },
          { text: "FURNITURE MEETING (2 hours). Present furniture boards and pricing to client.", owner: "DESIGNER, PRINCIPAL, CLIENT" },
          { text: "Send Follow Up Email with meeting notes and next steps 1–2 days after meeting.", owner: "DESIGNER" },
          { text: "Client submits revisions and feedback.", owner: "CLIENT" },
          { text: "Make Furniture Meeting Revisions.", owner: "DESIGNER" },
        ]
      },
    ]
  },
  {
    category: "Furnishings — Phase 2 | Finalize & Order",
    items: [
      {
        title: "2.1 – 2.5 Selections, Samples & Confirmation Meeting", owner: "DESIGNER",
        steps: [
          { text: "Enter all product selections into Gather.", owner: "DESIGNER" },
          { text: "Order Samples of All Materials.", owner: "DESIGNER" },
          { text: "Send reminder email for Furniture & Fabric Confirmation Meeting via Keap.", owner: "AUTOMATIC" },
          { text: "FURNITURE & FABRIC CONFIRMATION MEETING — On Site (1.5 hours). Confirm all furniture and finishes; take any measurements needed. Include drapery measurement if applicable.", owner: "DESIGNER, PRINCIPAL, CLIENT" },
          { text: "Allow travel time for on-site meeting.", owner: "DESIGNER, PRINCIPAL" },
          { text: "Make Furniture & Fabric Confirmation Meeting Revisions.", owner: "DESIGNER" },
        ]
      },
      {
        title: "2.6 – 2.11 Sign-Off & Ordering", owner: "ADMIN + DESIGNER",
        steps: [
          { text: "Send Client Sign-off.", owner: "ADMIN" },
          { text: "Receive Client Sign-off.", owner: "ADMIN" },
          { text: "Put together Orders.", owner: "ADMIN, DESIGNER" },
          { text: "Invoice client for Furniture.", owner: "ADMIN" },
          { text: "Client pays furniture invoice.", owner: "CLIENT" },
          { text: "Place Furniture Orders. Start with large and custom items first.", owner: "ADMIN" },
          { text: "Schedule Deliveries and confirm Warehousing.", owner: "ADMIN" },
        ]
      },
    ]
  },
  {
    category: "Furnishings — Phase 3 | Accessories",
    items: [
      {
        title: "4.1 – 4.3 Art & Accessory Sourcing & Presentation", owner: "DESIGNER",
        steps: [
          { text: "Art Sourcing — research and source all art and accessory selections.", owner: "DESIGNER, PRINCIPAL" },
          { text: "Build Accessory & Art Concept Boards with pricing.", owner: "DESIGNER" },
          { text: "Send client Accessory & Art Boards by email. Ask for feedback within 3 days. Clearly state how many rounds of revisions they will receive.", owner: "DESIGNER" },
          { text: "ACCESSORY & ART CONCEPT MEETING (1.5 hours). Review selections with client.", owner: "DESIGNER, PRINCIPAL, CLIENT" },
          { text: "Send Follow Up Email with meeting notes and next steps 1–2 days after meeting.", owner: "DESIGNER" },
        ]
      },
      {
        title: "4.4 – 4.9 Revisions, Sign-Off & Orders", owner: "DESIGNER + ADMIN",
        steps: [
          { text: "Make Accessory & Art Concept Board Revisions.", owner: "DESIGNER" },
          { text: "Send Client Sign-off for Accessories & Art.", owner: "ADMIN" },
          { text: "Receive Client Sign-off.", owner: "ADMIN" },
          { text: "Invoice client for Accessories & Art.", owner: "ADMIN" },
          { text: "Client pays Accessories & Art invoice (due within 3 days).", owner: "CLIENT" },
          { text: "Place Accessories Orders within 24 hours of receiving payment. Send all orders to warehouse for holding.", owner: "DESIGNER" },
          { text: "Accessory Shopping Day (as needed).", owner: "DESIGNER, PRINCIPAL" },
          { text: "Allow travel time for Accessory Shopping Day.", owner: "DESIGNER, PRINCIPAL" },
        ]
      },
    ]
  },
  {
    category: "Furnishings — Phase 4 | Installation",
    items: [
      {
        title: "Install Scheduling & Preparation", owner: "ADMIN + DESIGNER",
        steps: [
          { text: "Schedule Furniture & Accessory Set-Up Day in calendar.", owner: "ADMIN" },
          { text: "Schedule art installers.", owner: "ADMIN" },
          { text: "30–60 days prior to install, email client to confirm install date. Confirm spaces will be cleaned and cleared beforehand.", owner: "ADMIN" },
          { text: "30–60 days prior to install, schedule delivery date and handyman/art installer.", owner: "ADMIN" },
          { text: "30–60 days prior to install, schedule photographer and stylist if photographing the project.", owner: "ADMIN" },
          { text: "2 weeks prior to install: print room labels, floor plans, product lists. Have linens laundered, light bulbs and pillow inserts ready, schedule lunch delivery, get cash for tips, pack install day kit, order florals.", owner: "DESIGNER, ADMIN" },
          { text: "1 week prior to install, photoshoot prep: confirm shot list, styling items, headshot poses and outfits, weather, etc.", owner: "DESIGNER" },
          { text: "Send Reminder of Install Day 24 hours prior.", owner: "AUTOMATIC" },
        ]
      },
      {
        title: "5.1 – 5.6 Deliveries & Install", owner: "DESIGNER + PRINCIPAL",
        steps: [
          { text: "Accept Deliveries on site.", owner: "DESIGNER, PRINCIPAL, ADMIN" },
          { text: "Allow travel time for deliveries.", owner: "DESIGNER, PRINCIPAL, ADMIN" },
          { text: "FURNITURE SET-UP (full day). Deliver, place, and set up all furniture.", owner: "DESIGNER, PRINCIPAL" },
          { text: "Allow travel time for Furniture Set-Up.", owner: "DESIGNER, PRINCIPAL" },
          { text: "ACCESSORY INSTALL (full day). Place and style all accessories and art.", owner: "DESIGNER, PRINCIPAL" },
          { text: "Allow travel time for Accessory Install.", owner: "DESIGNER, PRINCIPAL" },
          { text: "Process Accessory Returns as needed.", owner: "DESIGNER" },
          { text: "Allow travel time for Accessory Returns.", owner: "DESIGNER" },
        ]
      },
      {
        title: "Photoshoot & Project Close-Out", owner: "DESIGNER + ADMIN",
        steps: [
          { text: "Email photographer for availability and schedule Photoshoot Day.", owner: "ADMIN" },
          { text: "PHOTOSHOOT DAY.", owner: "DESIGNER, PRINCIPAL, CLIENT" },
          { text: "CLIENT FINAL WALK-THROUGH (1–2 hours). Walk through all spaces with client. Create list of outstanding tasks.", owner: "PRINCIPAL, DESIGNER, CLIENT" },
          { text: "Day of walk-through: create list of outstanding tasks to be completed in 30–90 days.", owner: "DESIGNER, PRINCIPAL" },
          { text: "Within 30–90 days of install, complete all outstanding tasks. Send weekly emails to client with status updates.", owner: "DESIGNER" },
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

// ── PIN GATE ─────────────────────────────────────────────────────────────────
const PinGate = ({ children, label = "Enter PIN to Access" }) => {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [shake, setShake] = useState(false);
  const [error, setError] = useState("");

  const press = (d) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    setError("");
    if (next.length === 4) {
      if (next === "1199") { setTimeout(() => setUnlocked(true), 150); }
      else {
        setShake(true);
        setTimeout(() => { setPin(""); setShake(false); setError("Incorrect PIN"); }, 500);
      }
    }
  };
  const del = () => { setPin(p => p.slice(0, -1)); setError(""); };

  if (unlocked) return children;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 28, padding: 24 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 10, letterSpacing: 3, color: C.dim, textTransform: "uppercase", marginBottom: 4 }}>Rose & Funk</div>
        <div style={{ fontSize: 13, color: C.muted, letterSpacing: 1 }}>{label}</div>
      </div>
      <div style={{ display: "flex", gap: 14, animation: shake ? "shake 0.4s ease" : "none" }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            width: 14, height: 14, borderRadius: "50%",
            background: i < pin.length ? C.gold : "transparent",
            border: `2px solid ${i < pin.length ? C.gold : C.border}`,
            transition: "all 0.15s"
          }} />
        ))}
      </div>
      {error && <div style={{ fontSize: 12, color: C.red, letterSpacing: 1 }}>{error}</div>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 72px)", gap: 12 }}>
        {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((k, i) =>
          k === "" ? <div key={i} /> : (
            <button key={i} onClick={() => k === "⌫" ? del() : press(k)}
              style={{
                height: 72, borderRadius: 16, background: C.surface, border: `1px solid ${C.border}`,
                color: C.text, fontSize: k === "⌫" ? 20 : 24, cursor: "pointer",
                fontFamily: "Georgia, serif", WebkitTapHighlightColor: "transparent",
                transition: "background 0.1s", display: "flex", alignItems: "center", justifyContent: "center"
              }}
              onTouchStart={e => e.currentTarget.style.background = C.faint}
              onTouchEnd={e => e.currentTarget.style.background = C.surface}
            >{k}</button>
          )
        )}
      </div>
      <style>{`@keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-6px)} 80%{transform:translateX(6px)} }`}</style>
    </div>
  );
};

// ── CHAT TAB ─────────────────────────────────────────────────────────────────
const ChatTab = ({ knowledge }) => {
  const [messages, setMessages] = useState([{
    role: "assistant", content: "Hi! I'm your Rose & Funk assistant. Ask me anything about procedures, clients, or operations.", type: "answer"
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    const updated = [...messages, { role: "user", content: msg, type: "answer" }];
    setMessages(updated);
    setLoading(true);
    try {
      const data = await api({ messages: updated.map(m => ({ role: m.role, content: m.content })) });
      setMessages(prev => [...prev, { role: "assistant", content: data.text || "Sorry, no response.", type: "answer" }]);
    } catch { setMessages(prev => [...prev, { role: "assistant", content: "Network error — please try again.", type: "answer" }]); }
    setLoading(false);
  };

  const PROMPTS = [
    "What's the feedback window after a presentation?",
    "When does retainer billing start?",
    "How do I handle scope changes?",
    "What goes in the follow-up after a site visit?",
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
          {PROMPTS.map(p => (
            <button key={p} onClick={() => send(p)} style={{
              background: C.faint, border: `1px solid ${C.border}`, borderRadius: 20,
              color: C.gold, fontSize: 12, padding: "7px 14px", cursor: "pointer",
              fontFamily: "Georgia, serif", WebkitTapHighlightColor: "transparent", textAlign: "left"
            }}>{p}</button>
          ))}
        </div>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "85%", padding: "12px 15px", borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              fontSize: 15, lineHeight: 1.55,
              background: m.role === "user" ? C.gold : C.surface,
              color: m.role === "user" ? C.bg : C.text,
              border: m.role === "assistant" ? `1px solid ${C.border}` : "none",
              whiteSpace: "pre-wrap"
            }}>{m.content}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "18px 18px 18px 4px", padding: "12px 16px", color: C.dim, fontSize: 14 }}>Thinking…</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={{ padding: "10px 12px 10px", background: C.bg, borderTop: `1px solid ${C.border}`, display: "flex", gap: 10, alignItems: "flex-end" }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Ask anything…"
          rows={1}
          style={{
            flex: 1, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 22,
            color: C.text, padding: "12px 16px", fontSize: 15, resize: "none", outline: "none",
            fontFamily: "Georgia, serif", lineHeight: 1.4, maxHeight: 120, overflowY: "auto"
          }}
          onInput={e => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
        />
        <button onClick={() => send()} disabled={loading || !input.trim()} style={{
          width: 46, height: 46, borderRadius: "50%", background: input.trim() ? C.gold : C.faint,
          border: "none", cursor: "pointer", flexShrink: 0, fontSize: 20,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.2s", WebkitTapHighlightColor: "transparent"
        }}>↑</button>
      </div>
    </div>
  );
};

// ── ESTIMATOR TAB ─────────────────────────────────────────────────────────────
const EstimatorTab = () => {
  const [qtys, setQtys] = useState({});
  const [clientName, setClientName] = useState("");
  const [savedEstimates, setSavedEstimates] = useState([]);
  const [saveStatus, setSaveStatus] = useState("");
  const [showSaved, setShowSaved] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => { api({ action: "load_estimates" }).then(d => { if (d.estimates) setSavedEstimates(d.estimates); }); }, []);

  const setQty = (id, val) => setQtys(q => ({ ...q, [id]: Math.max(0, parseInt(val) || 0) }));
  const selectedRooms = ROOMS.filter(r => (qtys[r.id] || 0) > 0);
  const total = selectedRooms.reduce((sum, r) => sum + r.cost * qtys[r.id], 0);

  const saveEstimate = async () => {
    if (!clientName.trim()) { setSaveStatus("Enter a client name first."); setTimeout(() => setSaveStatus(""), 2500); return; }
    if (total === 0) { setSaveStatus("Add at least one room."); setTimeout(() => setSaveStatus(""), 2500); return; }
    const rooms = selectedRooms.map(r => ({ id: r.id, label: r.label, cost: r.cost, qty: qtys[r.id] }));
    await api({ action: "save_estimate", client_name: clientName, rooms, total });
    setSaveStatus("Saved!");
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
    const win = window.open("", "_blank");
    win.document.write(`<html><head><title>Rose & Funk — ${clientName || "Project"} Estimate</title>
    <style>body{font-family:Georgia,serif;color:#1a1814;padding:40px;max-width:700px;margin:0 auto}h1{font-size:28px;letter-spacing:4px;margin-bottom:4px}h2{font-size:12px;letter-spacing:3px;color:#8a7a65;font-weight:normal;margin-bottom:32px}.client{font-size:18px;margin-bottom:24px}table{width:100%;border-collapse:collapse;margin-bottom:24px}th{text-align:left;font-size:11px;letter-spacing:2px;color:#8a7a65;padding:8px 0;border-bottom:1px solid #d4cdc4}td{padding:8px 0;font-size:13px;border-bottom:1px solid #f0ebe3}td:last-child{text-align:right}.total-row td{font-size:16px;font-weight:bold;border-top:2px solid #1a1814;border-bottom:none;padding-top:12px}.phase{display:flex;justify-content:space-between;padding:10px 14px;background:#f8f6f3;margin-bottom:6px;border-radius:4px}.footer{margin-top:48px;font-size:11px;color:#8a7a65;letter-spacing:1px}</style></head><body>
    <h1>ROSE & FUNK</h1><h2>INTERIOR DESIGN — PROJECT ESTIMATE</h2>
    <div class="client">Client: ${clientName || "—"}</div>
    <div class="client" style="font-size:13px;color:#8a7a65;">Date: ${new Date().toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}</div>
    <table><tr><th>ROOM</th><th>QTY</th><th>COST</th><th>TOTAL</th></tr>
    ${selectedRooms.map(r => `<tr><td>${r.label}</td><td>${qtys[r.id]}</td><td>${fmt(r.cost)}</td><td>${fmt(r.cost * qtys[r.id])}</td></tr>`).join("")}
    <tr class="total-row"><td colspan="3">TOTAL</td><td>${fmt(total)}</td></tr></table>
    <div style="font-size:11px;letter-spacing:2px;color:#8a7a65;margin-bottom:12px;">PAYMENT SCHEDULE</div>
    ${PHASES.map(p => `<div class="phase"><div>${p.label} (${(p.pct*100).toFixed(1)}%)</div><div><strong>${fmt(total*p.pct)}</strong></div></div>`).join("")}
    <div class="footer">ROSE AND FUNK INTERIORS INC. · www.roseandfunk.com · 604.513.9118</div></body></html>`);
    win.document.close(); win.print();
  };

  if (showSummary && total > 0) return (
    <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => setShowSummary(false)} style={{ background: C.faint, border: "none", borderRadius: 10, padding: "8px 14px", color: C.muted, cursor: "pointer", fontSize: 13, fontFamily: "Georgia, serif" }}>← Back</button>
        <div style={{ fontSize: 11, letterSpacing: 2, color: C.dim }}>ESTIMATE SUMMARY</div>
      </div>
      <input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Client name…" style={{
        width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
        color: C.text, padding: "14px 16px", fontSize: 16, outline: "none",
        fontFamily: "Georgia, serif", boxSizing: "border-box"
      }} />
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
        {selectedRooms.map((r, i) => (
          <div key={r.id} style={{ display: "flex", justifyContent: "space-between", padding: "14px 16px", borderBottom: i < selectedRooms.length - 1 ? `1px solid ${C.faint}` : "none" }}>
            <span style={{ fontSize: 14, color: C.muted }}>{r.label} × {qtys[r.id]}</span>
            <span style={{ fontSize: 14, color: C.text }}>{fmt(r.cost * qtys[r.id])}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "16px", background: C.faint }}>
          <span style={{ fontSize: 16, color: C.text, fontWeight: 600 }}>TOTAL</span>
          <span style={{ fontSize: 20, color: C.gold }}>{fmt(total)}</span>
        </div>
      </div>
      <div style={{ fontSize: 11, letterSpacing: 2, color: C.dim, marginTop: 4 }}>PAYMENT SCHEDULE</div>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
        {PHASES.map((p, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: i < PHASES.length - 1 ? `1px solid ${C.faint}` : "none" }}>
            <div>
              <div style={{ fontSize: 14, color: C.text }}>{p.label}</div>
              <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>{(p.pct * 100).toFixed(1)}%</div>
            </div>
            <div style={{ fontSize: 16, color: C.gold }}>{fmt(total * p.pct)}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={saveEstimate} style={{ flex: 1, background: C.gold, color: C.bg, border: "none", borderRadius: 12, padding: "15px", cursor: "pointer", fontSize: 15, fontFamily: "Georgia, serif" }}>
          {saveStatus || "Save Estimate"}
        </button>
        <button onClick={printEstimate} style={{ flex: 1, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, color: C.muted, padding: "15px", cursor: "pointer", fontSize: 15, fontFamily: "Georgia, serif" }}>
          Print PDF
        </button>
      </div>
      {showSaved && savedEstimates.length > 0 && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", fontSize: 10, letterSpacing: 2, color: C.dim, borderBottom: `1px solid ${C.faint}` }}>SAVED ESTIMATES</div>
          {savedEstimates.map(est => (
            <div key={est.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: `1px solid ${C.faint}` }}>
              <div>
                <div style={{ fontSize: 14, color: C.text }}>{est.client_name}</div>
                <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>{fmt(est.total)} · {new Date(est.created_at).toLocaleDateString("en-CA")}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => loadEstimate(est)} style={{ background: C.gold, color: C.bg, border: "none", borderRadius: 8, fontSize: 12, padding: "6px 14px", cursor: "pointer", fontFamily: "Georgia, serif" }}>Load</button>
                <button onClick={() => deleteEstimate(est.id)} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, color: C.red, fontSize: 12, padding: "6px 14px", cursor: "pointer", fontFamily: "Georgia, serif" }}>Del</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 2, color: C.dim }}>ID BY ROOM · $200/hr</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setShowSaved(!showSaved)} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, color: C.dim, fontSize: 12, padding: "6px 12px", cursor: "pointer", fontFamily: "Georgia, serif" }}>Saved ({savedEstimates.length})</button>
          <button onClick={() => { setQtys({}); setClientName(""); }} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, color: C.dim, fontSize: 12, padding: "6px 12px", cursor: "pointer", fontFamily: "Georgia, serif" }}>Reset</button>
        </div>
      </div>
      {showSaved && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, marginBottom: 16, overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", fontSize: 10, letterSpacing: 2, color: C.dim, borderBottom: `1px solid ${C.faint}` }}>SAVED ESTIMATES</div>
          {savedEstimates.length === 0 ? <div style={{ padding: "14px", color: C.dim, fontSize: 13 }}>No saved estimates yet.</div> :
            savedEstimates.map(est => (
              <div key={est.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderBottom: `1px solid ${C.faint}` }}>
                <div>
                  <div style={{ fontSize: 14, color: C.text }}>{est.client_name}</div>
                  <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>{fmt(est.total)}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => loadEstimate(est)} style={{ background: C.gold, color: C.bg, border: "none", borderRadius: 8, fontSize: 12, padding: "6px 12px", cursor: "pointer", fontFamily: "Georgia, serif" }}>Load</button>
                  <button onClick={() => deleteEstimate(est.id)} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, color: C.red, fontSize: 12, padding: "6px 12px", cursor: "pointer", fontFamily: "Georgia, serif" }}>Del</button>
                </div>
              </div>
            ))}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: total > 0 ? 80 : 0 }}>
        {ROOMS.map(r => {
          const qty = qtys[r.id] || 0;
          return (
            <div key={r.id} style={{
              background: qty > 0 ? C.faint : C.surface,
              border: `1px solid ${qty > 0 ? C.gold : C.border}`,
              borderRadius: 12, padding: "12px 10px",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div style={{ flex: 1, minWidth: 0, marginRight: 8 }}>
                <div style={{ fontSize: 12, color: C.text, lineHeight: 1.3 }}>{r.label}</div>
                <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>{fmt(r.cost)}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <button onClick={() => setQty(r.id, qty - 1)} style={{ width: 28, height: 28, borderRadius: "50%", background: C.faint, border: `1px solid ${C.border}`, color: C.text, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", WebkitTapHighlightColor: "transparent" }}>−</button>
                <span style={{ fontSize: 14, color: C.text, minWidth: 16, textAlign: "center" }}>{qty}</span>
                <button onClick={() => setQty(r.id, qty + 1)} style={{ width: 28, height: 28, borderRadius: "50%", background: C.faint, border: `1px solid ${C.border}`, color: C.text, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", WebkitTapHighlightColor: "transparent" }}>+</button>
              </div>
            </div>
          );
        })}
      </div>
      {total > 0 && (
        <div style={{ position: "sticky", bottom: 0, padding: "12px 0 0", background: C.bg }}>
          <button onClick={() => setShowSummary(true)} style={{
            width: "100%", background: C.gold, color: C.bg, border: "none",
            borderRadius: 14, padding: "17px", cursor: "pointer", fontSize: 16,
            fontFamily: "Georgia, serif", display: "flex", justifyContent: "space-between", alignItems: "center"
          }}>
            <span>View Estimate</span>
            <span style={{ fontWeight: 700 }}>{fmt(total)}</span>
          </button>
        </div>
      )}
    </div>
  );
};

// ── FURNISHINGS TAB ───────────────────────────────────────────────────────────
const FurnishingsTab = () => {
  const [clientName, setClientName] = useState("");
  const [rooms, setRooms] = useState([]);
  const [installDays, setInstallDays] = useState([]);
  const [showInstall, setShowInstall] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const addRoom = (room) => { if (rooms.find(r => r.id === room.id)) return; setRooms(r => [...r, { ...room, roomClass: "Major" }]); };
  const setRoomClass = (id, roomClass) => setRooms(r => r.map(rm => rm.id === id ? { ...rm, roomClass } : rm));
  const removeRoom = (id) => setRooms(r => r.filter(rm => rm.id !== id));

  let majorCount = 0;
  const roomsWithPrices = rooms.map(r => {
    let price;
    if (r.roomClass === "Major") { price = r.basePrice * MAJOR_DISCOUNT[Math.min(majorCount, MAJOR_DISCOUNT.length - 1)]; majorCount++; }
    else { price = r.basePrice * CLASS_FACTORS[r.roomClass]; }
    return { ...r, price };
  });

  const roomsTotal = roomsWithPrices.reduce((s, r) => s + r.price, 0);
  const installTotal = installDays.reduce((sum, d) => sum + (250 * d.hours) + (125 * d.admin * d.hours) + (175 * d.designers * d.hours), 0);
  const grandTotal = ANCHOR_FEE + roomsTotal + (showInstall ? installTotal : 0);

  const addInstallDay = () => setInstallDays(d => [...d, { hours: 8, admin: 0, designers: 0 }]);
  const removeInstallDay = (i) => setInstallDays(d => d.filter((_, idx) => idx !== i));
  const updateDay = (i, key, val) => setInstallDays(d => d.map((day, idx) => idx === i ? { ...day, [key]: Math.max(0, parseInt(val) || 0) } : day));

  const printEstimate = () => {
    const win = window.open("", "_blank");
    win.document.write(`<html><head><title>Rose & Funk — ${clientName || "Project"} Furnishings</title>
    <style>body{font-family:Georgia,serif;color:#1a1814;padding:40px;max-width:700px;margin:0 auto}h1{font-size:28px;letter-spacing:4px;margin-bottom:4px}h2{font-size:12px;letter-spacing:3px;color:#8a7a65;font-weight:normal;margin-bottom:32px}.row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f0ebe3;font-size:13px}.grand{display:flex;justify-content:space-between;padding:16px 0;font-size:18px;font-weight:bold;border-top:2px solid #1a1814;margin-top:8px}.footer{margin-top:48px;font-size:11px;color:#8a7a65;letter-spacing:1px}.section{font-size:11px;letter-spacing:2px;color:#8a7a65;margin:20px 0 8px}</style></head><body>
    <h1>ROSE & FUNK</h1><h2>FURNISHINGS — PROJECT ESTIMATE</h2>
    <div style="font-size:18px;margin-bottom:8px">Client: ${clientName || "—"}</div>
    <div style="font-size:13px;color:#8a7a65;margin-bottom:24px">Date: ${new Date().toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}</div>
    <div class="section">PROJECT FEES</div>
    <div class="row"><span>Anchor Fee</span><span><strong>${fmt(ANCHOR_FEE)}</strong></span></div>
    <div class="section">ROOM ADD-ONS</div>
    ${roomsWithPrices.map(r => `<div class="row"><span>${r.label} (${r.roomClass})</span><span>${fmt(r.price)}</span></div>`).join("")}
    ${showInstall && installTotal > 0 ? `<div class="section">INSTALL & STYLING</div>${installDays.map((d,i) => `<div class="row"><span>Day ${i+1} — ${d.hours}hrs</span><span>${fmt((250*d.hours)+(125*d.admin*d.hours)+(175*d.designers*d.hours))}</span></div>`).join("")}` : ""}
    <div class="grand"><span>TOTAL FURNISHING FEE</span><span>${fmt(grandTotal)}</span></div>
    <div class="footer">ROSE AND FUNK INTERIORS INC. · www.roseandfunk.com · 604.513.9118</div></body></html>`);
    win.document.close(); win.print();
  };

  if (showSummary) return (
    <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => setShowSummary(false)} style={{ background: C.faint, border: "none", borderRadius: 10, padding: "8px 14px", color: C.muted, cursor: "pointer", fontSize: 13, fontFamily: "Georgia, serif" }}>← Back</button>
        <div style={{ fontSize: 11, letterSpacing: 2, color: C.dim }}>FURNISHINGS ESTIMATE</div>
      </div>
      <input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Client name…" style={{ width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, color: C.text, padding: "14px 16px", fontSize: 16, outline: "none", fontFamily: "Georgia, serif", boxSizing: "border-box" }} />
      <div style={{ background: C.surface, border: `1px solid ${C.gold}`, borderRadius: 14, padding: "14px 16px", display: "flex", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 14, color: C.text }}>Anchor Fee</div>
          <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>Project Activation</div>
        </div>
        <div style={{ fontSize: 16, color: C.gold }}>{fmt(ANCHOR_FEE)}</div>
      </div>
      {roomsWithPrices.length > 0 && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
          {roomsWithPrices.map((r, i) => (
            <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 16px", borderBottom: i < roomsWithPrices.length - 1 ? `1px solid ${C.faint}` : "none" }}>
              <div>
                <div style={{ fontSize: 14, color: C.text }}>{r.label}</div>
                <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>{r.roomClass}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <select value={r.roomClass} onChange={e => setRoomClass(r.id, e.target.value)} style={{ background: C.faint, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, padding: "4px 8px", fontSize: 12, fontFamily: "Georgia, serif" }}>
                  <option value="Major">Major</option>
                  <option value="Secondary">Secondary</option>
                  <option value="Styling">Styling</option>
                </select>
                <span style={{ fontSize: 14, color: C.gold, minWidth: 64, textAlign: "right" }}>{fmt(r.price)}</span>
                <button onClick={() => removeRoom(r.id)} style={{ background: "transparent", border: "none", color: C.dim, cursor: "pointer", fontSize: 18, padding: "0 4px" }}>×</button>
              </div>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", background: C.faint }}>
            <span style={{ fontSize: 13, color: C.muted }}>Rooms subtotal</span>
            <span style={{ fontSize: 13, color: C.muted }}>{fmt(roomsTotal)}</span>
          </div>
        </div>
      )}
      <button onClick={() => setShowInstall(!showInstall)} style={{ background: showInstall ? C.faint : "transparent", border: `1px solid ${showInstall ? C.gold : C.border}`, borderRadius: 12, padding: "14px 16px", cursor: "pointer", color: showInstall ? C.gold : C.muted, fontSize: 14, fontFamily: "Georgia, serif", textAlign: "left" }}>
        {showInstall ? "▼" : "▶"} Install & Styling {showInstall && installTotal > 0 ? `— ${fmt(installTotal)}` : ""}
      </button>
      {showInstall && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 11, color: C.dim, marginBottom: 12 }}>Gregory $250/hr · Admin $125/hr · Designer $175/hr</div>
          {installDays.map((d, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, color: C.muted, minWidth: 44 }}>Day {i+1}</span>
              <select value={d.hours} onChange={e => updateDay(i, "hours", e.target.value)} style={{ background: C.faint, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, padding: "6px 8px", fontSize: 13, fontFamily: "Georgia, serif" }}>
                <option value={4}>4 hrs</option><option value={8}>8 hrs</option>
              </select>
              {[["admin","Admin"],["designers","Designer"]].map(([key, label]) => (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 11, color: C.dim }}>{label}</span>
                  <button onClick={() => updateDay(i, key, d[key]-1)} style={{ width: 28, height: 28, borderRadius: "50%", background: C.faint, border: `1px solid ${C.border}`, color: C.text, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                  <span style={{ fontSize: 13, color: C.text, minWidth: 16, textAlign: "center" }}>{d[key]}</span>
                  <button onClick={() => updateDay(i, key, d[key]+1)} style={{ width: 28, height: 28, borderRadius: "50%", background: C.faint, border: `1px solid ${C.border}`, color: C.text, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                </div>
              ))}
              <span style={{ fontSize: 13, color: C.gold, marginLeft: "auto" }}>{fmt((250*d.hours)+(125*d.admin*d.hours)+(175*d.designers*d.hours))}</span>
              <button onClick={() => removeInstallDay(i)} style={{ background: "transparent", border: "none", color: C.dim, cursor: "pointer", fontSize: 18 }}>×</button>
            </div>
          ))}
          <button onClick={addInstallDay} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, color: C.muted, fontSize: 13, padding: "8px 16px", cursor: "pointer", fontFamily: "Georgia, serif" }}>+ Add Day</button>
        </div>
      )}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, color: C.gold, marginBottom: 16 }}>
          <span>TOTAL</span><span>{fmt(grandTotal)}</span>
        </div>
        <button onClick={printEstimate} style={{ width: "100%", background: C.gold, color: C.bg, border: "none", borderRadius: 12, padding: "15px", cursor: "pointer", fontSize: 15, fontFamily: "Georgia, serif" }}>Print / Export PDF</button>
      </div>
    </div>
  );

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
      <div style={{ fontSize: 11, letterSpacing: 2, color: C.dim, marginBottom: 12 }}>ADD ROOMS</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: rooms.length > 0 ? 80 : 0 }}>
        {FURN_ROOMS.filter(r => !rooms.find(x => x.id === r.id)).map(r => (
          <button key={r.id} onClick={() => addRoom(r)} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "13px 12px", cursor: "pointer", textAlign: "left", fontFamily: "Georgia, serif", WebkitTapHighlightColor: "transparent" }}>
            <div style={{ fontSize: 13, color: C.text }}>{r.label}</div>
            <div style={{ fontSize: 11, color: C.dim, marginTop: 3 }}>from {fmt(r.basePrice * 0.3)}</div>
          </button>
        ))}
      </div>
      {rooms.length > 0 && (
        <div style={{ position: "sticky", bottom: 0, padding: "12px 0 0", background: C.bg }}>
          <button onClick={() => setShowSummary(true)} style={{ width: "100%", background: C.gold, color: C.bg, border: "none", borderRadius: 14, padding: "17px", cursor: "pointer", fontSize: 16, fontFamily: "Georgia, serif", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>View Estimate ({rooms.length} rooms)</span>
            <span style={{ fontWeight: 700 }}>{fmt(grandTotal)}</span>
          </button>
        </div>
      )}
    </div>
  );
};

// ── PROCEDURES TAB ────────────────────────────────────────────────────────────
const ProceduresTab = () => {
  const [expandedCat, setExpandedCat] = useState(null);
  const [expandedProc, setExpandedProc] = useState(null);

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
      {PROCEDURES.map((cat, ci) => (
        <div key={ci} style={{ marginBottom: 8 }}>
          <button onClick={() => { setExpandedCat(expandedCat === ci ? null : ci); setExpandedProc(null); }} style={{
            width: "100%", background: C.surface, border: `1px solid ${expandedCat === ci ? C.gold : C.border}`,
            borderRadius: 12, padding: "16px", cursor: "pointer", textAlign: "left",
            fontFamily: "Georgia, serif", display: "flex", justifyContent: "space-between", alignItems: "center",
            WebkitTapHighlightColor: "transparent"
          }}>
            <div style={{ fontSize: 12, letterSpacing: 1.5, color: expandedCat === ci ? C.gold : C.muted, textTransform: "uppercase" }}>{cat.category}</div>
            <div style={{ color: C.dim, fontSize: 18, flexShrink: 0 }}>{expandedCat === ci ? "−" : "+"}</div>
          </button>
          {expandedCat === ci && (
            <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 6, paddingLeft: 8 }}>
              {cat.items.map((proc, pi) => {
                const key = `${ci}-${pi}`;
                const open = expandedProc === key;
                return (
                  <div key={pi} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
                    <button onClick={() => setExpandedProc(open ? null : key)} style={{
                      width: "100%", padding: "14px 16px", cursor: "pointer", background: "transparent",
                      border: "none", textAlign: "left", fontFamily: "Georgia, serif",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      WebkitTapHighlightColor: "transparent"
                    }}>
                      <div style={{ flex: 1, paddingRight: 8 }}>
                        <div style={{ fontSize: 14, color: C.text, lineHeight: 1.3 }}>{proc.title}</div>
                        <div style={{ fontSize: 10, color: ownerColor(proc.owner), marginTop: 4, letterSpacing: 1 }}>{proc.owner}</div>
                      </div>
                      <div style={{ color: C.dim, fontSize: 16, flexShrink: 0 }}>{open ? "−" : "+"}</div>
                    </button>
                    {open && (
                      <div style={{ borderTop: `1px solid ${C.border}`, padding: "12px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
                        {proc.steps.map((step, si) => (
                          <div key={si} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                            <div style={{ width: 24, height: 24, borderRadius: "50%", background: C.faint, color: C.dim, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{si + 1}</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 14, color: C.text, lineHeight: 1.5 }}>{step.text}</div>
                              <div style={{ fontSize: 10, color: ownerColor(step.owner), marginTop: 4, letterSpacing: 1 }}>{step.owner}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ── KNOWLEDGE BASE TAB ────────────────────────────────────────────────────────
const KnowledgeTab = ({ knowledge, setKnowledge }) => {
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const fileRef = useRef(null);

  useEffect(() => { api({ action: "load_documents" }).then(d => { if (d.documents) setDocuments(d.documents); }); }, []);

  const save = async () => {
    setStatus("Saving…");
    const data = await api({ action: "save_knowledge", content: knowledge });
    setStatus(data.success ? "Saved ✓" : "Error");
    setTimeout(() => setStatus(""), 2500);
  };

  const handleFile = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    try {
      const text = file.type === "application/pdf" ? await extractPdfText(await file.arrayBuffer()) : await file.text();
      await api({ action: "save_document", name: file.name, text });
      const d = await api({ action: "load_documents" });
      if (d.documents) setDocuments(d.documents);
    } catch (err) { console.error(err); }
    setUploading(false); e.target.value = "";
  };

  const deleteDoc = async (id) => { await api({ action: "delete_document", id }); setDocuments(docs => docs.filter(d => d.id !== id)); };

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ fontSize: 11, letterSpacing: 2, color: C.dim, marginBottom: 10 }}>KNOWLEDGE BASE</div>
        <textarea value={knowledge} onChange={e => setKnowledge(e.target.value)} rows={14} style={{
          width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
          color: C.text, padding: "14px", fontSize: 13, fontFamily: "monospace",
          lineHeight: 1.6, resize: "none", outline: "none", boxSizing: "border-box"
        }} />
        <button onClick={save} style={{ width: "100%", background: C.gold, color: C.bg, border: "none", borderRadius: 12, padding: "15px", cursor: "pointer", fontSize: 15, fontFamily: "Georgia, serif", marginTop: 10 }}>
          {status || "Save Knowledge Base"}
        </button>
      </div>
      <div>
        <div style={{ fontSize: 11, letterSpacing: 2, color: C.dim, marginBottom: 10 }}>UPLOADED DOCUMENTS</div>
        <div onClick={() => fileRef.current?.click()} style={{ border: `2px dashed ${C.border}`, borderRadius: 12, padding: "24px 16px", textAlign: "center", cursor: "pointer", color: C.dim, fontSize: 14, marginBottom: 12 }}>
          {uploading ? "Uploading…" : "Tap to upload PDF, TXT, or CSV"}
          <input ref={fileRef} type="file" accept=".txt,.csv,.md,.pdf" onChange={handleFile} style={{ display: "none" }} />
        </div>
        {documents.map(doc => (
          <div key={doc.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 14, color: C.text }}>{doc.name}</div>
              <div style={{ fontSize: 11, color: C.dim, marginTop: 3 }}>{doc.content.length.toLocaleString()} chars</div>
            </div>
            <button onClick={() => deleteDoc(doc.id)} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, color: C.red, fontSize: 12, padding: "6px 12px", cursor: "pointer", fontFamily: "Georgia, serif" }}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── NAV ICONS ─────────────────────────────────────────────────────────────────
const Icon = ({ name, active }) => {
  const col = active ? C.gold : C.dim;
  const icons = {
    chat: <svg width="24" height="24" fill="none" stroke={col} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    estimate: <svg width="24" height="24" fill="none" stroke={col} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 12h8M8 8h5M8 16h3"/></svg>,
    furnishings: <svg width="24" height="24" fill="none" stroke={col} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
    procedures: <svg width="24" height="24" fill="none" stroke={col} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
    knowledge: <svg width="24" height="24" fill="none" stroke={col} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  };
  return icons[name] || null;
};

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("chat");
  const [knowledge, setKnowledge] = useState("");

  useEffect(() => {
    api({ action: "load_knowledge" }).then(d => { if (d.content) setKnowledge(d.content); });
  }, []);

  const NAV = [
    { id: "chat", label: "Chat", icon: "chat" },
    { id: "estimator", label: "Estimate", icon: "estimate", pin: true },
    { id: "furnishings", label: "Furnish", icon: "furnishings", pin: true },
    { id: "procedures", label: "Process", icon: "procedures" },
    { id: "knowledge", label: "Knowledge", icon: "knowledge", pin: true },
  ];

  const renderTab = () => {
    if (tab === "chat") return <ChatTab knowledge={knowledge} />;
    if (tab === "estimator") return <PinGate label="Enter PIN to access Estimator"><EstimatorTab /></PinGate>;
    if (tab === "furnishings") return <PinGate label="Enter PIN to access Furnishings"><FurnishingsTab /></PinGate>;
    if (tab === "procedures") return <ProceduresTab />;
    if (tab === "knowledge") return <PinGate label="Enter PIN to access Knowledge Base"><KnowledgeTab knowledge={knowledge} setKnowledge={setKnowledge} /></PinGate>;
  };

  return (
    <div style={{ height: "100dvh", background: C.bg, color: C.text, fontFamily: "Georgia, serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <img src="/logo.png" alt="Rose & Funk" style={{ height: 36, objectFit: "contain" }} onError={e => e.target.style.display = "none"} />
        <div style={{ fontSize: 10, color: C.dim, letterSpacing: 3, textTransform: "uppercase" }}>Studio Assistant</div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {renderTab()}
      </div>

      {/* Bottom Nav */}
      <div style={{
        background: C.surface, borderTop: `1px solid ${C.border}`,
        display: "flex", flexShrink: 0,
        paddingBottom: "env(safe-area-inset-bottom)"
      }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => setTab(n.id)} style={{
            flex: 1, padding: "10px 4px 12px", background: "transparent", border: "none",
            cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            WebkitTapHighlightColor: "transparent"
          }}>
            <Icon name={n.icon} active={tab === n.id} />
            <span style={{ fontSize: 10, color: tab === n.id ? C.gold : C.dim, letterSpacing: 0.5, lineHeight: 1 }}>{n.label}</span>
          </button>
        ))}
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
        body { background: #0f0e0c; overscroll-behavior: none; }
        ::-webkit-scrollbar { display: none; }
        textarea, input, select, button { font-family: Georgia, serif; }
        textarea::placeholder, input::placeholder { color: #3a3028; }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-6px)} 80%{transform:translateX(6px)} }
      `}</style>
    </div>
  );
}
