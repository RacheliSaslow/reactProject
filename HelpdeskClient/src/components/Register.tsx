import ReactDOM from "react-dom"
import { useForm, type SubmitHandler } from "react-hook-form"
import { addUser } from "../services/apiLogin"
import { useState } from "react"

interface IFormInput {
  firstName: string
  email: string
  password: string
}

export const Register: React.FC = () => {

  const { register, handleSubmit } = useForm<IFormInput>()
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit: SubmitHandler<IFormInput> = async(data) => {
    setErrorMessage(""); 
    setSuccessMessage("");
    try {
      const response = await addUser(data.firstName, data.email, data.password);
      setSuccessMessage("הרשמה הצליחה!"); 
      console.log("Success:", response);
    } catch (error: any) {
      const message = error.response?.status === 409
        ? "המשתמש כבר קיים. נסה אימייל או שם משתמש אחר."
        : error.response?.data?.message || "שגיאה לא צפויה. נסה שוב.";
      setErrorMessage(message); 
      console.error("Error:", error);
    }
  }

  return <>
    <form className="forms" onSubmit={handleSubmit(onSubmit)}>
      <div className="form-group">
        <label htmlFor="firstName">firstName</label>
        <input id="firstName" {...register("firstName", { required: true, maxLength: 20 })}  />
      </div>
      <div className="form-group">
        <label htmlFor="email">email</label>
        <input id="email" type="email" {...register("email")} />
      </div>
       <div className="form-group">
        <label htmlFor="password">password</label>
        <input id="password" type="password" {...register("password")} />
      </div>
       <button type="submit" className="btn btn-primary">submit</button>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>} {}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>} {}
    </form>
  </>
}