import { useState, useEffect, useRef } from "react";

const TABS = ["Chat", "Knowledge Base", "Procedures"];

const C = {
  bg: "#0f0e0c", surface: "#1a1814", border: "#2a2620",
  gold: "#c8a96e", text: "#f0ebe3", muted: "#d4cdc4",
  dim: "#8a7a65", faint: "#3a3028"
};

const DEFAULT_KNOWLEDGE = `BUSINESS NAME: Rose and Funk Interiors Inc. (Rose & Funk)
WEBSITE: www.roseandfunk.com | ESTABLISHED: 1999
LOCATION: #100 - 9220 Glover Road, Fort Langley, BC
EMAIL: info@roseandfunk.com | ACCOUNTING: accounting@roseandfunk.com
PHONE: 604.513.9118 | HOURS: 9am–4pm Mon–Fri
AESTHETIC: "Approachable Luxury that is Contemporary and Timeless"

TEAM:
- GREGORY FUNK — Creative Director + Founder
- JENNY GRIFFITHS — Office Manager. jenny@roseandfunk.com | 604.513.9118

TAGLINE: "We create spaces that seamlessly blend style and sophistication with comfort and livability."

MAIN SERVICES:
1. Full Scope Construction Design Process (new builds + full renovations)
2. Decorating & Furniture Design Service

CLIENT PROCESS:
1. Initial inquiry / discovery call
2. Proposal & contract signing
3. Design deposit collected
4. Site survey / measurements
5. Concept development & mood boards
6. Client presentation & revisions
7. Final design approval
8. Procurement & ordering
9. Installation / styling day
10. Project wrap-up & follow-up`;

