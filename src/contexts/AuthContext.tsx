import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { initializeFirebase } from '../lib/firebase';
import { localGetMe } from '../lib/localAuth';

export interface UnifiedUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isCustom: boolean;
}

interface AuthContextType {
  user: UnifiedUser | null;
  loading: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
  setCustomUser: (user: UnifiedUser | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  logout: async () => {},
  setCustomUser: () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<UnifiedUser | null>(null);
  const [customUser, setCustomUserState] = useState<UnifiedUser | null>(null);
  const [loadingFirebase, setLoadingFirebase] = useState(true);
  const [loadingCustom, setLoadingCustom] = useState(true);

  // Unify user state: customUser takes priority, then firebaseUser
  const user = customUser || firebaseUser;
  const loading = loadingFirebase || loadingCustom;

  useEffect(() => {
    let unsubscribe: () => void;
    
    // 1. Initialize Firebase Auth
    const initAuth = async () => {
      try {
        const { auth } = await initializeFirebase();
        if (!auth) {
          console.warn("Firebase auth is null, skipping auth init.");
          setLoadingFirebase(false);
          return;
        }
        unsubscribe = onAuthStateChanged(auth, (fUser) => {
          if (fUser) {
            setFirebaseUser({
              uid: fUser.uid,
              email: fUser.email,
              displayName: fUser.displayName || fUser.email?.split('@')[0] || 'User',
              photoURL: fUser.photoURL,
              isCustom: false
            });
          } else {
            setFirebaseUser(null);
          }
          setLoadingFirebase(false);
        });
      } catch (error) {
        console.error("Firebase auth initialization failed:", error);
        setLoadingFirebase(false);
      }
    };

    initAuth();

    // 2. Initialize Custom Auth (Check localStorage token)
    const initCustomAuth = async () => {
      const token = localStorage.getItem('velo_custom_token');
      if (token) {
        try {
          const data = await localGetMe(token);
          if (data.user) {
            setCustomUserState(data.user);
          } else {
            localStorage.removeItem('velo_custom_token');
          }
        } catch (err) {
          console.error("Custom auth verification failed:", err);
          localStorage.removeItem('velo_custom_token');
        }
      }
      setLoadingCustom(false);
    };

    initCustomAuth();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const logout = async () => {
    // Sign out from Firebase if there's a Firebase user
    try {
      const { auth } = await initializeFirebase();
      if (auth) {
        await signOut(auth);
      }
    } catch (e) {
      console.warn("Firebase signout warning:", e);
    }

    // Sign out from Custom auth
    localStorage.removeItem('velo_custom_token');
    setCustomUserState(null);
    setFirebaseUser(null);
  };

  const setCustomUser = (userVal: UnifiedUser | null) => {
    setCustomUserState(userVal);
  };

  const isAdmin = user?.email === 'waseemfiras75@gmail.com' || user?.email === 'waseem@velo9' || user?.email === 'waseemquqas@gmail.com' || user?.email === 'firasquqas@gmail.com';

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, logout, setCustomUser }}>
      {children}
    </AuthContext.Provider>
  );
};

