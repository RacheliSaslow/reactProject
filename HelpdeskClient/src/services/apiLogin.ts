import axios from "axios";

export const addUser = async (name:string, email:string, password:string) => {
  try{
    const response = await axios.post("http://localhost:4000/auth/register", { name, email, password });
    return response.data;
  }
  catch (error:any) {
   throw Error( "הרשמה נכשלה");
}
};

export const authLogin = async (email:string, password:string) => {
  try{
    const response = await axios.post("http://localhost:4000/auth/login", { email, password },{ headers: { "Content-Type": "application/json" } });
    console.log("response.data");
  return response.data;
   }
  catch (error:any) {
    throw Error( "התחברות נכשלה");
 }
};

export const getUser = async () => {
  const raw = localStorage.getItem("token");
  if (!raw) throw new Error("אין token זמין. אנא התחבר מחדש.");

  const header = raw.startsWith("Bearer ") ? raw : `Bearer ${raw}`;

  try {
    const res = await axios.get("http://localhost:4000/auth/me", { headers: { Authorization: header } });
    if (res.status === 204 || res.data == null || res.data === "") {
      return null;
    }
    return res.data;
  } catch (error: any) {
    const status = error?.response?.status;
    if (status === 401) {
      const e = new Error("Unauthorized");
      (e as any).status = 401;
      throw e;
    }
    throw new Error(error?.response?.data?.message || "שליפת המשתמש נכשלה");
  }
};
// export const getUser = async () => {
//   const data = await axios.get("http://localhost:4000/auth/me",{
//     headers: {
//         Authorization: `Bearer ${localStorage.getItem("token")}`
//     }
//   });
//   return data.data;
// };