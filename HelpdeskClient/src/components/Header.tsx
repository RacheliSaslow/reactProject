
import { useEffect, useState, type FunctionComponent } from "react";
import { Link, useNavigate } from "react-router-dom"; // לניווט עם React Router
import { useAuth } from "../context/AuthContext";
import { getUser } from "../services/apiLogin";

interface HeaderProps {}

const Header: FunctionComponent<HeaderProps> = () => {
    const { state, dispatch } = useAuth();
    const navigate = useNavigate();

    const [serverUser, setServerUser] = useState<{ role?: string } | null>(null);
    const [loadingMe, setLoadingMe] = useState(false);
    const isLoggedIn = !!state.token;

  useEffect(() => {
    let cancelled = false;

    const fetchMe = async () => {
      if (!state.token) {
        setServerUser(null);
        return;
      }
      setLoadingMe(true);
      try {
        const me = await getUser();
        if (!cancelled) setServerUser(me);
      } catch(err: any) {
        const status = err?.status || err?.response?.status;
        if (!cancelled) {
          setServerUser(null);
        if (status === 401) {
            dispatch({ type: "logout" });
          }
        }
      }
      finally {
        if (!cancelled) setLoadingMe(false);
      }
    };

    fetchMe();
    return () => {
      cancelled = true;
    };
  }, [state.token, dispatch]);


    const handleLogout = () => {
    dispatch({ type: "logout" });
    navigate("/login");
  };

  return (
    <header style={{ backgroundColor: "#f0f0f0", padding: "10px", display: "flex", justifyContent: "space-between" }}>
      <div>
        <h1>האפליקציה שלי</h1>
      </div>

      <nav>
        <ul style={{ listStyle: "none", display: "flex", gap: "20px" }}>
         {!isLoggedIn ? (
    <>
      <li className=""><Link to="/login">התחברות</Link></li>
      <li><Link to="/register">הרשמה</Link></li>
    </>
  ) : (
    <>
      <li><Link to="/">Dashboard</Link></li>
      <li><Link to="/users">user</Link></li>
      <li><Link to="/tickets">טיקטים</Link></li>
      {serverUser?.role  === "admin" && <li><Link to="/admin">ניהול</Link></li>}
      <li>
        <button onClick={handleLogout} style={{ background: "none", border: "none", cursor: "pointer" }}>
          התנתק
        </button>
      </li>
      {serverUser?.role === "admin" && <li><Link to="/statuses">סטטוסים</Link></li>}
    </>
  )}
          
        </ul>
      </nav>
    </header>
  );
};

export default Header;