import { useState } from "react";
import { signInWithGoogle, logout } from "../firbase";
import { useNavigate } from "react-router-dom"

export default function SocialLogin({ setUser }) {
  const handleGoogleLogin = async () => {
    const loggedInUser = await signInWithGoogle();
    console.log(loggedInUser)
    if (loggedInUser) {
      setUser(loggedInUser); // Set user data on successful login
      console.log(loggedInUser);
      alert(`Welcome, ${loggedInUser.data.user.fullName}!`);
      window.location.href = "http://localhost:5173/";
    }
  };

  return (
    <div className="social-login">
    <button className="social-button" onClick={handleGoogleLogin}>
      <img src="google.svg" alt="Google" className="social-icon" />
      Sign in with Google
    </button>
    </div>
  );
}
