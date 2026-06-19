import { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./Chat";

function App() {
  const [showRegister, setShowRegister] = useState(false);

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");

    return savedUser
      ? JSON.parse(savedUser)
      : null;
  });

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
  };

  if (!user) {
    if (showRegister) {
      return (
        <Register
          goToLogin={() => setShowRegister(false)}
        />
      );
    }

    return (
      <Login
        onLogin={setUser}
        goToRegister={() => setShowRegister(true)}
      />
    );
  }

  return (
    <div>
      <div className="fixed top-5 right-5 z-50">
        <button
          onClick={logout}
          className="bg-red-600 text-white px-4 py-2 rounded-xl"
        >
          Logout
        </button>
      </div>

      <Chat />
    </div>
  );
}

export default App;