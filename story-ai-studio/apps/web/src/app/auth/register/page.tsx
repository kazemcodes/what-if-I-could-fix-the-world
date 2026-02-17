"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    display_name: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }

    if (!/[A-Z]/.test(formData.password)) {
      setError("Password must contain at least one uppercase letter");
      return false;
    }

    if (!/[a-z]/.test(formData.password)) {
      setError("Password must contain at least one lowercase letter");
      return false;
    }

    if (!/\d/.test(formData.password)) {
      setError("Password must contain at least one number");
      return false;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setError("Username can only contain letters, numbers, and underscores");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/v1/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          password: formData.password,
          display_name: formData.display_name || formData.username,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Registration failed");
      }

      // Auto-login after registration
      const loginResponse = await fetch("http://localhost:8000/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (loginResponse.ok) {
        const data = await loginResponse.json();
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        router.push("/dashboard");
      } else {
        router.push("/auth/login");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-fantasy-parchment to-fantasy-stone py-12">
      <div className="w-full max-w-md px-4">
        {/* Fantasy Card */}
        <div className="fantasy-card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-cinzel text-3xl text-fantasy-gold mb-2">
              Create Your Legend
            </h1>
            <p className="font-serif text-fantasy-ink/70">
              Begin your adventure today
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label 
                htmlFor="email" 
                className="block font-serif text-fantasy-ink mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="fantasy-input w-full"
                placeholder="adventurer@realm.com"
              />
            </div>

            <div>
              <label 
                htmlFor="username" 
                className="block font-serif text-fantasy-ink mb-2"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                required
                minLength={3}
                maxLength={50}
                className="fantasy-input w-full"
                placeholder="legendaryhero"
              />
              <p className="mt-1 text-xs text-fantasy-ink/50">
                Letters, numbers, and underscores only
              </p>
            </div>

            <div>
              <label 
                htmlFor="display_name" 
                className="block font-serif text-fantasy-ink mb-2"
              >
                Display Name <span className="text-fantasy-ink/50">(optional)</span>
              </label>
              <input
                id="display_name"
                name="display_name"
                type="text"
                value={formData.display_name}
                onChange={handleChange}
                maxLength={100}
                className="fantasy-input w-full"
                placeholder="The Legendary Hero"
              />
            </div>

            <div>
              <label 
                htmlFor="password" 
                className="block font-serif text-fantasy-ink mb-2"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                className="fantasy-input w-full"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-fantasy-ink/50">
                Min 8 chars, with uppercase, lowercase, and number
              </p>
            </div>

            <div>
              <label 
                htmlFor="confirmPassword" 
                className="block font-serif text-fantasy-ink mb-2"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="fantasy-input w-full"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="fantasy-btn w-full"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                      fill="none"
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Creating Legend...
                </span>
              ) : (
                "Begin Your Legend"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-fantasy-gold/30" />
            <span className="font-serif text-fantasy-ink/50 text-sm">or</span>
            <div className="flex-1 h-px bg-fantasy-gold/30" />
          </div>

          {/* Login Link */}
          <p className="text-center font-serif text-fantasy-ink/70">
            Already have a legend?{" "}
            <Link 
              href="/auth/login" 
              className="text-fantasy-gold hover:text-fantasy-gold-light transition-colors"
            >
              Return to the realm
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link 
            href="/" 
            className="font-serif text-fantasy-ink/60 hover:text-fantasy-gold transition-colors"
          >
            ← Return to the Tavern
          </Link>
        </div>
      </div>
    </div>
  );
}