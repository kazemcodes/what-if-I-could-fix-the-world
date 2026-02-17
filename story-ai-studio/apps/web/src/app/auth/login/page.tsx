"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Login failed");
      }

      const data = await response.json();
      
      // Store tokens
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      
      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-fantasy-parchment to-fantasy-stone">
      <div className="w-full max-w-md px-4">
        {/* Fantasy Card */}
        <div className="fantasy-card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-cinzel text-3xl text-fantasy-gold mb-2">
              Enter the Realm
            </h1>
            <p className="font-serif text-fantasy-ink/70">
              Welcome back, adventurer
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label 
                htmlFor="email" 
                className="block font-serif text-fantasy-ink mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="fantasy-input w-full"
                placeholder="adventurer@realm.com"
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
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                  Entering...
                </span>
              ) : (
                "Begin Your Journey"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-fantasy-gold/30" />
            <span className="font-serif text-fantasy-ink/50 text-sm">or</span>
            <div className="flex-1 h-px bg-fantasy-gold/30" />
          </div>

          {/* Register Link */}
          <p className="text-center font-serif text-fantasy-ink/70">
            New to the realm?{" "}
            <Link 
              href="/auth/register" 
              className="text-fantasy-gold hover:text-fantasy-gold-light transition-colors"
            >
              Create your legend
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