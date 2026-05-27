import { useState, useEffect, useRef } from "react";

const TABS = ["Chat", "Estimator", "Knowledge Base", "Documents", "Procedures"];

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
  { id: "i", label: "I - Kitchen Island", cost: 3500 },
  { id: "j", label: "J - Pantry", cost: 2500 },
  { id: "k", label: "K - Eating Nook", cost: 1250 },
  { id: "l", label: "L - Family/Living", cost: 3000 },
  { id: "m", label: "M - Mudroom", cost: 2500 },
  { id: "n", label: "N - Laundry", cost: 2500 },
  { id: "o", label: "O - Laundry (small)", cost: 1500 },
  { id: "p", label: "P - Primary Bedroom", cost: 3500 },
  { id: "q", label: "Q - Primary Ensuite", cost: 3500 },
  { id: "r", label: "R - Primary WIC", cost: 2500 },
  { id: "s", label: "S - Bedroom", cost: 1750 },
  { id: "t", label: "T - Bedroom (small)", cost: 250 },
  { id: "u", label: "U - Bathroom", cost: 2500 },
  { id: "v", label: "V - Bathroom (small)", cost: 2500 },
  { id: "w", label: "W - Media Room", cost: 2500 },
  { id: "x", label: "X - Bar", cost: 2500 },
  { id: "y", label: "Y - Gym", cost: 1500 },
  { id: "z1", label: "Z - Suite | Bedroom", cost: 1750 },
  { id: "z2", label: "Z - Suite | Bath", cost: 250 },
  { id: "z3", label: "Z - Suite | Kitchen", cost: 2000 },
  { id: "z4", label: "Z - Suite | Living", cost: 750 },
  { id: "zz1", label: "ZZ - Outdoor (large)", cost: 2000 },
  { id: "zz2", label: "ZZ - Outdoor (small)", cost: 1500 },
];

const PHASES = [
  { label: "Phase 1", pct: 0.15 },
  { label: "Phase 2", pct: 0.275 },
  { label: "Phase 3", pct: 0.20 },
  { label: "Phase 4", pct: 0.25 },
  { label: "Phase 5", pct: 0.125 },
];

