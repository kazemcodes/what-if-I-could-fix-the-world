"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface CharacterFormData {
  name: string;
  description: string;
  backstory: string;
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
  appearance: {
    height: string;
    weight: string;
    hair_color: string;
    eye_color: string;
    skin_color: string;
    distinguishing_features: string;
  };
  personality_traits: string[];
  ideals: string;
  bonds: string;
  flaws: string;
  is_npc: boolean;
}

const RACES = [
  "Human", "Elf", "Dwarf", "Halfling", "Gnome", "Half-Orc", "Tiefling", 
  "Dragonborn", "Half-Elf", "Goliath", "Aasimar", "Firbolg", "Kenku", 
  "Tabaxi", "Tortle", "Custom"
];

const CLASSES = [
  "Barbarian", "Bard", "Cleric", "Druid", "Fighter", "Monk", "Paladin",
  "Ranger", "Rogue", "Sorcerer", "Warlock", "Wizard", "Artificer", "Custom"
];

const DEFAULT_FORM_DATA: CharacterFormData = {
  name: "",
  description: "",
  backstory: "",
  race: "",
  character_class: "",
  level: 1,
  stats: {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  },
  appearance: {
    height: "",
    weight: "",
    hair_color: "",
    eye_color: "",
    skin_color: "",
    distinguishing_features: "",
  },
  personality_traits: [],
  ideals: "",
  bonds: "",
  flaws: "",
  is_npc: false,
};

export default function CreateCharacterPage() {
  const params = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState<CharacterFormData>(DEFAULT_FORM_DATA);
  const [newTrait, setNewTrait] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (name.startsWith("stats.")) {
      const statName = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        stats: {
          ...prev.stats,
          [statName]: parseInt(value) || 10,
        },
      }));
    } else if (name.startsWith("appearance.")) {
      const appearanceField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        appearance: {
          ...prev.appearance,
          [appearanceField]: value,
        },
      }));
    } else if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
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

  const addTrait = () => {
    if (newTrait.trim()) {
      setFormData((prev) => ({
        ...prev,
        personality_traits: [...prev.personality_traits, newTrait.trim()],
      }));
      setNewTrait("");
    }
  };

  const removeTrait = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      personality_traits: prev.personality_traits.filter((_, i) => i !== index),
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

      const response = await fetch("http://localhost:8000/api/v1/characters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          story_id: params.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create character");
      }

      router.push(`/stories/${params.id}/characters`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatModifier = (stat: number) => {
    const modifier = Math.floor((stat - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/stories/${params.id}/characters`}
            className="text-amber-400 hover:text-amber-300 mb-2 inline-block"
          >
            ← Back to Characters
          </Link>
          <h1 className="text-4xl font-fantasy text-amber-400">Create Character</h1>
          <p className="text-slate-400 mt-2">
            Bring a new hero or NPC to life in your story
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="fantasy-card">
            <h2 className="text-xl font-fantasy text-amber-400 mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 mb-1">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                  placeholder="Character name"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Level</label>
                <input
                  type="number"
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  min={1}
                  max={30}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Race</label>
                <select
                  name="race"
                  value={formData.race}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="">Select Race</option>
                  {RACES.map((race) => (
                    <option key={race} value={race.toLowerCase()}>
                      {race}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Class</label>
                <select
                  name="character_class"
                  value={formData.character_class}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="">Select Class</option>
                  {CLASSES.map((cls) => (
                    <option key={cls} value={cls.toLowerCase()}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-300 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                  placeholder="Brief description of your character"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_npc"
                    checked={formData.is_npc}
                    onChange={handleInputChange}
                    className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-amber-500 focus:ring-amber-500"
                  />
                  This is an NPC (Non-Player Character)
                </label>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="fantasy-card">
            <h2 className="text-xl font-fantasy text-amber-400 mb-4">Ability Scores</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(formData.stats).map(([stat, value]) => (
                <div key={stat} className="text-center">
                  <label className="block text-slate-400 text-sm mb-1 uppercase">
                    {stat.slice(0, 3)}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name={`stats.${stat}`}
                      value={value}
                      onChange={handleInputChange}
                      min={1}
                      max={30}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-2 py-3 text-white text-center text-xl focus:border-amber-500 focus:outline-none"
                    />
                    <span className="absolute -bottom-6 left-0 right-0 text-sm text-amber-400">
                      {getStatModifier(value)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-slate-500 text-sm mt-8">
              Modifier is calculated automatically (score - 10) / 2
            </p>
          </div>

          {/* Appearance */}
          <div className="fantasy-card">
            <h2 className="text-xl font-fantasy text-amber-400 mb-4">Appearance</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 mb-1">Height</label>
                <input
                  type="text"
                  name="appearance.height"
                  value={formData.appearance.height}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                  placeholder="e.g., 6'2""
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Weight</label>
                <input
                  type="text"
                  name="appearance.weight"
                  value={formData.appearance.weight}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                  placeholder="e.g., 180 lbs"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Hair Color</label>
                <input
                  type="text"
                  name="appearance.hair_color"
                  value={formData.appearance.hair_color}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                  placeholder="e.g., Black"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Eye Color</label>
                <input
                  type="text"
                  name="appearance.eye_color"
                  value={formData.appearance.eye_color}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                  placeholder="e.g., Blue"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Skin Color</label>
                <input
                  type="text"
                  name="appearance.skin_color"
                  value={formData.appearance.skin_color}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                  placeholder="e.g., Pale"
                />
              </div>

              <div className="md:col-span-2 lg:col-span-1">
                <label className="block text-slate-300 mb-1">Distinguishing Features</label>
                <input
                  type="text"
                  name="appearance.distinguishing_features"
                  value={formData.appearance.distinguishing_features}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                  placeholder="e.g., Scar on left cheek"
                />
              </div>
            </div>
          </div>

          {/* Personality */}
          <div className="fantasy-card">
            <h2 className="text-xl font-fantasy text-amber-400 mb-4">Personality</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 mb-1">Personality Traits</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newTrait}
                    onChange={(e) => setNewTrait(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTrait())}
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                    placeholder="Add a personality trait"
                  />
                  <button
                    type="button"
                    onClick={addTrait}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.personality_traits.map((trait, index) => (
                    <span
                      key={index}
                      className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {trait}
                      <button
                        type="button"
                        onClick={() => removeTrait(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1">Ideals</label>
                  <textarea
                    name="ideals"
                    value={formData.ideals}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                    placeholder="What drives your character?"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Bonds</label>
                  <textarea
                    name="bonds"
                    value={formData.bonds}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                    placeholder="Connections to people, places, or things"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Flaws</label>
                  <textarea
                    name="flaws"
                    value={formData.flaws}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                    placeholder="Weaknesses or vices"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Backstory */}
          <div className="fantasy-card">
            <h2 className="text-xl font-fantasy text-amber-400 mb-4">Backstory</h2>
            
            <div>
              <textarea
                name="backstory"
                value={formData.backstory}
                onChange={handleInputChange}
                rows={6}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                placeholder="Tell the story of your character's past. Where did they come from? What shaped them into who they are today?"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4 justify-end">
            <Link
              href={`/stories/${params.id}/characters`}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
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
    </div>
  );
}
