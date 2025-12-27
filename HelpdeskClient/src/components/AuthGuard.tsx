import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ReactNode } from 'react';

interface AuthGuardProps {
  children: ReactNode;
  allowedRoles?: string[];
}

const AuthGuard = ({ children, allowedRoles }: AuthGuardProps) => {
 const { state } = useAuth();

  // מחכה שהבדיקה תסתיים
  if (state.isLoading) {
    return <div>טוען...</div>;
  }

  // לא מחובר - העברה ללוגין
  if (!state.User) {
    return <Navigate to="/login" replace />;
  }

  // בדיקת הרשאות לפי role
  if (allowedRoles && !allowedRoles.includes(state.User.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // הכל תקין - הצג את הדף
  return <>{children}</>;
};

export default AuthGuard;
