import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ppextkmoibqxedfsoloo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwZXh0a21vaWJxeGVkZnNvbG9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MjE4NzUsImV4cCI6MjA5NTM5Nzg3NX0.ZJXZR-rLqX8uD4-6E_THx995jKvU2O-HaXoaOv5fzx4";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const ALLOWED_DOMAIN = "roseandfunk.com";


const TABS = ["Chat", "Estimator", "Estimator 2", "Furnishings", "Knowledge Base", "Procedures", "Contacts", "Schedule"];

const C = { // Rose & Funk light theme
  bg: "#EAE5DD", surface: "#F5F2ED", border: "#D4CFCA",
  gold: "#A98D70", text: "#2C2420", muted: "#5C5048",
  dim: "#9A8880", faint: "#E0D9D0", red: "#b5412e"
};

const ROOMS = [
  { id: "3d", label: "3D Rendering", cost: 1900 },
  { id: "a", label: "A - Exterior", cost: 2500 },
  { id: "b", label: "B - Foyer", cost: 1850 },
  { id: "c", label: "C - Staircase", cost: 2750 },
  { id: "d", label: "D - Living Room", cost: 2000 },
  { id: "e", label: "E - Dining Room", cost: 2500 },
  { id: "f", label: "F - Powder Room", cost: 1600 },
  { id: "g", label: "G - Office", cost: 2500 },
  { id: "h", label: "H - Kitchen", cost: 6350 },
  { id: "i", label: "I - Prep Kitchen", cost: 3650 },
  { id: "j", label: "J - Pantry", cost: 1600 },
  { id: "k", label: "K - Eating Nook", cost: 1150 },
  { id: "l", label: "L - Family/Living", cost: 4550 },
  { id: "m", label: "M - Mudroom", cost: 1600 },
  { id: "n", label: "N - Laundry", cost: 1400 },
  { id: "o", label: "O - Laundry (small)", cost: 1400 },
  { id: "p", label: "P - Primary Bedroom", cost: 3200 },
  { id: "q", label: "Q - Primary Ensuite", cost: 5000 },
  { id: "r", label: "R - Primary WIC", cost: 2500 },
  { id: "s", label: "S - Bedroom", cost: 1850 },
  { id: "t", label: "T - Bedroom (small)", cost: 250 },
  { id: "u", label: "U - Bathroom (3pc)", cost: 2050 },
  { id: "v", label: "V - Bathroom (4pc)", cost: 2950 },
  { id: "w", label: "W - Media Room", cost: 4550 },
  { id: "x", label: "X - Bar", cost: 2750 },
  { id: "y", label: "Y - Gym", cost: 1150 },
  { id: "z1", label: "Z - Suite | Bedroom", cost: 250 },
  { id: "z2", label: "Z - Suite | Bath", cost: 1750 },
  { id: "z3", label: "Z - Suite | Kitchen", cost: 2000 },
  { id: "z4", label: "Z - Suite | Living", cost: 750 },
  { id: "zz1", label: "ZZ - Outdoor Kitchen", cost: 2300 },
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

const PinGate = ({ children }) => {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    if (pin === "1199") {
      setUnlocked(true);
      setError("");
    } else {
      setError("Incorrect PIN. Please try again.");
      setPin("");
    }
  };

  if (unlocked) return children;

  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "32px 40px", textAlign: "center", width: 280 }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: C.dim, marginBottom: 20, fontFamily: "'Playfair Display', serif" }}>ENTER PIN TO ACCESS</div>
        <input
          type="password"
          value={pin}
          onChange={e => setPin(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
          placeholder="••••"
          maxLength={4}
          style={{
            width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6,
            color: C.text, padding: "12px", fontSize: 20, textAlign: "center", outline: "none",
            fontFamily: "'Archivo', sans-serif", boxSizing: "border-box", marginBottom: 12, letterSpacing: 8
          }}
        />
        {error && <div style={{ fontSize: 12, color: C.red, marginBottom: 10 }}>{error}</div>}
        <button
          onClick={submit}
          style={{
            background: C.gold, color: C.bg, border: "none", borderRadius: 6,
            padding: "10px 28px", cursor: "pointer", fontSize: 13, fontFamily: "'Archivo', sans-serif", width: "100%"
          }}
        >Enter</button>
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
                fontSize: 12, fontFamily: "'Archivo', sans-serif", transition: "all 0.15s"
              }}>{opt}</button>
            ))}
          </div>
        </div>
      ))}
      {allAnswered && (
        <button onClick={submit} style={{
          background: C.gold, color: C.bg, border: "none", borderRadius: 6,
          padding: "8px 20px", cursor: "pointer", fontSize: 13, fontFamily: "'Archivo', sans-serif", marginTop: 4
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
          <button onClick={() => setShowSaved(!showSaved)} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, color: C.muted, fontSize: 12, padding: "6px 14px", cursor: "pointer", fontFamily: "'Archivo', sans-serif" }}>Saved Estimates ({savedEstimates.length})</button>
          <button onClick={() => { setQtys({}); setClientName(""); }} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, color: C.dim, fontSize: 12, padding: "6px 14px", cursor: "pointer", fontFamily: "'Archivo', sans-serif" }}>Reset</button>
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
                  <button onClick={() => loadEstimate(est)} style={{ background: C.gold, color: C.bg, border: "none", borderRadius: 4, fontSize: 11, padding: "4px 12px", cursor: "pointer", fontFamily: "'Archivo', sans-serif" }}>Load</button>
                  <button onClick={() => deleteEstimate(est.id)} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 4, color: C.red, fontSize: 11, padding: "4px 12px", cursor: "pointer", fontFamily: "'Archivo', sans-serif" }}>Delete</button>
                </div>
              </div>
            ))}
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Client name…" style={{
          width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
          color: C.text, padding: "12px 14px", fontSize: 15, outline: "none",
          fontFamily: "'Archivo', sans-serif", boxSizing: "border-box"
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
            <button onClick={saveEstimate} style={{ background: C.gold, color: C.bg, border: "none", borderRadius: 6, padding: "10px 22px", cursor: "pointer", fontSize: 13, fontFamily: "'Archivo', sans-serif" }}>Save Estimate</button>
            <button onClick={printEstimate} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, color: C.muted, padding: "10px 22px", cursor: "pointer", fontSize: 13, fontFamily: "'Archivo', sans-serif" }}>Print / Export PDF</button>
            {saveStatus && <span style={{ fontSize: 12, color: C.gold }}>{saveStatus}</span>}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Estimator 2 — Project Fee Calculator ────────────────────────────────────

const E2_ROOMS = [
  { name: "Kitchen", t: "h", hrs: 28, fee: 4900 },
  { name: "Primary ensuite", t: "h", hrs: 22, fee: 3850 },
  { name: "Great room / family room", t: "h", hrs: 20, fee: 3500 },
  { name: "Media room", t: "h", hrs: 20, fee: 3500 },
  { name: "Prep kitchen", t: "h", hrs: 16, fee: 2800 },
  { name: "Primary bedroom", t: "m", hrs: 14, fee: 2450 },
  { name: "Ensuite (secondary)", t: "m", hrs: 13, fee: 2275 },
  { name: "Staircase", t: "m", hrs: 12, fee: 2100 },
  { name: "Rec room / bar", t: "m", hrs: 12, fee: 2100 },
  { name: "Dining room", t: "m", hrs: 11, fee: 1925 },
  { name: "Office / den", t: "m", hrs: 11, fee: 1925 },
  { name: "Primary WIC", t: "m", hrs: 11, fee: 1925 },
  { name: "Bedroom (secondary)", t: "s", hrs: 8, fee: 1400 },
  { name: "Outdoor kitchen", t: "s", hrs: 10, fee: 1750 },
  { name: "Bathroom / hall bath", t: "s", hrs: 9, fee: 1575 },
  { name: "Powder room", t: "s", hrs: 7, fee: 1225 },
  { name: "Foyer", t: "s", hrs: 8, fee: 1400 },
  { name: "Pantry", t: "s", hrs: 7, fee: 1225 },
  { name: "Mudroom", t: "s", hrs: 7, fee: 1225 },
  { name: "Laundry", t: "s", hrs: 6, fee: 1050 },
  { name: "Gym", t: "l", hrs: 5, fee: 875 },
  { name: "Loft area", t: "l", hrs: 5, fee: 875 },
  { name: "Dining nook", t: "l", hrs: 5, fee: 875 },
];
const E2_TIER_LABELS = { h: "High complexity", m: "Medium", s: "Standard", l: "Light touch" };
const E2_P1_TIERS = [
  { fee: 8500,  label: "Small",      spaces: "≤10 spaces",  maxSpaces: 10,  gHrs: 20, dHrs: 12 },
  { fee: 10500, label: "Medium",     spaces: "11–16 spaces", maxSpaces: 16,  gHrs: 25, dHrs: 15 },
  { fee: 13000, label: "Large",      spaces: "17–22 spaces", maxSpaces: 22,  gHrs: 31, dHrs: 18 },
  { fee: 15500, label: "Major build",spaces: "23+ spaces",   maxSpaces: 999, gHrs: 37, dHrs: 22 },
];
const E2_VISITS_DEF = [
  { id: "framing",     name: "Framing meeting",            defaultHrs: 2,   defaultOn: true  },
  { id: "drywall",     name: "Pre-drywall site visit",      defaultHrs: 2.5, defaultOn: true  },
  { id: "cabinetry",   name: "Cabinetry / millwork review", defaultHrs: 2,   defaultOn: true  },
  { id: "finishing",   name: "Finishing site visit",        defaultHrs: 2,   defaultOn: true  },
  { id: "walkthrough", name: "Final walkthrough",           defaultHrs: 2.5, defaultOn: true  },
  { id: "extra1",      name: "Additional site visit",       defaultHrs: 2,   defaultOn: false },
  { id: "extra2",      name: "Additional site visit",       defaultHrs: 2,   defaultOn: false },
];
const E2_TIER_COLORS = {
  h: { bg: "#FAECE7", color: "#993C1D" },
  m: { bg: "#FAEEDA", color: "#854F0B" },
  s: { bg: "#E6F1FB", color: "#185FA5" },
  l: { bg: "#f0efe8", color: "#666" },
};

