"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Story {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  world_config: {
    name: string;
    description: string;
    theme: string;
    locations: Array<{ name: string; description: string }>;
    factions: Array<{ name: string; description: string }>;
    npcs: Array<{ name: string; description: string }>;
  };
  ai_settings: {
    model: string;
    temperature: number;
    narrative_style: string;
    content_rating: string;
  };
  is_public: boolean;
  tags: string[];
  play_count: number;
  created_at: string;
  updated_at: string;
}

export default function StoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.push("/auth/login");
          return;
        }

        const response = await fetch(
          `http://localhost:8000/api/v1/stories/${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Story not found");
          }
          throw new Error("Failed to load story");
        }

        const data = await response.json();
        setStory(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchStory();
    }
  }, [params.id, router]);

  const handleDelete = async () => {
    if (!story || !confirm("Are you sure you want to delete this story?")) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `http://localhost:8000/api/v1/stories/${story.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Failed to delete story:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-amber-200 font-serif text-xl animate-pulse">
          Loading story...
        </div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 font-serif text-xl mb-4">
            {error || "Story not found"}
          </div>
          <Link
            href="/dashboard"
            className="text-amber-200 hover:text-amber-100 transition-colors"
          >
            ← Return to Tavern
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-amber-900/30 bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-amber-200 hover:text-amber-100 transition-colors flex items-center gap-2"
          >
            <span>←</span>
            <span>Return to Tavern</span>
          </Link>
          <div className="flex gap-3">
            <button
              onClick={() => router.push(`/stories/${story.id}/worldbuilder`)}
              className="px-6 py-2 bg-gradient-to-r from-purple-700 to-purple-600 rounded-lg text-purple-50 font-serif hover:from-purple-600 hover:to-purple-500 transition-all shadow-lg"
            >
              🌍 World Builder
            </button>
            <button
              onClick={() => router.push(`/stories/${story.id}/play`)}
              className="px-6 py-2 bg-gradient-to-r from-green-700 to-green-600 rounded-lg text-green-50 font-serif hover:from-green-600 hover:to-green-500 transition-all shadow-lg"
            >
              ▶️ Play Story
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Title Section */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-serif text-amber-100 mb-2">
                {story.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span>🎭 {story.play_count} plays</span>
                <span>
                  📅 Created {new Date(story.created_at).toLocaleDateString()}
                </span>
                {story.is_public && (
                  <span className="text-green-400">🌍 Public</span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/stories/${story.id}/edit`)}
                className="px-4 py-2 border border-amber-700/50 rounded-lg text-amber-200 hover:bg-amber-900/30 transition-colors font-serif"
              >
                ✏️ Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-red-700/50 rounded-lg text-red-300 hover:bg-red-900/30 transition-colors font-serif"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>

        {/* Tags */}
        {story.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {story.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-amber-900/30 border border-amber-700/30 rounded-full text-amber-200 text-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        {story.description && (
          <div className="mb-8 p-6 bg-gradient-to-b from-amber-900/20 to-slate-900/50 rounded-lg border border-amber-700/30">
            <h2 className="text-xl font-serif text-amber-200 mb-3">
              📜 Description
            </h2>
            <p className="text-slate-300 whitespace-pre-wrap">
              {story.description}
            </p>
          </div>
        )}

        {/* World Config */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="p-6 bg-gradient-to-b from-amber-900/20 to-slate-900/50 rounded-lg border border-amber-700/30">
            <h2 className="text-xl font-serif text-amber-200 mb-3">🗺️ World</h2>
            {story.world_config.name ? (
              <>
                <h3 className="text-lg text-amber-100 mb-2">
                  {story.world_config.name}
                </h3>
                <p className="text-slate-400 text-sm mb-2">
                  Theme: {story.world_config.theme}
                </p>
                {story.world_config.description && (
                  <p className="text-slate-300 text-sm">
                    {story.world_config.description}
                  </p>
                )}
              </>
            ) : (
              <p className="text-slate-400 italic">No world configured yet</p>
            )}
          </div>

          <div className="p-6 bg-gradient-to-b from-amber-900/20 to-slate-900/50 rounded-lg border border-amber-700/30">
            <h2 className="text-xl font-serif text-amber-200 mb-3">🧙 AI Settings</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Model:</span>
                <span className="text-amber-100">{story.ai_settings.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Creativity:</span>
                <span className="text-amber-100">
                  {story.ai_settings.temperature.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Style:</span>
                <span className="text-amber-100">
                  {story.ai_settings.narrative_style}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Rating:</span>
                <span className="text-amber-100">
                  {story.ai_settings.content_rating}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push(`/stories/${story.id}/characters`)}
            className="p-6 bg-gradient-to-b from-purple-900/30 to-slate-900/50 rounded-lg border border-purple-700/30 hover:border-purple-500/50 transition-colors text-left"
          >
            <div className="text-3xl mb-2">👤</div>
            <h3 className="text-lg font-serif text-purple-200 mb-1">
              Characters
            </h3>
            <p className="text-slate-400 text-sm">
              Manage your story's characters
            </p>
          </button>

          <button
            onClick={() => router.push(`/stories/${story.id}/locations`)}
            className="p-6 bg-gradient-to-b from-blue-900/30 to-slate-900/50 rounded-lg border border-blue-700/30 hover:border-blue-500/50 transition-colors text-left"
          >
            <div className="text-3xl mb-2">🏰</div>
            <h3 className="text-lg font-serif text-blue-200 mb-1">Locations</h3>
            <p className="text-slate-400 text-sm">
              Explore and add locations
            </p>
          </button>

          <button
            onClick={() => router.push(`/stories/${story.id}/sessions`)}
            className="p-6 bg-gradient-to-b from-green-900/30 to-slate-900/50 rounded-lg border border-green-700/30 hover:border-green-500/50 transition-colors text-left"
          >
            <div className="text-3xl mb-2">🎮</div>
            <h3 className="text-lg font-serif text-green-200 mb-1">
              Sessions
            </h3>
            <p className="text-slate-400 text-sm">
              View play sessions and history
            </p>
          </button>
        </div>
      </main>
    </div>
  );
}
