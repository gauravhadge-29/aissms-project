import { useState } from "react";
import { signInWithGoogle, logout } from "../firbase";

export default function SocialLogin({ setUser }) {
  const handleGoogleLogin = async () => {
    const loggedInUser = await signInWithGoogle();
    console.log(loggedInUser)
    if (loggedInUser) {
      setUser(loggedInUser); // Set user data on successful login
      console.log(loggedInUser);
      alert(`Welcome, ${loggedInUser.data.user.fullName}!`);
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
