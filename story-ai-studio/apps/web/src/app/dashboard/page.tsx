"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface User {
  id: string;
  email: string;
  username: string;
  display_name: string | null;
  subscription_tier: string;
  player_level: number;
  player_xp: number;
  monthly_credits: number;
  credits_used: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("access_token");
      
      if (!token) {
        router.push("/auth/login");
        return;
      }

      try {
        const response = await fetch("http://localhost:8000/api/v1/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user");
        }

        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError("Session expired. Please login again.");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setTimeout(() => router.push("/auth/login"), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-fantasy-parchment to-fantasy-stone">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fantasy-gold mx-auto mb-4"></div>
          <p className="font-serif text-fantasy-ink">Loading your legend...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-fantasy-parchment to-fantasy-stone">
        <div className="fantasy-card p-8 text-center">
          <p className="font-serif text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-fantasy-parchment to-fantasy-stone">
      {/* Header */}
      <header className="border-b border-fantasy-gold/30 bg-fantasy-parchment/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-cinzel text-2xl text-fantasy-gold">
            Story AI Studio
          </Link>
          <button
            onClick={handleLogout}
            className="fantasy-btn-secondary text-sm"
          >
            Leave Realm
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="fantasy-card p-8 mb-8">
          <h1 className="font-cinzel text-3xl text-fantasy-gold mb-2">
            Welcome, {user?.display_name || user?.username}!
          </h1>
          <p className="font-serif text-fantasy-ink/70">
            Your adventure awaits. What story will you tell today?
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Level Card */}
          <div className="fantasy-card p-6 text-center">
            <div className="text-4xl mb-2">⚔️</div>
            <h3 className="font-cinzel text-lg text-fantasy-gold mb-1">Level</h3>
            <p className="font-serif text-3xl text-fantasy-ink">{user?.player_level}</p>
            <p className="text-sm text-fantasy-ink/60 mt-1">
              {user?.player_xp} XP
            </p>
          </div>

          {/* Credits Card */}
          <div className="fantasy-card p-6 text-center">
            <div className="text-4xl mb-2">✨</div>
            <h3 className="font-cinzel text-lg text-fantasy-gold mb-1">Credits</h3>
            <p className="font-serif text-3xl text-fantasy-ink">
              {user ? user.monthly_credits - user.credits_used : 0}
            </p>
            <p className="text-sm text-fantasy-ink/60 mt-1">
              remaining this month
            </p>
          </div>

          {/* Tier Card */}
          <div className="fantasy-card p-6 text-center">
            <div className="text-4xl mb-2">👑</div>
            <h3 className="font-cinzel text-lg text-fantasy-gold mb-1">Tier</h3>
            <p className="font-serif text-3xl text-fantasy-ink capitalize">
              {user?.subscription_tier}
            </p>
            <p className="text-sm text-fantasy-ink/60 mt-1">
              {user?.subscription_tier === "free" ? "Upgrade for more!" : "Premium access"}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Story */}
          <div className="fantasy-card p-6 hover:border-fantasy-gold transition-colors cursor-pointer">
            <h3 className="font-cinzel text-xl text-fantasy-gold mb-2">
              📜 Create New Story
            </h3>
            <p className="font-serif text-fantasy-ink/70">
              Start a new adventure with AI-powered storytelling
            </p>
          </div>

          {/* Browse Worlds */}
          <div className="fantasy-card p-6 hover:border-fantasy-gold transition-colors cursor-pointer">
            <h3 className="font-cinzel text-xl text-fantasy-gold mb-2">
              🗺️ Browse Worlds
            </h3>
            <p className="font-serif text-fantasy-ink/70">
              Explore community-created worlds and campaigns
            </p>
          </div>

          {/* My Characters */}
          <div className="fantasy-card p-6 hover:border-fantasy-gold transition-colors cursor-pointer">
            <h3 className="font-cinzel text-xl text-fantasy-gold mb-2">
              🧙 My Characters
            </h3>
            <p className="font-serif text-fantasy-ink/70">
              Manage your characters and their stories
            </p>
          </div>

          {/* Settings */}
          <div className="fantasy-card p-6 hover:border-fantasy-gold transition-colors cursor-pointer">
            <h3 className="font-cinzel text-xl text-fantasy-gold mb-2">
              ⚙️ Settings
            </h3>
            <p className="font-serif text-fantasy-ink/70">
              Customize your experience and manage your account
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}