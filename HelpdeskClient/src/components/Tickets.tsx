
// export default Tickets;

import { useEffect, useState } from "react";
import { createTicket, getTickets, updateTicketById, updateTicketStatus, addTicketComment } from "../services/apiTickets";
import { getUsers } from "../services/apiUser";
import { getStatuses } from "../services/apiStatuses";
import { getUser } from "../services/apiLogin";

interface ticketsProps {
  id: number;
  subject: string;
  description: string;
  created_at: string;
  status_id?: number | null;
  status_name?: string | null;
  user_id?: number;
}

interface UserItem {
  id: number;
  name: string;
  email: string;
  role: "admin" | "agent" | "customer";
}

type CreateTicketPayload = {
  subject: string;
  description: string;
};

export const Tickets: React.FC = () => {
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});
  const [statuses, setStatuses] = useState<Array<{ id: number; name: string }>>([]);
  const [selectedStatusId, setSelectedStatusId] = useState<number | "">("");
  const [me, setMe] = useState<{ id?: number; role?: "admin" | "agent" | "customer" } | null>(null);
  const [tickets, setTickets] = useState<ticketsProps[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [agents, setAgents] = useState<UserItem[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<number | "">("");
  const [selectedAgentId, setSelectedAgentId] = useState<number | "">("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [ticketOptions, setTicketOptions] = useState<ticketsProps[]>([]);
  const [ticketStatusDraft, setTicketStatusDraft] = useState<Record<number, number | "">>({});
  const [form, setForm] = useState<CreateTicketPayload>({
    subject: "",
    description: "",
  });

  useEffect(() => {
    (async () => {
      try {
        setLoadingList(true);
        const [tks, us, sts, user] = await Promise.all([
          getTickets(),
          getUsers(),
          getStatuses(),
          getUser(),
        ]);
          console.log("✅ Tickets loaded:", tks);
      console.log("✅ Current user (me):", user);
      console.log("✅ Statuses:", sts);
      
        setStatuses(sts);
        setMe(user);
        setTickets(tks);
        setTicketOptions(tks);
        setUsers(us);
        setAgents(us.filter((u: UserItem) => u.role === "agent"));
      } catch (e: any) {
        setErrorMessage(e.message || "שגיאה בטעינת נתונים");
      } finally {
        setLoadingList(false);
      }
    })();
  }, []);

  const refreshLists = async () => {
    try {
      setLoadingList(true);
      const [tks, us] = await Promise.all([getTickets(), getUsers()]);
      setTickets(tks);
      setTicketOptions(tks);
      setUsers(us);
      setAgents(us.filter((u: UserItem) => u.role === "agent"));
    } catch (e: any) {
      setErrorMessage(e.message || "שגיאה ברענון נתונים");
    } finally {
      setLoadingList(false);
    }
  };

  const GetTickets = async () => {
    try {
      setLoadingList(true);
      const data = await getTickets();
      setTickets(data);
      setTicketOptions(data);
    } catch (error: any) {
      setErrorMessage(error.message || "שגיאה בטעינת כל הטיקטים");
    } finally {
      setLoadingList(false);
    }
  };

  const handleCreateTicket = async () => {
    try {
      setErrorMessage("");
      setSuccessMessage("");
      setCreating(true);

      if (!form.description || !form.subject) {
        throw new Error("נא למלא את כל השדות");
      }

      await createTicket(form.subject, form.description);
      setShowCreateForm(false);
      setForm({ subject: "", description: "" });
      setSuccessMessage("הטיקט נוצר בהצלחה");
      setTimeout(() => setSuccessMessage(""), 3000);
      await GetTickets();
    } catch (error: any) {
      setErrorMessage(error.message || "יצירת הטיקט נכשלה");
    } finally {
      setCreating(false);
    }
  };

  const handleAssign = async () => {
    try {
      setErrorMessage("");
      setSuccessMessage("");
      if (!selectedTicketId || !selectedAgentId) {
        setErrorMessage("נא לבחור טיקט ו-Agent");
        return;
      }
      await updateTicketById(selectedTicketId as number, selectedAgentId as number);
      setSuccessMessage("הטיקט הוקצה בהצלחה");
      setTimeout(() => setSuccessMessage(""), 3000);
      await refreshLists();
    } catch (e: any) {
      setErrorMessage(e.message || "שגיאה בהקצאת הטיקט");
    }
  };

  const handleAddComment = async (ticketId: number) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");
      const content = (commentDrafts[ticketId] ?? "").trim();
      if (!content) {
        setErrorMessage("נא להזין תוכן תגובה");
        return;
      }
      await addTicketComment(ticketId, content);
      setSuccessMessage(`התגובה נוספה לטיקט #${ticketId}`);
      setTimeout(() => setSuccessMessage(""), 3000);
      setCommentDrafts((prev) => ({ ...prev, [ticketId]: "" }));
    } catch (e: any) {
      setErrorMessage(e.message || `שגיאה בהוספת תגובה לטיקט #${ticketId}`);
    }
  };

  const handleUpdateStatus = async (ticketId: number) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");
      const statusId = ticketStatusDraft[ticketId] ?? tickets.find(t => t.id === ticketId)?.status_id;
      if (!statusId) {
        setErrorMessage("נא לבחור סטטוס");
        return;
      }
      await updateTicketStatus(ticketId, statusId as number);
      setSuccessMessage(`הסטטוס לטיקט #${ticketId} עודכן בהצלחה`);
      setTimeout(() => setSuccessMessage(""), 3000);
      await GetTickets();
    } catch (e: any) {
      setErrorMessage(e.message || `שגיאה בעדכון הסטטוס לטיקט #${ticketId}`);
    }
  };

  // בדיקה אם המשתמש יכול לראות את הטיקט
  const canViewTicket = (ticket: ticketsProps): boolean => {
    if (!me) return false;
    if (me.role === "admin" || me.role === "agent") return true;
    return ticket.user_id === me.id;
  };

  // סינון טיקטים שהמשתמש יכול לראות
  const visibleTickets = tickets.filter(canViewTicket);

  return (
    <>
      <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
        <h1>ניהול טיקטים</h1>

        {/* הודעות */}
        {successMessage && (
          <div className="toast text-success" style={{ padding: "10px", backgroundColor: "#d4edda", color: "#155724", borderRadius: "4px", marginBottom: "10px" }}>
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="toast text-danger"style={{ padding: "10px", backgroundColor: "#f8d7da", color: "#721c24", borderRadius: "4px", marginBottom: "10px" }}>
            {errorMessage}
          </div>
        )}

        {/* כפתורי פעולה */}
        <div className="action-bar" style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <button className="btn-hero"
            onClick={async () => {
              await GetTickets();
            }}
            disabled={loadingList}
            style={{ padding: "10px 20px", cursor: loadingList ? "not-allowed" : "pointer" }}
          >קבל טיקטים
        
            
          </button>{loadingList ? "טוען..." : "רענן טיקטים"}

          <button className="btn-glass-action"
            onClick={() => {
              setErrorMessage("");
              setSuccessMessage("");
              setShowCreateForm((v) => !v);
            }}
            style={{ padding: "10px 20px" }}
          >
            {showCreateForm ? "סגור טופס" : "יצירת טיקט חדש"}
          </button>
        </div>

        {/* טופס יצירת טיקט */}
        {showCreateForm && (
          <div
            style={{
              border: "1px solid #ccc",
              padding: "20px",
              borderRadius: "8px",
              maxWidth: "500px",
              marginBottom: "20px",
              backgroundColor: "#f9f9f9",
            }}
          >
          
            <h3>יצירת טיקט חדש</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <label>
                נושא:
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                />
              </label>

              <label>
                תיאור:
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  style={{ width: "100%", padding: "8px", marginTop: "5px", minHeight: "100px" }}
                />
              </label>

              <button
                onClick={handleCreateTicket}
                disabled={creating}
                style={{
                  padding: "10px 20px",
                  backgroundColor: creating ? "#ccc" : "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: creating ? "not-allowed" : "pointer",
                }}
              >
                {creating ? "יוצר..." : "שמור טיקט"}
              </button>
            </div>
          </div>
        )}

        {/* הקצאת טיקט ל-Agent (רק למנהלים) */}
        {me?.role === "admin" && (
          <div
            style={{
              border: "1px solid #ccc",
              padding: "20px",
              borderRadius: "8px",
              marginBottom: "20px",
              backgroundColor: "#f0f8ff",
            }}
          >
            <h3>הקצאת טיקט ל-Agent</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <label>
                בחר טיקט:
                <select
                  value={selectedTicketId}
                  onChange={(e) => setSelectedTicketId(e.target.value ? Number(e.target.value) : "")}
                  style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                >
                  <option value="">בחר טיקט</option>
                  {ticketOptions.map((t) => (
                    <option key={t.id} value={t.id}>
                      #{t.id} — {t.subject}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                בחר Agent:
                <select
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value ? Number(e.target.value) : "")}
                  style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                >
                  <option value="">בחר Agent</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      #{a.id} — {a.name} ({a.email})
                    </option>
                  ))}
                </select>
              </label>

              <button
                onClick={handleAssign}
                disabled={loadingList}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: loadingList ? "not-allowed" : "pointer",
                }}
              >
                הקצה
              </button>
            </div>
          </div>
        )}

        {/* רשימת טיקטים */}
        <h2>הטיקטים שלי ({visibleTickets.length})</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {visibleTickets.map((ticket) => (
            <li
              key={ticket.id}
              style={{
                border: "1px solid #ddd",
                padding: "20px",
                borderRadius: "8px",
                marginBottom: "15px",
                backgroundColor: "#fff",
              }}
            >
              <div style={{ marginBottom: "15px" }}>
                <h3 style={{ margin: "0 0 10px 0" }}>
                  #{ticket.id} — {ticket.subject}
                </h3>
                <p style={{ margin: "5px 0", color: "#666" }}>{ticket.description}</p>
                <p style={{ margin: "5px 0", fontSize: "14px", color: "#999" }}>
                  נוצר בתאריך: {new Date(ticket.created_at).toLocaleDateString("he-IL")}
                </p>
                {ticket.status_name && (
                  <p style={{ margin: "5px 0", fontWeight: "bold" }}>
                    סטטוס: {ticket.status_name}
                  </p>
                )}
              </div>

              {/* עדכון סטטוס (רק ל-Agent ו-Admin) */}
              {(me?.role === "agent" || me?.role === "admin") && (
                <div style={{ marginBottom: "15px", display: "flex", gap: "10px", alignItems: "center" }}>
                  <select
                    value={ticketStatusDraft[ticket.id] !== undefined ? ticketStatusDraft[ticket.id] : ticket.status_id ?? ""}
                    onChange={(e) => {
                      const val = e.target.value ? Number(e.target.value) : "";
                      setTicketStatusDraft((prev) => ({ ...prev, [ticket.id]: val }));
                    }}
                  >
                    <option value="">בחר סטטוס</option>
                    {statuses.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  
                  <button
                    onClick={() => handleUpdateStatus(ticket.id)}
                    disabled={loadingList}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: loadingList ? "not-allowed" : "pointer",
                    }}
                  >
                    עדכן סטטוס
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};
