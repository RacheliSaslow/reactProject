import { useEffect, useState, type FunctionComponent } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import { useAuth } from "../context/AuthContext";
import { getUser } from "../services/apiLogin";

interface HeaderProps {}

const Header: FunctionComponent<HeaderProps> = () => {
    const { state, dispatch } = useAuth();
    const navigate = useNavigate();

    const [serverUser, setServerUser] = useState<{ role?: string } | null>(null);
    // const [loadingMe, setLoadingMe] = useState(false); // לא חובה לשימוש בתצוגה כרגע
    const isLoggedIn = !!state.token;

    useEffect(() => {
        let cancelled = false;

        const fetchMe = async () => {
            if (!state.token) {
                setServerUser(null);
                return;
            }
            // setLoadingMe(true);
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
                // if (!cancelled) setLoadingMe(false);
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
        <header className="main-header">
            <div className="header-container">
                
                {/* צד ימין - לוגו */}
                <div className="header-logo">
                    {/* אייקון SVG פשוט */}
                    <svg className="logo-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                    <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
                        <h1>HelpDesk</h1>
                    </Link>
                </div>

                {/* צד שמאל - תפריט */}
                <nav className="main-nav">
                    <ul>
                        {!isLoggedIn ? (
                            <>
                                <li><Link className="nav-link" to="/login">התחברות</Link></li>
                                <li><Link className="nav-link" to="/register">הרשמה</Link></li>
                            </>
                        ) : (
                            <>
                                <li><Link className="nav-link" to="/dashboard">דף הבית</Link></li>
                                <li><Link className="nav-link" to="/tickets">טיקטים</Link></li>
                                
                                {/* תפריט מנהל */}
                                {serverUser?.role === "admin" && (
                                    <>
                                        <li><Link className="nav-link" to="/users">משתמשים</Link></li>
                                        <li><Link className="nav-link" to="/statuses">סטטוסים</Link></li>
                                    </>
                                )}

                                {/* כפתור התנתקות */}
                                <li>
                                    <button onClick={handleLogout} className="logout-btn">
                                        <span>התנתק</span>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                            <polyline points="16 17 21 12 16 7"></polyline>
                                            <line x1="21" y1="12" x2="9" y2="12"></line>
                                        </svg>
                                    </button>
                                </li>
                            </>
                        )}
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;