const Estimator2 = () => {
  const [p1Custom, setP1Custom] = useState("");
  const [km, setKm] = useState(20);
  const [kmText, setKmText] = useState("20");
  const [qty, setQty] = useState(() => Object.fromEntries(E2_ROOMS.map(r => [r.name, 0])));
  const [vs, setVs] = useState(() => Object.fromEntries(E2_VISITS_DEF.map(v => [v.id, { on: v.defaultOn, hrs: v.defaultHrs, designer: false }])));
  const [mgmtMonths, setMgmtMonths] = useState("10");
  const [mgmtGHrs, setMgmtGHrs] = useState("3");
  const [mgmtDHrs, setMgmtDHrs] = useState("1");
  const [mgmtJHrs, setMgmtJHrs] = useState("0.5");

  const totalSpaces = E2_ROOMS.reduce((s, r) => s + qty[r.name], 0);
  const autoTier = E2_P1_TIERS.find(t => totalSpaces <= t.maxSpaces) || E2_P1_TIERS[3];
  const effectiveP1Fee = p1Custom !== "" ? (parseInt(p1Custom) || 0) : autoTier.fee;
  const driveHrs = km / 70;

  const calcVFee = (id) => {
    const v = vs[id]; if (!v.on) return 0;
    return (v.hrs + driveHrs * 2) * 250 + (v.designer ? v.hrs * 175 : 0);
  };

  const selRooms = E2_ROOMS.filter(r => qty[r.name] > 0);
  const roomFee = selRooms.reduce((s, r) => s + r.fee * qty[r.name], 0);
  const roomHrs = selRooms.reduce((s, r) => s + r.hrs * qty[r.name], 0);
  const roomSpaces = selRooms.reduce((s, r) => s + qty[r.name], 0);

  const d2 = Math.round(roomFee * 22 / 66);
  const d3 = Math.round(roomFee * 12 / 66);
  const d4 = roomFee - d2 - d3;

  const mMonths = parseFloat(mgmtMonths) || 0;
  const mGHrs   = parseFloat(mgmtGHrs)   || 0;
  const mDHrs   = parseFloat(mgmtDHrs)   || 0;
  const mJHrs   = parseFloat(mgmtJHrs)   || 0;
  const mgmtG = mMonths * mGHrs * 250;
  const mgmtD = mMonths * mDHrs * 175;
  const mgmtJ = mMonths * mJHrs * 125;
  const mgmtTotal = mgmtG + mgmtD + mgmtJ;
  const visitTotal = E2_VISITS_DEF.reduce((s, v) => s + calcVFee(v.id), 0);
  const p5Fee = visitTotal + mgmtTotal;
  const grand = effectiveP1Fee + roomFee + p5Fee;

  const p1Hrs = {
    g: Math.round(effectiveP1Fee * 0.60 / 250),
    d: Math.round(effectiveP1Fee * 0.35 / 175),
    j: Math.round(effectiveP1Fee * 0.05 / 125),
  };
  const hrsBreak = (fee, gP, dP, jP, blend) => {
    const tot = blend > 0 ? fee / blend : 0;
    return { g: Math.round(tot * gP), d: Math.round(tot * dP), j: Math.round(tot * jP) };
  };
  const p2Hrs = hrsBreak(d2, 0.28, 0.66, 0.06, 193);
  const p3Hrs = hrsBreak(d3, 0.20, 0.73, 0.07, 186.5);
  const p4Hrs = hrsBreak(d4, 0.15, 0.78, 0.07, 183);
  const visitGHrs = E2_VISITS_DEF.reduce((s, v) => vs[v.id].on ? s + vs[v.id].hrs + driveHrs * 2 : s, 0);
  const visitDHrs = E2_VISITS_DEF.reduce((s, v) => (vs[v.id].on && vs[v.id].designer) ? s + vs[v.id].hrs : s, 0);
  const p5Hrs = {
    g: Math.round(visitGHrs + mMonths * mGHrs),
    d: Math.round(visitDHrs + mMonths * mDHrs),
    j: Math.round(mMonths * mJHrs),
  };

  const draws = [
    { num: "Draw 1", name: "Phase 1 — Design launch",      trigger: "Due at project start",        fee: effectiveP1Fee, hrs: p1Hrs },
    { num: "Draw 2", name: "Phase 2 — Conceptual design",  trigger: "Due at start of Phase 2",     fee: d2,    hrs: p2Hrs },
    { num: "Draw 3", name: "Phase 3 — Design development", trigger: "Due at start of Phase 3",     fee: d3,    hrs: p3Hrs },
    { num: "Draw 4", name: "Phase 4 — Construction docs",  trigger: "Due at start of Phase 4",     fee: d4,    hrs: p4Hrs },
    { num: "Draw 5", name: "Phase 5 — Construction",       trigger: `${E2_VISITS_DEF.filter(v => vs[v.id].on).length} visits + ${mMonths} mo. management`, fee: p5Fee, hrs: p5Hrs },
  ];

  const numStyle = {
    background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6,
    color: C.text, padding: "6px 10px", fontSize: 13, fontFamily: "'Archivo', sans-serif", outline: "none",
  };

  return (
    <div style={{ flex: 1, maxWidth: 900, width: "100%", margin: "0 auto", padding: "24px 16px", overflowY: "auto" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: C.dim }}>PROJECT FEE CALCULATOR</div>
        <div style={{ fontSize: 12, color: C.dim, marginTop: 4 }}>P1 flat fee · P2–4 room-based · P5 calculated</div>
      </div>

      {/* ── PHASE 1 ── */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "20px 22px", marginBottom: 16 }}>
        <div style={{ display: "inline-block", fontSize: 10, fontWeight: 600, padding: "2px 10px", borderRadius: 20, background: "#E1F5EE", color: "#085041", marginBottom: 10 }}>Phase 1 — Draw 1</div>
        <div style={{ fontSize: 11, letterSpacing: 2, color: C.dim, marginBottom: 8 }}>DESIGN LAUNCH — FLAT FEE BY PROJECT SIZE</div>
        <div style={{ fontSize: 12, color: C.muted, background: C.faint, borderRadius: 6, padding: "8px 12px", marginBottom: 14, lineHeight: 1.5 }}>
          Based on Gregory (~60%) + designer (~35%) hours. Auto-selects based on room count — override if needed.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 14 }}>
          {E2_P1_TIERS.map(tier => {
            const isActive = p1Custom === "" && autoTier.fee === tier.fee;
            return (
              <button key={tier.fee} onClick={() => setP1Custom("")} style={{
                background: isActive ? C.faint : C.bg,
                border: `${isActive ? 2 : 1}px solid ${isActive ? C.gold : C.border}`,
                borderRadius: 8, padding: "12px 8px", cursor: "pointer", textAlign: "center",
                fontFamily: "'Archivo', sans-serif", transition: "border-color 0.15s"
              }}>
                <span style={{ fontSize: 10, color: C.dim, display: "block", marginBottom: 2 }}>{tier.label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: isActive ? C.text : C.muted, display: "block", marginBottom: 3 }}>
                  {tier.spaces}
                  {isActive && <span style={{ display: "inline-block", fontSize: 9, background: "#E1F5EE", color: "#085041", padding: "1px 5px", borderRadius: 10, marginLeft: 4 }}>auto</span>}
                </span>
                <span style={{ fontSize: 15, fontWeight: 600, color: C.gold, display: "block", marginBottom: 2 }}>{fmt(tier.fee)}</span>
                <span style={{ fontSize: 10, color: C.dim, display: "block" }}>~{tier.gHrs} G + {tier.dHrs} D hrs</span>
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, color: C.muted }}>Custom P1 fee:</span>
          <input type="number" value={p1Custom} onChange={e => setP1Custom(e.target.value)} placeholder="e.g. 11500" min={0} step={500} style={{ ...numStyle, width: 130 }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: C.gold }}>{fmt(effectiveP1Fee)}</span>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            `Gregory ~${Math.round(effectiveP1Fee * 0.60 / 250)} hrs · ${fmt(Math.round(effectiveP1Fee * 0.60))}`,
            `Designer ~${Math.round(effectiveP1Fee * 0.35 / 175)} hrs · ${fmt(Math.round(effectiveP1Fee * 0.35))}`,
            `Jenny ~${Math.round(effectiveP1Fee * 0.05 / 125)} hrs · ${fmt(Math.round(effectiveP1Fee * 0.05))}`,
          ].map((l, i) => <span key={i} style={{ fontSize: 12, color: C.muted, padding: "3px 10px", background: C.faint, borderRadius: 20 }}>{l}</span>)}
        </div>
      </div>

      {/* ── PHASES 2–4 ── */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "20px 22px", marginBottom: 16 }}>
        <div style={{ display: "inline-block", fontSize: 10, fontWeight: 600, padding: "2px 10px", borderRadius: 20, background: "#E6F1FB", color: "#185FA5", marginBottom: 10 }}>Phases 2–4 — Draws 2, 3 & 4</div>
        <div style={{ fontSize: 11, letterSpacing: 2, color: C.dim, marginBottom: 8 }}>ROOM DESIGN FEES</div>
        <div style={{ fontSize: 12, color: C.muted, background: C.faint, borderRadius: 6, padding: "8px 12px", marginBottom: 16, lineHeight: 1.5 }}>
          Room-specific design work across concept, elevations, specs and construction drawings. Designer-weighted rate (~$182–197/hr).
        </div>
        {["h", "m", "s", "l"].map(tier => {
          const tc = E2_TIER_COLORS[tier];
          return (
            <div key={tier} style={{ marginBottom: 16 }}>
              <div style={{ display: "inline-block", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: tc.bg, color: tc.color, marginBottom: 8 }}>
                {E2_TIER_LABELS[tier]}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {E2_ROOMS.filter(r => r.t === tier).map(r => (
                  <button key={r.name} onClick={() => setQty(q => ({ ...q, [r.name]: q[r.name] > 0 ? 0 : 1 }))} style={{
                    fontSize: 12, padding: "5px 12px",
                    border: `1px solid ${qty[r.name] > 0 ? "#999" : C.border}`,
                    borderRadius: 20, cursor: "pointer",
                    background: qty[r.name] > 0 ? C.faint : C.bg,
                    color: qty[r.name] > 0 ? C.text : C.muted,
                    fontFamily: "'Archivo', sans-serif", fontWeight: qty[r.name] > 0 ? 600 : "normal"
                  }}>
                    {r.name}{qty[r.name] > 1 ? ` \xd7${qty[r.name]}` : ""}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
        {selRooms.length === 0 ? (
          <div style={{ fontSize: 13, color: C.dim, padding: "4px 0" }}>No spaces selected yet.</div>
        ) : (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 70px 70px 80px 28px", gap: 8, marginBottom: 4 }}>
              {["Space", "Qty", "Hrs", "Fee", ""].map((h, i) => (
                <span key={i} style={{ fontSize: 11, color: C.dim, textAlign: i >= 2 ? "right" : "left" }}>{h}</span>
              ))}
            </div>
            {selRooms.map(r => (
              <div key={r.name} style={{ display: "grid", gridTemplateColumns: "1fr 70px 70px 80px 28px", gap: 8, alignItems: "center", padding: "7px 0", borderBottom: `1px solid ${C.faint}` }}>
                <div>
                  <div style={{ fontSize: 13, color: C.text }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: C.dim }}>{E2_TIER_LABELS[r.t]} · {r.hrs} hrs ea</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 3, justifyContent: "center" }}>
                  <button onClick={() => setQty(q => ({ ...q, [r.name]: Math.max(0, q[r.name] - 1) }))} style={{ width: 22, height: 22, border: `1px solid ${C.border}`, borderRadius: 4, background: C.faint, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                  <span style={{ fontSize: 13, minWidth: 16, textAlign: "center", color: C.text }}>{qty[r.name]}</span>
                  <button onClick={() => setQty(q => ({ ...q, [r.name]: q[r.name] + 1 }))} style={{ width: 22, height: 22, border: `1px solid ${C.border}`, borderRadius: 4, background: C.faint, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                </div>
                <span style={{ fontSize: 12, color: C.muted, textAlign: "right" }}>{r.hrs * qty[r.name]}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.text, textAlign: "right" }}>{fmt(r.fee * qty[r.name])}</span>
                <button onClick={() => setQty(q => ({ ...q, [r.name]: 0 }))} style={{ background: "transparent", border: "none", color: C.dim, cursor: "pointer", fontSize: 16 }}>×</button>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "10px 14px", background: C.faint, borderRadius: 8, marginTop: 8 }}>
              <span style={{ fontSize: 12, color: C.muted }}>{roomSpaces} spaces · {roomHrs} hrs · P2–4 work</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{fmt(roomFee)}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── PHASE 5 ── */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "20px 22px", marginBottom: 16 }}>
        <div style={{ display: "inline-block", fontSize: 10, fontWeight: 600, padding: "2px 10px", borderRadius: 20, background: "#FAEEDA", color: "#854F0B", marginBottom: 10 }}>Phase 5 — Draw 5</div>
        <div style={{ fontSize: 11, letterSpacing: 2, color: C.dim, marginBottom: 16 }}>CONSTRUCTION PHASE</div>

        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 8 }}>Project location — one-way distance</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {[{ label: "Local (20 km)", value: 20 }, { label: "Metro Van (45 km)", value: 45 }, { label: "North Shore (80 km)", value: 80 }, { label: "Whistler (130 km)", value: 130 }].map(preset => (
              <button key={preset.value} onClick={() => { setKm(preset.value); setKmText(String(preset.value)); }} style={{
                fontSize: 12, padding: "4px 12px", border: `1px solid ${km === preset.value ? "#999" : C.border}`,
                borderRadius: 20, cursor: "pointer", background: km === preset.value ? C.faint : C.bg,
                color: km === preset.value ? C.text : C.muted, fontFamily: "'Archivo', sans-serif",
                fontWeight: km === preset.value ? 600 : "normal"
              }}>{preset.label}</button>
            ))}
            <span style={{ fontSize: 12, color: C.muted }}>Custom km:</span>
            <input type="number" value={kmText} onChange={e => { setKmText(e.target.value); setKm(parseInt(e.target.value) || 0); }} min={0} step={5} style={{ ...numStyle, width: 70 }} />
            <span style={{ fontSize: 12, color: C.dim }}>\u2192 {driveHrs.toFixed(1)} hrs each way</span>
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 8 }}>Site visits</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {E2_VISITS_DEF.map(v => {
              const vis = vs[v.id];
              return (
                <div key={v.id} style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px", background: C.bg, opacity: vis.on ? 1 : 0.45 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <input type="checkbox" checked={vis.on} onChange={e => setVs(vv => ({ ...vv, [v.id]: { ...vv[v.id], on: e.target.checked } }))} style={{ width: 16, height: 16, cursor: "pointer", accentColor: C.gold, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: C.text, flex: 1 }}>{v.name}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: vis.on ? C.gold : C.dim, minWidth: 70, textAlign: "right" }}>{vis.on ? fmt(calcVFee(v.id)) : "\u2014"}</span>
                  </div>
                  {vis.on && (
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${C.faint}`, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 11, color: C.dim, marginBottom: 4 }}>On-site hours</div>
                        <input type="number" value={vis.hrs} min={0.5} max={8} step={0.5} onChange={e => setVs(vv => ({ ...vv, [v.id]: { ...vv[v.id], hrs: parseFloat(e.target.value) || 2 } }))} style={{ ...numStyle, width: 65 }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: C.dim, marginBottom: 4 }}>Total (incl. {(driveHrs * 2).toFixed(1)} hrs return)</div>
                        <div style={{ fontSize: 12, color: C.muted, paddingTop: 6 }}>{(vis.hrs + driveHrs * 2).toFixed(1)} hrs @ $250</div>
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.muted, cursor: "pointer" }}>
                          <input type="checkbox" checked={vis.designer} onChange={e => setVs(vv => ({ ...vv, [v.id]: { ...vv[v.id], designer: e.target.checked } }))} style={{ accentColor: C.gold }} />
                          Add designer on this visit (+{fmt(vis.hrs * 175)})
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 10 }}>Construction management</div>
          {[
            { label: "Months of construction", value: mgmtMonths, setter: setMgmtMonths, result: null,      max: 36, step: 1   },
            { label: "Gregory hrs / month",    value: mgmtGHrs,   setter: setMgmtGHrs,   result: fmt(mgmtG), max: 20, step: 0.5 },
            { label: "Designer hrs / month",   value: mgmtDHrs,   setter: setMgmtDHrs,   result: fmt(mgmtD), max: 20, step: 0.5 },
            { label: "Jenny hrs / month",      value: mgmtJHrs,   setter: setMgmtJHrs,   result: fmt(mgmtJ), max: 10, step: 0.5 },
          ].map((row, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, color: C.muted, minWidth: 180 }}>{row.label}</span>
              <input type="number" value={row.value} onChange={e => row.setter(e.target.value)} min={0} max={row.max} step={row.step} style={{ ...numStyle, width: 70 }} />
              {row.result && <span style={{ fontSize: 12, color: C.dim }}>= {row.result}</span>}
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "8px 12px", background: C.faint, borderRadius: 8, marginTop: 8 }}>
            <span style={{ fontSize: 12, color: C.muted }}>Total management fee</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{fmt(mgmtTotal)}</span>
          </div>
          <div style={{ fontSize: 12, color: C.muted, background: C.faint, borderRadius: 6, padding: "7px 12px", marginTop: 8, lineHeight: 1.5 }}>
            Builder communication, trade coordination, RFIs, drawing questions, supplier follow-up.
          </div>
        </div>
      </div>

      {/* ── DRAW SCHEDULE ── */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "20px 22px" }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: C.dim, marginBottom: 14 }}>DRAW SCHEDULE</div>
        <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 90px 90px", gap: 10, marginBottom: 8 }}>
          {["Draw", "Phase", "Fee", "With GST"].map((h, i) => (
            <span key={i} style={{ fontSize: 11, color: C.dim, textAlign: i >= 2 ? "right" : "left" }}>{h}</span>
          ))}
        </div>
        {draws.map((d, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "80px 1fr 90px 90px", gap: 10, alignItems: "start", padding: "12px 0", borderBottom: i < draws.length - 1 ? `1px solid ${C.faint}` : "none" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.dim, paddingTop: 2 }}>{d.num}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 2 }}>{d.name}</div>
              <div style={{ fontSize: 11, color: C.dim, marginBottom: 4 }}>{d.trigger}</div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {d.hrs.g > 0 && <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 12, background: "#E6F1FB", color: "#185FA5", whiteSpace: "nowrap" }}>Gregory {d.hrs.g} hrs</span>}
                {d.hrs.d > 0 && <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 12, background: "#E1F5EE", color: "#085041", whiteSpace: "nowrap" }}>Designer {d.hrs.d} hrs</span>}
                {d.hrs.j > 0 && <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 12, background: C.faint, color: C.dim, whiteSpace: "nowrap" }}>Jenny {d.hrs.j} hrs</span>}
              </div>
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: C.text, textAlign: "right", paddingTop: 2 }}>{fmt(d.fee)}</span>
            <span style={{ fontSize: 12, color: C.muted, textAlign: "right", paddingTop: 4 }}>{fmt(d.fee * 1.05)}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingTop: 14, borderTop: `2px solid ${C.border}`, marginTop: 4 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Total project fee</span>
          <span style={{ fontSize: 26, fontWeight: 600, color: C.gold }}>{fmt(grand)}</span>
        </div>
        {grand > 0 && (
          <div style={{ fontSize: 12, color: C.dim, marginTop: 6 }}>
            + 5% GST = {fmt(grand * 0.05)}&nbsp;&nbsp;\u2192&nbsp;&nbsp;Total with tax {fmt(grand * 1.05)}
          </div>
        )}
      </div>
    </div>
  );
};

const FurnishingsEstimator = () => {
  const [clientName, setClientName] = useState("");
  const [rooms, setRooms] = useState([]);
  const [installDays, setInstallDays] = useState([]);
  const [showInstall, setShowInstall] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [savedEstimates, setSavedEstimates] = useState([]);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => { loadSavedEstimates(); }, []);

  const loadSavedEstimates = async () => {
    const { data } = await supabase.from("furnishing_estimates").select("*").order("created_at", { ascending: false });
    if (data) setSavedEstimates(data);
  };

  const saveEstimate = async () => {
    if (!clientName.trim()) { setSaveStatus("Please enter a client name first."); setTimeout(() => setSaveStatus(""), 2500); return; }
    if (rooms.length === 0) { setSaveStatus("Please add at least one room."); setTimeout(() => setSaveStatus(""), 2500); return; }
    await supabase.from("furnishing_estimates").insert([{
      client_name: clientName,
      rooms: rooms,
      install_days: installDays,
      total: grandTotal,
    }]);
    setSaveStatus("Estimate saved!");
    setTimeout(() => setSaveStatus(""), 2500);
    loadSavedEstimates();
  };

  const loadEstimate = (est) => {
    setClientName(est.client_name);
    setRooms(est.rooms || []);
    setInstallDays(est.install_days || []);
    setShowInstall((est.install_days || []).length > 0);
    setShowSaved(false);
  };

  const deleteEstimate = async (id) => {
    await supabase.from("furnishing_estimates").delete().eq("id", id);
    setSavedEstimates(e => e.filter(x => x.id !== id));
  };

  const addClass = (room) => {
    if (rooms.find(r => r.id === room.id)) return;
    setRooms(r => [...r, { ...room, roomClass: "Major", qty: 1 }]);
  };
  const setRoomClass = (id, roomClass) => setRooms(r => r.map(rm => rm.id === id ? { ...rm, roomClass } : rm));
  const updateQty = (id, delta) => setRooms(r => r.map(rm => rm.id === id ? { ...rm, qty: Math.max(1, (rm.qty || 1) + delta) } : rm));
  const removeRoom = (id) => setRooms(r => r.filter(rm => rm.id !== id));

  // Each unit of a Major room occupies its own slot in the progressive discount sequence
  let majorCount = 0;
  const roomsWithPrices = rooms.map(r => {
    const qty = r.qty || 1;
    if (r.roomClass === "Major") {
      const unitPrices = [];
      for (let i = 0; i < qty; i++) {
        const discountIdx = Math.min(majorCount, MAJOR_DISCOUNT.length - 1);
        unitPrices.push(r.basePrice * MAJOR_DISCOUNT[discountIdx]);
        majorCount++;
      }
      return { ...r, qty, price: unitPrices.reduce((s, p) => s + p, 0), unitPrices, majorStartIdx: majorCount - qty };
    } else {
      const unitPrice = r.basePrice * CLASS_FACTORS[r.roomClass];
      return { ...r, qty, price: unitPrice * qty, unitPrices: Array(qty).fill(unitPrice) };
    }
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
        <tr><th>ROOM</th><th>QTY</th><th>CLASS</th><th>FEE</th></tr>
        ${roomsWithPrices.map(r => `<tr><td>${r.label}</td><td>${r.qty}</td><td>${r.roomClass}</td><td>${fmt(r.price)}</td></tr>`).join("")}
        <tr><td colspan="3" style="font-size:12px;color:#8a7a65;">Room Total</td><td>${fmt(roomsTotal)}</td></tr>
      </table>
      <div class="fee-row" style="font-weight:bold;font-size:15px;border-top:2px solid #d4cdc4;padding-top:12px;margin-bottom:24px;">
        <span>TOTAL DESIGN FEE</span><span>${fmt(ANCHOR_FEE + roomsTotal)}</span>
      </div>
      <div class="section">PAYMENT SCHEDULE</div>
      ${[{label:"Phase 1",pct:0.40},{label:"Phase 2",pct:0.25},{label:"Phase 3",pct:0.25}].map(p =>
        `<div class="fee-row"><span>${p.label} (${(p.pct*100).toFixed(0)}% of design fee)</span><span><strong>${fmt((ANCHOR_FEE + roomsTotal) * p.pct)}</strong></span></div>`
      ).join("")}
      <div class="fee-row">
        <span>Phase 4 (10% of design fee${showInstall && installTotal > 0 ? ` + install days` : ""})</span>
        <span><strong>${fmt((ANCHOR_FEE + roomsTotal) * 0.10 + (showInstall ? installTotal : 0))}</strong></span>
      </div>
      ${showInstall && installTotal > 0 ? `
        <div class="section">INSTALL & STYLING (included in Phase 4)</div>
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 2, color: C.dim }}>FURNISHINGS ESTIMATOR</div>
          <div style={{ fontSize: 12, color: C.dim, marginTop: 4 }}>Anchor Fee {fmt(ANCHOR_FEE)} · Major/Secondary/Styling pricing</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setShowSaved(!showSaved)} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, color: C.muted, fontSize: 12, padding: "6px 14px", cursor: "pointer", fontFamily: "'Archivo', sans-serif" }}>Saved Estimates ({savedEstimates.length})</button>
          <button onClick={() => { setRooms([]); setClientName(""); setInstallDays([]); setShowInstall(false); }} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, color: C.dim, fontSize: 12, padding: "6px 14px", cursor: "pointer", fontFamily: "'Archivo', sans-serif" }}>Reset</button>
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
                  <button onClick={() => loadEstimate(est)} style={{ background: C.gold, color: C.bg, border: "none", borderRadius: 4, fontSize: 11, padding: "4px 12px", cursor: "pointer", fontFamily: "'Archivo', sans-serif" }}>Load</button>
                  <button onClick={() => deleteEstimate(est.id)} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 4, color: C.red, fontSize: 11, padding: "4px 12px", cursor: "pointer", fontFamily: "'Archivo', sans-serif" }}>Delete</button>
                </div>
              </div>
            ))}
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Client name…" style={{
          width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
          color: C.text, padding: "12px 14px", fontSize: 15, outline: "none",
          fontFamily: "'Archivo', sans-serif", boxSizing: "border-box"
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
            padding: "10px 14px", cursor: "pointer", textAlign: "left", fontFamily: "'Archivo', sans-serif"
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
            {roomsWithPrices.map((r) => {
              const majorLabel = r.roomClass === "Major" && r.qty > 0
                ? r.qty === 1
                  ? `Major #${r.majorStartIdx + 1} — ${(MAJOR_DISCOUNT[Math.min(r.majorStartIdx, MAJOR_DISCOUNT.length - 1)] * 100).toFixed(0)}% rate`
                  : `Major #${r.majorStartIdx + 1}–${r.majorStartIdx + r.qty} — ${r.unitPrices.map((p, i) => (MAJOR_DISCOUNT[Math.min(r.majorStartIdx + i, MAJOR_DISCOUNT.length - 1)] * 100).toFixed(0) + "%").join(", ")}`
                : null;
              return (
                <div key={r.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: C.text }}>{r.label}</div>
                    {majorLabel && <div style={{ fontSize: 10, color: C.dim, marginTop: 2 }}>{majorLabel}</div>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <button onClick={() => updateQty(r.id, -1)} style={{ width: 22, height: 22, borderRadius: "50%", background: C.faint, border: `1px solid ${C.border}`, color: C.text, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                      <span style={{ fontSize: 13, color: C.text, minWidth: 18, textAlign: "center" }}>{r.qty}</span>
                      <button onClick={() => updateQty(r.id, 1)} style={{ width: 22, height: 22, borderRadius: "50%", background: C.faint, border: `1px solid ${C.border}`, color: C.text, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                    </div>
                    <select value={r.roomClass} onChange={e => setRoomClass(r.id, e.target.value)} style={{
                      background: C.faint, border: `1px solid ${C.border}`, borderRadius: 4,
                      color: C.text, padding: "4px 8px", fontSize: 12, fontFamily: "'Archivo', sans-serif", cursor: "pointer"
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
          color: showInstall ? C.gold : C.muted, fontSize: 13, fontFamily: "'Archivo', sans-serif", width: "100%", textAlign: "left"
        }}>
          {showInstall ? "▼" : "▶"} Install & Styling Days {showInstall && installTotal > 0 ? `— ${fmt(installTotal)}` : ""}
        </button>
        {showInstall && (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "16px", marginTop: 8 }}>
            <div style={{ fontSize: 11, color: C.dim, marginBottom: 12 }}>Gregory: $250/hr · Admin: $125/hr · Designer: $175/hr</div>
            {installDays.map((d, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                <div style={{ fontSize: 13, color: C.muted, minWidth: 48 }}>Day {i + 1}</div>
                <select value={d.hours} onChange={e => updateDay(i, "hours", e.target.value)} style={{ background: C.faint, border: `1px solid ${C.border}`, borderRadius: 4, color: C.text, padding: "4px 8px", fontSize: 12, fontFamily: "'Archivo', sans-serif" }}>
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
            <button onClick={addInstallDay} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, color: C.muted, fontSize: 12, padding: "6px 14px", cursor: "pointer", fontFamily: "'Archivo', sans-serif", marginTop: 4 }}>+ Add Day</button>
          </div>
        )}
      </div>

      {(rooms.length > 0 || (showInstall && installTotal > 0)) && (() => {
        const designFee = ANCHOR_FEE + roomsTotal;
        const FURN_PHASES = [
          { label: "Phase 1", pct: 0.40 },
          { label: "Phase 2", pct: 0.25 },
          { label: "Phase 3", pct: 0.25 },
        ];
        const phase4Design = designFee * 0.10;
        const phase4Total = phase4Design + (showInstall ? installTotal : 0);
        return (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "20px 24px" }}>
            <div style={{ fontSize: 11, letterSpacing: 2, color: C.dim, marginBottom: 16 }}>ESTIMATE SUMMARY{clientName ? ` — ${clientName.toUpperCase()}` : ""}</div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.muted, padding: "6px 0", borderBottom: `1px solid ${C.faint}` }}>
              <span>Anchor Fee</span><span>{fmt(ANCHOR_FEE)}</span>
            </div>
            {rooms.length > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.muted, padding: "6px 0", borderBottom: `1px solid ${C.faint}` }}>
                <span>Room Add-Ons</span><span>{fmt(roomsTotal)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, color: C.text, padding: "10px 0", borderBottom: `1px solid ${C.border}`, marginBottom: 16 }}>
              <span>TOTAL DESIGN FEE</span><span style={{ color: C.gold }}>{fmt(designFee)}</span>
            </div>

            <div style={{ fontSize: 11, letterSpacing: 2, color: C.dim, marginBottom: 12 }}>PAYMENT SCHEDULE</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {FURN_PHASES.map((p, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: C.faint, borderRadius: 6 }}>
                  <div>
                    <div style={{ fontSize: 13, color: C.text }}>{p.label}</div>
                    <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>{(p.pct * 100).toFixed(0)}% of design fee</div>
                  </div>
                  <div style={{ fontSize: 15, color: C.gold }}>{fmt(designFee * p.pct)}</div>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: C.faint, borderRadius: 6 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: C.text }}>Phase 4</div>
                  <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>10% of design fee{showInstall && installTotal > 0 ? ` + install days` : ""}</div>
                  {showInstall && installTotal > 0 && (
                    <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>
                      {fmt(phase4Design)} design + {fmt(installTotal)} install
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 15, color: C.gold }}>{fmt(phase4Total)}</div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, color: C.gold, paddingTop: 8, marginBottom: 20, borderTop: `1px solid ${C.border}` }}>
              <span>TOTAL</span><span>{fmt(grandTotal)}</span>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button onClick={saveEstimate} style={{ background: C.gold, color: C.bg, border: "none", borderRadius: 6, padding: "10px 22px", cursor: "pointer", fontSize: 13, fontFamily: "'Archivo', sans-serif" }}>Save Estimate</button>
              <button onClick={printEstimate} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, color: C.muted, padding: "10px 22px", cursor: "pointer", fontSize: 13, fontFamily: "'Archivo', sans-serif" }}>Print / Export PDF</button>
              {saveStatus && <span style={{ fontSize: 12, color: C.gold }}>{saveStatus}</span>}
            </div>
          </div>
        );
      })()}
    </div>
  );
};

