import { auth, db } from './firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export const loginUser = async (email, password) => {
  // Real Firebase only
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return { id: userCredential.user.uid, email };
};

export const registerUser = async (email, password, name, role, extra = {}) => {
  // Real Firebase only
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = { email, name, role, created_at: new Date().toISOString(), ...extra };
  await setDoc(doc(db, 'users', userCredential.user.uid), user);
  return { id: userCredential.user.uid, ...user };
};

export const logoutUser = async () => {
  // Real Firebase only
  await signOut(auth);
};
