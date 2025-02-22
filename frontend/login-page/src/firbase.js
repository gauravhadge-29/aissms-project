// Import Firebase SDK functions
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDFDyRXi4L2PnizWKh8aAcyjXsj64xlgFE",
  authDomain: "datadiscovery-a71a7.firebaseapp.com",
  projectId: "datadiscovery-a71a7",
  storageBucket: "datadiscovery-a71a7.appspot.com",
  messagingSenderId: "779761115781",
  appId: "1:779761115781:web:6dbf44d805e09eff147fec",
  measurementId: "G-LYMBKTCS1N",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Initialize Firebase Auth
const googleProvider = new GoogleAuthProvider();

// Force Google to always prompt for account selection
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// Function to handle Google Sign-In
export const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log("Responsse from google ",user)
  
      // Send user details to backend for MongoDB storage
      const response = await fetch("https://data-discovery-login.onrender.com/api/v1/users/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: user.uid,
          fullName: user.displayName,
          email: user.email,
          avatar : user.photoURL
        }),
        credentials: "include"
      });
      console.log("Response: from api login with google",response)
      console.log();
      const data = await response.json();
      console.log("This is data", data)
      return data; // This will contain user info from MongoDB
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      return null;
    }
  };
  

// Function to handle Logout
export const logout = async () => {
  try {
    await signOut(auth);
    localStorage.clear();
    console.log("User logged out successfully");
  } catch (error) {
    console.error("Logout Error:", error);
  }
};

export { auth, app};
