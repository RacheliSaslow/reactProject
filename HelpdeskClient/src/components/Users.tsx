import { useState } from "react";
import { createUser, getUsers } from "../services/apiUser";

interface UsersProps {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
}
type CreateUserPayload = {
  name: string;
  email: string;
  password: string;
  role: string;
};

export const Users: React.FC = () => {
    const [users, setUsers] = useState<UsersProps[]>([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [form, setForm] = useState<CreateUserPayload>({
    name: "",
    email: "",
    password: "",
    role:""
  });
    
    const GetAllUsers = async () => {
    try {
        const data = await getUsers();
        setUsers(data);
    } catch (error: any) {
        setErrorMessage(error.message || "שגיאה בטעינת המשתמשים");
    }
    
    }

    const handleCreateUser = async () => {
    try {
      setErrorMessage("");
      setCreating(true);

      if (!form.name || !form.email || !form.password||!form.role) {
        throw new Error("נא למלא את כל השדות");
      }

      await createUser(form.name, form.email, form.password,form.role as "customer");
      setShowCreateForm(false);
      setForm({ name: "", email: "", password: "" , role:"customer"});
      await GetAllUsers();
    } catch (error: any) {
      setErrorMessage(error.message || "יצירת המשתמש נכשלה");
    } finally {
      setCreating(false);
    }
  };

    

    return <>
    <div className="action-bar" style={{ display: "flex", gap: 12, marginBottom: 12 }}></div>
     <button className="btn-hero" onClick={async () => {
        await GetAllUsers();
     }}
     disabled={loadingList}>
        {loadingList ?(<><span className="spin">↻</span>"טוען..."</>)  : ( <>
        <span>🚀</span> טען את כל המשתמשים
      </>)}
     </button>
     <button className="btn-glass-action" onClick={()=>{
        setErrorMessage("");
        setShowCreateForm((v) => !v);
     }}>
        {showCreateForm ? (
      <>
        <span>✕</span> סגור טופס
      </>
    ) : (
      <>
        <span>＋</span> יצירת משתמש חדש
      </>
    )}
        </button>

{showCreateForm && (
        <div className="card card-compact"
          style={{
            border: "1px solid #ccc",
            padding: 12,
            borderRadius: 8,
            maxWidth: 420,
            marginBottom: 16,
          }}
        >
          <div className="forms" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label className="form-group">
              שם
              <input className="input"
                type="text"
                placeholder="לדוגמה: ישראל ישראלי"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </label>

            <label className="form-group">
              אימייל
              <input  className="input"
                type="email"
                placeholder="name@example.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </label>

            <label className="form-group">
              תפקיד
              <select className="input"
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              >
                <option value="customer">customer</option>
                <option value="admin">admin</option>
                <option value="agent">agent</option>
              </select>
            </label>

            <label className="form-group">
              סיסמה
              <input  className="input"
                type="password"
                placeholder="******"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              />
            </label>

            <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={handleCreateUser} disabled={creating}>
              {creating ? "יוצר..." : "שמור משתמש"}
            </button>
          </div>
        </div>
      )}

      <div className="user-grid">
        {users &&
          users.map((x: UsersProps) => (
            <div  key={x.id} className="user-card" style={{ marginBottom: 8 }}>
               <div className="user-info-row">
        <span style={{ opacity: 0.5, fontSize: 12 }}>#{x.id}</span>
        <span className={`badge badge-${x.role}`}>{x.role}</span>
      </div>
      
      <div className="user-name">{x.name}</div>
      <a href={`mailto:${x.email}`} className="user-email">{x.email}</a>
      
      <div className="user-meta">
        נוצר בתאריך: {new Date(x.created_at).toLocaleDateString('he-IL')}
      </div>
            </div>
          ))}
      </div>
    

    {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </>

}
export default Users;