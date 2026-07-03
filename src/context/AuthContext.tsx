import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, signOutUser } from '../lib/firebase';
import { CRMDepartment } from '../types';
import { mapEmailToDept } from '../utils/auth';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  authorizedDept: CRMDepartment | null;
  loginError: string | null;
  setLoginError: (error: string | null) => void;
  setUser: (user: User | null) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setAuthorizedDept: (dept: CRMDepartment | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [authorizedDept, setAuthorizedDept] = useState<CRMDepartment | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        const email = user.email.toLowerCase().trim();
        const isSuperUser = email === "macjay2joe@gmail.com" || email.includes("macjay2joe");
        const isCentrix = email.endsWith("@centrix.com");

        if (!isSuperUser && !isCentrix) {
          signOutUser();
          setUser(null);
          setIsLoggedIn(false);
          setLoginError("Access Denied: Only @centrix.com corporate emails are authorized to access CentriX CRM.");
          return;
        }

        const dept = mapEmailToDept(user.email);
        setUser(user);
        setIsLoggedIn(true);
        setAuthorizedDept(dept);
        setLoginError(null);
      } else {
        setUser(null);
        setIsLoggedIn(false);
        setAuthorizedDept(null);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, authorizedDept, setAuthorizedDept, setIsLoggedIn, setUser, loginError, setLoginError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
