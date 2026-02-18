"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

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
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-fantasy-bg-primary flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="font-heading text-3xl text-fantasy-gold">
            Story AI Studio
          </Link>
          <div className="divider-fantasy mt-4">
            <span className="text-fantasy-gold">✦</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="card-parchment">
          <h1 className="font-heading text-2xl text-fantasy-text-primary text-center mb-6">
            Return to Your Adventure
          </h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-fantasy-text-secondary mb-1 font-ui">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-fantasy"
                placeholder="adventurer@example.com"
              />
            </div>

            <div>
              <label className="block text-fantasy-text-secondary mb-1 font-ui">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-fantasy"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-fantasy w-full"
            >
              {isLoading ? "Entering..." : "Enter the Realm"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-fantasy-text-secondary text-sm">
              New adventurer?{" "}
              <Link
                href="/auth/register"
                className="text-fantasy-gold hover:text-amber-400 transition-colors"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
