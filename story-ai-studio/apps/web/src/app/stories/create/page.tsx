"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface StoryFormData {
  title: string;
  description: string;
  world_config: {
    name: string;
    description: string;
    theme: string;
    tone: string;
    locations: Array<{ name: string; description: string }>;
    factions: Array<{ name: string; description: string }>;
    npcs: Array<{ name: string; description: string }>;
  };
  ai_settings: {
    model: string;
    temperature: number;
    narrative_style: string;
    content_rating: string;
    max_tokens: number;
  };
  tags: string[];
  is_public: boolean;
}

const THEMES = [
  { value: "fantasy", label: "Fantasy", icon: "🏰" },
  { value: "scifi", label: "Science Fiction", icon: "🚀" },
  { value: "horror", label: "Horror", icon: "👻" },
  { value: "mystery", label: "Mystery", icon: "🔍" },
  { value: "adventure", label: "Adventure", icon: "🗺️" },
  { value: "romance", label: "Romance", icon: "💕" },
  { value: "historical", label: "Historical", icon: "📜" },
  { value: "modern", label: "Modern", icon: "🏙️" },
];

const TONES = [
  { value: "heroic", label: "Heroic" },
  { value: "dark", label: "Dark" },
  { value: "lighthearted", label: "Lighthearted" },
  { value: "serious", label: "Serious" },
  { value: "comedic", label: "Comedic" },
  { value: "epic", label: "Epic" },
];

const NARRATIVE_STYLES = [
  { value: "descriptive", label: "Descriptive & Immersive" },
  { value: "concise", label: "Concise & Action-Focused" },
  { value: "literary", label: "Literary & Poetic" },
  { value: "cinematic", label: "Cinematic & Dramatic" },
];

const DEFAULT_FORM_DATA: StoryFormData = {
  title: "",
  description: "",
  world_config: {
    name: "",
    description: "",
    theme: "fantasy",
    tone: "heroic",
    locations: [],
    factions: [],
    npcs: [],
  },
  ai_settings: {
    model: "gpt-4o",
    temperature: 0.7,
    narrative_style: "descriptive",
    content_rating: "teen",
    max_tokens: 2000,
  },
  tags: [],
  is_public: false,
};

