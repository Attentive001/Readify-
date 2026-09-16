"use client";

import { useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000/api/v1";

export default function LoginModal({ onClose, onRegister }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!form.email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!form.password) {
      setError("Password is required.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Invalid email or password."
        );
      }

      localStorage.setItem("readify_token", data.token);

      localStorage.setItem(
        "readify_user",
        JSON.stringify(data.user)
      );

      // Tell Navbar and other components that login succeeded
      window.dispatchEvent(new Event("readify-auth-change"));

      // Close modal
      onClose();
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  function handleOverlayClick(event) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      onMouseDown={handleOverlayClick}
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
      >

        {/* CLOSE BUTTON */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          aria-label="Close login"
        >
          ×
        </button>

        {/* HEADER */}
        <div className="mb-7 text-center">
          <p className="text-sm font-bold uppercase tracking-[.2em] text-blue-600">
            Readify
          </p>

          <h2
            id="login-modal-title"
            className="mt-2 text-3xl font-bold text-gray-900"
          >
            Welcome Back
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            Sign in to continue reading your books.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-5">

            {/* EMAIL */}
            <div>
              <label
                htmlFor="login-email"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Email
              </label>

              <input
                id="login-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="text-sm font-semibold text-gray-700"
                >
                  Password
                </label>

                <button
                  type="button"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  Forgot password?
                </button>
              </div>

              <input
                id="login-password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* REGISTER */}
        <div className="mt-6 border-t border-gray-100 pt-5 text-center text-sm text-gray-600">
          Don't have an account?{" "}

          <button
            type="button"
            onClick={onRegister}
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Create an account
          </button>
        </div>
      </div>
    </div>
  );
}