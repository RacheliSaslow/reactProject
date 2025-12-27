import axios from "axios";

function bearerHeaderFromLS() {
  const raw = localStorage.getItem("token");
  if (!raw) throw new Error("אין token זמין. אנא התחבר מחדש.");
  return raw.startsWith("Bearer ") ? raw : `Bearer ${raw}`;
}

export const getStatuses = async () => {
  try {
    const res = await axios.get("http://localhost:4000/statuses", {
      headers: { Authorization: bearerHeaderFromLS() },
    });
    return res.data as Array<{ id: number; name: string }>;
  } catch (error: any) {
    const status = error?.response?.status;
    if (status === 401) throw new Error("לא מאומת/הטוקן לא תקין");
    throw new Error(error?.response?.data?.message || "טעינת הסטטוסים נכשלה");
  }
};

export const createStatus = async (name: string) => {
  try {
    const res = await axios.post(
      "http://localhost:4000/statuses",
      { name },
      { headers: { Authorization: bearerHeaderFromLS(), "Content-Type": "application/json" } }
    );
    return res.data as { id: number; name: string };
  } catch (error: any) {
    const status = error?.response?.status;
    if (status === 401) throw new Error("לא מאומת/הטוקן לא תקין");
    if (status === 403) throw new Error("גישה נדחתה: נדרשת הרשאת מנהל");
    if (status === 400) throw new Error(error?.response?.data?.message || "שם סטטוס נדרש");
    throw new Error(error?.response?.data?.message || "הוספת סטטוס נכשלה");
  }
};