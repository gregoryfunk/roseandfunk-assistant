import { useState, useEffect, useRef } from "react";

const TABS = ["Chat", "Knowledge Base", "Procedures"];

const C = {
  bg: "#0f0e0c", surface: "#1a1814", border: "#2a2620",
  gold: "#c8a96e", text: "#f0ebe3", muted: "#d4cdc4",
  dim: "#8a7a65", faint: "#3a3028", accent: "#b8944a"
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
10. Final walkthrough & reveal`;

const DEFAULT_PROCEDURES = [
  {
    category: "CLIENT MANAGEMENT",
    items: [
      {
        title: "New Client Onboarding",
        owner: "JENNY",
        steps: [
          { text: "Send welcome email with questionnaire link", owner: "JENNY" },
          { text: "Schedule discovery call with Gregory", owner: "JENNY" },
          { text: "Create client folder in Drive", owner: "JENNY" },
          { text: "Prepare initial proposal template", owner: "GREGORY" }
        ]
      }
    ]
  },
  {
    category: "DESIGN PROCESS",
    items: [
      {
        title: "Mood Board Creation",
        owner: "GREGORY",
        steps: [
          { text: "Gather client inspiration images", owner: "GREGORY" },
          { text: "Source furniture and material samples", owner: "GREGORY" },
          { text: "Build presentation deck", owner: "GREGORY" },
          { text: "Client review session", owner: "JENNY" }
        ]
      }
    ]
  }
];

export default function Home() {
  const [tab, setTab] = useState("Chat");
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I'm the Rose & Funk assistant. Ask me anything about our business, clients, processes, or design work." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [knowledge, setKnowledge] = useState(DEFAULT_KNOWLEDGE);
  const [procedures, setProcedures] = useState(DEFAULT_PROCEDURES);
  const [expandedProc, setExpandedProc] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setSearchHistory(prev => {
      const filtered = prev.filter(q => q !== text);
      return [text, ...filtered].slice(0, 12);
    });
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          knowledge
        })
      });
      const data = await res.json();
      const reply = data.content || "Sorry, I couldn't get a response.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection error. Please try again." }]);
    }
    setLoading(false);
  };

  const ownerColor = (owner) => {
    if (!owner) return C.dim;
    if (owner.includes("GREGORY")) return C.gold;
    if (owner.includes("JENNY")) return "#9bb4c8";
    return C.dim;
  };

  const saveToKnowledge = (text) => {
    setKnowledge(prev => prev + "\n\n--- SAVED FROM CHAT ---\n" + text);
  };

  const reuseSearch = (query) => {
    setInput(query);
  };

  const clearHistory = () => setSearchHistory([]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: C.bg, color: C.text, fontFamily: "'Georgia', serif" }}>
      {/* Header */}
      <div style={{ padding: "16px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12, background: C.surface }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.gold }} />
        <span style={{ fontSize: 13, letterSpacing: 3, color: C.gold }}>ROSE & FUNK</span>
        <span style={{ fontSize: 11, letterSpacing: 2, color: C.dim, marginLeft: 4 }}>BUSINESS ASSISTANT</span>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, background: C.surface }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "12px 20px", background: "none", border: "none", cursor: "pointer",
            fontSize: 11, letterSpacing: 2, color: tab === t ? C.gold : C.dim,
            borderBottom: tab === t ? `1px solid ${C.gold}` : "1px solid transparent",
            transition: "all 0.2s", fontFamily: "inherit"
          }}>{t}</button>
        ))}
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>

        {/* CHAT TAB */}
        {tab === "Chat" && (
          <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

            {/* Recent Searches Column */}
            <div style={{
              width: 220, borderRight: `1px solid ${C.border}`, display: "flex",
              flexDirection: "column", background: C.surface, flexShrink: 0
            }}>
              <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 9, letterSpacing: 2, color: C.dim }}>RECENT SEARCHES</span>
                {searchHistory.length > 0 && (
                  <button onClick={clearHistory} style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 9, color: C.dim, letterSpacing: 1, padding: 0, fontFamily: "inherit"
                  }}>CLEAR</button>
                )}
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
                {searchHistory.length === 0 ? (
                  <div style={{ padding: "16px", fontSize: 11, color: C.dim, lineHeight: 1.6, textAlign: "center" }}>
                    Your recent questions will appear here
                  </div>
                ) : (
                  searchHistory.map((query, i) => (
                    <button key={i} onClick={() => reuseSearch(query)} style={{
                      display: "block", width: "100%", textAlign: "left",
                      background: "none", border: "none", borderLeft: "2px solid transparent",
                      cursor: "pointer", padding: "9px 16px", fontSize: 11, color: C.muted,
                      fontFamily: "inherit", transition: "all 0.15s"
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = C.faint;
                      e.currentTarget.style.borderLeftColor = C.gold;
                      e.currentTarget.style.color = C.text;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "none";
                      e.currentTarget.style.borderLeftColor = "transparent";
                      e.currentTarget.style.color = C.muted;
                    }}>
                      <div style={{ fontSize: 10, color: C.dim, marginBottom: 2 }}>#{searchHistory.length - i}</div>
                      <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: 1.4 }}>{query}</div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Chat Main */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
                {messages.map((m, i) => (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                      <div style={{
                        maxWidth: "72%", padding: "12px 16px", borderRadius: 8,
                        background: m.role === "user" ? C.gold : C.surface,
                        color: m.role === "user" ? "#1a1200" : C.text,
                        border: m.role === "assistant" ? `1px solid ${C.border}` : "none",
                        fontSize: 13, lineHeight: 1.6,
                        boxShadow: m.role === "user" ? "0 2px 8px rgba(200,169,110,0.15)" : "none"
                      }}>
                        {m.content}
                      </div>
                    </div>
                    {m.role === "assistant" && i > 0 && (
                      <div style={{ marginTop: 6 }}>
                        <button onClick={() => saveToKnowledge(m.content)} style={{
                          background: "none", border: `1px solid ${C.faint}`, cursor: "pointer",
                          fontSize: 9, color: C.dim, padding: "3px 10px", borderRadius: 4,
                          letterSpacing: 1, transition: "all 0.2s", fontFamily: "inherit"
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = C.faint; e.currentTarget.style.color = C.dim; }}>
                          + SAVE TO KNOWLEDGE BASE
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div style={{ display: "flex" }}>
                    <div style={{ padding: "12px 16px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, color: C.dim }}>
                      Thinking...
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
              <div style={{ padding: "16px 24px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 12 }}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && send()}
                  placeholder="Ask anything about Rose & Funk..."
                  style={{
                    flex: 1, background: C.surface, border: `1px solid ${C.border}`,
                    borderRadius: 6, padding: "10px 14px", color: C.text, fontSize: 13,
                    outline: "none", fontFamily: "inherit"
                  }}
                />
                <button onClick={send} disabled={loading || !input.trim()} style={{
                  padding: "10px 20px", background: C.gold, color: "#1a1200",
                  border: "none", borderRadius: 6, cursor: "pointer",
                  fontSize: 11, letterSpacing: 2, fontFamily: "inherit",
                  opacity: loading || !input.trim() ? 0.5 : 1, transition: "opacity 0.2s"
                }}>SEND</button>
              </div>
            </div>
          </div>
        )}

        {/* KNOWLEDGE BASE TAB */}
        {tab === "Knowledge Base" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "12px 20px", borderBottom: `1px solid ${C.border}`, fontSize: 10, color: C.dim, letterSpacing: 2 }}>
              EDIT DIRECTLY — CHANGES APPLY IMMEDIATELY TO CHAT
            </div>
            <textarea
              value={knowledge}
              onChange={e => setKnowledge(e.target.value)}
              style={{
                flex: 1, background: C.bg, color: C.muted, border: "none",
                padding: "20px 24px", fontSize: 12, lineHeight: 1.8,
                fontFamily: "'Courier New', monospace", resize: "none", outline: "none"
              }}
            />
          </div>
        )}

        {/* PROCEDURES TAB */}
        {tab === "Procedures" && (
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
            {procedures.map((cat, ci) => (
              <div key={ci} style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 9, letterSpacing: 3, color: C.dim, marginBottom: 12 }}>{cat.category}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {cat.items.map((proc, pi) => {
                    const key = `${ci}-${pi}`;
                    const open = expandedProc === key;
                    return (
                      <div key={pi} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
                        <div onClick={() => setExpandedProc(open ? null : key)} style={{
                          padding: "14px 18px", cursor: "pointer",
                          display: "flex", justifyContent: "space-between", alignItems: "center"
                        }}>
                          <div>
                            <div style={{ fontSize: 13, color: C.text }}>{proc.title}</div>
                            <div style={{ fontSize: 10, color: ownerColor(proc.owner), marginTop: 3, letterSpacing: 1 }}>{proc.owner}</div>
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
  );
}