const CONTACT_TYPES = ["Client", "Builder", "Trade", "Rep"];

// ── Scheduling Engine ────────────────────────────────────────────────────────

const fmtDate = (d) => d.toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
const fmtTime = (d) => d.toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit", hour12: true });

const addWorkDays = (date, days) => {
  let d = new Date(date);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0) added++;
  }
  return d;
};

const nextMeetingDay = (date, preferFriday = false) => {
  let d = new Date(date);
  if (preferFriday) {
    for (let i = 0; i < 7; i++) {
      if (d.getDay() === 5) return d;
      d.setDate(d.getDate() + 1);
    }
    d = new Date(date);
  }
  while (d.getDay() === 0 || d.getDay() === 1) d.setDate(d.getDate() + 1);
  return d;
};

const getMeetingOptions = (baseDate, count = 3) => {
  const options = [];
  let d = nextMeetingDay(new Date(baseDate));
  for (let i = 0; i < count; i++) {
    options.push(new Date(d));
    d = new Date(d);
    d.setDate(d.getDate() + (d.getDay() === 4 ? 3 : 2));
    while (d.getDay() === 0 || d.getDay() === 1) d.setDate(d.getDate() + 1);
  }
  return options;
};

const withTime = (date, hour, min = 0) => {
  const d = new Date(date);
  d.setHours(hour, min, 0, 0);
  return d;
};

