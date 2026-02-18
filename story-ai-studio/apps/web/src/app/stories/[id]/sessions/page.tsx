"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Session {
  id: string;
  story_id: string;
  host_id: string;
  title: string | null;
  status: string;
  max_players: number;
  is_public: boolean;
  turn_count: number;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  waiting: "bg-yellow-600",
  active: "bg-green-600",
  paused: "bg-blue-600",
  completed: "bg-slate-600",
  archived: "bg-purple-600",
};

const STATUS_LABELS: Record<string, string> = {
  waiting: "Waiting",
  active: "Active",
  paused: "Paused",
  completed: "Completed",
  archived: "Archived",
};

export default function SessionsPage() {
  const params = useParams();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.push("/auth/login");
          return;
        }

        const response = await fetch(
          `http://localhost:8000/api/v1/sessions?story_id=${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load sessions");
        }

        const data = await response.json();
        setSessions(data.sessions || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchSessions();
    }
  }, [params.id, router]);

  const handleCreateSession = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      const response = await fetch("http://localhost:8000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          story_id: params.id,
          title: "New Game Session",
          is_public: false,
          max_players: 4,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create session");
      }

      const data = await response.json();
      router.push(`/stories/${params.id}/sessions/${data.id}/play`);
    } catch (err) {
      console.error("Failed to create session:", err);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm("Are you sure you want to delete this session?")) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `http://localhost:8000/api/v1/sessions/${sessionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setSessions(sessions.filter((s) => s.id !== sessionId));
      }
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-amber-400 text-xl">Loading sessions...</div>
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
            <h1 className="text-4xl font-fantasy text-amber-400">Game Sessions</h1>
            <p className="text-slate-400 mt-2">
              Start a new adventure or continue an existing one
            </p>
          </div>
          <button onClick={handleCreateSession} className="btn-fantasy">
            Start New Session
          </button>
        </div>

        {/* Sessions List */}
        {sessions.length === 0 ? (
          <div className="fantasy-card text-center py-12">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-xl font-fantasy text-amber-400 mb-2">
              No Sessions Yet
            </h3>
            <p className="text-slate-400 mb-6">
              Start your first game session to begin playing!
            </p>
            <button onClick={handleCreateSession} className="btn-fantasy">
              Start Your First Session
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="fantasy-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Status Indicator */}
                    <div
                      className={`w-3 h-3 rounded-full ${
                        STATUS_COLORS[session.status] || "bg-slate-600"
                      }`}
                    />

                    {/* Info */}
                    <div>
                      <h3 className="text-lg font-fantasy text-amber-400">
                        {session.title || "Untitled Session"}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span
                          className={`px-2 py-0.5 rounded text-xs ${
                            STATUS_COLORS[session.status] || "bg-slate-600"
                          }`}
                        >
                          {STATUS_LABELS[session.status] || session.status}
                        </span>
                        <span>👥 {session.max_players} players max</span>
                        <span>🎲 {session.turn_count} turns</span>
                        {session.is_public && (
                          <span className="text-green-400">🌍 Public</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {session.status === "waiting" && (
                      <Link
                        href={`/stories/${params.id}/sessions/${session.id}/play`}
                        className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
                      >
                        Start Playing
                      </Link>
                    )}
                    {(session.status === "active" || session.status === "paused") && (
                      <Link
                        href={`/stories/${params.id}/sessions/${session.id}/play`}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors"
                      >
                        Continue
                      </Link>
                    )}
                    {session.status === "completed" && (
                      <Link
                        href={`/stories/${params.id}/sessions/${session.id}`}
                        className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
                      >
                        View Summary
                      </Link>
                    )}
                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      className="px-4 py-2 bg-red-900/50 hover:bg-red-800 text-red-400 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-700 text-sm text-slate-500">
                  Created {new Date(session.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
