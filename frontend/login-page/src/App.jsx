import { useState } from "react";
import SocialLogin from "./components/SocialLogin";
import LocalLogin from "./components/LocalLogin";

const App = () => {
  const [user, setUser] = useState(null);

  // Function to handle login and fetch user from API
  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/v1/users/current-user", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }
      
      const userData = await response.json();
      console.log("RESPONSE FROM CUEENTUSER",userData)
      setUser(userData.data); // Set user data from API response
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  // Function to handle logout
  const handleLogout = () => {
    fetch("http://localhost:8000/api/v1/users/logout", {
      method: "POST",
      credentials: "include",
    }).then(() => {
      setUser(null);
    }).catch(error => console.error("Logout error:", error));
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
