"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface WorldConfig {
  name: string;
  description: string;
  theme: string;
  setting_details: Record<string, unknown>;
  locations: Array<Record<string, unknown>>;
  factions: Array<Record<string, unknown>>;
  npcs: Array<Record<string, unknown>>;
}

interface AISettings {
  model: string;
  temperature: number;
  max_tokens: number;
  system_prompt_override: string | null;
  narrative_style: string;
  content_rating: string;
}

export default function CreateStoryPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"basic" | "world" | "ai">("basic");

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [tags, setTags] = useState("");
  const [worldConfig, setWorldConfig] = useState<WorldConfig>({
    name: "",
    description: "",
    theme: "fantasy",
    setting_details: {},
    locations: [],
    factions: [],
    npcs: [],
  });
  const [aiSettings, setAiSettings] = useState<AISettings>({
    model: "gpt-4o",
    temperature: 0.7,
    max_tokens: 2000,
    system_prompt_override: null,
    narrative_style: "immersive",
    content_rating: "teen",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      const response = await fetch("http://localhost:8000/api/v1/stories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          is_public: isPublic,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          world_config: worldConfig,
          ai_settings: aiSettings,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to create story");
      }

      const story = await response.json();
      router.push(`/stories/${story.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

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
          <h1 className="text-2xl font-serif text-amber-100">Create New Story</h1>
          <div className="w-24" /> {/* Spacer for centering */}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit}>
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {[
              { id: "basic", label: "📜 Basic Info" },
              { id: "world", label: "🗺️ World Config" },
              { id: "ai", label: "🧙 AI Settings" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-6 py-3 rounded-t-lg font-serif transition-all ${
                  activeTab === tab.id
                    ? "bg-amber-900/40 text-amber-100 border-t border-x border-amber-700/50"
                    : "bg-slate-800/50 text-slate-400 hover:text-amber-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-gradient-to-b from-amber-900/20 to-slate-900/50 rounded-lg border border-amber-700/30 p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-lg text-red-200">
                {error}
              </div>
            )}

            {/* Basic Info Tab */}
            {activeTab === "basic" && (
              <div className="space-y-6">
                <div>
                  <label className="block text-amber-200 mb-2 font-serif">
                    Story Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    maxLength={200}
                    placeholder="Enter your story's title..."
                    className="w-full px-4 py-3 bg-slate-800/50 border border-amber-700/30 rounded-lg text-amber-50 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-amber-200 mb-2 font-serif">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={5000}
                    rows={5}
                    placeholder="Describe your story world and what adventures await..."
                    className="w-full px-4 py-3 bg-slate-800/50 border border-amber-700/30 rounded-lg text-amber-50 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-amber-200 mb-2 font-serif">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="fantasy, adventure, dragons, magic..."
                    className="w-full px-4 py-3 bg-slate-800/50 border border-amber-700/30 rounded-lg text-amber-50 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="w-5 h-5 rounded border-amber-700/50 bg-slate-800/50 text-amber-500 focus:ring-amber-500"
                  />
                  <label htmlFor="isPublic" className="text-amber-200 font-serif">
                    Make this story public (others can discover and play it)
                  </label>
                </div>
              </div>
            )}

            {/* World Config Tab */}
            {activeTab === "world" && (
              <div className="space-y-6">
                <div>
                  <label className="block text-amber-200 mb-2 font-serif">
                    World Name
                  </label>
                  <input
                    type="text"
                    value={worldConfig.name}
                    onChange={(e) =>
                      setWorldConfig({ ...worldConfig, name: e.target.value })
                    }
                    placeholder="The Realm of Eldoria..."
                    className="w-full px-4 py-3 bg-slate-800/50 border border-amber-700/30 rounded-lg text-amber-50 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-amber-200 mb-2 font-serif">
                    World Description
                  </label>
                  <textarea
                    value={worldConfig.description}
                    onChange={(e) =>
                      setWorldConfig({ ...worldConfig, description: e.target.value })
                    }
                    rows={4}
                    placeholder="Describe the world, its history, and its inhabitants..."
                    className="w-full px-4 py-3 bg-slate-800/50 border border-amber-700/30 rounded-lg text-amber-50 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-amber-200 mb-2 font-serif">
                    Theme
                  </label>
                  <select
                    value={worldConfig.theme}
                    onChange={(e) =>
                      setWorldConfig({ ...worldConfig, theme: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-800/50 border border-amber-700/30 rounded-lg text-amber-50 focus:outline-none focus:border-amber-500 transition-colors"
                  >
                    <option value="fantasy">Fantasy</option>
                    <option value="sci-fi">Science Fiction</option>
                    <option value="horror">Horror</option>
                    <option value="modern">Modern</option>
                    <option value="historical">Historical</option>
                    <option value="post-apocalyptic">Post-Apocalyptic</option>
                    <option value="steampunk">Steampunk</option>
                    <option value="cyberpunk">Cyberpunk</option>
                  </select>
                </div>
              </div>
            )}

            {/* AI Settings Tab */}
            {activeTab === "ai" && (
              <div className="space-y-6">
                <div>
                  <label className="block text-amber-200 mb-2 font-serif">
                    AI Model
                  </label>
                  <select
                    value={aiSettings.model}
                    onChange={(e) =>
                      setAiSettings({ ...aiSettings, model: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-800/50 border border-amber-700/30 rounded-lg text-amber-50 focus:outline-none focus:border-amber-500 transition-colors"
                  >
                    <option value="gpt-4o">GPT-4o (Recommended)</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-amber-200 mb-2 font-serif">
                    Creativity Level: {aiSettings.temperature.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={aiSettings.temperature}
                    onChange={(e) =>
                      setAiSettings({
                        ...aiSettings,
                        temperature: parseFloat(e.target.value),
                      })
                    }
                    className="w-full accent-amber-500"
                  />
                  <div className="flex justify-between text-sm text-slate-400 mt-1">
                    <span>Focused</span>
                    <span>Balanced</span>
                    <span>Creative</span>
                  </div>
                </div>

                <div>
                  <label className="block text-amber-200 mb-2 font-serif">
                    Narrative Style
                  </label>
                  <select
                    value={aiSettings.narrative_style}
                    onChange={(e) =>
                      setAiSettings({ ...aiSettings, narrative_style: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-800/50 border border-amber-700/30 rounded-lg text-amber-50 focus:outline-none focus:border-amber-500 transition-colors"
                  >
                    <option value="immersive">Immersive (Second Person)</option>
                    <option value="narrative">Narrative (Third Person)</option>
                    <option value="cinematic">Cinematic (Action-focused)</option>
                    <option value="literary">Literary (Descriptive)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-amber-200 mb-2 font-serif">
                    Content Rating
                  </label>
                  <select
                    value={aiSettings.content_rating}
                    onChange={(e) =>
                      setAiSettings({ ...aiSettings, content_rating: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-800/50 border border-amber-700/30 rounded-lg text-amber-50 focus:outline-none focus:border-amber-500 transition-colors"
                  >
                    <option value="everyone">Everyone (Family-friendly)</option>
                    <option value="teen">Teen (Mild violence, themes)</option>
                    <option value="mature">Mature (Adult themes)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-amber-200 mb-2 font-serif">
                    Custom System Prompt (Optional)
                  </label>
                  <textarea
                    value={aiSettings.system_prompt_override || ""}
                    onChange={(e) =>
                      setAiSettings({
                        ...aiSettings,
                        system_prompt_override: e.target.value || null,
                      })
                    }
                    rows={4}
                    placeholder="Override the default AI behavior with custom instructions..."
                    className="w-full px-4 py-3 bg-slate-800/50 border border-amber-700/30 rounded-lg text-amber-50 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors resize-none font-mono text-sm"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="mt-8 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors font-serif"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !title.trim()}
                className="px-8 py-3 bg-gradient-to-r from-amber-700 to-amber-600 rounded-lg text-amber-50 font-serif hover:from-amber-600 hover:to-amber-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-900/30"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creating...
                  </span>
                ) : (
                  "✨ Create Story"
                )}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
