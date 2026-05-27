import { useState, useEffect, useRef } from "react";

const TABS = ["Chat", "Knowledge Base", "Documents", "Procedures"];

const C = {
  bg: "#0f0e0c", surface: "#1a1814", border: "#2a2620",
  gold: "#c8a96e", text: "#f0ebe3", muted: "#d4cdc4",
  dim: "#8a7a65", faint: "#3a3028", red: "#c0614a"
};

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
  const script = document.createElement("script");
  script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
  await new Promise((res, rej) => { script.onload = res; script.onerror = rej; document.head.appendChild(script); });
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

export default function App() {
  const [tab, setTab] = useState("Chat");
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "Hi! I'm your Rose & Funk business assistant. Ask me anything about your processes, client situations, or how to handle day-to-day operations — or browse the tabs for references and documents."
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [knowledge, setKnowledge] = useState("");
  const [kbStatus, setKbStatus] = useState("");
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [expandedProc, setExpandedProc] = useState(null);
  const [saveMsg, setSaveMsg] = useState("");
  const bottomRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    api({ action: "load_knowledge" }).then(d => { if (d.content) setKnowledge(d.content); });
    api({ action: "load_documents" }).then(d => { if (d.documents) setDocuments(d.documents); });
  }, []);

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
      const data = await api({ messages: updated });
      setMessages([...updated, { role: "assistant", content: data.reply || "Sorry, no response." }]);
    } catch {
      setMessages([...updated, { role: "assistant", content: "Something went wrong. Please try again." }]);
    }
    setLoading(false);
  };

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
      let text = "";
      if (file.type === "application/pdf") {
        const arrayBuffer = await file.arrayBuffer();
        text = await extractPdfText(arrayBuffer);
      } else {
        text = await file.text();
      }
      await api({ action: "save_document", name: file.name, text });
      const d = await api({ action: "load_documents" });
      if (d.documents) setDocuments(d.documents);
    } catch (err) {
      console.error("Upload error:", err);
    }
    setUploading(false);
    e.target.value = "";
  };

  const deleteDoc = async (id) => {
    await api({ action: "delete_document", id });
    setDocuments(docs => docs.filter(d => d.id !== id));
  };

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
              <button onClick={() => setMessages([{ role: "assistant", content: "Hi! I'm your Rose & Funk business assistant. Ask me anything about your processes, client situations, or how to handle day-to-day operations — or browse the tabs for references and documents." }])} style={{
                background: "transparent", color: C.dim, border: `1px solid ${C.border}`,
                borderRadius: 6, padding: "8px 18px", cursor: "pointer", fontSize: 11, fontFamily: "Georgia, serif"
              }}>Clear</button>
            </div>
          </div>
        </div>
      )}

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
  );
}
