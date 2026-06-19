import { useState } from "react";
import axios from "axios";

function Login({ onLogin, goToRegister }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "https://realchat-6l4v.onrender.com/api/auth/login",
        form
      );

      localStorage.setItem(
        "token",
        res.data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(res.data.user)
      );

      onLogin(res.data.user);

    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Login Failed"
      );
    }
  };

  return (
    <div className="h-screen bg-slate-950 flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 p-8 rounded-3xl w-96 shadow-2xl"
      >
        <h1 className="text-white text-3xl font-bold mb-5">
          Login
        </h1>

        <input
          placeholder="Email"
          className="w-full p-3 mb-3 bg-slate-800 text-white rounded-xl"
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value,
            })
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-3 bg-slate-800 text-white rounded-xl"
          onChange={(e) =>
            setForm({
              ...form,
              password: e.target.value,
            })
          }
        />

        <button className="w-full bg-indigo-600 hover:bg-indigo-700 p-3 rounded-xl text-white">
          Login
        </button>

        <p className="text-gray-400 mt-4 text-center">
          Don't have an account?
        </p>

        <button
  type="button"
  onClick={() => {
    console.log("Create Account clicked");
    goToRegister();
  }}
  className="w-full mt-2 border border-indigo-600 text-indigo-400 p-3 rounded-xl"
>
  Create Account
</button>
      </form>
    </div>
  );
}

export default Login;