const PROCEDURES = [
  {
    category: "Client Management",
    items: [
      {
        title: "New Client Inquiry",
        owner: "JENNY",
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
        title: "Onboarding a New Client",
        owner: "JENNY + GREGORY",
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
        title: "Handling a Client Complaint",
        owner: "GREGORY",
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
        title: "Concept Development",
        owner: "DESIGNER + GREGORY",
        steps: [
          { text: "Review client intake notes, inspiration images, and brief", owner: "DESIGNER" },
          { text: "Develop 1–2 concept directions (mood board + palette)", owner: "DESIGNER" },
          { text: "Internal review with Gregory before client presentation", owner: "GREGORY" },
          { text: "Refine based on Gregory's feedback", owner: "DESIGNER" },
          { text: "Prepare presentation deck", owner: "DESIGNER" },
        ]
      },
      {
        title: "Client Design Presentation",
        owner: "GREGORY",
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
        title: "Procurement & Ordering",
        owner: "JENNY + DESIGNER",
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
        title: "Weekly Team Check-In",
        owner: "GREGORY",
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

export default function App() {
  const [tab, setTab] = useState("Chat");
  const [knowledge, setKnowledge] = useState(DEFAULT_KNOWLEDGE);
  const [addText, setAddText] = useState("");
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "Hi! I'm your Rose & Funk business assistant. Ask me anything about your processes, client situations, or how to handle day-to-day operations — or browse the Procedures tab for step-by-step references."
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [expandedProc, setExpandedProc] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated, knowledge })
      });
      const data = await res.json();
      setMessages([...updated, { role: "assistant", content: data.reply || "Sorry, no response." }]);
    } catch {
      setMessages([...updated, { role: "assistant", content: "Something went wrong. Please try again." }]);
    }
    setLoading(false);
  };

  const saveToKnowledge = (content) => {
    setKnowledge(k => k + "\n\n" + content);
    setSaveMsg("Saved to Knowledge Base!");
    setTimeout(() => setSaveMsg(""), 2500);
  };

  const saveKnowledge = () => {
    const merged = knowledge + (addText.trim() ? "\n\n" + addText.trim() : "");
    setKnowledge(merged);
    setAddText("");
    setSaveMsg("Saved!");
    setTimeout(() => setSaveMsg(""), 2500);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "Georgia, serif", display: "flex", flexDirection: "column" }}>
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src="/logo.png" alt="Rose & Funk" style={{ height: 48, objectFit: "contain" }} />
          <div style={{ fontSize: 11, color: C.dim, letterSpacing: 2 }}>STUDIO ASSISTANT</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
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

      {tab === "Chat" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", maxWidth: 800, width: "100%", margin: "0 auto", padding: "0 16px" }}>
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 0", display: "flex", flexDirection: "column", gap: 16 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "75%", padding: "12px 16px", borderRadius: 8, lineHeight: 1.6, fontSize: 14,
                  background: m.role === "user" ? C.gold : C.surface,
                  color: m.role === "user" ? C.bg : C.text,
                  border: m.role === "assistant" ? `1px solid ${C.border}` : "none"
                }}>
                  {m.content.split("\n").map((ln, j) => <div key={j}>{ln || <br />}</div>)}
                </div>
                {m.role === "assistant" && i > 0 && (
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
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Ask anything about Rose & Funk operations, clients, or procedures…"
              rows={3}
              style={{
                flex: 1, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
                color: C.text, padding: "12px 14px", fontSize: 14, resize: "none",
                outline: "none", fontFamily: "Georgia, serif", lineHeight: 1.5
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <button onClick={send} disabled={loading || !input.trim()} style={{
                background: C.gold, color: C.bg, border: "none", borderRadius: 6,
                padding: "10px 18px", cursor: "pointer", fontSize: 13, fontFamily: "Georgia, serif",
                opacity: loading || !input.trim() ? 0.5 : 1
              }}>Send</button>
              <button onClick={() => setMessages([{ role: "assistant", content: "Hi! I'm your Rose & Funk business assistant. Ask me anything about your processes, client situations, or how to handle day-to-day operations — or browse the Procedures tab for step-by-step references." }])} style={{
                background: "transparent", color: C.dim, border: `1px solid ${C.border}`,
                borderRadius: 6, padding: "8px 18px", cursor: "pointer", fontSize: 11, fontFamily: "Georgia, serif"
              }}>Clear</button>
            </div>
          </div>
        </div>
      )}

      {tab === "Knowledge Base" && (
        <div style={{ flex: 1, maxWidth: 800, width: "100%", margin: "0 auto", padding: "24px 16px", display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 2, color: C.dim, marginBottom: 10 }}>CURRENT KNOWLEDGE BASE</div>
            <textarea value={knowledge} onChange={e => setKnowledge(e.target.value)} rows={18} style={{
              width: "100%", background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 8, color: C.text, padding: "14px", fontSize: 13,
              fontFamily: "monospace", lineHeight: 1.6, resize: "vertical", outline: "none", boxSizing: "border-box"
            }} />
          </div>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 2, color: C.dim, marginBottom: 10 }}>ADD TO KNOWLEDGE BASE</div>
            <textarea value={addText} onChange={e => setAddText(e.target.value)}
              placeholder="Add new info — team changes, vendor notes, pricing updates, policies…"
              rows={5} style={{
                width: "100%", background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 8, color: C.text, padding: "14px", fontSize: 13,
                fontFamily: "Georgia, serif", lineHeight: 1.6, resize: "vertical", outline: "none", boxSizing: "border-box"
              }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button onClick={saveKnowledge} style={{
              background: C.gold, color: C.bg, border: "none", borderRadius: 6,
              padding: "10px 22px", cursor: "pointer", fontSize: 13, fontFamily: "Georgia, serif"
            }}>Save Knowledge Base</button>
            {saveMsg && <span style={{ color: C.gold, fontSize: 13 }}>{saveMsg}</span>}
          </div>
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
  );
}

const TABS = ["Chat", "Knowledge Base", "Procedures"];

const C = {
  bg: "#0f0e0c", surface: "#1a1814", border: "#2a2620",
  gold: "#c8a96e", text: "#f0ebe3", muted: "#d4cdc4",
  dim: "#8a7a65", faint: "#3a3028"
};

const DEFAULT_KNOWLEDGE = `BUSINESS NAME: Rose and Funk Interiors Inc. (Rose & Funk)
WEBSITE: www.roseandfunk.com | ESTABLISHED: 1999
LOCATION: #100 - 9220 Glover Road, Fort Langley, BC
EMAIL: info@roseandfunk.com | ACCOUNTING: accounting@roseandfunk.com
PHONE: 604.513.9118 | HOURS: 9am–4pm Mon–Fri
AESTHETIC: "Approachable Luxury that is Contemporary and Timeless"

TEAM:
- GREGORY FUNK — Creative Director + Founder
- JENNY GRIFFITHS — Office Manager. jenny@roseandfunk.com | 604.513.9118

TAGLINE: "We create spaces that seamlessly blend style and sophistication with comfort and livability."

MAIN SERVICES:
1. Full Scope Construction Design Process (new builds + full renovations)
2. Decorating & Furniture Design Service

CLIENT PROCESS:
1. Initial inquiry / discovery call
2. Proposal & contract signing
3. Design deposit collected
4. Site survey / measurements
5. Concept development & mood boards
6. Client presentation & revisions
7. Final design approval
8. Procurement & ordering
9. Installation / styling day
10. Project wrap-up & follow-up`;

const PROCEDURES = [
  {
    category: "Client Management",
    items: [
      {
        title: "New Client Inquiry",
        owner: "JENNY",
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
        title: "Onboarding a New Client",
        owner: "JENNY + GREGORY",
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
        title: "Handling a Client Complaint",
        owner: "GREGORY",
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
        title: "Concept Development",
        owner: "DESIGNER + GREGORY",
        steps: [
          { text: "Review client intake notes, inspiration images, and brief", owner: "DESIGNER" },
          { text: "Develop 1–2 concept directions (mood board + palette)", owner: "DESIGNER" },
          { text: "Internal review with Gregory before client presentation", owner: "GREGORY" },
          { text: "Refine based on Gregory's feedback", owner: "DESIGNER" },
          { text: "Prepare presentation deck", owner: "DESIGNER" },
        ]
      },
      {
        title: "Client Design Presentation",
        owner: "GREGORY",
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
        title: "Procurement & Ordering",
        owner: "JENNY + DESIGNER",
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
        title: "Weekly Team Check-In",
        owner: "GREGORY",
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

export default function App() {
  const [tab, setTab] = useState("Chat");
  const [knowledge, setKnowledge] = useState(DEFAULT_KNOWLEDGE);
  const [addText, setAddText] = useState("");
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "Hi! I'm your Rose & Funk business assistant. Ask me anything about your processes, client situations, or how to handle day-to-day operations — or browse the Procedures tab for step-by-step references."
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [expandedProc, setExpandedProc] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated, knowledge })
      });
      const data = await res.json();
      setMessages([...updated, { role: "assistant", content: data.reply || "Sorry, no response." }]);
    } catch {
      setMessages([...updated, { role: "assistant", content: "Something went wrong. Please try again." }]);
    }
    setLoading(false);
  };

  const saveKnowledge = () => {
    const merged = knowledge + (addText.trim() ? "\n\n" + addText.trim() : "");
    setKnowledge(merged);
    setAddText("");
    setSaveMsg("Saved!");
    setTimeout(() => setSaveMsg(""), 2500);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "Georgia, serif", display: "flex", flexDirection: "column" }}>
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 20, letterSpacing: 3, color: C.gold }}>ROSE & FUNK</div>
          <div style={{ fontSize: 11, color: C.dim, letterSpacing: 2, marginTop: 2 }}>STUDIO ASSISTANT</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
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

      {tab === "Chat" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", maxWidth: 800, width: "100%", margin: "0 auto", padding: "0 16px" }}>
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 0", display: "flex", flexDirection: "column", gap: 16 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "75%", padding: "12px 16px", borderRadius: 8, lineHeight: 1.6, fontSize: 14,
                  background: m.role === "user" ? C.gold : C.surface,
                  color: m.role === "user" ? C.bg : C.text,
                  border: m.role === "assistant" ? `1px solid ${C.border}` : "none"
                }}>
                  {m.content.split("\n").map((ln, j) => <div key={j}>{ln || <br />}</div>)}
                </div>
                {m.role === "assistant" && (
                  <button
                    onClick={() => {
                      setKnowledge(k => k + "\n\n" + m.content);
                      setSaveMsg("Saved to Knowledge Base!");
                      setTimeout(() => setSaveMsg(""), 2500);
                    }}
                    style={{
                      marginTop: 4, background: "transparent", border: `1px solid ${C.border}`,
                      borderRadius: 4, color: C.dim, fontSize: 10, padding: "3px 10px",
                      cursor: "pointer", letterSpacing: 1, fontFamily: "Georgia, serif"
                    }}>
                    + SAVE TO KNOWLEDGE BASE
                  </button>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 16px", color: C.dim, fontSize: 13 }}>Thinking…</div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <div style={{ padding: "16px 0 24px", display: "flex", gap: 10, alignItems: "flex-end" }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Ask anything about Rose & Funk operations, clients, or procedures…"
              rows={3}
              style={{
                flex: 1, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
                color: C.text, padding: "12px 14px", fontSize: 14, resize: "none",
                outline: "none", fontFamily: "Georgia, serif", lineHeight: 1.5
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <button onClick={send} disabled={loading || !input.trim()} style={{
                background: C.gold, color: C.bg, border: "none", borderRadius: 6,
                padding: "10px 18px", cursor: "pointer", fontSize: 13, fontFamily: "Georgia, serif",
                opacity: loading || !input.trim() ? 0.5 : 1
              }}>Send</button>
              <button onClick={() => setMessages([{ role: "assistant", content: "Hi! I'm your Rose & Funk business assistant. Ask me anything about your processes, client situations, or how to handle day-to-day operations — or browse the Procedures tab for step-by-step references." }])} style={{
                background: "transparent", color: C.dim, border: `1px solid ${C.border}`,
                borderRadius: 6, padding: "8px 18px", cursor: "pointer", fontSize: 11, fontFamily: "Georgia, serif"
              }}>Clear</button>
            </div>
          </div>
        </div>
      )}

      {tab === "Knowledge Base" && (
        <div style={{ flex: 1, maxWidth: 800, width: "100%", margin: "0 auto", padding: "24px 16px", display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 2, color: C.dim, marginBottom: 10 }}>CURRENT KNOWLEDGE BASE</div>
            <textarea value={knowledge} onChange={e => setKnowledge(e.target.value)} rows={18} style={{
              width: "100%", background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 8, color: C.text, padding: "14px", fontSize: 13,
              fontFamily: "monospace", lineHeight: 1.6, resize: "vertical", outline: "none", boxSizing: "border-box"
            }} />
          </div>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 2, color: C.dim, marginBottom: 10 }}>ADD TO KNOWLEDGE BASE</div>
            <textarea value={addText} onChange={e => setAddText(e.target.value)}
              placeholder="Add new info — team changes, vendor notes, pricing updates, policies…"
              rows={5} style={{
                width: "100%", background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 8, color: C.text, padding: "14px", fontSize: 13,
                fontFamily: "Georgia, serif", lineHeight: 1.6, resize: "vertical", outline: "none", boxSizing: "border-box"
              }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button onClick={saveKnowledge} style={{
              background: C.gold, color: C.bg, border: "none", borderRadius: 6,
              padding: "10px 22px", cursor: "pointer", fontSize: 13, fontFamily: "Georgia, serif"
            }}>Save Knowledge Base</button>
            {saveMsg && <span style={{ color: C.gold, fontSize: 13 }}>{saveMsg}</span>}
          </div>
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
  );
}
