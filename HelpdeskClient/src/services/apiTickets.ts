import axios from "axios";
import { getUser } from "./apiLogin";

export const getTickets = async () => {

  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("אין token זמין. אנא התחבר מחדש.");
  }

  try {
    const data = await axios.get(`http://localhost:4000/tickets`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data.data;
  } catch (error: any) {
    const status = error?.response?.status;
    if (status === 401) throw new Error("לא מאומת/הטוקן לא תקין");
    throw new Error(error?.response?.data?.message || "טעינת הטיקטים נכשלה");
  }
};

function bearerHeaderFromLS() {
  const raw = localStorage.getItem("token");
  if (!raw) throw new Error("אין token זמין. אנא התחבר מחדש.");
  return raw.startsWith("Bearer ") ? raw : `Bearer ${raw}`;
}

export const createTicket = async (subject: string,
  description: string) => {
  try{
    const response = await axios.post("http://localhost:4000/tickets", {subject, description },{headers:{ Authorization: bearerHeaderFromLS() }});
  return response.data;
   }
  catch (error:any) {
    const status = error?.response?.status;
    if (status === 401) throw new Error("לא מאומת/הטוקן לא תקין");
    if (status === 403) throw new Error("גישה נדחתה: נדרשת הרשאת משתמש");
    throw new Error(error?.response?.data?.message || "יצירת הטיקט נכשלה");
 }
};

export const getTicketById = async (id: number) => {
  try {
    const response = await axios.get(`http://localhost:4000/tickets/${id}`, {
      headers: { Authorization: bearerHeaderFromLS() }
    });
    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;
    if (status === 401) throw new Error("לא מאומת/הטוקן לא תקין");
    if (status === 403) throw new Error("גישה נדחתה: נדרשת הרשאת משתמש");
    throw new Error(error?.response?.data?.message || "טעינת הטיקט נכשלה");
  }
};

export const updateTicketById = async (id: number,agentId:number) => {
  try {
    const response = await axios.patch(`http://localhost:4000/tickets/${id}`,
      {assigned_to: agentId},
      {headers:{ Authorization: bearerHeaderFromLS(),'Content-Type': 'application/json' }}
    );
    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;
    if (status === 401) throw new Error("לא מאומת/הטוקן לא תקין");
    if (status === 403) throw new Error("גישה נדחתה: נדרשת הרשאת מנהל");
    throw new Error(error?.response?.data?.message || "טעינת הטיקט נכשלה");
  }
};

export const updateTicketStatus = async (id: number, statusId: number) => {
  try {
    const response = await axios.patch(
      `http://localhost:4000/tickets/${id}`,
      { status_id: statusId },
      { headers: { Authorization: bearerHeaderFromLS(), "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;
    if (status === 401) throw new Error("לא מאומת/הטוקן לא תקין");
    if (status === 403) throw new Error("גישה נדחתה");
    if (status === 404) throw new Error(error?.response?.data?.message || "לא נמצא");
    throw new Error(error?.response?.data?.message || "עדכון הסטטוס נכשל");
  }
};

export const addTicketComment = async (ticketId: number, content: string) => {
  try {
    const res = await axios.post(
      `http://localhost:4000/tickets/${ticketId}/comments`,
      { content },
      { headers: { Authorization: bearerHeaderFromLS(), "Content-Type": "application/json" } }
    );
    return res.data; // comment שנוצר
  } catch (error: any) {
    const status = error?.response?.status;
    if (status === 401) throw new Error("לא מאומת/הטוקן לא תקין");
    if (status === 403) throw new Error("אין הרשאה להוסיף תגובה לטיקט זה");
    if (status === 400) throw new Error(error?.response?.data?.message || "תוכן התגובה נדרש");
    if (status === 404) throw new Error(error?.response?.data?.message || "הטיקט לא נמצא");
    throw new Error(error?.response?.data?.message || "הוספת התגובה נכשלה");
  }
};