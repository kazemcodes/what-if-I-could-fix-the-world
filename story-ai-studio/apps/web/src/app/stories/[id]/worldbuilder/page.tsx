"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Story {
  id: string;
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
}

interface Character {
  id: string;
  name: string;
  race: string;
  character_class: string;
  level: number;
  is_npc: boolean;
}

interface Location {
  id: string;
  name: string;
  location_type: string;
  parent_id: string | null;
}

type TabType = "overview" | "characters" | "locations" | "factions" | "items" | "quests";

export default function WorldBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const [story, setStory] = useState<Story | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.push("/auth/login");
          return;
        }

        // Fetch story
        const storyResponse = await fetch(
          `http://localhost:8000/api/v1/stories/${params.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (storyResponse.ok) {
          setStory(await storyResponse.json());
        }

        // Fetch characters
        const charResponse = await fetch(
          `http://localhost:8000/api/v1/characters?story_id=${params.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (charResponse.ok) {
          const data = await charResponse.json();
          setCharacters(data.characters || []);
        }

        // Fetch locations
        const locResponse = await fetch(
          `http://localhost:8000/api/v1/locations?story_id=${params.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (locResponse.ok) {
          const data = await locResponse.json();
          setLocations(data.locations || []);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-amber-400 text-xl">Loading world builder...</div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-red-400 text-xl">Story not found</div>
      </div>
    );
  }

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "🌍" },
    { id: "characters", label: "Characters", icon: "👤" },
    { id: "locations", label: "Locations", icon: "🏰" },
    { id: "factions", label: "Factions", icon: "⚔️" },
    { id: "items", label: "Items", icon: "💎" },
    { id: "quests", label: "Quests", icon: "📜" },
  ];

  const playerCharacters = characters.filter((c) => !c.is_npc);
  const npcs = characters.filter((c) => c.is_npc);
  const rootLocations = locations.filter((l) => !l.parent_id);
  const childLocations = locations.filter((l) => l.parent_id);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-amber-900/30 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href={`/stories/${params.id}`}
                className="text-amber-400 hover:text-amber-300 mb-1 inline-block"
              >
                ← Back to Story
              </Link>
              <h1 className="text-2xl font-fantasy text-amber-400">
                World Builder: {story.title}
              </h1>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-t-lg flex items-center gap-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "bg-slate-800 text-amber-400 border-t border-x border-amber-900/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* World Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="fantasy-card text-center">
                <div className="text-3xl mb-2">👤</div>
                <div className="text-2xl font-bold text-amber-400">{characters.length}</div>
                <div className="text-slate-400 text-sm">Characters</div>
              </div>
              <div className="fantasy-card text-center">
                <div className="text-3xl mb-2">🏰</div>
                <div className="text-2xl font-bold text-amber-400">{locations.length}</div>
                <div className="text-slate-400 text-sm">Locations</div>
              </div>
              <div className="fantasy-card text-center">
                <div className="text-3xl mb-2">🎭</div>
                <div className="text-2xl font-bold text-amber-400">{npcs.length}</div>
                <div className="text-slate-400 text-sm">NPCs</div>
              </div>
              <div className="fantasy-card text-center">
                <div className="text-3xl mb-2">⚔️</div>
                <div className="text-2xl font-bold text-amber-400">
                  {story.world_config?.factions?.length || 0}
                </div>
                <div className="text-slate-400 text-sm">Factions</div>
              </div>
            </div>

            {/* World Description */}
            <div className="fantasy-card">
              <h2 className="text-xl font-fantasy text-amber-400 mb-4">World Overview</h2>
              {story.world_config?.name ? (
                <div>
                  <h3 className="text-lg text-amber-200 mb-2">{story.world_config.name}</h3>
                  <p className="text-slate-300 mb-4">
                    {story.world_config.description || "No description yet"}
                  </p>
                  <div className="text-sm text-slate-400">
                    <span className="text-amber-400">Theme:</span> {story.world_config.theme || "Fantasy"}
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 italic">
                  No world configuration yet. Edit your story to add world details.
                </p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href={`/stories/${params.id}/characters/create`}
                className="fantasy-card hover:border-amber-500/50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="text-4xl">➕👤</div>
                  <div>
                    <h3 className="text-lg font-fantasy text-amber-400 group-hover:text-amber-300">
                      Create Character
                    </h3>
                    <p className="text-slate-400 text-sm">Add a new hero or NPC to your world</p>
                  </div>
                </div>
              </Link>
              <Link
                href={`/stories/${params.id}/locations/create`}
                className="fantasy-card hover:border-amber-500/50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="text-4xl">➕🏰</div>
                  <div>
                    <h3 className="text-lg font-fantasy text-amber-400 group-hover:text-amber-300">
                      Create Location
                    </h3>
                    <p className="text-slate-400 text-sm">Add a new place to explore</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        )}

        {activeTab === "characters" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-fantasy text-amber-400">Characters</h2>
              <Link href={`/stories/${params.id}/characters/create`} className="btn-fantasy">
                Create Character
              </Link>
            </div>

            {/* Player Characters */}
            {playerCharacters.length > 0 && (
              <div>
                <h3 className="text-lg text-amber-200 mb-3">Player Characters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {playerCharacters.map((char) => (
                    <div key={char.id} className="fantasy-card">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center text-xl">
                          ⚔️
                        </div>
                        <div>
                          <h4 className="text-amber-400 font-fantasy">{char.name}</h4>
                          <p className="text-slate-400 text-sm">
                            {char.race} {char.character_class} (Lvl {char.level})
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NPCs */}
            {npcs.length > 0 && (
              <div>
                <h3 className="text-lg text-amber-200 mb-3">NPCs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {npcs.map((char) => (
                    <div key={char.id} className="fantasy-card">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center text-xl">
                          🎭
                        </div>
                        <div>
                          <h4 className="text-amber-400 font-fantasy">{char.name}</h4>
                          <p className="text-slate-400 text-sm">
                            {char.race} {char.character_class}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {characters.length === 0 && (
              <div className="fantasy-card text-center py-12">
                <div className="text-6xl mb-4">👤</div>
                <h3 className="text-xl font-fantasy text-amber-400 mb-2">No Characters Yet</h3>
                <p className="text-slate-400 mb-6">Create your first character to populate your world</p>
                <Link href={`/stories/${params.id}/characters/create`} className="btn-fantasy">
                  Create Character
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === "locations" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-fantasy text-amber-400">Locations</h2>
              <Link href={`/stories/${params.id}/locations/create`} className="btn-fantasy">
                Create Location
              </Link>
            </div>

            {locations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rootLocations.map((loc) => (
                  <div key={loc.id} className="fantasy-card">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center text-xl">
                        📍
                      </div>
                      <div>
                        <h4 className="text-amber-400 font-fantasy">{loc.name}</h4>
                        <p className="text-slate-400 text-sm">{loc.location_type}</p>
                      </div>
                    </div>
                    {childLocations.filter((c) => c.parent_id === loc.id).length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-700">
                        <p className="text-slate-500 text-xs mb-2">Contains:</p>
                        <div className="flex flex-wrap gap-1">
                          {childLocations
                            .filter((c) => c.parent_id === loc.id)
                            .map((child) => (
                              <span
                                key={child.id}
                                className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded"
                              >
                                {child.name}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="fantasy-card text-center py-12">
                <div className="text-6xl mb-4">🏰</div>
                <h3 className="text-xl font-fantasy text-amber-400 mb-2">No Locations Yet</h3>
                <p className="text-slate-400 mb-6">Create your first location to build your world</p>
                <Link href={`/stories/${params.id}/locations/create`} className="btn-fantasy">
                  Create Location
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === "factions" && (
          <div className="fantasy-card text-center py-12">
            <div className="text-6xl mb-4">⚔️</div>
            <h3 className="text-xl font-fantasy text-amber-400 mb-2">Factions</h3>
            <p className="text-slate-400 mb-6">
              Factions are coming soon! Create organizations, guilds, and political groups.
            </p>
          </div>
        )}

        {activeTab === "items" && (
          <div className="fantasy-card text-center py-12">
            <div className="text-6xl mb-4">💎</div>
            <h3 className="text-xl font-fantasy text-amber-400 mb-2">Items</h3>
            <p className="text-slate-400 mb-6">
              Items are coming soon! Create weapons, artifacts, and magical items.
            </p>
          </div>
        )}

        {activeTab === "quests" && (
          <div className="fantasy-card text-center py-12">
            <div className="text-6xl mb-4">📜</div>
            <h3 className="text-xl font-fantasy text-amber-400 mb-2">Quests</h3>
            <p className="text-slate-400 mb-6">
              Quests are coming soon! Create main quests, side quests, and story arcs.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
