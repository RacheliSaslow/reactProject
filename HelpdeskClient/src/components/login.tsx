import ReactDOM from "react-dom"
import { useForm, type SubmitHandler } from "react-hook-form"
import { authLogin, getUser } from "../services/apiLogin"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

interface LoginProps {
    email: string
    password: string
}

export const Login: React.FC = () => {
    const { register, handleSubmit } = useForm<LoginProps>()
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const { dispatch } = useAuth();
    const navigate = useNavigate();

  
    const onSubmit: SubmitHandler<LoginProps> = async (formData) => {
        setErrorMessage("");
        setSuccessMessage("התחברות הצליחה! ברוך הבא, ");
        setTimeout(() => navigate('/dashboard'), 1500);
        setCurrentUser(null);
        setLoading(true);

        try {
             const loginRes = await authLogin(formData.email, formData.password); 
             dispatch({ type: 'login', payload: {token: loginRes.token, user: loginRes.user} });
            try {
                const me = await getUser();
                setCurrentUser(me);
                setSuccessMessage("התחברות הצליחה! ברוך הבא, " + (me.name || ""));
            } catch {
                   // אם /auth/me נכשל, לא מפיל את הזרימה
            }
            navigate('/dashboard'); 

            } catch (err: any) 
            { 
                const msg = err?.response?.data?.message || err?.message || "התחברות נכשלה";
    setErrorMessage(msg); 
            } finally
            { setLoading(false); 
            
        }
    }
    useEffect(() => {
    return () => {
        setErrorMessage("");
        setSuccessMessage("");
    };
}, []);

    return <>
        <form className="forms" onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
                <label htmlFor="email">Email</label>
                <input className="input" placeholder="name@example.com" id="email" type="email" {...register("email", { required: true, maxLength: 50 })} required />
            </div>
            <div className="form-group">
                <label htmlFor="password">password</label>
                <input className="input" placeholder="******" id="password" type="password" {...register("password",{required:true})} />
            </div>

            <input  type="submit" value="התחבר" className="btn btn-primary" disabled={loading} />
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>} { }
            {successMessage && <p style={{ color: "green" }}>{successMessage}</p>} { }
        </form>

            {currentUser && (
        <div className="forms" style={{ marginTop: "20px", border: "1px solid green", padding: "10px" }}>
          <h3>פרטי המשתמש הנוכחי:</h3>
          <p className="form-group">שם: {currentUser.name}</p>
          <p className="form-group">אימייל: {currentUser.email}</p>
          <p className="form-group">תפקיד: {currentUser.role}</p>
        </div>
      )}
    </>;
}

export default Login;