const buildIDSchedule = (clientName, contractDate) => {
  const start = new Date(contractDate);
  const events = [];
  let cursor = new Date(start);

  cursor = addWorkDays(start, 1);
  events.push({ phase: "Pre-Design", type: "block", label: `Design ${clientName} | Initial Drawing Set-up`, start: withTime(cursor, 9), end: withTime(cursor, 17), days: 3, notes: "Designer — 3 days drawing set-up" });

  cursor = addWorkDays(cursor, 3);
  const initialMtgOptions = getMeetingOptions(cursor);
  events.push({ phase: "Phase 1", type: "meeting", label: `RF ${clientName} | Initial Meeting 1.1`, durationHrs: 1.5, options: initialMtgOptions, selectedOption: 0, notes: "Gregory + Designer + Client · 1.5 hrs · Zoom or in-person" });

  events.push({ phase: "Phase 1", type: "block", label: `Design ${clientName} | Aesthetic Direction`, days: 2, offsetFromPrev: 1, notes: "Gregory OFF 9am–4pm · Designer invited · No client meetings" });
  events.push({ phase: "Phase 1", type: "meeting", label: `RF ${clientName} | Aesthetic Direction Meeting`, durationHrs: 1.5, offsetFromPrevBlock: 1, options: [], selectedOption: 0, notes: "Gregory + Designer + Client · 1.5 hrs" });
  events.push({ phase: "Phase 1", type: "meeting", label: `RF ${clientName} | Appliance + Plumbing Meeting`, durationHrs: 4, offsetFromPrev: 2, options: [], selectedOption: 0, notes: "Gregory + Designer + Client · 4 hrs" });

  events.push({ phase: "Phase 2", type: "block", label: `Design ${clientName} | Team Material Concept`, days: 2, offsetFromPrev: 2, notes: "Gregory OFF 9am–4pm · Designer invited · No client meetings" });
  events.push({ phase: "Phase 2", type: "block", label: `Design ${clientName} | Complete Material Boards`, days: 2, offsetFromPrev: 1, notes: "Designer" });
  events.push({ phase: "Phase 2", type: "block", label: `Design ${clientName} | Lighting Concept Boards`, days: 2, offsetFromPrev: 1, notes: "Designer" });
  events.push({ phase: "Phase 2", type: "block", label: `Design ${clientName} | Sketch Elevations`, days: 1, offsetFromPrev: 1, notes: "Gregory OFF 9am–4pm · Designer invited · No client meetings" });
  events.push({ phase: "Phase 2", type: "block", label: `Design ${clientName} | Elevations in AutoCAD`, days: 2, offsetFromPrev: 1, notes: "Designer" });
  events.push({ phase: "Phase 2", type: "meeting", label: `RF ${clientName} | Concept Elevation + Material Meeting`, durationHrs: 4, offsetFromPrevBlock: 1, options: [], selectedOption: 0, notes: "Gregory + Designer + Client · 4 hrs · Prefer Friday at 11am or 1pm" });

  events.push({ phase: "Phase 3", type: "block", label: `Design ${clientName} | Concept Revisions + Material Boards`, days: 2, offsetFromPrev: 2, notes: "1 day Gregory OFF 9am–4pm · Designer invited" });
  events.push({ phase: "Phase 3", type: "block", label: `Design ${clientName} | Documentation`, days: 3, offsetFromPrev: 1, notes: "Designer" });
  events.push({ phase: "Phase 3", type: "block", label: `Design ${clientName} | Concept Exterior`, days: 1, offsetFromPrev: 1, notes: "2 hrs Gregory" });
  events.push({ phase: "Phase 3", type: "meeting", label: `RF ${clientName} | Material Confirmation Meeting`, durationHrs: 3, offsetFromPrevBlock: 1, options: [], selectedOption: 0, notes: "Gregory + Designer + Client · 3 hrs · Prefer Friday at 11am or 1pm" });

  events.push({ phase: "Phase 4", type: "block", label: `Design ${clientName} | 3D Rendering (external)`, days: 15, offsetFromPrev: 2, notes: "2–3 weeks for rendering · Client review period" });
  events.push({ phase: "Phase 4", type: "block", label: `Design ${clientName} | Material Confirmation Revisions`, days: 1, offsetFromPrev: 1, notes: "Designer" });
  events.push({ phase: "Phase 4", type: "block", label: `Design ${clientName} | Complete Remaining Elevations`, days: 3, offsetFromPrev: 4, notes: "3 client review days before this · Designer" });
  events.push({ phase: "Phase 4", type: "block", label: `Design ${clientName} | Drawing Details`, days: 1, offsetFromPrev: 1, notes: "Designer" });
  events.push({ phase: "Phase 4", type: "block", label: `Design ${clientName} | Dimension + Noting Elevations`, days: 2, offsetFromPrev: 1, notes: "Designer" });
  events.push({ phase: "Phase 4", type: "block", label: `Design ${clientName} | Plan Layouts`, days: 5, offsetFromPrev: 1, notes: "Designer" });
  events.push({ phase: "Phase 4", type: "meeting", label: `RF ${clientName} | Final Review Meeting`, durationHrs: 3, offsetFromPrevBlock: 1, options: [], selectedOption: 0, notes: "Gregory + Designer + Client · 3 hrs · Prefer Friday at 11am or 1pm" });

  events.push({ phase: "Post Final", type: "block", label: `Design ${clientName} | Client Adjustments + Send for Sign-off`, days: 1, offsetFromPrev: 3, notes: "Designer" });
  events.push({ phase: "Post Final", type: "block", label: `Design ${clientName} | Final Adjustments + Send to Print`, days: 2, offsetFromPrev: 4, notes: "3 client review days · Designer" });
  events.push({ phase: "Post Final", type: "block", label: `Design ${clientName} | Review Drawings + Gather`, days: 1, offsetFromPrev: 1, notes: "Gregory OFF 9am–4pm · Designer invited" });
  events.push({ phase: "Post Final", type: "block", label: `Design ${clientName} | All Final Edits + Send to Client`, days: 3, offsetFromPrev: 1, notes: "Designer" });

  return events;
};

