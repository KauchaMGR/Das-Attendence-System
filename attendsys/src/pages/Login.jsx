import { useState } from "react";
import { api } from "../services/api";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const handleLogin = async (e) => {

    e.preventDefault();

    try {

      setError("");

      const data = await api.login({
        email: email,
        password: password
      });

      console.log("Login response:", data);

      // Save JWT
      localStorage.setItem(
        "access_token",
        data.access_token
      );

      alert("Login successful!");

    } catch (error) {

      console.error(error);

      setError(error.message);
    }
  };


  return (
    <div>

      <h1>Login</h1>

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      <form onSubmit={handleLogin}>

        <div>
          <label>Email</label>

          <input
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />
        </div>


        <div>
          <label>Password</label>

          <input
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />
        </div>


        <button type="submit">
          Login
        </button>

      </form>

    </div>
  );
}


