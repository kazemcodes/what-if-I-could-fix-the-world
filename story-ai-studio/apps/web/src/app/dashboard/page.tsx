"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Story {
  id: string;
  title: string;
  description: string;
  is_public: boolean;
  play_count: number;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.push("/auth/login");
          return;
        }

        const response = await fetch("http://localhost:8000/api/v1/stories", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch stories");
        }

        const data = await response.json();
        setStories(data.stories || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStories();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-fantasy-bg-primary flex items-center justify-center">
        <div className="text-fantasy-gold text-xl animate-pulse">
          Loading your adventures...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fantasy-bg-primary">
      {/* Header */}
      <header className="border-b-2 border-fantasy-border-dark bg-fantasy-bg-secondary">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-heading text-2xl text-fantasy-gold">
            Story AI Studio
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/stories/browse"
              className="text-fantasy-text-light hover:text-fantasy-gold transition-colors"
            >
              Browse Worlds
            </Link>
            <button
              onClick={handleLogout}
              className="btn-fantasy-secondary text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="card-wood mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-3xl text-fantasy-gold mb-2">
                Your Story Forge
              </h1>
              <p className="text-fantasy-text-light">
                Create worlds, build characters, and embark on adventures
              </p>
            </div>
            <Link href="/stories/create" className="btn-fantasy">
              ✦ Create New Story
            </Link>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="card-wood border-red-800 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Stories Grid */}
        {stories.length === 0 ? (
          <div className="card-parchment text-center py-12">
            <div className="text-6xl mb-4">📜</div>
            <h2 className="font-heading text-2xl text-fantasy-text-primary mb-4">
              No Stories Yet
            </h2>
            <p className="text-fantasy-text-secondary mb-6">
              Begin your journey by creating your first story world
            </p>
            <Link href="/stories/create" className="btn-fantasy">
              Create Your First Story
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <Link
                key={story.id}
                href={`/stories/${story.id}`}
                className="card-wood hover:border-fantasy-gold transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-heading text-xl text-fantasy-gold group-hover:text-amber-300 transition-colors">
                    {story.title}
                  </h3>
                  {story.is_public && (
                    <span className="text-xs bg-fantasy-green/20 text-green-400 px-2 py-1 rounded">
                      Public
                    </span>
                  )}
                </div>
                <p className="text-fantasy-text-light text-sm line-clamp-2 mb-4">
                  {story.description || "No description yet..."}
                </p>
                <div className="flex items-center justify-between text-xs text-fantasy-text-secondary">
                  <span>🎭 {story.play_count} plays</span>
                  <span>
                    📅 {new Date(story.created_at).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-12">
          <h2 className="font-heading text-2xl text-fantasy-gold mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/stories/create"
              className="card-wood hover:border-fantasy-gold transition-all flex items-center gap-4"
            >
              <div className="text-3xl">✨</div>
              <div>
                <h3 className="font-heading text-lg text-fantasy-gold">
                  New Story
                </h3>
                <p className="text-fantasy-text-secondary text-sm">
                  Start a new adventure
                </p>
              </div>
            </Link>
            
            <Link
              href="/stories/browse"
              className="card-wood hover:border-fantasy-gold transition-all flex items-center gap-4"
            >
              <div className="text-3xl">🗺️</div>
              <div>
                <h3 className="font-heading text-lg text-fantasy-gold">
                  Browse Worlds
                </h3>
                <p className="text-fantasy-text-secondary text-sm">
                  Explore public stories
                </p>
              </div>
            </Link>
            
            <div className="card-wood flex items-center gap-4 opacity-50">
              <div className="text-3xl">👥</div>
              <div>
                <h3 className="font-heading text-lg text-fantasy-gold">
                  Join Session
                </h3>
                <p className="text-fantasy-text-secondary text-sm">
                  Coming soon
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
