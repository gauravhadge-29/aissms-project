import InputField from "./components/InputField";
import SocilLogin from "./components/SocialLogin";

const App = () => {
  return (
    <div className="login-container">

      <h2 className="form-title">Log in with</h2>
      <SocilLogin />

      <p className="seprator"><span>or</span></p>
      <form action="" className="login-form">
        <InputField type="email" placeholder="Email Address" icon="mail"/>
        <InputField type="password" placeholder="Password" icon="lock"/>

      <a href="#" className="forgot-pass-link">Forgot Password?</a>

      <button className="login-button">Login In</button>
      </form>

      <p className="signup-text">Don&apos;t have an account? <a href="#">Signup now</a></p>

    </div>
  );
}

export default App;