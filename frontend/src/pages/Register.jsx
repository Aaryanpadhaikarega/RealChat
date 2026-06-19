import { useState } from "react";
import axios from "axios";

function Register({ goToLogin }) {

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [avatar, setAvatar] = useState(null);

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const formData = new FormData();

      formData.append(
        "username",
        form.username
      );

      formData.append(
        "email",
        form.email
      );

      formData.append(
        "password",
        form.password
      );

      if (avatar) {

        formData.append(
          "avatar",
          avatar
        );

      }

      await axios.post(

        "https://realchat-6l4v.onrender.com/api/auth/register",

        formData,

        {

          headers: {

            "Content-Type":
              "multipart/form-data",

          },

        }

      );

      alert("Registration Successful");

      goToLogin();

    }

    catch (error) {

      alert(

        error.response?.data?.message ||

        "Registration Failed"

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

          Register

        </h1>

        <input

          placeholder="Username"

          className="w-full p-3 mb-3 bg-slate-800 text-white rounded-xl"

          onChange={(e) =>

            setForm({

              ...form,

              username: e.target.value,

            })

          }

        />

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

        <input

          type="file"

          accept="image/*"

          className="w-full p-3 mb-4 bg-slate-800 text-white rounded-xl"

          onChange={(e) =>

            setAvatar(

              e.target.files[0]

            )

          }

        />

        <button

          className="w-full bg-indigo-600 hover:bg-indigo-700 p-3 rounded-xl text-white"

        >

          Register

        </button>

        <p className="text-gray-400 mt-4 text-center">

          Already have an account?

        </p>

        <button

          type="button"

          onClick={goToLogin}

          className="w-full mt-2 border border-indigo-600 text-indigo-400 p-3 rounded-xl"

        >

          Login

        </button>

      </form>

    </div>

  );

}

export default Register;