const buildFurnishingsSchedule = (clientName, contractDate) => {
  const start = new Date(contractDate);
  const events = [];
  let cursor = new Date(start);

  cursor = addWorkDays(start, 1);
  events.push({ phase: "Pre-Design", type: "block", label: `Design ${clientName} | Drawing File Set-up`, days: 1, notes: "Admin + Designer · Set up drawing file, sheets, AutoCAD layout, book all meeting dates" });

  cursor = addWorkDays(cursor, 2);
  const initialMtgOptions = getMeetingOptions(cursor);
  events.push({ phase: "Phase 1 | Concept", type: "meeting", label: `RF ${clientName} | Initial Meeting`, durationHrs: 1.5, options: initialMtgOptions, selectedOption: 0, notes: "Gregory + Designer + Client · 1.5 hrs · Review scope, budget, inspiration" });

  events.push({ phase: "Phase 1 | Concept", type: "block", label: `Design ${clientName} | Sourcing`, days: 2, offsetFromPrev: 1, notes: "Gregory OFF both days 9am–4pm · Designer" });
  events.push({ phase: "Phase 1 | Concept", type: "block", label: `Design ${clientName} | Furniture Mood Boards`, days: 3, offsetFromPrev: 1, notes: "Designer 3 days · 1 day Gregory review" });
  events.push({ phase: "Phase 1 | Concept", type: "block", label: `Design ${clientName} | Furniture Pricing`, days: 1, offsetFromPrev: 1, notes: "Designer · Note all requested revisions" });
  events.push({ phase: "Phase 1 | Concept", type: "meeting", label: `RF ${clientName} | Furniture Meeting`, durationHrs: 2, offsetFromPrevBlock: 1, options: [], selectedOption: 0, notes: "Gregory + Designer + Client · 2 hrs · Present furniture boards + pricing" });
  events.push({ phase: "Phase 1 | Concept", type: "block", label: `Design ${clientName} | Furniture Meeting Revisions`, days: 1, offsetFromPrev: 1, notes: "Designer" });

  events.push({ phase: "Phase 2 | Finalize", type: "block", label: `Design ${clientName} | Enter Selections into Gather`, days: 1, offsetFromPrev: 1, notes: "Designer" });
  events.push({ phase: "Phase 2 | Finalize", type: "block", label: `Design ${clientName} | Order Samples`, days: 1, offsetFromPrev: 1, notes: "Designer" });
  events.push({ phase: "Phase 2 | Finalize", type: "meeting", label: `RF ${clientName} | Furniture + Fabric Confirmation Meeting`, durationHrs: 1.5, offsetFromPrevBlock: 2, options: [], selectedOption: 0, notes: "Gregory + Designer + Client · 1.5 hrs · ON SITE · Include drapery measurement if applicable" });
  events.push({ phase: "Phase 2 | Finalize", type: "block", label: `Design ${clientName} | Confirmation Meeting Revisions`, days: 1, offsetFromPrev: 1, notes: "Designer" });

  events.push({ phase: "Phase 3 | Accessories", type: "block", label: `Design ${clientName} | Art Sourcing`, days: 1, offsetFromPrev: 2, notes: "Gregory OFF 9am–4pm · Designer" });
  events.push({ phase: "Phase 3 | Accessories", type: "block", label: `Design ${clientName} | Accessory + Art Concept Boards`, days: 1, offsetFromPrev: 1, notes: "Designer" });
  events.push({ phase: "Phase 3 | Accessories", type: "meeting", label: `RF ${clientName} | Accessory + Art Concept Meeting`, durationHrs: 1.5, offsetFromPrevBlock: 1, options: [], selectedOption: 0, notes: "Gregory + Designer + Client · 1.5 hrs · 3 business day client review after" });
  events.push({ phase: "Phase 3 | Accessories", type: "block", label: `Design ${clientName} | Accessory Board Revisions`, days: 1, offsetFromPrev: 4, notes: "Designer · After 3 business day client review" });

  events.push({ phase: "Phase 4 | Installation", type: "meeting", label: `RF ${clientName} | Furniture Set-Up Day`, durationHrs: 7, offsetFromPrevBlock: 14, options: [], selectedOption: 0, notes: "Gregory + Designer · Full day on site · After all orders placed + delivered" });
  events.push({ phase: "Phase 4 | Installation", type: "meeting", label: `RF ${clientName} | Accessory Install Day`, durationHrs: 7, offsetFromPrev: 2, options: [], selectedOption: 0, notes: "Gregory + Designer · Full day on site" });
  events.push({ phase: "Phase 4 | Installation", type: "meeting", label: `RF ${clientName} | Photoshoot Day`, durationHrs: 6, offsetFromPrev: 3, options: [], selectedOption: 0, notes: "Gregory + Designer + Photographer" });

  return events;
};

const computeDates = (events) => {
  let cursor = null;
  return events.map((ev, i) => {
    if (ev.type === "meeting") {
      if (ev.options && ev.options.length > 0) {
        cursor = new Date(ev.options[ev.selectedOption]);
      } else {
        const off = ev.offsetFromPrev || ev.offsetFromPrevBlock || 2;
        cursor = addWorkDays(cursor || new Date(), off);
        cursor = nextMeetingDay(cursor);
      }
      const hour = ev.durationHrs >= 3 ? 11 : 10;
      return { ...ev, date: new Date(cursor), startTime: withTime(cursor, hour), endTime: withTime(cursor, hour + Math.ceil(ev.durationHrs)) };
    } else {
      const off = ev.offsetFromPrev || ev.offsetFromPrevBlock || 1;
      if (cursor) cursor = addWorkDays(cursor, off);
      else cursor = new Date();
      while (cursor.getDay() === 0 || cursor.getDay() === 1) cursor.setDate(cursor.getDate() + 1);
      const blockStart = new Date(cursor);
      if (ev.days > 1) cursor = addWorkDays(cursor, ev.days - 1);
      return { ...ev, date: blockStart, startTime: withTime(blockStart, 9), endTime: withTime(blockStart, 17) };
    }
  });
};

const PHASE_COLORS = {
  "Pre-Design": "#9A8880",
  "Phase 1": "#7a9e8e",
  "Phase 1 | Concept": "#7a9e8e",
  "Phase 2": "#8a9cb5",
  "Phase 2 | Finalize": "#8a9cb5",
  "Phase 3": "#a0896a",
  "Phase 3 | Accessories": "#a0896a",
  "Phase 4": "#9a7aaa",
  "Phase 4 | Installation": "#9a7aaa",
  "Post Final": "#A98D70",
};

