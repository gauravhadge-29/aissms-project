import { useState } from "react";
import SocialLogin from "./components/SocialLogin";
import LocalLogin from "./components/LocalLogin";
import Signup from "./components/Signup";
import './index.css';

const App = () => {
  const [user, setUser] = useState(null);
  const [isSignup, setIsSignup] = useState(false);

  const handleLogin = async () => {
    try {
      const response = await fetch("https://data-discovery-login.onrender.com/api/v1/users/current-user", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch user data");

      const userData = await response.json();
      setUser(userData.data);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("https://data-discovery-login.onrender.com/api/v1/users/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="login-container">
        <>
          <Signup setUser={setUser} />
          <p className="toggle-text">
            Already have an account? <button onClick={() => setIsSignup(false)}>Log in</button>
          </p>
        </>
        <>
          <h2 className="form-title">Log in with</h2>
          <SocialLogin setUser={handleLogin} />
          <p className="separator"><span>or</span></p>
          <LocalLogin setUser={handleLogin} />
          <p className="toggle-text">
            Don't have an account? <button onClick={() => setIsSignup(true)}>Sign up</button>
          </p>
        </>
    </div>
  );
};

export default App;