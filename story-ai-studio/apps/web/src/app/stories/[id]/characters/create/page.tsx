"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface CharacterFormData {
  name: string;
  description: string;
  character_type: "player" | "npc";
  race: string;
  character_class: string;
  level: number;
  stats: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  backstory: string;
  portrait_url: string;
}

const RACES = [
  "Human",
  "Elf",
  "Dwarf",
  "Halfling",
  "Gnome",
  "Half-Orc",
  "Tiefling",
  "Dragonborn",
  "Half-Elf",
  "Goliath",
  "Aasimar",
  "Firbolg",
  "Tabaxi",
  "Kenku",
  "Lizardfolk",
  "Goblin",
  "Other",
];

const CLASSES = [
  "Barbarian",
  "Bard",
  "Cleric",
  "Druid",
  "Fighter",
  "Monk",
  "Paladin",
  "Ranger",
  "Rogue",
  "Sorcerer",
  "Warlock",
  "Wizard",
  "Artificer",
  "Blood Hunter",
  "Other",
];

const DEFAULT_FORM_DATA: CharacterFormData = {
  name: "",
  description: "",
  character_type: "player",
  race: "Human",
  character_class: "Fighter",
  level: 1,
  stats: {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  },
  backstory: "",
  portrait_url: "",
};

export default function CreateCharacterPage() {
  const params = useParams();
  const router = useRouter();
  const storyId = params.id as string;

  const [formData, setFormData] = useState<CharacterFormData>(DEFAULT_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name.startsWith("stats.")) {
      const stat = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        stats: {
          ...prev.stats,
          [stat]: parseInt(value) || 10,
        },
      }));
    } else if (name === "level") {
      setFormData((prev) => ({
        ...prev,
        [name]: parseInt(value) || 1,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleStatChange = (stat: keyof typeof formData.stats, delta: number) => {
    setFormData((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        [stat]: Math.max(1, Math.min(20, prev.stats[stat] + delta)),
      },
    }));
  };

  const getStatModifier = (stat: number) => {
    const mod = Math.floor((stat - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
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

      const response = await fetch(
        `http://localhost:8000/api/v1/stories/${storyId}/characters`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to create character");
      }

      router.push(`/stories/${storyId}/characters`);
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
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-2 text-fantasy-gold mb-2">
            <Link href={`/stories/${storyId}`} className="hover:text-amber-400 transition-colors">
              ← Story
            </Link>
            <span className="text-fantasy-text-secondary">/</span>
            <Link href={`/stories/${storyId}/characters`} className="hover:text-amber-400 transition-colors">
              Characters
            </Link>
            <span className="text-fantasy-text-secondary">/</span>
            <span>Create</span>
          </div>

          <h1 className="font-heading text-3xl text-fantasy-gold">
            ✨ Create Character
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-fantasy-text-secondary mb-1 font-ui">
                    Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="input-fantasy"
                    placeholder="Aragorn"
                  />
                </div>

                <div>
                  <label className="block text-fantasy-text-secondary mb-1 font-ui">
                    Character Type
                  </label>
                  <select
                    name="character_type"
                    value={formData.character_type}
                    onChange={handleInputChange}
                    className="input-fantasy"
                  >
                    <option value="player">⚔️ Player Character</option>
                    <option value="npc">🎭 Non-Player Character</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-fantasy-text-secondary mb-1 font-ui">
                    Race
                  </label>
                  <select
                    name="race"
                    value={formData.race}
                    onChange={handleInputChange}
                    className="input-fantasy"
                  >
                    {RACES.map((race) => (
                      <option key={race} value={race}>
                        {race}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-fantasy-text-secondary mb-1 font-ui">
                    Class
                  </label>
                  <select
                    name="character_class"
                    value={formData.character_class}
                    onChange={handleInputChange}
                    className="input-fantasy"
                  >
                    {CLASSES.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-fantasy-text-secondary mb-1 font-ui">
                    Level
                  </label>
                  <input
                    type="number"
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    min={1}
                    max={20}
                    className="input-fantasy"
                  />
                </div>
              </div>

              <div>
                <label className="block text-fantasy-text-secondary mb-1 font-ui">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={2}
                  className="input-fantasy"
                  placeholder="A weathered ranger with piercing grey eyes..."
                />
              </div>

              <div>
                <label className="block text-fantasy-text-secondary mb-1 font-ui">
                  Portrait URL
                </label>
                <input
                  type="url"
                  name="portrait_url"
                  value={formData.portrait_url}
                  onChange={handleInputChange}
                  className="input-fantasy"
                  placeholder="https://example.com/portrait.jpg"
                />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="card-wood">
            <h2 className="font-heading text-xl text-fantasy-gold mb-4">
              ⚔️ Ability Scores
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(formData.stats).map(([stat, value]) => (
                <div
                  key={stat}
                  className="bg-fantasy-bg-primary/50 rounded-lg p-4 text-center"
                >
                  <label className="block text-fantasy-text-secondary text-xs uppercase mb-2">
                    {stat}
                  </label>
                  <div className="text-2xl font-bold text-fantasy-text-light mb-1">
                    {value}
                  </div>
                  <div className="text-fantasy-gold text-sm mb-3">
                    ({getStatModifier(value)})
                  </div>
                  <div className="flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleStatChange(stat as keyof typeof formData.stats, -1)}
                      className="w-8 h-8 rounded bg-fantasy-bg-secondary text-fantasy-text-light hover:bg-fantasy-bg-tertiary transition-colors"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatChange(stat as keyof typeof formData.stats, 1)}
                      className="w-8 h-8 rounded bg-fantasy-bg-secondary text-fantasy-text-light hover:bg-fantasy-bg-tertiary transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-fantasy-text-secondary text-sm mt-4 text-center italic">
              Point buy or standard array recommended. Consult your DM for rolled stats.
            </p>
          </div>

          {/* Backstory */}
          <div className="card-parchment">
            <h2 className="font-heading text-xl text-fantasy-text-primary mb-4">
              📖 Backstory
            </h2>

            <textarea
              name="backstory"
              value={formData.backstory}
              onChange={handleInputChange}
              rows={6}
              className="input-fantasy"
              placeholder="Born in the northern reaches, this character's journey began when..."
            />
          </div>

          {/* Submit */}
          <div className="flex gap-4 justify-end">
            <Link
              href={`/stories/${storyId}/characters`}
              className="btn-fantasy-secondary"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !formData.name}
              className="btn-fantasy disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Create Character"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
