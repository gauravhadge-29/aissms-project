import { useState } from "react";

const Signup = ({ setUser }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch("https://data-discovery-login.onrender.com/api/v1/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      setUser(data.data); // Set the user data after signup
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="signup-container">
      <h2>Create a New Account</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSignup} className="form1">
        <input className="input-field1" type="text" name="username" placeholder="username" value={formData.username} onChange={handleChange} required />
        <input className="input-field1" type="text" name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} required />
        <input className="input-field1" type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <input className="input-field1" type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
        <button type="submit" className="signup-button">Sign Up</button>
      </form>
    </div>
  );
};

export default Signup;