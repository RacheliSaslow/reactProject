import React, { useEffect, useState } from "react";
import { getUser } from "../services/apiLogin";
import { useNavigate } from "react-router-dom";

// הגדרת טיפוס למשתמש כדי למנוע שגיאות טייפסקריפט
interface UserData {
  id: number;
  name: string;
  email: string;
  role: "admin" | "agent" | "customer";
}

export const Dashboard: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // useEffect - רץ פעם אחת כשהדף עולה
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const me = await getUser();
        setCurrentUser(me);
      } catch (err) {
        setError("לא ניתן היה לטעון את פרטי המשתמש");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // מסך טעינה
  if (loading) {
    return (
      <div className="page-center">
        <div style={{ fontSize: "24px", color: "#4f46e5" }}>⏳ טוען נתונים...</div>
      </div>
    );
  }

  return (
    <div className="container page-center" style={{ alignItems: "flex-start" }}>
      <div className="stack">
        
        {/* כותרת ראשית */}
        <h1 style={{ fontSize: "32px", marginBottom: "0", textAlign: "center", width: "100%" }}>
          לוח בקרה ראשי
        </h1>

        {/* הצגת שגיאות אם יש */}
        {error && <div className="toast text-danger">{error}</div>}

        {/* כרטיס ברוכים הבאים */}
        <div className="card" style={{ textAlign: "center", padding: "40px" }}>
          <h2 style={{ margin: "0 0 10px 0", fontSize: "28px" }}>
            שלום, <span style={{ color: "var(--primary)" }}>{currentUser?.name || "אורח"}</span> 👋
          </h2>
          
          <p style={{ color: "#64748b", fontSize: "18px" }}>
            ברוכים הבאים למערכת ניהול הטיקטים.
          </p>

          {/* פרטי המשתמש */}
          {currentUser && (
            <div style={{ 
              marginTop: "24px", 
              padding: "16px", 
              background: "rgba(79, 70, 229, 0.05)", 
              borderRadius: "12px",
              display: "inline-block"
            }}>
              <div style={{ marginBottom: "8px" }}><strong>אימייל:</strong> {currentUser.email}</div>
              <div>
                <strong>תפקיד:</strong> 
                <span className={`badge badge-${currentUser.role}`} style={{ marginRight: "8px" }}>
                  {currentUser.role}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* כפתורי פעולה מהירים (תפריט) */}
        <div style={{ display: "grid", gap: "16px", marginTop: "16px" }}>
          
          {/* כפתור מעבר לטיקטים */}
          <button 
            className="btn btn-hero" 
            style={{ justifyContent: "center" }}
            onClick={() => navigate(`/tickets`)} // או להשתמש ב-Navigate של הראוטר שלך
          >
            📂 צפייה בטיקטים
          </button>

          {/* כפתור ניהול משתמשים (רק למנהלים) */}
          {currentUser?.role === "admin" && (
            <button 
              className="btn btn-glass-action" 
              style={{ justifyContent: "center", background: "#fff" }}
              onClick={() => navigate(`/users`)}
            >
              👥 ניהול משתמשים
            </button>
          )}

          {/* כפתור יצירת טיקט מהיר */}
          {currentUser?.role === "customer" && (
          <button 
            className="btn btn-glass-action" 
            style={{ justifyContent: "center", gridColumn: "1 / -1" }}
            onClick={() => navigate(`/tickets/new`)}
          >
            ＋ פתיחת קריאה חדשה
          </button>
          )}

            </div>
      </div>
    </div>
  );
};

export default Dashboard;
