import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Ticket {
  id: number;
  subject: string;
  description: string;
  status_id: number;
  priority_id: number;
  status_name: string;
  priority_name: string;
  created_by: number;
  assigned_to: number | null;
  created_at: string;
  agent_name?: string; // אם השרת מחזיר שם סוכן
  customer_name?: string; // אם השרת מחזיר שם לקוח
}

const TicketById = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTicketData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
           navigate('/login');
           return;
        }

        // קריאה לשרת עם Header
        const response = await axios.get(`http://localhost:4000/tickets/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const data = response.data;
        setTicket(data);
        

      } catch (err: any) {
        if (err.response?.status === 403) {
          setError('אין לך הרשאה לצפות בטיקט זה.');
        } else if (err.response?.status === 404) {
          setError('הטיקט לא נמצא.');
        } else {
          setError('שגיאה בטעינת הנתונים.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTicketData();
  }, [id, navigate]);

  if (loading) return <div className="ticket-container"><h3>טוען נתונים...</h3></div>;
  if (error) return <div className="ticket-container"><h3 className="error-msg">{error}</h3></div>;
  if (!ticket) return null;

  return (
    <div className="ticket-container">
      <div className="ticket-card">
         <button onClick={() => navigate('/tickets')} className="btn btn-primary">
        &larr; חזרה לרשימה
      </button>
        
        {/* כותרת */}
        <div className="ticket-header">
          <div className="ticket-title">
            <h1>{ticket.subject}</h1>
            <div className="ticket-id">מספר פניה: #{ticket.id}</div>
          </div>
          <div className={`status-badge ${ticket.status_name === 'סגור' ? 'closed' : 'open'}`}>
            {ticket.status_name || 'לא ידוע'}
          </div>
        </div>

        {/* גריד מידע */}
        <div className="ticket-meta-grid">
          <div className="meta-item">
            <span className="meta-label">נוצר בתאריך</span>
            <span className="meta-value">{new Date(ticket.created_at).toLocaleDateString('he-IL')}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">עדיפות</span>
            <span className="meta-value">{ticket.priority_name || 'רגילה'}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">נוצר ע"י</span>
            <span className="meta-value">משתמש #{ticket.created_by}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">מטופל ע"י</span>
            <span className="meta-value">
              {ticket.assigned_to ? `סוכן #${ticket.assigned_to}` : 'טרם הוקצה'}
            </span>
          </div>
        </div>

        {/* תיאור */}
        <div className="ticket-description">
          <div className="meta-label" style={{marginBottom: '10px'}}>תיאור הפניה:</div>
          <div className="description-box">
            {ticket.description}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TicketById;
