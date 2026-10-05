import { useState } from "react";

const API = "http://localhost:5000/api";

function Login({ onLoginSuccess, onShowRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        API + "/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password: password,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Login failed."
        );
      }

      localStorage.setItem(
        "token",
        result.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(result.user)
      );

      if (onLoginSuccess) {
        onLoginSuccess(result.user);
      }
    } catch (error) {
      console.error("Login error:", error);

      setError(
        error.message || "Unable to login."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome Back</h1>

          <p>
            Login to your Smart Lifestyle Tracker.
          </p>
        </div>

        <form
          className="auth-form"
          onSubmit={handleLogin}
        >
          <div className="auth-field">
            <label htmlFor="login-email">
              Email
            </label>

            <input
              id="login-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
            />
          </div>

          <div className="auth-field">
            <label htmlFor="login-password">
              Password
            </label>

            <input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
            />
          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <button
            className="auth-submit-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>
        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <button 
          className="google-auth-button"
          type="button"
          onClick={() => alert("To enable Google Login:\n\n1. Go to Google Cloud Console\n2. Create an OAuth 2.0 Client ID\n3. Provide the client ID to the app in the code.")}
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google logo" className="google-logo" />
          Continue with Google
        </button>

        <div className="auth-switch">
          <span>
            Don't have an account?
          </span>

          <button
            type="button"
            onClick={onShowRegister}
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;