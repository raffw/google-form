import React, { useState, useEffect } from "react";
import axios from "axios";
import Login from "./Login";
import Register from "./Register";
import Forms from "./Form";
import "./App.css";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [view, setView] = useState("login");
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/auth", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
      setView("forms");
    } catch (error) {
      console.error("Error fetching user:", error);
      localStorage.removeItem("token");
      setToken("");
      setView("login");
    }
  };

  const handleLogin = (token) => {
    setToken(token);
    localStorage.setItem("token", token);
    fetchUser();
  };

  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("token");
    setView("login");
    setUser(null);
  };

  const switchToRegister = () => {
    setView("register");
  };

  const switchToLogin = () => {
    setView("login");
  };

  return (
    <div className="app">
      {view === "login" && (
        <Login onLogin={handleLogin} switchToRegister={switchToRegister} />
      )}
      {view === "register" && (
        <Register onRegister={handleLogin} switchToLogin={switchToLogin} />
      )}
      {view === "forms" && (
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl">Forms</h1>
            {user && <span className="text-lg">Hello, {user.username}</span>}
            <button
              className="bg-red-500 text-white px-4 py-2 rounded"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
          <Forms token={token} />
        </div>
      )}
    </div>
  );
};

export default App;
