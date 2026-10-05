import { useState } from "react";

const API = "http://localhost:5000/api";

function Register({ onRegisterSuccess, onShowLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(event) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        API + "/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password: password,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Registration failed."
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

      setMessage(
        "Registration successful!"
      );

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      if (onRegisterSuccess) {
        onRegisterSuccess(result.user);
      }

    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      setError(
        error.message ||
          "Unable to register."
      );

    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-header">
          <h1>Create Account</h1>

          <p>
            Start your Smart Lifestyle Tracker
            journey.
          </p>
        </div>

        <form
          className="auth-form"
          onSubmit={handleRegister}
        >

          <div className="auth-field">
            <label htmlFor="register-name">
              Name
            </label>

            <input
              id="register-name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
            />
          </div>

          <div className="auth-field">
            <label htmlFor="register-email">
              Email
            </label>

            <input
              id="register-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
            />
          </div>

          <div className="auth-field">
            <label htmlFor="register-password">
              Password
            </label>

            <input
              id="register-password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
            />
          </div>

          <div className="auth-field">
            <label htmlFor="register-confirm-password">
              Confirm Password
            </label>

            <input
              id="register-confirm-password"
              type="password"
              placeholder="Enter password again"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value
                )
              }
            />
          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          {message && (
            <div className="auth-success">
              {message}
            </div>
          )}

          <button
            className="auth-submit-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
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
            Already have an account?
          </span>

          <button
            type="button"
            onClick={onShowLogin}
          >
            Login
          </button>
        </div>

      </div>
    </div>
  );
}

export default Register;