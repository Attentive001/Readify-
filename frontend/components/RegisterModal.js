"use client";

import { useState } from "react";

import T from "./T";
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000/api/v1";

export default function RegisterModal({ onClose, onLogin }) {
  const [form, setForm] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    setSuccess("");

    if (!form.displayName.trim()) {
      setError("Name is required.");
      return;
    }

    if (!form.email.trim()) {
      setError("Email is required.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName: form.displayName.trim(),
          email: form.email.trim(),
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to create your account."
        );
      }

      localStorage.setItem("readify_token", data.token);

      localStorage.setItem(
        "readify_user",
        JSON.stringify(data.user)
      );

      window.dispatchEvent(
        new Event("readify-auth-change")
      );

      setSuccess("Account created successfully.");

      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      setError(err.message || "Registration failed.");
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
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="register-modal-title"
      >
        {/* CLOSE */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          aria-label="Close register"
        >
          ×
        </button>

        {/* HEADER */}
        <div className="mb-7 text-center">
          <p className="text-sm font-bold uppercase tracking-[.2em] text-blue-600">
            Readify
          </p>

          <h2
            id="register-modal-title"
            className="mt-2 text-3xl font-bold text-gray-900"
          >
            <T k="createAccount" />
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            <T k="joinReadify" />
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {success}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-5">

            {/* NAME */}
            <div>
              <label
                htmlFor="register-name"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                <T k="fullName" />
              </label>

              <input
                id="register-name"
                name="displayName"
                type="text"
                value={form.displayName}
                onChange={handleChange}
                placeholder="Your name"
                autoComplete="name"
                autoFocus
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label
                htmlFor="register-email"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                <T k="email" />
              </label>

              <input
                id="register-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <p className="mt-2 text-xs text-gray-500">
                <T k="validEmailHint" />
              </p>
            </div>

            {/* PASSWORD */}
            <div>
              <label
                htmlFor="register-password"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                <T k="password" />
              </label>

              <input
                id="register-password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label
                htmlFor="register-confirm-password"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                <T k="confirmPassword" />
              </label>

              <input
                id="register-confirm-password"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat your password"
                autoComplete="new-password"
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
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        {/* LOGIN SWITCH */}
        <div className="mt-6 border-t border-gray-100 pt-5 text-center text-sm text-gray-600">
          Already have an account?{" "}

          <button
            type="button"
            onClick={onLogin}
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            <T k="signIn" />
          </button>
        </div>
      </div>
    </div>
  );
}