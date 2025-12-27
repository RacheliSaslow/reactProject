import { useEffect, useState } from "react";
import { createStatus, getStatuses } from "../services/apiStatuses";
import { getUser } from "../services/apiLogin";

type StatusItem = { id: number; name: string };
type CurrentUser = { id: number; name: string; email: string; role: "admin" | "agent" | "customer" };

export const Statuses: React.FC = () => {
    const [statuses, setStatuses] = useState<StatusItem[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [me, setMe] = useState<CurrentUser | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const [list, user] = await Promise.allSettled([getStatuses(), getUser()]);
      if (list.status === "fulfilled") setStatuses(list.value);
      if (user.status === "fulfilled") setMe(user.value);
    } catch (e: any) {
      setErrorMessage(e.message || "שגיאה בטעינה");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

    const handleAdd = async () => {
    try {
      setErrorMessage("");
      setSuccessMessage("");
      if (!name.trim()) {
        setErrorMessage("נא להזין שם סטטוס");
        return;
      }
      setAdding(true);
      await createStatus(name.trim());
      setName("");
      setSuccessMessage("הסטטוס נוסף בהצלחה");
      await load();
    } catch (e: any) {
      setErrorMessage(e.message || "הוספת סטטוס נכשלה");
    } finally {
      setAdding(false);
    }
  };

  const isAdmin = me?.role === "admin";
    return <>
<div className="toolbar">
        <button className="btn" onClick={load} disabled={loading}>
          {loading ? "טוען..." : "רענון"}
        </button>
      </div>

      <div className="card card-compact">
        <h2 style={{ marginTop: 0, marginBottom: 8 }}>סטטוסים</h2>
        <ul className="list">
          {statuses.map((s) => (
            <li className="list-item" key={s.id}>
              #{s.id} — {s.name}
            </li>
          ))}
        </ul>
      </div>

      {isAdmin && (
        <div className="card card-compact">
          <div className="form">
            <label>
              שם סטטוס חדש
              <input
                className="input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="למשל: פתוח / בטיפול / נסגר"
              />
            </label>
            <button className="btn btn-primary" onClick={handleAdd} disabled={adding}>
              {adding ? "מוסיף..." : "הוסף סטטוס"}
            </button>
          </div>
        </div>
      )}

      {successMessage && <div className="text-success">{successMessage}</div>}
      {errorMessage && <div className="text-danger">{errorMessage}</div>}
    </>
}
export default Statuses;