const ScheduleTab = () => {
  const [projectType, setProjectType] = useState("id");
  const [clientName, setClientName] = useState("");
  const [contractDate, setContractDate] = useState("");
  const [designer, setDesigner] = useState("Chloe");
  const [comparison, setComparison] = useState(null);
  const [events, setEvents] = useState([]);
  const [step, setStep] = useState("setup");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [conflicts, setConflicts] = useState([]);

  const parseSchedule = (data) => (data.schedule || []).map(ev => ({
    ...ev,
    date: ev.date ? new Date(ev.date) : null,
    startTime: ev.date && ev.startTime ? new Date(`${ev.date}T${ev.startTime}`) : null,
    endTime: ev.date && ev.endTime ? new Date(`${ev.date}T${ev.endTime}`) : null,
    options: (ev.options || []).map(o => new Date(o)),
    selectedOption: ev.selectedOption || 0,
  }));

  const getLastDate = (schedule) => {
    if (!schedule || schedule.length === 0) return new Date(0);
    return schedule.filter(e => e.date).reduce((latest, e) => {
      let end = new Date(e.date);
      if (e.days > 1) { let added = 0; while (added < e.days - 1) { end.setDate(end.getDate() + 1); if (end.getDay() !== 0 && end.getDay() !== 1) added++; } }
      return end > latest ? end : latest;
    }, new Date(0));
  };

  const fetchSchedule = (d) => fetch("/api/schedule", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "generate_schedule", clientName: clientName.trim(), projectType, contractDate, designer: d })
  }).then(r => r.json());

  const generate = async () => {
    if (!clientName.trim() || !contractDate) return;
    setStep("loading");
    setError("");
    try {
      if (projectType === "id") {
        const [chloeData, stephanieData] = await Promise.all([fetchSchedule("Chloe"), fetchSchedule("Stephanie")]);
        if (chloeData.error) throw new Error(chloeData.error);
        if (stephanieData.error) throw new Error(stephanieData.error);
        setComparison({
          Chloe: { ...chloeData, parsed: parseSchedule(chloeData) },
          Stephanie: { ...stephanieData, parsed: parseSchedule(stephanieData) },
        });
        setStep("compare");
      } else {
        const data = await fetchSchedule("Lillian");
        if (data.error) throw new Error(data.error);
        setEvents(parseSchedule(data));
        setDesigner("Lillian");
        setConflicts(data.conflicts || []);
        setStep("review");
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
      setStep("setup");
    }
  };

  const selectDesigner = (d) => {
    const data = comparison[d];
    setEvents(data.parsed);
    setDesigner(d);
    setConflicts(data.conflicts || []);
    setComparison(null);
    setStep("review");
  };

  const selectOption = (idx, optionIdx) => {
    setEvents(evs => evs.map((ev, i) => i === idx ? { ...ev, selectedOption: optionIdx, date: ev.options[optionIdx], startTime: withTime(ev.options[optionIdx], ev.startTime?.getHours() || 11), endTime: withTime(ev.options[optionIdx], ev.endTime?.getHours() || 13) } : ev));
  };

  const approve = async () => {
    setStep("finalizing");
    try {
      const res = await fetch("/api/schedule", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "finalize_schedule", clientName: clientName.trim(), projectType, contractDate, events })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setEvents((data.schedule || []).map(ev => ({
        ...ev,
        date: ev.date ? new Date(ev.date) : null,
        startTime: ev.date && ev.startTime ? new Date(`${ev.date}T${ev.startTime}`) : null,
        endTime: ev.date && ev.endTime ? new Date(`${ev.date}T${ev.endTime}`) : null,
      })));
      setStep("approved");
    } catch (err) {
      setError("Failed to finalize schedule. Please try again.");
      setStep("review");
    }
  };

  const reset = () => { setStep("setup"); setClientName(""); setContractDate(""); setEvents([]); setConflicts([]); setError(""); setComparison(null); setRevisionMessages([]); };

  const copyAll = () => {
    const text = events.map(ev => {
      if (!ev.date) return "";
      const dateStr = fmtDate(ev.date);
      const timeStr = ev.startTime && ev.endTime ? `${fmtTime(ev.startTime)} – ${fmtTime(ev.endTime)}` : "";
      return `${ev.phase?.toUpperCase()} | ${ev.label}\n${dateStr}${ev.days > 1 ? ` (${ev.days} days)` : ""} · ${timeStr}\n${ev.notes || ""}\n`;
    }).filter(Boolean).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const [revisionInput, setRevisionInput] = useState("");
  const [revisionLoading, setRevisionLoading] = useState(false);
  const [revisionMessages, setRevisionMessages] = useState([]);

  const sendRevision = async () => {
    if (!revisionInput.trim() || revisionLoading) return;
    const msg = revisionInput.trim();
    setRevisionInput("");
    setRevisionLoading(true);
    const newMessages = [...revisionMessages, { role: "user", text: msg }];
    setRevisionMessages(newMessages);

    try {
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "revise_schedule",
          clientName: clientName.trim(),
          projectType,
          contractDate,
          events,
          revision: msg,
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (data.schedule) {
        const parsed = data.schedule.map(ev => ({
          ...ev,
          date: ev.date ? new Date(ev.date) : null,
          startTime: ev.date && ev.startTime ? new Date(`${ev.date}T${ev.startTime}`) : null,
          endTime: ev.date && ev.endTime ? new Date(`${ev.date}T${ev.endTime}`) : null,
          options: (ev.options || []).map(o => new Date(o)),
          selectedOption: ev.selectedOption || 0,
        }));
        setEvents(parsed);
      }
      setRevisionMessages([...newMessages, { role: "assistant", text: data.message || "Schedule updated." }]);
    } catch (err) {
      setRevisionMessages([...newMessages, { role: "assistant", text: `Sorry, couldn't apply that revision: ${err.message}` }]);
    }
    setRevisionLoading(false);
  };

  const schedInputStyle = { background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, padding: "10px 14px", fontSize: 14, outline: "none", fontFamily: "'Archivo', sans-serif" };
  const phases = events.length > 0 ? [...new Set(events.map(e => e.phase).filter(Boolean))] : [];

  return (
    <div style={{ flex: 1, maxWidth: 960, width: "100%", margin: "0 auto", padding: "24px 16px", overflowY: "auto" }}>

      {step === "setup" && (
        <div style={{ maxWidth: 500 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: C.dim, marginBottom: 20 }}>NEW PROJECT SCHEDULE</div>
          {error && <div style={{ background: C.red + "22", border: `1px solid ${C.red}`, borderRadius: 6, padding: "10px 14px", fontSize: 13, color: C.red, marginBottom: 16 }}>{error}</div>}

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: C.dim, marginBottom: 6, letterSpacing: 1 }}>PROJECT TYPE</div>
            <div style={{ display: "flex", gap: 8 }}>
              {[["id", "ID Construction"], ["furnishings", "Furnishings"]].map(([val, label]) => (
                <button key={val} onClick={() => { setProjectType(val); setDesigner(val === "furnishings" ? "Lillian" : "Chloe"); }} style={{
                  flex: 1, padding: "10px", borderRadius: 6, cursor: "pointer",
                  fontFamily: "'Playfair Display', serif", fontSize: 13, letterSpacing: 1,
                  background: projectType === val ? C.gold : C.surface,
                  color: projectType === val ? C.bg : C.muted,
                  border: `1px solid ${projectType === val ? C.gold : C.border}`
                }}>{label.toUpperCase()}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: C.dim, marginBottom: 6, letterSpacing: 1 }}>CLIENT NAME</div>
            <input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="e.g. Smith Family" style={{ ...schedInputStyle, width: "100%", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: C.dim, marginBottom: 6, letterSpacing: 1 }}>CONTRACT SIGNED DATE</div>
            <input type="date" value={contractDate} onChange={e => setContractDate(e.target.value)} style={{ ...schedInputStyle, width: "100%", boxSizing: "border-box" }} />
          </div>

          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "14px 16px", marginBottom: 20, fontSize: 12, color: C.dim, lineHeight: 1.6 }}>
            <div style={{ color: C.text, marginBottom: 4, fontSize: 13 }}>📅 Calendar-aware scheduling</div>
            {projectType === "id"
              ? "Claude will check both Chloe and Stephanie's availability and show you who has the earlier completion date."
              : "Claude will check Lillian's availability and propose a conflict-free schedule."}
          </div>

          <button onClick={generate} disabled={!clientName.trim() || !contractDate} style={{
            background: C.gold, color: C.bg, border: "none", borderRadius: 6,
            padding: "12px 28px", cursor: "pointer", fontSize: 13,
            fontFamily: "'Playfair Display', serif", letterSpacing: 1,
            opacity: !clientName.trim() || !contractDate ? 0.5 : 1, width: "100%"
          }}>GENERATE SCHEDULE →</button>
        </div>
      )}

      {(step === "loading" || step === "finalizing") && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0", gap: 16 }}>
          <div style={{ fontSize: 13, color: C.dim, letterSpacing: 2 }}>
            {step === "loading" ? (projectType === "id" ? "CHECKING BOTH DESIGNERS' AVAILABILITY…" : "CHECKING CALENDAR + BUILDING SCHEDULE…") : "FINALIZING SCHEDULE…"}
          </div>
          <div style={{ fontSize: 12, color: C.dim }}>
            {step === "loading" && projectType === "id" ? "Comparing Chloe and Stephanie's schedules simultaneously" : step === "loading" ? `Planning Furnishings project for ${clientName}` : "Placing all design blocks around confirmed meetings"}
          </div>
        </div>
      )}

      {step === "compare" && comparison && (
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 18, color: C.text, fontFamily: "'Playfair Display', serif", marginBottom: 4 }}>{clientName}</div>
            <div style={{ fontSize: 12, color: C.dim }}>ID Construction · Choose your designer</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            {["Chloe", "Stephanie"].map(d => {
              const data = comparison[d];
              const lastDate = getLastDate(data.parsed);
              const firstDate = data.parsed.filter(e => e.date).reduce((earliest, e) => {
                const d2 = new Date(e.date); return d2 < earliest ? d2 : earliest;
              }, new Date(9999, 0));
              const totalWeeks = lastDate > new Date(0) ? Math.round((lastDate - firstDate) / (1000 * 60 * 60 * 24 * 7) * 10) / 10 : null;
              const isEarlier = d === "Chloe"
                ? getLastDate(comparison.Chloe.parsed) <= getLastDate(comparison.Stephanie.parsed)
                : getLastDate(comparison.Stephanie.parsed) < getLastDate(comparison.Chloe.parsed);
              return (
                <div key={d} style={{
                  background: C.surface, border: `2px solid ${isEarlier ? C.gold : C.border}`,
                  borderRadius: 10, padding: "24px 20px", position: "relative"
                }}>
                  {isEarlier && (
                    <div style={{ position: "absolute", top: -11, left: 16, background: C.gold, color: C.bg, fontSize: 10, letterSpacing: 1, padding: "2px 10px", borderRadius: 10, fontFamily: "'Playfair Display', serif" }}>
                      EARLIEST COMPLETION
                    </div>
                  )}
                  <div style={{ fontSize: 20, color: C.text, fontFamily: "'Playfair Display', serif", marginBottom: 16 }}>{d}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                      <span style={{ color: C.dim }}>Completion</span>
                      <span style={{ color: C.text, fontWeight: 500 }}>{lastDate > new Date(0) ? lastDate.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" }) : "—"}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                      <span style={{ color: C.dim }}>Total duration</span>
                      <span style={{ color: C.text }}>{totalWeeks ? `${totalWeeks} weeks` : "—"}</span>
                    </div>
                    {data.conflicts && data.conflicts.length > 0 && (
                      <div style={{ fontSize: 11, color: "#a0896a", background: "#a0896a22", borderRadius: 6, padding: "6px 10px", marginTop: 4 }}>
                        ⚠ {data.conflicts.length} conflict{data.conflicts.length > 1 ? "s" : ""} adjusted
                      </div>
                    )}
                    {(!data.conflicts || data.conflicts.length === 0) && (
                      <div style={{ fontSize: 11, color: "#7a9e8e", background: "#7a9e8e22", borderRadius: 6, padding: "6px 10px", marginTop: 4 }}>
                        ✓ No conflicts
                      </div>
                    )}
                  </div>
                  <button onClick={() => selectDesigner(d)} style={{
                    width: "100%", background: isEarlier ? C.gold : "transparent",
                    color: isEarlier ? C.bg : C.muted,
                    border: `1px solid ${isEarlier ? C.gold : C.border}`,
                    borderRadius: 6, padding: "10px", cursor: "pointer",
                    fontSize: 12, fontFamily: "'Playfair Display', serif", letterSpacing: 1
                  }}>SELECT {d.toUpperCase()} →</button>
                </div>
              );
            })}
          </div>
          <button onClick={reset} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, color: C.dim, padding: "8px 16px", cursor: "pointer", fontSize: 12, fontFamily: "'Archivo', sans-serif" }}>← Start Over</button>
        </div>
      )}

      {(step === "review" || step === "approved") && (() => {
        const datesWithValues = events.filter(e => e.date).map(e => new Date(e.date));
        const firstDate = datesWithValues.length > 0 ? new Date(Math.min(...datesWithValues)) : null;
        const lastDate = events.filter(e => e.date).reduce((latest, e) => {
          let end = new Date(e.date);
          if (e.days > 1) {
            let added = 0;
            while (added < e.days - 1) {
              end.setDate(end.getDate() + 1);
              if (end.getDay() !== 0 && end.getDay() !== 1) added++;
            }
          }
          return end > latest ? end : latest;
        }, new Date(0));
        const totalDays = firstDate ? Math.round((lastDate - firstDate) / (1000 * 60 * 60 * 24)) : 0;
        const totalWeeks = Math.round(totalDays / 7 * 10) / 10;

        return (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 18, color: C.text, fontFamily: "'Playfair Display', serif" }}>{clientName}</div>
              <div style={{ fontSize: 12, color: C.dim, marginTop: 3 }}>
                {projectType === "id" ? "ID Construction" : "Furnishings"} · Contract: {new Date(contractDate + "T12:00:00").toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric" })}
              </div>
              {firstDate && lastDate > new Date(0) && (
                <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
                  <div style={{ background: C.faint, borderRadius: 6, padding: "6px 12px", fontSize: 12 }}>
                    <span style={{ color: C.dim }}>Start </span>
                    <span style={{ color: C.text }}>{firstDate.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                  <div style={{ background: C.faint, borderRadius: 6, padding: "6px 12px", fontSize: 12 }}>
                    <span style={{ color: C.dim }}>End </span>
                    <span style={{ color: C.text }}>{lastDate.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                  <div style={{ background: C.gold + "33", border: `1px solid ${C.gold}`, borderRadius: 6, padding: "6px 12px", fontSize: 12 }}>
                    <span style={{ color: C.dim }}>Total </span>
                    <span style={{ color: C.gold, fontWeight: 600 }}>{totalWeeks} weeks</span>
                  </div>
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {step === "review" && (
                <button onClick={approve} style={{ background: C.gold, color: C.bg, border: "none", borderRadius: 6, padding: "9px 20px", cursor: "pointer", fontSize: 12, fontFamily: "'Playfair Display', serif", letterSpacing: 1 }}>
                  ✓ APPROVE SCHEDULE
                </button>
              )}
              {step === "approved" && (
                <button onClick={copyAll} style={{ background: C.gold, color: C.bg, border: "none", borderRadius: 6, padding: "9px 20px", cursor: "pointer", fontSize: 12, fontFamily: "'Playfair Display', serif", letterSpacing: 1 }}>
                  {copied ? "✓ COPIED!" : "COPY ALL EVENTS"}
                </button>
              )}
              <button onClick={reset} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, color: C.dim, padding: "9px 16px", cursor: "pointer", fontSize: 12, fontFamily: "'Archivo', sans-serif" }}>New Schedule</button>
            </div>
          </div>

          {conflicts.length > 0 && (
            <div style={{ background: "#a0896a22", border: "1px solid #a0896a", borderRadius: 8, padding: "12px 16px", marginBottom: 16, fontSize: 12, color: "#a0896a" }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>⚠ Conflicts noted — dates adjusted:</div>
              {conflicts.map((c, i) => <div key={i}>· {c}</div>)}
            </div>
          )}

          {step === "approved" && (
            <div style={{ background: "#7a9e8e22", border: "1px solid #7a9e8e", borderRadius: 8, padding: "14px 18px", marginBottom: 20, fontSize: 13, color: "#7a9e8e" }}>
              ✓ Schedule approved! All design blocks have been placed. Copy all events to add to Google Calendar.
            </div>
          )}

          {phases.map(phase => (
            <div key={phase} style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: PHASE_COLORS[phase] || C.gold, marginBottom: 10 }}>{phase?.toUpperCase()}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {events.filter(e => e.phase === phase).map((ev, evIdx) => {
                  const globalIdx = events.indexOf(ev);
                  const phaseColor = PHASE_COLORS[phase] || C.gold;
                  return (
                    <div key={evIdx} style={{ background: C.surface, border: `1px solid ${ev.type === "meeting" ? phaseColor : C.border}`, borderRadius: 8, overflow: "hidden" }}>
                      <div style={{ display: "flex" }}>
                        <div style={{ width: 4, background: ev.type === "meeting" ? phaseColor : C.faint, flexShrink: 0 }} />
                        <div style={{ flex: 1, padding: "12px 16px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                            <div>
                              <div style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{ev.label}</div>
                              <div style={{ fontSize: 11, color: C.dim, marginTop: 3 }}>{ev.notes}</div>
                            </div>
                            <div style={{ textAlign: "right", flexShrink: 0 }}>
                              {ev.date && (
                                <div style={{ fontSize: 13, color: ev.type === "meeting" ? phaseColor : C.muted, fontWeight: 500 }}>
                                  {ev.days > 1 ? (() => {
                                    const end = new Date(ev.date);
                                    let added = 0;
                                    while (added < ev.days - 1) {
                                      end.setDate(end.getDate() + 1);
                                      if (end.getDay() !== 0 && end.getDay() !== 1) added++;
                                    }
                                    return `${fmtDate(ev.date)} – ${fmtDate(end)}`;
                                  })() : fmtDate(ev.date)}
                                </div>
                              )}
                              {ev.startTime && ev.endTime && (
                                <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>
                                  {ev.days > 1 ? `${ev.days} days · ` : ""}{fmtTime(ev.startTime)} – {fmtTime(ev.endTime)}
                                </div>
                              )}
                            </div>
                          </div>

                          {step === "review" && ev.type === "meeting" && ev.options && ev.options.length > 0 && (
                            <div style={{ marginTop: 10 }}>
                              <div style={{ fontSize: 10, color: C.dim, letterSpacing: 1, marginBottom: 6 }}>CHOOSE DATE:</div>
                              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                {ev.options.map((opt, oi) => (
                                  <button key={oi} onClick={() => selectOption(globalIdx, oi)} style={{
                                    background: ev.selectedOption === oi ? phaseColor : C.faint,
                                    color: ev.selectedOption === oi ? "#fff" : C.muted,
                                    border: `1px solid ${ev.selectedOption === oi ? phaseColor : C.border}`,
                                    borderRadius: 6, padding: "6px 14px", cursor: "pointer",
                                    fontSize: 12, fontFamily: "'Archivo', sans-serif"
                                  }}>{fmtDate(opt)}</button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {step === "review" && (
            <div style={{ marginTop: 8, paddingTop: 20, borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "center" }}>
              <button onClick={approve} style={{ background: C.gold, color: C.bg, border: "none", borderRadius: 6, padding: "13px 40px", cursor: "pointer", fontSize: 13, fontFamily: "'Playfair Display', serif", letterSpacing: 1 }}>
                ✓ APPROVE SCHEDULE
              </button>
            </div>
          )}

          <div style={{ marginTop: 32, borderTop: `1px solid ${C.border}`, paddingTop: 20 }}>
            <div style={{ fontSize: 11, letterSpacing: 2, color: C.dim, marginBottom: 14 }}>SCHEDULE REVISIONS</div>
            <div style={{ fontSize: 12, color: C.dim, marginBottom: 14 }}>
              Ask me to adjust any dates — e.g. "Move the Initial Meeting to the week of June 23" or "Client can't do Thursdays"
            </div>

            {revisionMessages.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
                {revisionMessages.map((m, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                    <div style={{
                      maxWidth: "80%", padding: "10px 14px", borderRadius: 8, fontSize: 13, lineHeight: 1.5,
                      background: m.role === "user" ? C.gold : C.surface,
                      color: m.role === "user" ? C.bg : C.text,
                      border: m.role === "assistant" ? `1px solid ${C.border}` : "none"
                    }}>{m.text}</div>
                  </div>
                ))}
                {revisionLoading && (
                  <div style={{ display: "flex", justifyContent: "flex-start" }}>
                    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.dim, fontSize: 13 }}>Updating schedule…</div>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={revisionInput}
                onChange={e => setRevisionInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") sendRevision(); }}
                placeholder="e.g. Move the Furniture Meeting to July 8…"
                style={{ ...schedInputStyle, flex: 1 }}
              />
              <button
                onClick={sendRevision}
                disabled={revisionLoading || !revisionInput.trim()}
                style={{
                  background: C.gold, color: C.bg, border: "none", borderRadius: 6,
                  padding: "10px 18px", cursor: "pointer", fontSize: 13,
                  fontFamily: "'Playfair Display', serif", letterSpacing: 1,
                  opacity: revisionLoading || !revisionInput.trim() ? 0.5 : 1
                }}>Send</button>
            </div>
          </div>
        </>
        );
      })()}
    </div>
  );
};

const ContactsTab = () => {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone: "", type: "Client", notes: "" });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("first_name");

  useEffect(() => { loadContacts(); }, [sortBy]);

  const loadContacts = async () => {
    const { data } = await supabase.from("contacts").select("*").order(sortBy, { ascending: true });
    if (data) setContacts(data);
  };

  const resetForm = () => {
    setForm({ first_name: "", last_name: "", email: "", phone: "", type: "Client", notes: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const saveContact = async () => {
    if (!form.first_name.trim() && !form.last_name.trim()) { setStatus("Please enter a name."); setTimeout(() => setStatus(""), 2500); return; }
    setSaving(true);
    if (editingId) {
      await supabase.from("contacts").update(form).eq("id", editingId);
    } else {
      await supabase.from("contacts").insert([form]);
    }
    await loadContacts();
    setSaving(false);
    resetForm();
    setStatus(editingId ? "Contact updated." : "Contact saved.");
    setTimeout(() => setStatus(""), 2500);
  };

  const deleteContact = async (id) => {
    await supabase.from("contacts").delete().eq("id", id);
    setContacts(c => c.filter(x => x.id !== id));
  };

  const startEdit = (c) => {
    setForm({ first_name: c.first_name || "", last_name: c.last_name || "", email: c.email || "", phone: c.phone || "", type: c.type || "Client", notes: c.notes || "" });
    setEditingId(c.id);
    setShowForm(true);
  };

  const filtered = contacts.filter(c => {
    const matchType = filterType === "All" || c.type === filterType;
    const q = search.toLowerCase();
    const matchSearch = !q || (c.first_name || "").toLowerCase().includes(q) || (c.last_name || "").toLowerCase().includes(q) || (c.email || "").toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  const inputStyle = { width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, padding: "10px 12px", fontSize: 13, outline: "none", fontFamily: "'Archivo', sans-serif", boxSizing: "border-box" };
  const typeColor = { Client: "#7a9e8e", Builder: "#8a9cb5", Trade: "#a0896a", Rep: "#9a7aaa" };

  return (
    <div style={{ flex: 1, maxWidth: 900, width: "100%", margin: "0 auto", padding: "24px 16px", overflowY: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: C.dim }}>CONTACTS — {contacts.length} total</div>
        <button onClick={() => { resetForm(); setShowForm(true); }} style={{ background: C.gold, color: C.bg, border: "none", borderRadius: 6, padding: "8px 18px", cursor: "pointer", fontSize: 12, fontFamily: "'Playfair Display', serif", letterSpacing: 1 }}>
          + ADD CONTACT
        </button>
      </div>

      {showForm && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "20px 24px", marginBottom: 24 }}>
          <div style={{ fontSize: 12, letterSpacing: 2, color: C.dim, marginBottom: 16 }}>{editingId ? "EDIT CONTACT" : "NEW CONTACT"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} placeholder="First name" style={inputStyle} />
            <input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} placeholder="Last name" style={inputStyle} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" type="email" style={inputStyle} />
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone" type="tel" style={inputStyle} />
          </div>
          <div style={{ marginBottom: 10 }}>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={{ ...inputStyle, width: "auto", minWidth: 160 }}>
              {CONTACT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 16 }}>
            <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notes (optional)" style={inputStyle} />
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={saveContact} disabled={saving} style={{ background: C.gold, color: C.bg, border: "none", borderRadius: 6, padding: "9px 22px", cursor: "pointer", fontSize: 12, fontFamily: "'Playfair Display', serif", letterSpacing: 1 }}>
              {saving ? "Saving…" : editingId ? "SAVE CHANGES" : "SAVE CONTACT"}
            </button>
            <button onClick={resetForm} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, padding: "9px 18px", cursor: "pointer", fontSize: 12, color: C.dim, fontFamily: "'Archivo', sans-serif" }}>Cancel</button>
            {status && <span style={{ fontSize: 12, color: C.gold }}>{status}</span>}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…" style={{ ...inputStyle, flex: 1, minWidth: 200 }} />
        <div style={{ display: "flex", gap: 4, background: C.faint, borderRadius: 6, padding: 3 }}>
          <button onClick={() => setSortBy("first_name")} style={{ background: sortBy === "first_name" ? C.surface : "transparent", border: sortBy === "first_name" ? `1px solid ${C.border}` : "1px solid transparent", borderRadius: 4, padding: "5px 12px", cursor: "pointer", fontSize: 11, color: sortBy === "first_name" ? C.text : C.dim, fontFamily: "'Archivo', sans-serif" }}>First</button>
          <button onClick={() => setSortBy("last_name")} style={{ background: sortBy === "last_name" ? C.surface : "transparent", border: sortBy === "last_name" ? `1px solid ${C.border}` : "1px solid transparent", borderRadius: 4, padding: "5px 12px", cursor: "pointer", fontSize: 11, color: sortBy === "last_name" ? C.text : C.dim, fontFamily: "'Archivo', sans-serif" }}>Last</button>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["All", ...CONTACT_TYPES].map(t => (
            <button key={t} onClick={() => setFilterType(t)} style={{ background: filterType === t ? C.gold : "transparent", color: filterType === t ? C.bg : C.dim, border: `1px solid ${filterType === t ? C.gold : C.border}`, borderRadius: 20, padding: "6px 14px", cursor: "pointer", fontSize: 11, fontFamily: "'Archivo', sans-serif", letterSpacing: 0.5 }}>{t}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", color: C.dim, fontSize: 13, padding: "40px 0" }}>
          {contacts.length === 0 ? "No contacts yet — add your first one above." : "No contacts match your search."}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(c => (
            <div key={c.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "14px 18px", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 4, alignSelf: "stretch", borderRadius: 4, background: typeColor[c.type] || C.dim, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ fontSize: 15, color: C.text, fontWeight: 500 }}>{c.first_name} {c.last_name}</div>
                  <div style={{ fontSize: 10, letterSpacing: 1, color: typeColor[c.type] || C.dim, background: (typeColor[c.type] || C.dim) + "22", borderRadius: 4, padding: "2px 8px" }}>{c.type}</div>
                </div>
                <div style={{ display: "flex", gap: 20, marginTop: 5, flexWrap: "wrap" }}>
                  {c.email && <a href={`mailto:${c.email}`} style={{ fontSize: 12, color: C.dim, textDecoration: "none" }}>✉ {c.email}</a>}
                  {c.phone && <a href={`tel:${c.phone}`} style={{ fontSize: 12, color: C.dim, textDecoration: "none" }}>📞 {c.phone}</a>}
                </div>
                {c.notes && <div style={{ fontSize: 11, color: C.dim, marginTop: 4, fontStyle: "italic" }}>{c.notes}</div>}
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button onClick={() => startEdit(c)} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 4, color: C.muted, fontSize: 11, padding: "4px 12px", cursor: "pointer", fontFamily: "'Archivo', sans-serif" }}>Edit</button>
                <button onClick={() => deleteContact(c.id)} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 4, color: C.red, fontSize: 11, padding: "4px 12px", cursor: "pointer", fontFamily: "'Archivo', sans-serif" }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const KnowledgeBaseTab = ({ knowledge, setKnowledge, kbStatus, saveKnowledge, documents, uploading, fileRef, handleFileUpload, deleteDoc }) => (
  <div style={{ flex: 1, maxWidth: 800, width: "100%", margin: "0 auto", padding: "24px 16px", display: "flex", flexDirection: "column", gap: 24, overflowY: "auto" }}>
    <div>
      <div style={{ fontSize: 11, letterSpacing: 2, color: C.dim, marginBottom: 10 }}>KNOWLEDGE BASE — saved to database, persists for all team members</div>
      <textarea value={knowledge} onChange={e => setKnowledge(e.target.value)} rows={16} style={{
        width: "100%", background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 8, color: C.text, padding: "14px", fontSize: 13,
        fontFamily: "monospace", lineHeight: 1.6, resize: "vertical", outline: "none", boxSizing: "border-box"
      }} />
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 12 }}>
        <button onClick={saveKnowledge} style={{ background: C.gold, color: C.bg, border: "none", borderRadius: 6, padding: "10px 22px", cursor: "pointer", fontSize: 13, fontFamily: "'Archivo', sans-serif" }}>Save Knowledge Base</button>
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
              <button onClick={() => deleteDoc(doc.id)} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 4, color: C.red, fontSize: 11, padding: "4px 12px", cursor: "pointer", fontFamily: "'Archivo', sans-serif" }}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

function App({ user, onSignOut }) {
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
  const [showSearchDrawer, setShowSearchDrawer] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const bottomRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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

  const tabContent = (
    <>
      {tab === "Chat" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", maxWidth: 800, width: "100%", margin: "0 auto", padding: isMobile ? "0 12px" : "0 16px" }}>
          <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "16px 0" : "24px 0", display: "flex", flexDirection: "column", gap: 14 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
                {m.type === "clarifying" && m.clarifyData ? (
                  <ClarifyingMessage data={m.clarifyData} onAnswer={handleClarifyAnswer} />
                ) : (
                  <div style={{
                    maxWidth: isMobile ? "88%" : "75%", padding: "11px 14px", borderRadius: 8, lineHeight: 1.6,
                    fontSize: isMobile ? 15 : 14,
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
                    cursor: "pointer", letterSpacing: 1, fontFamily: "'Archivo', sans-serif"
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
          <div style={{ padding: isMobile ? "10px 0 16px" : "16px 0 24px", display: "flex", gap: 8, alignItems: "flex-end" }}>
            <textarea value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Ask anything…"
              rows={isMobile ? 2 : 3} style={{
                flex: 1, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
                color: C.text, padding: "11px 13px", fontSize: isMobile ? 16 : 14, resize: "none",
                outline: "none", fontFamily: "'Archivo', sans-serif", lineHeight: 1.5
              }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <button onClick={send} disabled={loading || !input.trim()} style={{
                background: C.gold, color: C.bg, border: "none", borderRadius: 6,
                padding: isMobile ? "12px 16px" : "10px 18px", cursor: "pointer",
                fontSize: 13, fontFamily: "'Archivo', sans-serif", opacity: loading || !input.trim() ? 0.5 : 1
              }}>Send</button>
              {!isMobile && (
                <button onClick={() => setMessages([{ role: "assistant", type: "answer", content: "Hi! I'm your Rose & Funk business assistant. Ask me anything about your processes, client situations, or how to handle day-to-day operations — or browse the tabs for references and documents." }])} style={{
                  background: "transparent", color: C.dim, border: `1px solid ${C.border}`,
                  borderRadius: 6, padding: "8px 18px", cursor: "pointer", fontSize: 11, fontFamily: "'Archivo', sans-serif"
                }}>Clear</button>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "Estimator" && <PinGate><Estimator /></PinGate>}
      {tab === "Estimator 2" && <PinGate><Estimator2 /></PinGate>}
      {tab === "Furnishings" && <PinGate><FurnishingsEstimator /></PinGate>}

      {tab === "Knowledge Base" && (
        <PinGate>
          <KnowledgeBaseTab
            knowledge={knowledge}
            setKnowledge={setKnowledge}
            kbStatus={kbStatus}
            saveKnowledge={saveKnowledge}
            documents={documents}
            uploading={uploading}
            fileRef={fileRef}
            handleFileUpload={handleFileUpload}
            deleteDoc={deleteDoc}
          />
        </PinGate>
      )}

      {tab === "Procedures" && (
        <div style={{ flex: 1, maxWidth: 900, width: "100%", margin: "0 auto", padding: isMobile ? "16px 12px" : "24px 16px", overflowY: "auto" }}>
          {PROCEDURES.map((cat, ci) => (
            <div key={ci} style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 11, letterSpacing: 3, color: C.gold, marginBottom: 12 }}>{cat.category.toUpperCase()}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {cat.items.map((proc, pi) => {
                  const key = `${ci}-${pi}`;
                  const open = expandedProc === key;
                  return (
                    <div key={pi} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
                      <div onClick={() => setExpandedProc(open ? null : key)} style={{ padding: isMobile ? "14px 14px" : "14px 18px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: isMobile ? 14 : 14, color: C.text }}>{proc.title}</div>
                          <div style={{ fontSize: 11, color: ownerColor(proc.owner), marginTop: 3, letterSpacing: 1 }}>{proc.owner}</div>
                        </div>
                        <div style={{ color: C.dim, fontSize: 18, flexShrink: 0, marginLeft: 8 }}>{open ? "−" : "+"}</div>
                      </div>
                      {open && (
                        <div style={{ borderTop: `1px solid ${C.border}`, padding: isMobile ? "12px 14px" : "14px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
                          {proc.steps.map((step, si) => (
                            <div key={si} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                              <div style={{ width: 22, height: 22, borderRadius: "50%", background: C.faint, color: C.dim, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{si + 1}</div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: isMobile ? 14 : 13, color: C.text, lineHeight: 1.5 }}>{step.text}</div>
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

      {tab === "Contacts" && <ContactsTab />}
      {tab === "Schedule" && <ScheduleTab />}
    </>
  );

  const sidebarContent = (
    <>
      <div style={{ padding: "16px 14px 8px", fontSize: 10, letterSpacing: 2, color: C.dim }}>RECENT SEARCHES</div>
      {searches.length === 0 ? (
        <div style={{ padding: "8px 14px", fontSize: 12, color: C.dim }}>Your recent questions will appear here</div>
      ) : searches.map(s => (
        <div key={s.id} style={{ display: "flex", alignItems: "flex-start", gap: 4, padding: "6px 10px", borderBottom: `1px solid ${C.faint}` }}>
          <button onClick={() => { reaskQuestion(s.question); setShowSearchDrawer(false); }} style={{ flex: 1, background: "transparent", border: "none", color: C.muted, fontSize: 12, textAlign: "left", cursor: "pointer", fontFamily: "'Archivo', sans-serif", lineHeight: 1.4, padding: "2px 0" }}>
            {s.question.length > 60 ? s.question.slice(0, 60) + "…" : s.question}
          </button>
          <button onClick={() => deleteSearch(s.id)} style={{ background: "transparent", border: "none", color: C.dim, cursor: "pointer", fontSize: 14, padding: "0 2px", flexShrink: 0 }}>×</button>
        </div>
      ))}
    </>
  );

  if (isMobile) {
    return (
      <div style={{ height: "100dvh", background: C.bg, color: C.text, fontFamily: "'Archivo', sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src="/RF_LogoPrimary(Black)_RGB.png" alt="Rose & Funk" style={{ height: 24, objectFit: "contain" }} />
            <div style={{ fontSize: 10, color: C.dim, letterSpacing: 2, fontFamily: "'Playfair Display', serif" }}>STUDIO ASSISTANT</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setShowSearchDrawer(true)} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, color: C.muted, fontSize: 11, padding: "6px 12px", cursor: "pointer", fontFamily: "'Archivo', sans-serif" }}>History</button>
            <button onClick={onSignOut} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, color: C.dim, fontSize: 11, padding: "6px 12px", cursor: "pointer", fontFamily: "'Archivo', sans-serif" }}>Sign Out</button>
          </div>
        </div>

        {showSearchDrawer && (
          <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>
            <div style={{ flex: 1, background: "rgba(0,0,0,0.5)" }} onClick={() => setShowSearchDrawer(false)} />
            <div style={{ width: 280, background: C.surface, borderLeft: `1px solid ${C.border}`, display: "flex", flexDirection: "column", overflowY: "auto" }}>
              <div style={{ padding: "16px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, letterSpacing: 2, color: C.dim }}>RECENT SEARCHES</div>
                <button onClick={() => setShowSearchDrawer(false)} style={{ background: "transparent", border: "none", color: C.dim, fontSize: 20, cursor: "pointer" }}>×</button>
              </div>
              {sidebarContent}
            </div>
          </div>
        )}

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {tabContent}
        </div>

        <div style={{ background: C.surface, borderTop: `1px solid ${C.border}`, display: "flex", flexShrink: 0, paddingBottom: "env(safe-area-inset-bottom)" }}>
          {TABS.map(t => {
            const active = tab === t;
            const label = t === "Knowledge Base" ? "Knowledge" : t;
            return (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1, background: "none", border: "none", borderTop: `2px solid ${active ? C.gold : "transparent"}`,
                color: active ? C.gold : C.dim, padding: "12px 2px 14px", cursor: "pointer",
                fontFamily: "'Archivo', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                transition: "color 0.15s"
              }}>
                <div style={{ width: 28, height: 3, borderRadius: 2, background: active ? C.gold : "transparent", marginBottom: 4, transition: "background 0.15s" }} />
                <span style={{ fontSize: 10, letterSpacing: 0.8, fontWeight: active ? "bold" : "normal", fontFamily: "'Playfair Display', serif" }}>{label.toUpperCase()}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Archivo', sans-serif", display: "flex", flexDirection: "column" }}>
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src="/RF_LogoPrimary(Black)_RGB.png" alt="Rose & Funk" style={{ height: 32, objectFit: "contain" }} />
          <div style={{ fontSize: 11, color: C.dim, letterSpacing: 2, fontFamily: "'Playfair Display', serif" }}>STUDIO ASSISTANT</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                background: tab === t ? C.gold : "transparent",
                color: tab === t ? C.bg : C.muted,
                border: `1px solid ${tab === t ? C.gold : C.border}`,
                borderRadius: 4, padding: "6px 14px", cursor: "pointer",
                fontSize: 12, letterSpacing: 1, fontFamily: "'Playfair Display', serif"
              }}>{t.toUpperCase()}</button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: 8, paddingLeft: 16, borderLeft: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 11, color: C.dim }}>{user?.email?.split("@")[0]}</div>
            <button onClick={onSignOut} style={{
              background: "transparent", border: `1px solid ${C.border}`, borderRadius: 4,
              color: C.dim, fontSize: 11, padding: "5px 12px", cursor: "pointer", fontFamily: "'Archivo', sans-serif", letterSpacing: 1
            }}>SIGN OUT</button>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <div style={{ width: 220, background: C.surface, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", overflowY: "auto", flexShrink: 0 }}>
          {sidebarContent}
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {tabContent}
        </div>
      </div>
    </div>
  );
}

const LoginScreen = ({ onLogin }) => {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const validate = () => {
    if (!email.endsWith("@roseandfunk.com")) {
      setError("Access is restricted to @roseandfunk.com email addresses.");
      return false;
    }
    if (mode !== "reset" && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setError("");
    setMessage("");
    if (!validate()) return;
    setLoading(true);

    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onLogin(data.user);
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage("Check your email to confirm your account, then log in.");
        setMode("login");
      } else if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
        if (error) throw error;
        setMessage("Password reset email sent. Check your inbox.");
        setMode("login");
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const inputStyle = {
    width: "100%", background: "#EAE5DD", border: "1px solid #D4CFCA",
    borderRadius: 6, color: "#2C2420", padding: "12px 14px", fontSize: 15,
    outline: "none", fontFamily: "'Archivo', sans-serif", boxSizing: "border-box", marginBottom: 12,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#EAE5DD", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Archivo', sans-serif", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <img src="/RF_LogoPrimary(Black)_RGB.png" alt="Rose & Funk" style={{ height: 36, objectFit: "contain", marginBottom: 12 }} />
          <div style={{ fontSize: 10, letterSpacing: 4, color: "#9A8880" }}>STUDIO ASSISTANT</div>
        </div>
        <div style={{ background: "#F5F2ED", border: "1px solid #D4CFCA", borderRadius: 10, padding: "32px 28px" }}>
          <div style={{ fontSize: 13, letterSpacing: 1, color: "#9A8880", marginBottom: 24, textAlign: "center", fontFamily: "'Playfair Display', serif" }}>
            {mode === "login" && "SIGN IN"}
            {mode === "signup" && "CREATE ACCOUNT"}
            {mode === "reset" && "RESET PASSWORD"}
          </div>
          <input type="email" placeholder="you@roseandfunk.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} style={inputStyle} autoComplete="email" />
          {mode !== "reset" && (
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} style={inputStyle} autoComplete={mode === "login" ? "current-password" : "new-password"} />
          )}
          {error && <div style={{ fontSize: 12, color: "#c0614a", marginBottom: 14, lineHeight: 1.5 }}>{error}</div>}
          {message && <div style={{ fontSize: 12, color: "#c8a96e", marginBottom: 14, lineHeight: 1.5 }}>{message}</div>}
          <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", background: "#A98D70", color: "#F5F2ED", border: "none", borderRadius: 6, padding: "13px", cursor: loading ? "not-allowed" : "pointer", fontSize: 12, letterSpacing: 2, fontFamily: "'Playfair Display', serif", opacity: loading ? 0.7 : 1, marginBottom: 20 }}>
            {loading ? "…" : mode === "login" ? "SIGN IN" : mode === "signup" ? "CREATE ACCOUNT" : "SEND RESET EMAIL"}
          </button>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
            {mode === "login" && (
              <>
                <button onClick={() => { setMode("signup"); setError(""); setMessage(""); }} style={{ background: "none", border: "none", color: "#8a7a65", fontSize: 12, cursor: "pointer", fontFamily: "'Archivo', sans-serif", textDecoration: "underline" }}>Create an account</button>
                <button onClick={() => { setMode("reset"); setError(""); setMessage(""); }} style={{ background: "none", border: "none", color: "#8a7a65", fontSize: 12, cursor: "pointer", fontFamily: "'Archivo', sans-serif", textDecoration: "underline" }}>Forgot password?</button>
              </>
            )}
            {mode !== "login" && (
              <button onClick={() => { setMode("login"); setError(""); setMessage(""); }} style={{ background: "none", border: "none", color: "#8a7a65", fontSize: 12, cursor: "pointer", fontFamily: "'Archivo', sans-serif", textDecoration: "underline" }}>Back to sign in</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function RootApp() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#EAE5DD", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: "#9A8880" }}>LOADING…</div>
      </div>
    );
  }

  if (!user) return <LoginScreen onLogin={setUser} />;
  return <App user={user} onSignOut={() => supabase.auth.signOut()} />;
}
