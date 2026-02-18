"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Story {
  id: string;
  title: string;
  description: string | null;
  owner_id: string;
  world_config: {
    name?: string;
    theme?: string;
  };
  tags: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export default function BrowseStoriesPage() {
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<string>("all");

  const themes = [
    { value: "all", label: "All Themes", icon: "🌐" },
    { value: "fantasy", label: "Fantasy", icon: "🏰" },
    { value: "scifi", label: "Sci-Fi", icon: "🚀" },
    { value: "horror", label: "Horror", icon: "👻" },
    { value: "mystery", label: "Mystery", icon: "🔍" },
    { value: "adventure", label: "Adventure", icon: "🗺️" },
  ];

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setIsLoading(true);
      // For now, fetch user's stories. In production, this would be a public stories endpoint
      const token = localStorage.getItem("access_token");
      
      const headers: HeadersInit = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch("http://localhost:8000/api/v1/stories", {
        headers,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch stories");
      }

      const data = await response.json();
      setStories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStories = stories.filter((story) => {
    const matchesSearch =
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTheme =
      selectedTheme === "all" || story.world_config?.theme === selectedTheme;

    return matchesSearch && matchesTheme;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getThemeIcon = (theme?: string) => {
    const themeData = themes.find((t) => t.value === theme);
    return themeData?.icon || "📖";
  };

  return (
    <main className="min-h-screen bg-fantasy-bg-primary">
      {/* Header */}
      <header className="border-b-2 border-fantasy-border-dark bg-fantasy-bg-secondary">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/dashboard"
                className="text-fantasy-gold hover:text-amber-400 transition-colors"
              >
                ← Return to Tavern
              </Link>
              <h1 className="font-heading text-3xl text-fantasy-gold mt-2">
                📚 Story Library
              </h1>
              <p className="text-fantasy-text-secondary mt-1">
                Discover epic adventures and magical worlds
              </p>
            </div>
            <Link href="/stories/create" className="btn-fantasy">
              ✨ Forge New Story
            </Link>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="border-b border-fantasy-border-dark bg-fantasy-bg-secondary/50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stories, worlds, or tags..."
                className="input-fantasy w-full"
              />
            </div>

            {/* Theme Filter */}
            <div className="flex gap-2 flex-wrap">
              {themes.map((theme) => (
                <button
                  key={theme.value}
                  onClick={() => setSelectedTheme(theme.value)}
                  className={`px-4 py-2 rounded-lg font-ui text-sm transition-all ${
                    selectedTheme === theme.value
                      ? "bg-fantasy-gold text-fantasy-bg-primary"
                      : "bg-fantasy-bg-secondary text-fantasy-text-light hover:bg-fantasy-bg-tertiary"
                  }`}
                >
                  {theme.icon} {theme.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="card-wood border-red-800 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-fantasy-gold text-4xl mb-4">⏳</div>
            <p className="text-fantasy-text-secondary">Loading stories...</p>
          </div>
        ) : filteredStories.length === 0 ? (
          <div className="card-parchment text-center py-12">
            <div className="text-6xl mb-4">📜</div>
            <h2 className="font-heading text-xl text-fantasy-text-primary mb-2">
              No Stories Found
            </h2>
            <p className="text-fantasy-text-secondary mb-6">
              {searchQuery || selectedTheme !== "all"
                ? "Try adjusting your search or filters"
                : "Begin your journey by creating your first story"}
            </p>
            <Link href="/stories/create" className="btn-fantasy">
              ✨ Create Your First Story
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStories.map((story) => (
              <Link
                key={story.id}
                href={`/stories/${story.id}`}
                className="fantasy-card hover:scale-[1.02] transition-transform"
              >
                {/* Theme Badge */}
                <div className="absolute top-4 right-4 text-2xl">
                  {getThemeIcon(story.world_config?.theme)}
                </div>

                {/* Content */}
                <h3 className="font-heading text-lg text-fantasy-gold mb-2 pr-8">
                  {story.title}
                </h3>

                {story.world_config?.name && (
                  <p className="text-fantasy-gold/70 text-sm mb-2">
                    🌍 {story.world_config.name}
                  </p>
                )}

                <p className="text-fantasy-text-light text-sm line-clamp-3 mb-4">
                  {story.description || "No description provided"}
                </p>

                {/* Tags */}
                {story.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {story.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="bg-fantasy-bg-primary/50 text-fantasy-text-secondary px-2 py-0.5 rounded text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                    {story.tags.length > 3 && (
                      <span className="text-fantasy-text-secondary text-xs">
                        +{story.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-fantasy-text-secondary border-t border-fantasy-border-gold/20 pt-3 mt-auto">
                  <span>📅 {formatDate(story.created_at)}</span>
                  {story.is_public && (
                    <span className="text-fantasy-gold">🌐 Public</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
