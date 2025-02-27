import { useState } from "react";
import InputField from "./InputField"; // Importing the InputField component
import { useNavigate } from "react-router-dom"

const LocalLogin = ({ setUser }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate(); // Declare navigate
  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("https://data-discovery-login.onrender.com/api/v1/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials:"include"
      });

      const result = await response.json();
      console.log(result)

      if (response.ok) {
        setUser(result.user); // Set user data on successful login
        console.log(result);
        // const { accessToken, refreshToken, user } = result.data;

    // Set these values to localStorage
        localStorage.setItem('token', accessToken);
        //  localStorage.setItem('refreshToken', refreshToken);
        //  localStorage.setItem('user', JSON.stringify(user)); 
       
        alert("Login successful!");
        window.location.href = "http://localhost:5173/";
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      alert("Network error. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <InputField
        type="email"
        name="email"
        placeholder="Email Address"
        value={formData.email}
        onChange={handleChange}
      />
      <InputField
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
      />
      <a href="#" className="forgot-pass-link">
        Forgot Password?
      </a>
      <button type="submit" className="login-button">
        Login
      </button>
    </form>
  );
};

export default LocalLogin;
