import { useState, type FunctionComponent } from "react";
import { createTicket,getTickets } from "../services/apiTickets";
import { useNavigate } from 'react-router-dom';

const NewTicket = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [form, setForm] = useState({
    subject: "",
    description: "",
  });

  const handleSubmit = async (e:any) => {
    e.preventDefault();
    try {
      setError("");
      
      // ולידציה בסיסית
      if (!form.subject || !form.description) {
        setError("נא למלא את נושא הפנייה ואת הפירוט");
        return;
      }

      setLoading(true);
      
      // שליחה לשרת
      await createTicket(form.subject, form.description);
      
      // איפוס ועדכון האבא
      setForm({ subject: "", description: "" });
      navigate('/tickets'); 
      
    } catch (err: any) {
      setError(err.message || "שגיאה ביצירת הטיקט");
    } finally {
      setLoading(false);
    }
  };
  const handleTicketCreated = () => {
    setSuccessMessage("הטיקט נוצר בהצלחה! 🎉");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  return <> 
   <div className="card card-compact" style={{ animation: "formFadeIn 0.4s ease", marginBottom: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h3 style={{ margin: 0 }}>📝 פרטי הקריאה החדשה</h3>
        <button 
          onClick={() => navigate('/tickets')}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px" }}
        >
          ✕
        </button>
      </div>

      {error && <div className="toast text-danger" style={{ marginBottom: "16px" }}>{error}</div>}

      <div className="forms">
        <div className="form-group full-width">
          <label>נושא הפנייה</label>
          <input
            className="input"
            type="text"
            placeholder="בכמה מילים, מה הבעיה?"
            value={form.subject}
            onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
            disabled={loading}
          />
        </div>

        <div className="form-group full-width">
          <label>פירוט מלא</label>
          <textarea
            className="input"
            rows={4}
            placeholder="תאר את הבעיה בפירוט..."
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            style={{ minHeight: "100px", resize: "vertical" }}
            disabled={loading}
          />
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "שולח..." : "שלח קריאה"}
          </button>
          
          <button
            className="btn"
            style={{ background: "transparent", border: "1px solid #ccc" }}
            onClick={() => navigate('/tickets')}
            disabled={loading}
          >
            ביטול
          </button>
        </div>
      </div>
    </div>

    </>;
}
 
export default NewTicket;