"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Location {
  id: string;
  name: string;
  location_type: string;
}

interface LocationFormData {
  name: string;
  description: string;
  location_type: string;
  parent_id: string | null;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  image_url: string;
  connections: string[];
  atmosphere: {
    lighting: string;
    sounds: string;
    smells: string;
    temperature: string;
    mood: string;
  };
  is_visible: boolean;
}

const LOCATION_TYPES = [
  { value: "kingdom", label: "Kingdom", icon: "👑" },
  { value: "city", label: "City", icon: "🏰" },
  { value: "town", label: "Town", icon: "🏘️" },
  { value: "village", label: "Village", icon: "🏡" },
  { value: "dungeon", label: "Dungeon", icon: "💀" },
  { value: "forest", label: "Forest", icon: "🌲" },
  { value: "mountain", label: "Mountain", icon: "⛰️" },
  { value: "river", label: "River", icon: "🌊" },
  { value: "lake", label: "Lake", icon: "🏞️" },
  { value: "building", label: "Building", icon: "🏛️" },
  { value: "room", label: "Room", icon: "🚪" },
  { value: "shop", label: "Shop", icon: "🏪" },
  { value: "tavern", label: "Tavern", icon: "🍺" },
  { value: "temple", label: "Temple", icon: "⛩️" },
  { value: "ruins", label: "Ruins", icon: "🏚️" },
  { value: "other", label: "Other", icon: "📍" },
];

const DEFAULT_FORM_DATA: LocationFormData = {
  name: "",
  description: "",
  location_type: "",
  parent_id: null,
  coordinates: {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  },
  image_url: "",
  connections: [],
  atmosphere: {
    lighting: "",
    sounds: "",
    smells: "",
    temperature: "",
    mood: "",
  },
  is_visible: true,
};

export default function CreateLocationPage() {
  const params = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState<LocationFormData>(DEFAULT_FORM_DATA);
  const [parentLocations, setParentLocations] = useState<Location[]>([]);
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const response = await fetch(
          `http://localhost:8000/api/v1/locations?story_id=${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setAllLocations(data.locations || []);
        }
      } catch (err) {
        console.error("Failed to fetch locations:", err);
      }
    };

    fetchLocations();
  }, [params.id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (name.startsWith("coordinates.")) {
      const coordName = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        coordinates: {
          ...prev.coordinates,
          [coordName]: parseInt(value) || 0,
        },
      }));
    } else if (name.startsWith("atmosphere.")) {
      const atmName = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        atmosphere: {
          ...prev.atmosphere,
          [atmName]: value,
        },
      }));
    } else if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (name === "parent_id") {
      setFormData((prev) => ({
        ...prev,
        parent_id: value || null,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleConnectionToggle = (locationId: string) => {
    setFormData((prev) => ({
      ...prev,
      connections: prev.connections.includes(locationId)
        ? prev.connections.filter((id) => id !== locationId)
        : [...prev.connections, locationId],
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

      const response = await fetch("http://localhost:8000/api/v1/locations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          story_id: params.id,
          image_url: formData.image_url || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create location");
      }

      router.push(`/stories/${params.id}/locations`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/stories/${params.id}/locations`}
            className="text-amber-400 hover:text-amber-300 mb-2 inline-block"
          >
            ← Back to Locations
          </Link>
          <h1 className="text-4xl font-fantasy text-amber-400">Create Location</h1>
          <p className="text-slate-400 mt-2">
            Add a new location to your story world
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
                  placeholder="Location name"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Type</label>
                <select
                  name="location_type"
                  value={formData.location_type}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="">Select Type</option>
                  {LOCATION_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Parent Location</label>
                <select
                  name="parent_id"
                  value={formData.parent_id || ""}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="">None (Top Level)</option>
                  {allLocations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.location_type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Image URL</label>
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-300 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                  placeholder="Describe this location in detail..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_visible"
                    checked={formData.is_visible}
                    onChange={handleInputChange}
                    className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-amber-500 focus:ring-amber-500"
                  />
                  Location is visible to players from the start
                </label>
              </div>
            </div>
          </div>

          {/* Atmosphere */}
          <div className="fantasy-card">
            <h2 className="text-xl font-fantasy text-amber-400 mb-4">Atmosphere</h2>
            <p className="text-slate-400 text-sm mb-4">
              Set the mood and sensory details for this location
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 mb-1">Lighting</label>
                <input
                  type="text"
                  name="atmosphere.lighting"
                  value={formData.atmosphere.lighting}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                  placeholder="e.g., Dim candlelight, bright sunlight"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Sounds</label>
                <input
                  type="text"
                  name="atmosphere.sounds"
                  value={formData.atmosphere.sounds}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                  placeholder="e.g., Distant thunder, crackling fire"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Smells</label>
                <input
                  type="text"
                  name="atmosphere.smells"
                  value={formData.atmosphere.smells}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                  placeholder="e.g., Wood smoke, sea salt"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Temperature</label>
                <input
                  type="text"
                  name="atmosphere.temperature"
                  value={formData.atmosphere.temperature}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                  placeholder="e.g., Chilly, warm and humid"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-300 mb-1">Overall Mood</label>
                <input
                  type="text"
                  name="atmosphere.mood"
                  value={formData.atmosphere.mood}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                  placeholder="e.g., Mysterious, welcoming, foreboding"
                />
              </div>
            </div>
          </div>

          {/* Connections */}
          {allLocations.length > 0 && (
            <div className="fantasy-card">
              <h2 className="text-xl font-fantasy text-amber-400 mb-4">Connections</h2>
              <p className="text-slate-400 text-sm mb-4">
                Select locations that are connected to this one
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {allLocations.map((loc) => (
                  <label
                    key={loc.id}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                      formData.connections.includes(loc.id)
                        ? "bg-amber-600/30 border border-amber-500"
                        : "bg-slate-700 border border-slate-600 hover:border-slate-500"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.connections.includes(loc.id)}
                      onChange={() => handleConnectionToggle(loc.id)}
                      className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-slate-200 text-sm">{loc.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Map Coordinates */}
          <div className="fantasy-card">
            <h2 className="text-xl font-fantasy text-amber-400 mb-4">Map Position</h2>
            <p className="text-slate-400 text-sm mb-4">
              Set the position and size for map display (optional)
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-slate-300 mb-1">X Position</label>
                <input
                  type="number"
                  name="coordinates.x"
                  value={formData.coordinates.x}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Y Position</label>
                <input
                  type="number"
                  name="coordinates.y"
                  value={formData.coordinates.y}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Width</label>
                <input
                  type="number"
                  name="coordinates.width"
                  value={formData.coordinates.width}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Height</label>
                <input
                  type="number"
                  name="coordinates.height"
                  value={formData.coordinates.height}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4 justify-end">
            <Link
              href={`/stories/${params.id}/locations`}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !formData.name}
              className="btn-fantasy disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Create Location"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
