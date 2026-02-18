"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Character {
  id: string;
  story_id: string;
  name: string;
  description: string;
  race: string;
  character_class: string;
  level: number;
  is_npc: boolean;
  portrait_url: string | null;
}

export default function CharactersPage() {
  const params = useParams();
  const router = useRouter();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.push("/auth/login");
          return;
        }

        const response = await fetch(
          `http://localhost:8000/api/v1/characters?story_id=${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load characters");
        }

        const data = await response.json();
        setCharacters(data.characters || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchCharacters();
    }
  }, [params.id, router]);

  const handleDeleteCharacter = async (characterId: string) => {
    if (!confirm("Are you sure you want to delete this character?")) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `http://localhost:8000/api/v1/characters/${characterId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setCharacters(characters.filter((c) => c.id !== characterId));
      }
    } catch (err) {
      console.error("Failed to delete character:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-amber-400 text-xl">Loading characters...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href={`/stories/${params.id}`}
              className="text-amber-400 hover:text-amber-300 mb-2 inline-block"
            >
              ← Back to Story
            </Link>
            <h1 className="text-4xl font-fantasy text-amber-400">Characters</h1>
            <p className="text-slate-400 mt-2">
              Manage the characters in your story
            </p>
          </div>
          <Link
            href={`/stories/${params.id}/characters/create`}
            className="btn-fantasy"
          >
            Create Character
          </Link>
        </div>

        {/* Characters Grid */}
        {characters.length === 0 ? (
          <div className="fantasy-card text-center py-12">
            <div className="text-6xl mb-4">👤</div>
            <h3 className="text-xl font-fantasy text-amber-400 mb-2">
              No Characters Yet
            </h3>
            <p className="text-slate-400 mb-6">
              Create your first character to begin populating your story world.
            </p>
            <Link href={`/stories/${params.id}/characters/create`} className="btn-fantasy">
              Create Your First Character
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((character) => (
              <div key={character.id} className="fantasy-card group">
                <div className="flex items-start gap-4">
                  {/* Portrait */}
                  <div className="w-16 h-16 rounded-lg bg-slate-700 flex items-center justify-center text-2xl overflow-hidden">
                    {character.portrait_url ? (
                      <img
                        src={character.portrait_url}
                        alt={character.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{character.is_npc ? "🎭" : "⚔️"}</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-fantasy text-amber-400">
                        {character.name}
                      </h3>
                      {character.is_npc && (
                        <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded">
                          NPC
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm">
                      {character.race} {character.character_class} (Lvl {character.level})
                    </p>
                    <p className="text-slate-500 text-sm mt-1 line-clamp-2">
                      {character.description || "No description"}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700">
                  <Link
                    href={`/stories/${params.id}/characters/${character.id}`}
                    className="flex-1 text-center py-2 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                  >
                    View
                  </Link>
                  <Link
                    href={`/stories/${params.id}/characters/${character.id}/edit`}
                    className="flex-1 text-center py-2 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteCharacter(character.id)}
                    className="px-4 py-2 rounded bg-red-900/50 hover:bg-red-800 text-red-400 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
