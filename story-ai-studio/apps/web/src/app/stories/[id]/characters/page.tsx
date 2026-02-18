"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Character {
  id: string;
  name: string;
  description: string | null;
  character_type: "player" | "npc";
  race: string | null;
  character_class: string | null;
  level: number;
  stats: Record<string, number> | null;
  backstory: string | null;
  portrait_url: string | null;
  is_alive: boolean;
  created_at: string;
}

export default function CharactersPage() {
  const params = useParams();
  const router = useRouter();
  const storyId = params.id as string;

  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "player" | "npc">("all");

  useEffect(() => {
    fetchCharacters();
  }, [storyId]);

  const fetchCharacters = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/auth/login");
        return;
      }

      const response = await fetch(
        `http://localhost:8000/api/v1/stories/${storyId}/characters`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch characters");
      }

      const data = await response.json();
      setCharacters(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCharacters = characters.filter((char) => {
    if (filter === "all") return true;
    return char.character_type === filter;
  });

  const getStatModifier = (stat: number) => {
    const mod = Math.floor((stat - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
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
            <span>Characters</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-3xl text-fantasy-gold">
                👤 Characters
              </h1>
              <p className="text-fantasy-text-secondary mt-1">
                Heroes, villains, and everyone in between
              </p>
            </div>
            <Link href={`/stories/${storyId}/characters/create`} className="btn-fantasy">
              ✨ Create Character
            </Link>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="border-b border-fantasy-border-dark bg-fantasy-bg-secondary/50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex gap-2">
            {(["all", "player", "npc"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-lg font-ui text-sm transition-all ${
                  filter === type
                    ? "bg-fantasy-gold text-fantasy-bg-primary"
                    : "bg-fantasy-bg-secondary text-fantasy-text-light hover:bg-fantasy-bg-tertiary"
                }`}
              >
                {type === "all" && "🌐 All"}
                {type === "player" && "⚔️ Players"}
                {type === "npc" && "🎭 NPCs"}
              </button>
            ))}
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
            <p className="text-fantasy-text-secondary">Loading characters...</p>
          </div>
        ) : filteredCharacters.length === 0 ? (
          <div className="card-parchment text-center py-12">
            <div className="text-6xl mb-4">👤</div>
            <h2 className="font-heading text-xl text-fantasy-text-primary mb-2">
              No Characters Found
            </h2>
            <p className="text-fantasy-text-secondary mb-6">
              {filter !== "all"
                ? `No ${filter} characters yet`
                : "Create your first character to begin your adventure"}
            </p>
            <Link href={`/stories/${storyId}/characters/create`} className="btn-fantasy">
              ✨ Create Character
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCharacters.map((character) => (
              <div
                key={character.id}
                className="fantasy-card hover:scale-[1.02] transition-transform"
              >
                {/* Character Type Badge */}
                <div className="absolute top-4 right-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-ui ${
                      character.character_type === "player"
                        ? "bg-fantasy-gold text-fantasy-bg-primary"
                        : "bg-fantasy-bg-secondary text-fantasy-text-light"
                    }`}
                  >
                    {character.character_type === "player" ? "⚔️ Player" : "🎭 NPC"}
                  </span>
                </div>

                {/* Portrait Placeholder */}
                <div className="w-16 h-16 rounded-full bg-fantasy-bg-secondary border-2 border-fantasy-border-gold flex items-center justify-center text-2xl mb-4">
                  {character.portrait_url ? (
                    <img
                      src={character.portrait_url}
                      alt={character.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    "👤"
                  )}
                </div>

                {/* Name & Class */}
                <h3 className="font-heading text-lg text-fantasy-gold mb-1">
                  {character.name}
                </h3>
                <p className="text-fantasy-text-secondary text-sm mb-3">
                  {character.race} {character.character_class} (Level {character.level})
                </p>

                {/* Description */}
                <p className="text-fantasy-text-light text-sm line-clamp-2 mb-4">
                  {character.description || "No description provided"}
                </p>

                {/* Stats Preview */}
                {character.stats && (
                  <div className="grid grid-cols-3 gap-2 text-xs mb-4">
                    {Object.entries(character.stats)
                      .slice(0, 6)
                      .map(([stat, value]) => (
                        <div
                          key={stat}
                          className="bg-fantasy-bg-secondary/50 rounded px-2 py-1 text-center"
                        >
                          <div className="text-fantasy-text-secondary uppercase">
                            {stat.slice(0, 3)}
                          </div>
                          <div className="text-fantasy-text-light font-bold">
                            {value} ({getStatModifier(value)})
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                {/* Status */}
                <div className="flex items-center justify-between text-xs border-t border-fantasy-border-gold/20 pt-3">
                  <span
                    className={`flex items-center gap-1 ${
                      character.is_alive ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {character.is_alive ? "💚 Alive" : "💀 Deceased"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
