// Firebase configuration for Google OAuth
// Note: For learning purposes, these would normally be environment variables
// In production, store these in .env file and use import.meta.env

const firebaseConfig = {
  apiKey: "AIzaSyBMOZrFA3doLGcqAFuIcY2Hc5_BEUfd-v4",
  authDomain: "e-commerce-76460.firebaseapp.com",
  projectId: "e-commerce-76460",
  storageBucket: "e-commerce-76460.firebasestorage.app",
  messagingSenderId: "571277176652",
  appId: "1:571277176652:web:a8f834465a2825d46e29e9",
  measurementId: "G-1J78S07KJJ"
};

// For learning purposes, we'll simulate Firebase functionality
// In a real app, you would install Firebase SDK: npm install firebase
// and import it properly: import { initializeApp } from 'firebase/app';

// Mock Firebase implementation for learning
export const mockFirebaseAuth = {
  // Simulate Google Sign In
  signInWithGoogle: async () => {
    return new Promise((resolve, reject) => {
      // Simulate user choosing to sign in or cancel
      const userWantsToSignIn = window.confirm(
        "This is a demo of Google Sign-In. Click OK to simulate successful login, Cancel to simulate user cancellation."
      );
      
      setTimeout(() => {
        if (userWantsToSignIn) {
          resolve({
            user: {
              uid: `google_${Date.now()}`,
              email: "demo.user@gmail.com",
              displayName: "Demo User",
              photoURL: "https://via.placeholder.com/100x100/007bff/ffffff?text=DU",
              emailVerified: true,
              providerId: "google.com"
            },
            credential: {
              accessToken: `mock_google_token_${Date.now()}`,
              idToken: `mock_id_token_${Date.now()}`
            }
          });
        } else {
          reject(new Error("User cancelled Google Sign-In"));
        }
      }, 1000);
    });
  },

  // Simulate sign out
  signOut: async () => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, 500);
    });
  },

  // Get current user
  getCurrentUser: () => {
    const mockUser = localStorage.getItem('mockGoogleUser');
    return mockUser ? JSON.parse(mockUser) : null;
  },

  // Set current user
  setCurrentUser: (user) => {
    if (user) {
      localStorage.setItem('mockGoogleUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('mockGoogleUser');
    }
  }
};

// In a real implementation, you would do:
/*
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, provider);
export const signOutUser = () => signOut(auth);
export { auth };
*/

export default firebaseConfig;