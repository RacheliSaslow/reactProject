import axios from "axios";
import { getUser } from "./apiLogin";

export const getUsers = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("אין token זמין. אנא התחבר מחדש.");
  }

  try {
    const currentUser = await getUser(); // קריאה ל-getUser כדי לקבל את פרטי המשתמש הנוכחי
    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("גישה נדחתה: רק מנהל יכול לגשת לרשימת המשתמשים.");
    }
    
    const data = await axios.get(`http://localhost:4000/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data.data;
  } catch (error: any) {
    const status = error?.response?.status;
    if (status === 401) throw new Error("לא מאומת/הטוקן לא תקין");
    if (status === 403) throw new Error("גישה נדחתה: נדרשת הרשאת מנהל");
    throw new Error(error?.response?.data?.message || "טעינת המשתמשים נכשלה");
  }
};

function bearerHeaderFromLS() {
  const raw = localStorage.getItem("token");
  if (!raw) throw new Error("אין token זמין. אנא התחבר מחדש.");
  return raw.startsWith("Bearer ") ? raw : `Bearer ${raw}`;
}

export const createUser = async (name: string, email: string, password: string, role:"customer") => {
  try{
    const response = await axios.post("http://localhost:4000/users", {name, email, password,role },{headers:{ Authorization: bearerHeaderFromLS() }});
  return response.data;
   }
  catch (error:any) {
    const status = error?.response?.status;
    if (status === 401) throw new Error("לא מאומת/הטוקן לא תקין");
    if (status === 403) throw new Error("גישה נדחתה: נדרשת הרשאת מנהל");
    throw new Error(error?.response?.data?.message || "יצירת המשתמש נכשלה");
 }
};

