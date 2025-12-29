import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="main-footer">
      <div className="footer-container">
        
        <div className="footer-content">
          
          {/* עמודה 1: אודות */}
          <div className="footer-column">
            <h3>מערכת Helpdesk</h3>
            <p>
              מערכת מתקדמת לניהול פניות שירות ותמיכה טכנית.
              אנו מספקים פתרון יעיל ומהיר לניהול טיקטים, מעקב אחר סטטוסים
              ותקשורת בין לקוחות לסוכני שירות.
            </p>
          </div>

          {/* עמודה 2: קישורים מהירים */}
          <div className="footer-column">
            <h3>ניווט מהיר</h3>
            <ul className="footer-links">
              <li>
                <Link to="/dashboard">מסך ראשי (Dashboard)</Link>
              </li>
              <li>
                <Link to="/tickets">רשימת פניות</Link>
              </li>
              <li>
                <Link to="/tickets/new">פתיחת פניה חדשה</Link>
              </li>
              <li>
                <Link to="/login">התחברות למערכת</Link>
              </li>
            </ul>
          </div>

          {/* עמודה 3: יצירת קשר */}
          <div className="footer-column">
            <h3>תמיכה טכנית</h3>
            <ul className="footer-links">
              <li>
                {/* אייקון מייל */}
                <svg className="icon-svg" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                support@helpdesk.co.il
              </li>
              <li>
                {/* אייקון טלפון */}
                <svg className="icon-svg" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                03-123-4567
              </li>
              <li>
                {/* אייקון מיקום */}
                <svg className="icon-svg" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                רחוב הברזל 10, תל אביב
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* שורה תחתונה */}
      <div className="footer-bottom">
        <div className="footer-container">
          <p>© {currentYear} כל הזכויות שמורות למערכת Helpdesk.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
