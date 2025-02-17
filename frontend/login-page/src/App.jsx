import { useState } from "react";
import SocialLogin from "./components/SocialLogin";
import LocalLogin from "./components/LocalLogin";

const App = () => {
  // Directly set user from localStorage initially
  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem("user")) || null;
  });

  // Function to handle login and update state
  const handleLogin = (newUser) => {
    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser); // Update state immediately
    window.location.reload()
  };

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
  };

  return (
    <div className="login-container">
      <h2 className="form-title">Log in with</h2>

      {user ? (
        <div className="user-info">
          <img src={user.avatar} alt="User" className="user-avatar" />
          <p>Welcome, {user.fullName}</p>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      ) : (
        <>
          <SocialLogin setUser={handleLogin} />
          <p className="separator"><span>or</span></p>
          <LocalLogin setUser={handleLogin} />
        </>
      )}
    </div>
  );
};

export default App;