const fmt = (n) => n.toLocaleString("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });

const PROCEDURES = [
  {
    category: "Client Management",
    items: [
      {
        title: "New Client Inquiry", owner: "JENNY",
        steps: [
          { text: "Respond to inquiry within 24 business hours", owner: "JENNY" },
          { text: "Send introductory email with studio overview and next steps", owner: "JENNY" },
          { text: "Schedule discovery call with Gregory", owner: "JENNY" },
          { text: "Conduct discovery call — assess scope, budget, timeline, fit", owner: "GREGORY" },
          { text: "If proceeding: prepare and send proposal within 5 business days", owner: "GREGORY" },
          { text: "Follow up on proposal if no response after 5 days", owner: "JENNY" },
        ]
      },
      {
        title: "Onboarding a New Client", owner: "JENNY + GREGORY",
        steps: [
          { text: "Send contract for e-signature", owner: "JENNY" },
          { text: "Collect signed contract and design deposit before any work begins", owner: "JENNY" },
          { text: "Set up client folder (digital + physical if needed)", owner: "JENNY" },
          { text: "Schedule site survey / measurement day", owner: "GREGORY" },
          { text: "Introduce client to their lead designer if not Gregory", owner: "GREGORY" },
          { text: "Send welcome email confirming kickoff and what to expect", owner: "JENNY" },
        ]
      },
      {
        title: "Handling a Client Complaint", owner: "GREGORY",
        steps: [
          { text: "Acknowledge the issue promptly — same day if possible", owner: "GREGORY" },
          { text: "Listen fully before responding — do not get defensive", owner: "GREGORY" },
          { text: "Assess: studio error, vendor error, or expectation mismatch?", owner: "GREGORY" },
          { text: "If studio error: apologize clearly and offer resolution", owner: "GREGORY" },
          { text: "If vendor error: communicate on client's behalf to resolve", owner: "GREGORY" },
          { text: "Follow up in writing to confirm resolution", owner: "JENNY" },
        ]
      }
    ]
  },
  {
    category: "Design Process",
    items: [
      {
        title: "Concept Development", owner: "DESIGNER + GREGORY",
        steps: [
          { text: "Review client intake notes, inspiration images, and brief", owner: "DESIGNER" },
          { text: "Develop 1–2 concept directions (mood board + palette)", owner: "DESIGNER" },
          { text: "Internal review with Gregory before client presentation", owner: "GREGORY" },
          { text: "Refine based on Gregory's feedback", owner: "DESIGNER" },
          { text: "Prepare presentation deck", owner: "DESIGNER" },
        ]
      },
      {
        title: "Client Design Presentation", owner: "GREGORY",
        steps: [
          { text: "Schedule in-person or video presentation", owner: "JENNY" },
          { text: "Walk through concept, mood board, and key selections", owner: "GREGORY" },
          { text: "Allow client time to respond — don't rush", owner: "GREGORY" },
          { text: "Note all feedback in writing during or immediately after", owner: "DESIGNER" },
          { text: "Confirm next steps and revision timeline before ending meeting", owner: "GREGORY" },
          { text: "Send follow-up email summarizing decisions made", owner: "JENNY" },
        ]
      },
      {
        title: "Procurement & Ordering", owner: "JENNY + DESIGNER",
        steps: [
          { text: "Confirm final selections are client-approved in writing", owner: "GREGORY" },
          { text: "Collect procurement deposit if not already received", owner: "JENNY" },
          { text: "Place all orders and log in procurement tracker", owner: "JENNY" },
          { text: "Send order confirmations and lead times to client", owner: "JENNY" },
          { text: "Track deliveries and flag any delays immediately", owner: "JENNY" },
          { text: "Coordinate delivery and installation schedule", owner: "JENNY" },
        ]
      }
    ]
  },
  {
    category: "Operations",
    items: [
      {
        title: "Weekly Team Check-In", owner: "GREGORY",
        steps: [
          { text: "Review active project statuses", owner: "ALL" },
          { text: "Flag any client issues or urgent items", owner: "ALL" },
          { text: "Review upcoming deadlines and deliverables", owner: "ALL" },
          { text: "Assign or reassign tasks as needed", owner: "GREGORY" },
          { text: "Confirm everyone's priorities for the week", owner: "GREGORY" },
        ]
      }
    ]
  }
];

const ownerColor = (owner = "") => {
  if (owner.includes("GREGORY")) return C.gold;
  if (owner === "JENNY") return "#6a9ab0";
  if (owner === "ALL") return "#7a9a7a";
  if (owner === "DESIGNER") return "#a0896a";
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
    if (pin === "1199") {
      setEntered(true);
      setError("");
    } else {
      setError("Incorrect PIN. Please try again.");
      setPin("");
    }
  };

  if (entered) return children;

  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "32px 40px", textAlign: "center", width: 280 }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: C.dim, marginBottom: 20 }}>ENTER PIN TO ACCESS ESTIMATOR</div>
        <input
          type="password"
          value={pin}
          onChange={e => setPin(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
          placeholder="••••"
          maxLength={4}
          style={{
            width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6,
            color: C.text, padding: "12px", fontSize: 20, textAlign: "center",
            outline: "none", fontFamily: "Georgia, serif", boxSizing: "border-box", marginBottom: 12, letterSpacing: 8
          }}
        />
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
          padding: "8px 20px", cursor: "pointer", fontSize: 13,
          fontFamily: "Georgia, serif", marginTop: 4
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
  const printRef = useRef(null);

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
        .client { font-size: 18px; margin-bottom: 24px; color: #1a1814; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        th { text-align: left; font-size: 11px; letter-spacing: 2px; color: #8a7a65; padding: 8px 0; border-bottom: 1px solid #d4cdc4; }
        td { padding: 8px 0; font-size: 13px; border-bottom: 1px solid #f0ebe3; }
        td:last-child { text-align: right; }
        .total-row td { font-size: 16px; font-weight: bold; border-top: 2px solid #1a1814; border-bottom: none; padding-top: 12px; }
        .phases { margin-top: 32px; }
        .phase { display: flex; justify-content: space-between; padding: 10px 14px; background: #f8f6f3; margin-bottom: 6px; border-radius: 4px; }
        .phase-label { font-size: 13px; }
        .phase-pct { font-size: 11px; color: #8a7a65; }
        .phase-amt { font-size: 14px; font-weight: bold; }
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
      <div class="phases">
        <div style="font-size:11px;letter-spacing:2px;color:#8a7a65;margin-bottom:12px;">PAYMENT SCHEDULE</div>
        ${PHASES.map(p => `<div class="phase"><div><div class="phase-label">${p.label}</div><div class="phase-pct">${(p.pct * 100).toFixed(1)}%</div></div><div class="phase-amt">${fmt(total * p.pct)}</div></div>`).join("")}
      </div>
      <div class="footer">ROSE AND FUNK INTERIORS INC. · www.roseandfunk.com · 604.513.9118</div>
      </body></html>
    `;
    const win = window.open("", "_blank");
    win.document.write(printContent);
    win.document.close();
    win.print();
  };

  return (
    <div style={{ flex: 1, maxWidth: 900, width: "100%", margin: "0 auto", padding: "24px 16px", overflowY: "auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 2, color: C.dim }}>PROJECT ESTIMATOR — ID BY ROOM</div>
          <div style={{ fontSize: 12, color: C.dim, marginTop: 4 }}>Based on $200/hr</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setShowSaved(!showSaved)} style={{
            background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6,
            color: C.muted, fontSize: 12, padding: "6px 14px", cursor: "pointer", fontFamily: "Georgia, serif"
          }}>Saved Estimates ({savedEstimates.length})</button>
          <button onClick={() => { setQtys({}); setClientName(""); }} style={{
            background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6,
            color: C.dim, fontSize: 12, padding: "6px 14px", cursor: "pointer", fontFamily: "Georgia, serif"
          }}>Reset</button>
        </div>
      </div>

      {/* Saved estimates panel */}
      {showSaved && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "16px", marginBottom: 20 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: C.dim, marginBottom: 12 }}>SAVED ESTIMATES</div>
          {savedEstimates.length === 0 ? (
            <div style={{ color: C.dim, fontSize: 13 }}>No saved estimates yet.</div>
          ) : savedEstimates.map(est => (
            <div key={est.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.faint}` }}>
              <div>
                <div style={{ fontSize: 14, color: C.text }}>{est.client_name}</div>
                <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>{fmt(est.total)} · {new Date(est.created_at).toLocaleDateString("en-CA")}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => loadEstimate(est)} style={{
                  background: C.gold, color: C.bg, border: "none", borderRadius: 4,
                  fontSize: 11, padding: "4px 12px", cursor: "pointer", fontFamily: "Georgia, serif"
                }}>Load</button>
                <button onClick={() => deleteEstimate(est.id)} style={{
                  background: "transparent", border: `1px solid ${C.border}`, borderRadius: 4,
                  color: C.red, fontSize: 11, padding: "4px 12px", cursor: "pointer", fontFamily: "Georgia, serif"
                }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Client name */}
      <div style={{ marginBottom: 20 }}>
        <input
          value={clientName}
          onChange={e => setClientName(e.target.value)}
          placeholder="Client name…"
          style={{
            width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
            color: C.text, padding: "12px 14px", fontSize: 15, outline: "none",
            fontFamily: "Georgia, serif", boxSizing: "border-box"
          }}
        />
      </div>

      {/* Room grid */}
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
              <button onClick={() => setQty(r.id, (qtys[r.id] || 0) - 1)} style={{
                width: 24, height: 24, borderRadius: "50%", background: C.faint, border: `1px solid ${C.border}`,
                color: C.text, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center"
              }}>−</button>
              <span style={{ fontSize: 14, color: C.text, minWidth: 16, textAlign: "center" }}>{qtys[r.id] || 0}</span>
              <button onClick={() => setQty(r.id, (qtys[r.id] || 0) + 1)} style={{
                width: 24, height: 24, borderRadius: "50%", background: C.faint, border: `1px solid ${C.border}`,
                color: C.text, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center"
              }}>+</button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      {total > 0 && (
        <div ref={printRef} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "20px 24px" }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: C.dim, marginBottom: 16 }}>ESTIMATE SUMMARY{clientName ? ` — ${clientName.toUpperCase()}` : ""}</div>
          <div style={{ marginBottom: 16 }}>
            {selectedRooms.map(r => (
              <div key={r.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.muted, padding: "4px 0", borderBottom: `1px solid ${C.faint}` }}>
                <span>{r.label} × {qtys[r.id]}</span>
                <span>{fmt(r.cost * qtys[r.id])}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, color: C.text, marginBottom: 20, paddingTop: 8 }}>
            <span>TOTAL</span>
            <span style={{ color: C.gold }}>{fmt(total)}</span>
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
            <button onClick={saveEstimate} style={{
              background: C.gold, color: C.bg, border: "none", borderRadius: 6,
              padding: "10px 22px", cursor: "pointer", fontSize: 13, fontFamily: "Georgia, serif"
            }}>Save Estimate</button>
            <button onClick={printEstimate} style={{
              background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6,
              color: C.muted, padding: "10px 22px", cursor: "pointer", fontSize: 13, fontFamily: "Georgia, serif"
            }}>Print / Export PDF</button>
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
              <button onClick={() => reaskQuestion(s.question)} style={{
                flex: 1, background: "transparent", border: "none", color: C.muted,
                fontSize: 12, textAlign: "left", cursor: "pointer", fontFamily: "Georgia, serif", lineHeight: 1.4, padding: "2px 0"
              }}>{s.question.length > 60 ? s.question.slice(0, 60) + "…" : s.question}</button>
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

          {tab === "Knowledge Base" && (
            <div style={{ flex: 1, maxWidth: 800, width: "100%", margin: "0 auto", padding: "24px 16px", display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ fontSize: 11, letterSpacing: 2, color: C.dim }}>KNOWLEDGE BASE — saved to database, persists for all team members</div>
              <textarea value={knowledge} onChange={e => setKnowledge(e.target.value)} rows={22} style={{
                width: "100%", background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 8, color: C.text, padding: "14px", fontSize: 13,
                fontFamily: "monospace", lineHeight: 1.6, resize: "vertical", outline: "none", boxSizing: "border-box"
              }} />
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <button onClick={saveKnowledge} style={{
                  background: C.gold, color: C.bg, border: "none", borderRadius: 6,
                  padding: "10px 22px", cursor: "pointer", fontSize: 13, fontFamily: "Georgia, serif"
                }}>Save Knowledge Base</button>
                {kbStatus && <span style={{ color: C.gold, fontSize: 13 }}>{kbStatus}</span>}
              </div>
            </div>
          )}

          {tab === "Documents" && (
            <div style={{ flex: 1, maxWidth: 800, width: "100%", margin: "0 auto", padding: "24px 16px", display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ fontSize: 11, letterSpacing: 2, color: C.dim }}>UPLOADED DOCUMENTS — the AI reads these automatically</div>
              <div onClick={() => fileRef.current?.click()} style={{
                border: `2px dashed ${C.border}`, borderRadius: 8, padding: "32px",
                textAlign: "center", cursor: "pointer", color: C.dim, fontSize: 14
              }}>
                {uploading ? "Uploading and extracting text…" : "Click to upload a file (PDF, TXT, or CSV)"}
                <input ref={fileRef} type="file" accept=".txt,.csv,.md,.pdf" onChange={handleFileUpload} style={{ display: "none" }} />
              </div>
              {documents.length === 0 ? (
                <div style={{ color: C.dim, fontSize: 13, textAlign: "center" }}>No documents uploaded yet.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {documents.map(doc => (
                    <div key={doc.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 14, color: C.text }}>{doc.name}</div>
                        <div style={{ fontSize: 11, color: C.dim, marginTop: 3 }}>{doc.content.length.toLocaleString()} characters extracted</div>
                      </div>
                      <button onClick={() => deleteDoc(doc.id)} style={{
                        background: "transparent", border: `1px solid ${C.border}`,
                        borderRadius: 4, color: C.red, fontSize: 11, padding: "4px 12px",
                        cursor: "pointer", fontFamily: "Georgia, serif"
                      }}>Delete</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "Procedures" && (
            <div style={{ flex: 1, maxWidth: 800, width: "100%", margin: "0 auto", padding: "24px 16px", overflowY: "auto" }}>
              {PROCEDURES.map((cat, ci) => (
                <div key={ci} style={{ marginBottom: 32 }}>
                  <div style={{ fontSize: 11, letterSpacing: 3, color: C.gold, marginBottom: 14 }}>{cat.category.toUpperCase()}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {cat.items.map((proc, pi) => {
                      const key = `${ci}-${pi}`;
                      const open = expandedProc === key;
                      return (
                        <div key={pi} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
                          <div onClick={() => setExpandedProc(open ? null : key)}
                            style={{ padding: "14px 18px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
