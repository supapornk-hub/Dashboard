import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, loginWithGoogle, logoutUser, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isDemoUser: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsDemo: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER_ID = 'demo_instructor_01';
const DEMO_USER_PROFILE: UserProfile = {
  id: DEMO_USER_ID,
  email: 'instructor.demo@university.ac.th',
  displayName: 'ผศ.ดร. สุภาพร การศึกษา (อาจารย์ผู้สอน)',
  role: 'instructor',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemoUser, setIsDemoUser] = useState<boolean>(false);

  useEffect(() => {
    // Check if demo user saved in localStorage
    const savedDemo = localStorage.getItem('classpulse_demo_auth');
    if (savedDemo === 'true') {
      setIsDemoUser(true);
      setUser({
        uid: DEMO_USER_ID,
        email: DEMO_USER_PROFILE.email,
        displayName: DEMO_USER_PROFILE.displayName,
      } as User);
      setUserProfile(DEMO_USER_PROFILE);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsDemoUser(false);
        localStorage.removeItem('classpulse_demo_auth');
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            setUserProfile(userSnap.data() as UserProfile);
          } else {
            const newProfile: UserProfile = {
              id: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'อาจารย์ผู้สอน',
              role: 'instructor',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (err) {
          console.warn('Could not sync user profile to Firestore:', err);
          setUserProfile({
            id: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || 'อาจารย์ผู้สอน',
            role: 'instructor',
          });
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignInWithGoogle = async () => {
    setLoading(true);
    try {
      localStorage.removeItem('classpulse_demo_auth');
      setIsDemoUser(false);
      await loginWithGoogle();
    } catch (error) {
      console.error('Google Sign In Error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleSignInAsDemo = () => {
    localStorage.setItem('classpulse_demo_auth', 'true');
    setIsDemoUser(true);
    setUser({
      uid: DEMO_USER_ID,
      email: DEMO_USER_PROFILE.email,
      displayName: DEMO_USER_PROFILE.displayName,
    } as User);
    setUserProfile(DEMO_USER_PROFILE);
    setLoading(false);
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      localStorage.removeItem('classpulse_demo_auth');
      setIsDemoUser(false);
      if (auth.currentUser) {
        await logoutUser();
      }
      setUser(null);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isDemoUser,
        signInWithGoogle: handleSignInWithGoogle,
        signInAsDemo: handleSignInAsDemo,
        signOut: handleSignOut,
      }}
    >
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
