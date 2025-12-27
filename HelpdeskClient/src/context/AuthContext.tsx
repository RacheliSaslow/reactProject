import React,{createContext, useReducer,useContext, useEffect} from 'react';
import { Users } from '../components/Users';
import { Navigate } from 'react-router-dom';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface AuthState {
    User: User | null;
    token: string | null;
    isLoading: boolean;
}

type AuthAction = { type: 'login', payload: { token: string; user: User } } |
{ type: 'logout' }|{type:'setLoading',payload:boolean} ;

export const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case 'login':
            localStorage.setItem('token', action.payload.token);
            localStorage.setItem('user', JSON.stringify(action.payload.user));
           return { 
                token: action.payload.token, 
                User: action.payload.user,
                isLoading: false 
            };
        case 'logout':
           localStorage.removeItem('user');  // חדש
            return { token: null, User: null, isLoading: false };
        case 'setLoading':
            return { ...state, isLoading: action.payload };
        default:
            return state;
    }
};

export const UserContext = createContext<{ state: AuthState; dispatch: React.Dispatch<AuthAction> } | null>(null);
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, { token: null, User: null,isLoading:true });
   useEffect(() => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (token && userStr) {
            try {
                const user = JSON.parse(userStr);
                dispatch({ type: 'login', payload: { token, user } });
            } catch (error) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        dispatch({ type: 'setLoading', payload: false });
    }, []);
  return <UserContext.Provider value={{ state, dispatch }}>{children}</UserContext.Provider>;
};
export const useAuth = () =>  {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state } = useAuth();
   if (state.isLoading) {
        return <div>טוען...</div>; 
    }
    
    return state.token ? <>{children}</> : <Navigate to="/login" replace />;
};