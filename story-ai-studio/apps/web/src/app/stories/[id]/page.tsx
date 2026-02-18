"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Story {
  id: string;
  title: string;
  description: string | null;
  owner_id: string;
  world_config: {
    name?: string;
    description?: string;
    theme?: string;
    tone?: string;
  };
  ai_settings: {
    model?: string;
    temperature?: number;
    narrative_style?: string;
  };
  tags: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export default function StoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const storyId = params.id as string;

  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchStory();
  }, [storyId]);

  const fetchStory = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("access_token");
      
      if (!token) {
        router.push("/auth/login");
        return;
      }

      const response = await fetch(`http://localhost:8000/api/v1/stories/${storyId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Story not found");
        }
        throw new Error("Failed to fetch story");
      }

      const data = await response.json();
      setStory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this story? This action cannot be undone.")) {
      return;
    }

    try {
      setIsDeleting(true);
      const token = localStorage.getItem("access_token");

      const response = await fetch(`http://localhost:8000/api/v1/stories/${storyId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete story");
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getThemeIcon = (theme?: string) => {
    const icons: Record<string, string> = {
      fantasy: "🏰",
      scifi: "🚀",
      horror: "👻",
      mystery: "🔍",
      adventure: "🗺️",
      romance: "💕",
    };
    return icons[theme || ""] || "📖";
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-fantasy-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="text-fantasy-gold text-4xl mb-4">⏳</div>
          <p className="text-fantasy-text-secondary">Loading story...</p>
        </div>
      </main>
    );
  }

  if (error && !story) {
    return (
      <main className="min-h-screen bg-fantasy-bg-primary flex items-center justify-center">
        <div className="card-parchment text-center max-w-md">
          <div className="text-6xl mb-4">📜</div>
          <h1 className="font-heading text-2xl text-fantasy-text-primary mb-2">
            Story Not Found
          </h1>
          <p className="text-fantasy-text-secondary mb-6">{error}</p>
          <Link href="/dashboard" className="btn-fantasy">
            Return to Tavern
          </Link>
        </div>
      </main>
    );
  }

  if (!story) return null;

  return (
    <main className="min-h-screen bg-fantasy-bg-primary">
      {/* Header */}
      <header className="border-b-2 border-fantasy-border-dark bg-fantasy-bg-secondary">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <Link
            href="/dashboard"
            className="text-fantasy-gold hover:text-amber-400 transition-colors"
          >
            ← Return to Tavern
          </Link>

          <div className="flex items-start justify-between mt-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{getThemeIcon(story.world_config?.theme)}</span>
                <h1 className="font-heading text-3xl text-fantasy-gold">
                  {story.title}
                </h1>
              </div>
              {story.world_config?.name && (
                <p className="text-fantasy-text-secondary">
                  🌍 {story.world_config.name}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Link
                href={`/stories/${storyId}/sessions`}
                className="btn-fantasy"
              >
                🎭 Play Now
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {error && (
          <div className="card-wood border-red-800 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link
            href={`/stories/${storyId}/characters`}
            className="fantasy-card text-center hover:scale-[1.02] transition-transform"
          >
            <div className="text-3xl mb-2">👤</div>
            <h3 className="font-heading text-fantasy-gold">Characters</h3>
            <p className="text-fantasy-text-secondary text-sm">Manage heroes & NPCs</p>
          </Link>

          <Link
            href={`/stories/${storyId}/locations`}
            className="fantasy-card text-center hover:scale-[1.02] transition-transform"
          >
            <div className="text-3xl mb-2">🗺️</div>
            <h3 className="font-heading text-fantasy-gold">Locations</h3>
            <p className="text-fantasy-text-secondary text-sm">Explore the world</p>
          </Link>

          <Link
            href={`/stories/${storyId}/sessions`}
            className="fantasy-card text-center hover:scale-[1.02] transition-transform"
          >
            <div className="text-3xl mb-2">🎭</div>
            <h3 className="font-heading text-fantasy-gold">Sessions</h3>
            <p className="text-fantasy-text-secondary text-sm">Play adventures</p>
          </Link>

          <Link
            href={`/stories/${storyId}/worldbuilder`}
            className="fantasy-card text-center hover:scale-[1.02] transition-transform"
          >
            <div className="text-3xl mb-2">🧙</div>
            <h3 className="font-heading text-fantasy-gold">World Builder</h3>
            <p className="text-fantasy-text-secondary text-sm">Craft your world</p>
          </Link>
        </div>

        {/* Story Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="card-parchment">
              <h2 className="font-heading text-xl text-fantasy-text-primary mb-4">
                📜 Description
              </h2>
              <p className="text-fantasy-text-secondary">
                {story.description || "No description provided. Add one to bring your story to life!"}
              </p>
            </div>

            {/* World Configuration */}
            <div className="card-parchment">
              <h2 className="font-heading text-xl text-fantasy-text-primary mb-4">
                🌍 World Configuration
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-fantasy-text-secondary text-sm">Theme</label>
                  <p className="text-fantasy-text-primary">
                    {story.world_config?.theme || "Not set"}
                  </p>
                </div>
                <div>
                  <label className="text-fantasy-text-secondary text-sm">Tone</label>
                  <p className="text-fantasy-text-primary">
                    {story.world_config?.tone || "Not set"}
                  </p>
                </div>
              </div>
              {story.world_config?.description && (
                <div className="mt-4">
                  <label className="text-fantasy-text-secondary text-sm">World Description</label>
                  <p className="text-fantasy-text-primary mt-1">
                    {story.world_config.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tags */}
            <div className="card-wood">
              <h2 className="font-heading text-lg text-fantasy-gold mb-3">
                🏷️ Tags
              </h2>
              {story.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {story.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-fantasy-bg-primary/50 text-fantasy-text-light px-3 py-1 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-fantasy-text-secondary text-sm">No tags</p>
              )}
            </div>

            {/* AI Settings */}
            <div className="card-wood">
              <h2 className="font-heading text-lg text-fantasy-gold mb-3">
                🧙 AI Settings
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-fantasy-text-secondary">Model</span>
                  <span className="text-fantasy-text-light">
                    {story.ai_settings?.model || "gpt-4o"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-fantasy-text-secondary">Temperature</span>
                  <span className="text-fantasy-text-light">
                    {story.ai_settings?.temperature || 0.7}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-fantasy-text-secondary">Style</span>
                  <span className="text-fantasy-text-light">
                    {story.ai_settings?.narrative_style || "descriptive"}
                  </span>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="card-wood">
              <h2 className="font-heading text-lg text-fantasy-gold mb-3">
                📅 Details
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-fantasy-text-secondary">Created</span>
                  <span className="text-fantasy-text-light">
                    {formatDate(story.created_at)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-fantasy-text-secondary">Updated</span>
                  <span className="text-fantasy-text-light">
                    {formatDate(story.updated_at)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-fantasy-text-secondary">Visibility</span>
                  <span className="text-fantasy-text-light">
                    {story.is_public ? "🌐 Public" : "🔒 Private"}
                  </span>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="card-wood border-red-900">
              <h2 className="font-heading text-lg text-red-400 mb-3">
                ⚠️ Danger Zone
              </h2>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full bg-red-900/50 hover:bg-red-800 text-red-200 py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Story"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
