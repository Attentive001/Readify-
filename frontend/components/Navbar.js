"use client";

import { useEffect, useState } from "react";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";
import ProfileModal from "./ProfileModal";

export default function Navbar() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState(null);

  const links = [
    { href: "/", label: "Home" },
    { href: "/search", label: "Search" },
  ];

  // =========================
  // LOAD USER
  // =========================

  useEffect(() => {
    function loadUser() {
      try {
        const storedUser = localStorage.getItem("readify_user");

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to load user:", error);
        setUser(null);
      }
    }

    loadUser();

    window.addEventListener("readify-auth-change", loadUser);

    return () => {
      window.removeEventListener(
        "readify-auth-change",
        loadUser
      );
    };
  }, []);

  // =========================
  // LOGOUT
  // =========================

  function handleLogout() {
    localStorage.removeItem("readify_token");
    localStorage.removeItem("readify_user");

    setUser(null);
    setProfileOpen(false);

    window.dispatchEvent(
      new Event("readify-auth-change")
    );
  }

  // =========================
  // LOGIN
  // =========================

  function handleLogin() {
    setLoginOpen(true);
    setRegisterOpen(false);
    setProfileOpen(false);
  }

  // =========================
  // REGISTER
  // =========================

  function handleRegister() {
    setRegisterOpen(true);
    setLoginOpen(false);
    setProfileOpen(false);
  }

  // =========================
  // PROFILE
  // =========================

  function handleProfile() {
    setProfileOpen(true);
    setLoginOpen(false);
    setRegisterOpen(false);
  }

  // =========================
  // AVATAR
  // =========================

  const userName =
    user?.display_name ||
    user?.displayName ||
    user?.name ||
    "Profile";

  const userInitial = userName
    .charAt(0)
    .toUpperCase();

  const avatarUrl =
    user?.avatar_url ||
    user?.avatarUrl ||
    user?.avatar ||
    "";

  return (
    <>
      {/* ==================================================
          NAVBAR
      ================================================== */}

      <header className="sticky top-0 z-50 border-b border-ink/10 bg-parchment/95 backdrop-blur">
        <div className="mx-auto flex h-[60px] max-w-7xl items-center justify-between px-5 lg:px-8">

          {/* LOGO */}

          <a
            href="/"
            className="flex items-center gap-2.5"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink font-display text-lg font-bold text-parchment">
              R
            </span>

            <span className="font-display text-2xl font-bold tracking-tight">
              Readify
            </span>
          </a>

          {/* DESKTOP NAV */}

          <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-ink/70 transition hover:text-ink"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* RIGHT SIDE */}

          <div className="flex items-center gap-2">

            {/* SEARCH */}

            <a
              href="/search"
              aria-label="Search"
              className="grid h-10 w-10 place-items-center rounded-full text-lg transition hover:bg-ink/5"
            >
              ⌕
            </a>

            {/* ==================================================
                NOT LOGGED IN
            ================================================== */}

            {!user && (
              <>
                {/* DESKTOP SIGN IN */}

                <button
                  type="button"
                  onClick={handleLogin}
                  className="hidden rounded-full border border-ink/15 px-4 py-2 text-sm font-semibold transition hover:bg-ink hover:text-parchment sm:flex"
                >
                  Sign In
                </button>

                {/* DESKTOP REGISTER */}

                <button
                  type="button"
                  onClick={handleRegister}
                  className="hidden rounded-full bg-ink px-4 py-2 text-sm font-semibold text-parchment transition hover:opacity-90 sm:flex"
                >
                  Register
                </button>

                {/* MOBILE LOGIN */}

                <button
                  type="button"
                  onClick={handleLogin}
                  className="grid h-10 w-10 place-items-center rounded-full border border-ink/15 text-base transition hover:bg-ink hover:text-parchment md:hidden"
                  aria-label="Sign in"
                >
                  👤
                </button>
              </>
            )}

            {/* ==================================================
                LOGGED IN
                AVATAR ONLY
            ================================================== */}

            {user && (
              <button
                type="button"
                onClick={handleProfile}
                className="grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-ink/15 bg-parchment transition hover:bg-ink hover:text-parchment"
                aria-label={`Open ${userName} profile`}
                title="Profile"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-ink font-semibold text-parchment">
                    {userInitial}
                  </span>
                )}
              </button>
            )}

            {/* ==================================================
                MOBILE SIDEBAR BUTTON
            ================================================== */}

            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(
                  new Event("readify-sidebar-toggle")
                );
              }}
              className="grid h-10 w-10 place-items-center rounded-full border border-ink/15 md:hidden"
              aria-label="Open menu"
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      {/* ==================================================
          LOGIN MODAL
      ================================================== */}

      {loginOpen && (
        <LoginModal
          onClose={() => setLoginOpen(false)}
          onRegister={() => {
            setLoginOpen(false);
            setRegisterOpen(true);
          }}
        />
      )}

      {/* ==================================================
          REGISTER MODAL
      ================================================== */}

      {registerOpen && (
        <RegisterModal
          onClose={() => setRegisterOpen(false)}
          onLogin={() => {
            setRegisterOpen(false);
            setLoginOpen(true);
          }}
        />
      )}

      {/* ==================================================
          PROFILE MODAL
      ================================================== */}

      {profileOpen && user && (
        <ProfileModal
          user={user}
          onClose={() => setProfileOpen(false)}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}