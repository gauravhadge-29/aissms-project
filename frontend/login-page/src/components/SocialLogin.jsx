import { useState } from "react";
import { signInWithGoogle, logout } from "../firbase";

export default function SocialLogin({ setUser }) {
  const [user, setLocalUser] = useState(null);

  const capitalizeWords = (str) => str.replace(/\b\w/g, (char) => char.toUpperCase());

  const handleGoogleLogin = async () => {
    const loggedInUser = await signInWithGoogle();
    if (loggedInUser) {
      setLocalUser(loggedInUser);
      setUser(loggedInUser); // Set user data on successful login
      console.log(loggedInUser)
      const name = capitalizeWords(loggedInUser.data.user.fullName);
      localStorage.setItem("user",JSON.stringify(loggedInUser.data.user))
      localStorage.setItem("accessToken",loggedInUser.data.accessToken)
      localStorage.setItem("refreshToken",loggedInUser.data.refreshToken)
      alert(`Welcome, ${name}!`);
    }
  };

  return (
    <div className="social-login">
      {user ? (
        
        <div className="user-info">
          <img src={localStorage.getItem(user).avatar} alt="User" className="user-avatar" />
          <p>Welcome, {localStorage.getItem(user).fullName}</p>
          <button
            onClick={() => {
              localStorage.clear()
              logout();
              setUser(null);
              setLocalUser(null);
          
            }}
            className="logout-button"
          >
            Logout
          </button>
        </div>
      ) : (
        <button className="social-button" onClick={handleGoogleLogin}>
          <img src="google.svg" alt="Google" className="social-icon" />
          Sign in with Google
        </button>
      )}
    </div>
  );
}
