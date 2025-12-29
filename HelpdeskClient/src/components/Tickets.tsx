import { useEffect, useState } from "react";
import { getTickets, updateTicketById, updateTicketStatus, addTicketComment } from "../services/apiTickets";
import { getUsers } from "../services/apiUser";
import { getStatuses } from "../services/apiStatuses";
import { getUser } from "../services/apiLogin"; 
import  NewTicket  from "./NewTicket";
import { useNavigate } from 'react-router-dom';

// --- Types ---
interface ticketsProps {
  id: number;
  subject: string;
  description: string;
  created_at: string;
  status_id?: number | null;
  status_name?: string | null;
  created_by: number;
  priority_name?: string;
}

interface UserItem {
  id: number;
  name: string;
  email: string;
  role: "admin" | "agent" | "customer";
}

export const Tickets: React.FC = () => {
  // --- State ---
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});
  const [openCommentId, setOpenCommentId] = useState<number | null>(null);
  
  const [statuses, setStatuses] = useState<Array<{ id: number; name: string }>>([]);
  const [me, setMe] = useState<{ id?: number; role?: "admin" | "agent" | "customer" } | null>(null);
  const [tickets, setTickets] = useState<ticketsProps[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [agents, setAgents] = useState<UserItem[]>([]);
  
  // Selections
  const [selectedTicketId, setSelectedTicketId] = useState<number | "">("");
  const [selectedAgentId, setSelectedAgentId] = useState<number | "">("");
  const [ticketStatusDraft, setTicketStatusDraft] = useState<Record<number, number | "">>({});

  // UI State
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false); // עדיין צריך לדעת אם להציג את הטופס
  const [loadingList, setLoadingList] = useState(false);
  const navigate = useNavigate();
  
  // --- Effects ---
  useEffect(() => {
    (async () => {
      try {
        setLoadingList(true);

        const userData = await getUser();
        if (!userData) throw new Error("לא ניתן לזהות משתמש");
        setMe(userData);

        const [tks, sts] = await Promise.all([
          getTickets(),
          getStatuses()
        ]);
        
        setTickets(tks);
        setStatuses(sts);

        try {
          const us = await getUsers();
          setUsers(us);
          setAgents(us.filter((u: UserItem) => u.role === "agent"));
        } catch (err) {
          
        }

      } catch (e: any) {
        setErrorMessage(e.message || "שגיאה בטעינת נתונים");
      } finally {
        setLoadingList(false);
      }
    })();
  }, []);

  // --- Actions ---
