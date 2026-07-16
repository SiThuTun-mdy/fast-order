import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { useAuthDispatch } from "../context/AuthContext";
import heroImage from "../assets/fastorder-hero.jpg";

export default function LoginPage() {
  const dispatch = useAuthDispatch();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    dispatch({ type: "LOGIN_START" });

    try {
      const { token, user } = await login(username, password);
      localStorage.setItem("auth_token", token);
      localStorage.setItem("auth_user", JSON.stringify(user));
      dispatch({ type: "LOGIN_SUCCESS", token, user });
      if (user?.roles?.includes("SysAdmin")) {
        navigate("/sysadmin");
      } else if (user?.roles?.includes("Admin")) {
        navigate("/admin");
      } else if (user?.roles?.includes("Cashier")) {
        navigate("/cashier");
      } else if (user?.roles?.includes("Chef")) {
        navigate("/kitchen");
      } else {
        navigate("/");
      }
    } catch (err) {
      dispatch({ type: "LOGIN_ERROR", error: err.message });
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-50 font-body">
      {/* Hero band */}
      <div className="max-w-5xl mx-auto px-4 pt-8 sm:pt-12">
        <div className="relative rounded-3xl overflow-hidden shadow-lg shadow-brand-500/20">
          <img
            src={heroImage}
            alt="A cheeseburger with fries and ketchup on a plate"
            className="w-full h-56 sm:h-72 object-cover"
          />
          {/* Left-side scrim so the wordmark stays legible over the photo's empty space */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10">
            <h1 className="font-display text-5xl sm:text-6xl tracking-wide text-brand-600 leading-none">
              FastOrder
            </h1>
            <p className="mt-3 max-w-xs sm:max-w-sm text-gray-600 text-sm sm:text-base">
              Fresh made to order — sign in to manage the counter, kitchen, or
              your restaurants.
            </p>
          </div>
        </div>
      </div>

      {/* Login card */}
      <div className="max-w-sm mx-auto px-4 pt-10 pb-16">
        <div className="bg-yellow-50/60 rounded-2xl border border-yellow-100 shadow-xl shadow-yellow-900/5 p-6 sm:p-8">
          <h2 className="font-display text-3xl tracking-wide text-gray-900 mb-6 text-center">
            Sign In
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="username"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-shadow"
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="password"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-shadow"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-brand-500 to-appetite-600 hover:brightness-105 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl px-4 py-2.5 text-sm shadow-md shadow-brand-500/30 transition-all"
            >
              {submitting ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-gray-400">
            Staff &amp; restaurant admin access only.
          </p>
        </div>
      </div>
    </div>
  );
}
