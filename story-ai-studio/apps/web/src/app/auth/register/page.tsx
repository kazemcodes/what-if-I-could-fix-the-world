"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    display_name: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

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
          display_name: formData.display_name || undefined,
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
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-fantasy-bg-primary flex items-center justify-center px-4 py-8">
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

        {/* Register Card */}
        <div className="card-parchment">
          <h1 className="font-heading text-2xl text-fantasy-text-primary text-center mb-6">
            Begin Your Journey
          </h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-fantasy-text-secondary mb-1 font-ui">
                Email <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-fantasy"
                placeholder="adventurer@example.com"
              />
            </div>

            <div>
              <label className="block text-fantasy-text-secondary mb-1 font-ui">
                Username <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                minLength={3}
                maxLength={30}
                className="input-fantasy"
                placeholder="legendaryhero"
              />
            </div>

            <div>
              <label className="block text-fantasy-text-secondary mb-1 font-ui">
                Display Name
              </label>
              <input
                type="text"
                name="display_name"
                value={formData.display_name}
                onChange={handleChange}
                className="input-fantasy"
                placeholder="The Legendary Hero"
              />
            </div>

            <div>
              <label className="block text-fantasy-text-secondary mb-1 font-ui">
                Password <span className="text-red-600">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                className="input-fantasy"
                placeholder="••••••••"
              />
              <p className="text-xs text-fantasy-text-secondary mt-1 italic">
                At least 8 characters with uppercase, lowercase, and number
              </p>
            </div>

            <div>
              <label className="block text-fantasy-text-secondary mb-1 font-ui">
                Confirm Password <span className="text-red-600">*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
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
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-fantasy-text-secondary text-sm">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-fantasy-gold hover:text-amber-400 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
