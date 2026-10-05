import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";

const API = "https://smart-lifestyle-tracker.onrender.com/api";

function Login({ onLoginSuccess }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGoogleSuccess(credentialResponse) {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "Google login failed");
      }

      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
      if (onLoginSuccess) {
        onLoginSuccess(result.user);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to login with Google");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your Smart Lifestyle Tracker.</p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {loading && <p style={{textAlign: "center"}}>Loading...</p>}

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px', marginBottom: '20px' }}>
          <GoogleLogin 
            onSuccess={handleGoogleSuccess} 
            onError={() => setError("Google login failed.")} 
          />
        </div>
      </div>
    </div>
  );
}

export default Login;