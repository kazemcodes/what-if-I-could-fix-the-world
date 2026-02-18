"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Location {
  id: string;
  name: string;
  description: string | null;
  location_type: string | null;
  parent_id: string | null;
  atmosphere: string | null;
  notable_npcs: string[];
  points_of_interest: string[];
  dangers: string[];
  image_url: string | null;
  created_at: string;
}

export default function LocationsPage() {
  const params = useParams();
  const router = useRouter();
  const storyId = params.id as string;

  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const LOCATION_TYPES = [
    { value: "all", label: "All Locations", icon: "🌐" },
    { value: "city", label: "Cities", icon: "🏰" },
    { value: "town", label: "Towns", icon: "🏘️" },
    { value: "dungeon", label: "Dungeons", icon: "💀" },
    { value: "wilderness", label: "Wilderness", icon: "🌲" },
    { value: "building", label: "Buildings", icon: "🏠" },
    { value: "landmark", label: "Landmarks", icon: "🗿" },
  ];

  useEffect(() => {
    fetchLocations();
  }, [storyId]);

  const fetchLocations = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/auth/login");
        return;
      }

      const response = await fetch(
        `http://localhost:8000/api/v1/stories/${storyId}/locations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch locations");
      }

      const data = await response.json();
      setLocations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLocations = locations.filter((loc) => {
    if (filter === "all") return true;
    return loc.location_type === filter;
  });

  const getTypeIcon = (type?: string | null) => {
    const typeData = LOCATION_TYPES.find((t) => t.value === type);
    return typeData?.icon || "📍";
  };

  return (
    <main className="min-h-screen bg-fantasy-bg-primary">
      {/* Header */}
      <header className="border-b-2 border-fantasy-border-dark bg-fantasy-bg-secondary">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-2 text-fantasy-gold mb-2">
            <Link href={`/stories/${storyId}`} className="hover:text-amber-400 transition-colors">
              ← Story
            </Link>
            <span className="text-fantasy-text-secondary">/</span>
            <span>Locations</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-3xl text-fantasy-gold">
                🗺️ Locations
              </h1>
              <p className="text-fantasy-text-secondary mt-1">
                Discover the world's places and secrets
              </p>
            </div>
            <Link href={`/stories/${storyId}/locations/create`} className="btn-fantasy">
              ✨ Create Location
            </Link>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="border-b border-fantasy-border-dark bg-fantasy-bg-secondary/50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex gap-2 flex-wrap">
            {LOCATION_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setFilter(type.value)}
                className={`px-4 py-2 rounded-lg font-ui text-sm transition-all ${
                  filter === type.value
                    ? "bg-fantasy-gold text-fantasy-bg-primary"
                    : "bg-fantasy-bg-secondary text-fantasy-text-light hover:bg-fantasy-bg-tertiary"
                }`}
              >
                {type.icon} {type.label}
              </button>
            ))}
          </div>
        </div>
      </header>

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
            <p className="text-fantasy-text-secondary">Loading locations...</p>
          </div>
        ) : filteredLocations.length === 0 ? (
          <div className="card-parchment text-center py-12">
            <div className="text-6xl mb-4">🗺️</div>
            <h2 className="font-heading text-xl text-fantasy-text-primary mb-2">
              No Locations Found
            </h2>
            <p className="text-fantasy-text-secondary mb-6">
              {filter !== "all"
                ? `No ${filter} locations yet`
                : "Create your first location to build your world"}
            </p>
            <Link href={`/stories/${storyId}/locations/create`} className="btn-fantasy">
              ✨ Create Location
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLocations.map((location) => (
              <div
                key={location.id}
                className="fantasy-card hover:scale-[1.02] transition-transform"
              >
                {/* Type Badge */}
                <div className="absolute top-4 right-4">
                  <span className="bg-fantasy-bg-secondary text-fantasy-text-light px-2 py-1 rounded text-xs font-ui">
                    {getTypeIcon(location.location_type)} {location.location_type || "Unknown"}
                  </span>
                </div>

                {/* Image Placeholder */}
                <div className="w-full h-32 rounded-lg bg-fantasy-bg-secondary border border-fantasy-border-gold/30 flex items-center justify-center text-4xl mb-4 overflow-hidden">
                  {location.image_url ? (
                    <img
                      src={location.image_url}
                      alt={location.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getTypeIcon(location.location_type)
                  )}
                </div>

                {/* Name */}
                <h3 className="font-heading text-lg text-fantasy-gold mb-2">
                  {location.name}
                </h3>

                {/* Description */}
                <p className="text-fantasy-text-light text-sm line-clamp-2 mb-4">
                  {location.description || "No description provided"}
                </p>

                {/* Atmosphere */}
                {location.atmosphere && (
                  <p className="text-fantasy-text-secondary text-xs italic mb-3">
                    🌫️ {location.atmosphere}
                  </p>
                )}

                {/* Notable NPCs */}
                {location.notable_npcs.length > 0 && (
                  <div className="mb-3">
                    <p className="text-fantasy-text-secondary text-xs mb-1">Notable NPCs:</p>
                    <div className="flex flex-wrap gap-1">
                      {location.notable_npcs.slice(0, 3).map((npc, i) => (
                        <span
                          key={i}
                          className="bg-fantasy-bg-primary/50 text-fantasy-text-light px-2 py-0.5 rounded text-xs"
                        >
                          {npc}
                        </span>
                      ))}
                      {location.notable_npcs.length > 3 && (
                        <span className="text-fantasy-text-secondary text-xs">
                          +{location.notable_npcs.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Dangers */}
                {location.dangers.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-red-400">
                    ⚠️ {location.dangers.length} known danger{location.dangers.length !== 1 && "s"}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
