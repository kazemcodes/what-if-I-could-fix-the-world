"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Session {
  id: string;
  story_id: string;
  title: string | null;
  status: string;
  current_state: Record<string, unknown> | null;
  turn_count: number;
}

interface Event {
  id: string;
  event_type: string;
  content: string;
  character_id: string | null;
  player_id: string | null;
  is_ai_generated: boolean;
  created_at: string;
}

export default function SessionPlayPage() {
  const params = useParams();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionInput, setActionInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const eventsEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    eventsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [events]);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.push("/auth/login");
          return;
        }

        // Fetch session details
        const sessionResponse = await fetch(
          `http://localhost:8000/api/v1/sessions/${params.sessionId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!sessionResponse.ok) {
          throw new Error("Failed to load session");
        }

        const sessionData = await sessionResponse.json();
        setSession(sessionData);

        // If session is waiting, start it
        if (sessionData.status === "waiting") {
          await fetch(
            `http://localhost:8000/api/v1/sessions/${params.sessionId}/start`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }

        // Fetch events
        const eventsResponse = await fetch(
          `http://localhost:8000/api/v1/sessions/${params.sessionId}/events`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          setEvents(eventsData.events || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.sessionId) {
      fetchSession();
    }
  }, [params.sessionId, router]);

  const handleSubmitAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionInput.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const actionText = actionInput.trim();
    setActionInput("");

    // Add user action to events immediately for better UX
    const tempUserEvent: Event = {
      id: `temp-${Date.now()}`,
      event_type: "action",
      content: actionText,
      character_id: null,
      player_id: null,
      is_ai_generated: false,
      created_at: new Date().toISOString(),
    };
    setEvents((prev) => [...prev, tempUserEvent]);

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `http://localhost:8000/api/v1/sessions/${params.sessionId}/action`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            action: actionText,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit action");
      }

      const data = await response.json();

      // Remove temp event and add real events
      setEvents((prev) => prev.filter((e) => e.id !== tempUserEvent.id));

      // Add the AI response as an event
      if (data.narrative) {
        const aiEvent: Event = {
          id: `ai-${Date.now()}`,
          event_type: "narration",
          content: data.narrative,
          character_id: null,
          player_id: null,
          is_ai_generated: true,
          created_at: new Date().toISOString(),
        };
        setEvents((prev) => [...prev, aiEvent]);
      }
    } catch (err) {
      console.error("Failed to submit action:", err);
      // Remove temp event on error
      setEvents((prev) => prev.filter((e) => e.id !== tempUserEvent.id));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEndSession = async () => {
    if (!confirm("Are you sure you want to end this session?")) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `http://localhost:8000/api/v1/sessions/${params.sessionId}/end`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        router.push(`/stories/${params.id}/sessions`);
      }
    } catch (err) {
      console.error("Failed to end session:", err);
    }
  };

  const getEventStyle = (event: Event) => {
    switch (event.event_type) {
      case "narration":
        return "bg-slate-800/50 border-l-4 border-amber-600";
      case "dialogue":
        return "bg-blue-900/30 border-l-4 border-blue-500";
      case "action":
        return "bg-green-900/30 border-l-4 border-green-500";
      case "combat":
        return "bg-red-900/30 border-l-4 border-red-500";
      case "discovery":
        return "bg-purple-900/30 border-l-4 border-purple-500";
      case "system":
        return "bg-slate-700/50 border-l-4 border-slate-500";
      default:
        return "bg-slate-800/50 border-l-4 border-slate-600";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-amber-400 text-xl">Loading adventure...</div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">{error || "Session not found"}</div>
          <Link href={`/stories/${params.id}/sessions`} className="text-amber-400 hover:text-amber-300">
            ← Back to Sessions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col">
      {/* Header */}
      <header className="border-b border-amber-900/30 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/stories/${params.id}/sessions`}
              className="text-amber-400 hover:text-amber-300"
            >
              ← Leave
            </Link>
            <div>
              <h1 className="text-lg font-fantasy text-amber-400">
                {session.title || "Game Session"}
              </h1>
              <div className="text-sm text-slate-400">
                Turn {session.turn_count} • {session.status}
              </div>
            </div>
          </div>
          <button
            onClick={handleEndSession}
            className="px-4 py-2 bg-red-900/50 hover:bg-red-800 text-red-400 rounded-lg transition-colors text-sm"
          >
            End Session
          </button>
        </div>
      </header>

      {/* Events Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          {/* Welcome message if no events */}
          {events.length === 0 && (
            <div className="fantasy-card text-center py-8">
              <div className="text-4xl mb-4">⚔️</div>
              <h2 className="text-xl font-fantasy text-amber-400 mb-2">
                Your Adventure Begins
              </h2>
              <p className="text-slate-400">
                Describe what you want to do below to start your journey.
              </p>
            </div>
          )}

          {/* Events */}
          {events.map((event) => (
            <div
              key={event.id}
              className={`p-4 rounded-lg ${getEventStyle(event)}`}
            >
              <div className="flex items-start justify-between mb-1">
                <span className="text-xs text-slate-500 uppercase">
                  {event.event_type}
                  {event.is_ai_generated && " • AI Generated"}
                </span>
                <span className="text-xs text-slate-500">
                  {new Date(event.created_at).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-slate-200 whitespace-pre-wrap">{event.content}</p>
            </div>
          ))}

          {/* Typing indicator */}
          {isSubmitting && (
            <div className="p-4 rounded-lg bg-slate-800/50 border-l-4 border-amber-600">
              <div className="flex items-center gap-2 text-slate-400">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span>The story unfolds...</span>
              </div>
            </div>
          )}

          <div ref={eventsEndRef} />
        </div>
      </main>

      {/* Action Input */}
      <footer className="border-t border-amber-900/30 bg-slate-900/80 backdrop-blur-sm sticky bottom-0">
        <form onSubmit={handleSubmitAction} className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={actionInput}
              onChange={(e) => setActionInput(e.target.value)}
              disabled={isSubmitting}
              placeholder="What do you do?"
              className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-amber-500 focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!actionInput.trim() || isSubmitting}
              className="btn-fantasy disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Tip: Be descriptive! Instead of "I attack", try "I draw my sword and lunge at the goblin"
          </div>
        </form>
      </footer>
    </div>
  );
}