const GetTickets = async () => {
    try {
      setLoadingList(true);
      const data = await getTickets();
      setTickets(data);
    } catch (error: any) {
      setErrorMessage(error.message || "שגיאה בטעינת הטיקטים");
    } finally {
      setLoadingList(false);
    }
  };

  const handleAssign = async () => {
    try {
      if (!selectedTicketId || !selectedAgentId) {
        setErrorMessage("נא לבחור טיקט ו-Agent");
        return;
      }
      await updateTicketById(selectedTicketId as number, selectedAgentId as number);
      setSuccessMessage("הטיקט הוקצה בהצלחה");
      setTimeout(() => setSuccessMessage(""), 3000);
      await GetTickets();
    } catch (e: any) {
      setErrorMessage(e.message || "שגיאה בהקצאת הטיקט");
    }
  };

  const handleUpdateStatus = async (ticketId: number) => {
    try {
      const statusId = ticketStatusDraft[ticketId] ?? tickets.find(t => t.id === ticketId)?.status_id;
      if (!statusId) return;
      await updateTicketStatus(ticketId, statusId as number);
      setSuccessMessage(`הסטטוס עודכן בהצלחה 👍`);
      setTimeout(() => setSuccessMessage(""), 3000);
      await GetTickets();
    } catch (e: any) {
      setErrorMessage(e.message || `שגיאה בעדכון הסטטוס`);
    }
  };

  const handleSendComment = async (ticketId: number) => {
    const content = commentDrafts[ticketId];
    if (!content || content.trim() === "") {
      setErrorMessage("לא ניתן לשלוח תגובה ריקה");
      return;
    }

    try {
      await addTicketComment(ticketId, content);
      setSuccessMessage("התגובה נוספה בהצלחה! 💬");
      setCommentDrafts(prev => ({ ...prev, [ticketId]: "" }));
      setOpenCommentId(null);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (e: any) {
      setErrorMessage("שגיאה בשליחת התגובה");
    }
  };

  const canViewTicket = (ticket: ticketsProps): boolean => {
    if (!me) return false;
    if (me.role === "admin" || me.role === "agent") return true;
    return ticket.created_by === me.id;
  };

  const visibleTickets = tickets.filter(canViewTicket);

  // --- Render ---
  return <>
    <div className="container">
      
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 className="header-title" style={{ fontSize: "36px", marginBottom: "10px" }}>
          מרכז התמיכה והטיקטים
        </h1>
        <p style={{ color: "var(--text-muted)" }}>
          {me ? `מחובר כ: ${me.role} (${me.id})` : "טוען משתמש..."}
        </p>
      </div>

      {successMessage && <div className="toast text-success">{successMessage}</div>}
      {errorMessage && <div className="toast text-danger">{errorMessage}</div>}

      <div className="action-bar">
        <button className="btn btn-hero" onClick={GetTickets} disabled={loadingList}>
          {loadingList ? <>⏳ טוען נתונים...</> : <>🔄 רענן רשימה</>}
        </button>

        {me?.role === "customer" && (
        <button 
          className="btn btn-glass-action" 
          onClick={() => navigate('/tickets/new')}
        >
          {showCreateForm ? "סגור טופס" : "＋ פתיחת קריאה חדשה"}
        </button>
        )}
      </div>

      {me?.role === "admin" && (
        <div className="card admin-panel">
          <h3 style={{ color: "#0369a1", marginTop: 0 }}>⚡ פעולות מנהל: הקצאת סוכן</h3>
          <div className="forms" style={{ gridTemplateColumns: "1fr 1fr auto", alignItems: "end" }}>
            <div className="form-group">
              <label>בחר טיקט</label>
              <select
                className="input"
                value={selectedTicketId}
                onChange={(e) => setSelectedTicketId(e.target.value ? Number(e.target.value) : "")}
              >
                <option value="">-- בחר מהרשימה --</option>
                {tickets.map((t) => (
                  <option key={t.id} value={t.id}>#{t.id} - {t.subject}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>בחר סוכן</label>
              <select
                className="input"
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value ? Number(e.target.value) : "")}
              >
                <option value="">-- בחר סוכן --</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <button className="btn btn-primary" onClick={handleAssign} style={{ height: "50px", marginBottom: "2px" }}>
              בצע הקצאה
            </button>
          </div>
        </div>
      )}

      <h2 style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" }}>
        📦 רשימת הקריאות ({visibleTickets.length})
      </h2>
      
      <div className="ticket-grid">
        {visibleTickets.map((ticket) => (
          <div key={ticket.id} className="card ticket-card">
            <div>
              <div className="ticket-header">
                <span className="ticket-id">#{ticket.id}</span>
                <span className={`status-badge status-${ticket.status_name?.toLowerCase() || 'open'}`}>
                  {ticket.status_name || 'Open'}
                </span>
              </div>
              <div className="ticket-subject">{ticket.subject}</div>
              <div className="ticket-desc">{ticket.description}</div>
              <div style={{ fontSize: "13px", color: "#94a3b8", marginTop: "12px" }}>
                📅 {new Date(ticket.created_at).toLocaleDateString("he-IL")}
              </div>
            </div>

            <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #f1f5f9" }}>
              <button 
                className="btn" 
                style={{ 
                  background: "none", 
                  color: "#3b82f6", 
                  padding: "0", 
                  fontSize: "14px", 
                  marginBottom: "10px",
                  cursor: "pointer"
                }}
                onClick={() => setOpenCommentId(openCommentId === ticket.id ? null : ticket.id)}
              >
                {openCommentId === ticket.id ? "✕ סגור תגובה" : "💬 הוסף תגובה"}
              </button>

              {openCommentId === ticket.id && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", animation: "fadeIn 0.3s" }}>
                  <textarea
                    className="input"
                    placeholder="כתוב תגובה..."
                    rows={2}
                    value={commentDrafts[ticket.id] || ""}
                    onChange={(e) => setCommentDrafts(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                    style={{ fontSize: "14px" }}
                  />
                  <button 
                    className="btn btn-primary" 
                    style={{ alignSelf: "flex-end", padding: "6px 16px", fontSize: "13px" }}
                    onClick={() => handleSendComment(ticket.id)}
                  >
                    שלח תגובה
                  </button>
                </div>
              )}

              {(me?.role === "agent" || me?.role === "admin") && (
                <div style={{ marginTop: "15px", paddingTop: "10px", borderTop: "1px dashed #e2e8f0" }}>
                  <label style={{ fontSize: "12px", marginBottom: "4px", display: "block" }}>שינוי סטטוס:</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <select
                      className="input"
                      style={{ padding: "4px", height: "auto", fontSize: "13px" }}
                      value={ticketStatusDraft[ticket.id] !== undefined ? ticketStatusDraft[ticket.id] : ticket.status_id ?? ""}
                      onChange={(e) => {
                        const val = e.target.value ? Number(e.target.value) : "";
                        setTicketStatusDraft((prev) => ({ ...prev, [ticket.id]: val }));
                      }}
                    >
                      {statuses.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    <button
                      className="btn btn-primary"
                      style={{ padding: "4px 10px", fontSize: "12px" }}
                      onClick={() => handleUpdateStatus(ticket.id)}
                    >
                      עדכן
                    </button>
                    <button className="btn btn-primary"
                      style={{ padding: "4px 10px", fontSize: "12px" }}
                      onClick={() => navigate(`/tickets/${ticket.id}`)}>
לפרטי הטיקט
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
    </>;
    }