export default function CreateStoryPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<StoryFormData>(DEFAULT_FORM_DATA);
  const [newTag, setNewTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (name.startsWith("world_config.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        world_config: {
          ...prev.world_config,
          [field]: value,
        },
      }));
    } else if (name.startsWith("ai_settings.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        ai_settings: {
          ...prev.ai_settings,
          [field]: type === "number" ? parseFloat(value) : value,
        },
      }));
    } else if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim().toLowerCase()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
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
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to create story");
      }

      const data = await response.json();
      router.push(`/stories/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-fantasy-bg-primary">
      {/* Header */}
      <header className="border-b-2 border-fantasy-border-dark bg-fantasy-bg-secondary">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href="/dashboard"
            className="text-fantasy-gold hover:text-amber-400 transition-colors"
          >
            ← Return to Tavern
          </Link>
          <h1 className="font-heading text-3xl text-fantasy-gold mt-2">
            Forge New Story
          </h1>
        </div>
      </header>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="card-wood border-red-800">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Basic Info */}
          <div className="card-parchment">
            <h2 className="font-heading text-xl text-fantasy-text-primary mb-4">
              📜 Basic Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-fantasy-text-secondary mb-1 font-ui">
                  Story Title <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="input-fantasy"
                  placeholder="The Dragon's Quest"
                />
              </div>

              <div>
                <label className="block text-fantasy-text-secondary mb-1 font-ui">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="input-fantasy"
                  placeholder="An epic adventure to save the kingdom..."
                />
              </div>

              <div>
                <label className="block text-fantasy-text-secondary mb-1 font-ui">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    className="input-fantasy flex-1"
                    placeholder="fantasy, adventure, dragons..."
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="btn-fantasy-secondary"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-fantasy-bg-secondary text-fantasy-text-light px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-fantasy-gold hover:text-amber-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 text-fantasy-text-secondary cursor-pointer">
                <input
                  type="checkbox"
                  name="is_public"
                  checked={formData.is_public}
                  onChange={handleInputChange}
                  className="w-5 h-5 rounded border-fantasy-border-gold"
                />
                Make this story public for others to discover
              </label>
            </div>
          </div>

          {/* World Configuration */}
          <div className="card-parchment">
            <h2 className="font-heading text-xl text-fantasy-text-primary mb-4">
              🌍 World Configuration
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-fantasy-text-secondary mb-1 font-ui">
                    World Name
                  </label>
                  <input
                    type="text"
                    name="world_config.name"
                    value={formData.world_config.name}
                    onChange={handleInputChange}
                    className="input-fantasy"
                    placeholder="Eldoria"
                  />
                </div>

                <div>
                  <label className="block text-fantasy-text-secondary mb-1 font-ui">
                    Theme
                  </label>
                  <select
                    name="world_config.theme"
                    value={formData.world_config.theme}
                    onChange={handleInputChange}
                    className="input-fantasy"
                  >
                    {THEMES.map((theme) => (
                      <option key={theme.value} value={theme.value}>
                        {theme.icon} {theme.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-fantasy-text-secondary mb-1 font-ui">
                  World Description
                </label>
                <textarea
                  name="world_config.description"
                  value={formData.world_config.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="input-fantasy"
                  placeholder="A vast kingdom filled with magic and wonder..."
                />
              </div>

              <div>
                <label className="block text-fantasy-text-secondary mb-1 font-ui">
                  Tone
                </label>
                <select
                  name="world_config.tone"
                  value={formData.world_config.tone}
                  onChange={handleInputChange}
                  className="input-fantasy"
                >
                  {TONES.map((tone) => (
                    <option key={tone.value} value={tone.value}>
                      {tone.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* AI Settings */}
          <div className="card-wood">
            <h2 className="font-heading text-xl text-fantasy-gold mb-4">
              🧙 AI Narrator Settings
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-fantasy-text-light mb-1 font-ui">
                    AI Model
                  </label>
                  <select
                    name="ai_settings.model"
                    value={formData.ai_settings.model}
                    onChange={handleInputChange}
                    className="input-fantasy"
                  >
                    <option value="gpt-4o">GPT-4o (Best Quality)</option>
                    <option value="gpt-4o-mini">GPT-4o Mini (Faster)</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Budget)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-fantasy-text-light mb-1 font-ui">
                    Narrative Style
                  </label>
                  <select
                    name="ai_settings.narrative_style"
                    value={formData.ai_settings.narrative_style}
                    onChange={handleInputChange}
                    className="input-fantasy"
                  >
                    {NARRATIVE_STYLES.map((style) => (
                      <option key={style.value} value={style.value}>
                        {style.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-fantasy-text-light mb-1 font-ui">
                  Creativity (Temperature): {formData.ai_settings.temperature}
                </label>
                <input
                  type="range"
                  name="ai_settings.temperature"
                  value={formData.ai_settings.temperature}
                  onChange={handleInputChange}
                  min={0}
                  max={1}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-fantasy-text-secondary">
                  <span>Focused</span>
                  <span>Balanced</span>
                  <span>Creative</span>
                </div>
              </div>

              <div>
                <label className="block text-fantasy-text-light mb-1 font-ui">
                  Content Rating
                </label>
                <select
                  name="ai_settings.content_rating"
                  value={formData.ai_settings.content_rating}
                  onChange={handleInputChange}
                  className="input-fantasy"
                >
                  <option value="everyone">Everyone</option>
                  <option value="teen">Teen</option>
                  <option value="mature">Mature</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4 justify-end">
            <Link href="/dashboard" className="btn-fantasy-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !formData.title}
              className="btn-fantasy disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Create Story"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
