import React, { useState, useEffect } from 'react';
import { loginUser, registerUser, logoutUser } from '../services/authService';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { AuthContext } from './AuthContext.js';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    // Real Firebase Listener only
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          const userData = userDocSnap.exists() ? userDocSnap.data() : {};
          console.log('[AuthContext] Fetched userData from Firestore:', userData);
          let role = userData.role;
          if (!role) {
            if (firebaseUser.email && firebaseUser.email.includes('provider')) {
              role = 'provider';
            } else {
              role = 'user';
            }
          }
          console.log('[AuthContext] Using role:', role, 'for email:', firebaseUser.email);
          setUser({ id: firebaseUser.uid, email: firebaseUser.email, ...userData, role });
        } catch (e) {
          console.error('[AuthContext] Error fetching user profile:', e);
          setUser({ id: firebaseUser.uid, email: firebaseUser.email, role: 'user' });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    const loggedInUser = await loginUser(email, password);
    setUser(loggedInUser);
  };

  const signup = async (email, password, name, role, extra = {}) => {
    const newUser = await registerUser(email, password, name, role, extra);
    setUser(newUser);
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
