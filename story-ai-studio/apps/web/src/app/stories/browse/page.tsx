"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface StorySummary {
  id: string;
  title: string;
  description: string;
  tags: string[];
  play_count: number;
  created_at: string;
  is_public: boolean;
}

interface StoryListResponse {
  stories: StorySummary[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export default function BrowseStoriesPage() {
  const router = useRouter();
  const [stories, setStories] = useState<StorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchStories();
  }, [page]);

  const fetchStories = async (searchTerm?: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      const params = new URLSearchParams({
        page: page.toString(),
        page_size: "12",
        public_only: "true",
      });

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const response = await fetch(
        `http://localhost:8000/api/v1/stories/public?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch stories");
      }

      const data: StoryListResponse = await response.json();
      setStories(data.stories);
      setTotalPages(data.total_pages);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchStories(search);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 dark:from-stone-900 dark:to-stone-800">
      {/* Header */}
      <header className="bg-amber-800 dark:bg-stone-900 text-amber-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 hover:text-amber-200 transition-colors"
          >
            <span> tavern</span>
          </Link>
          <h1 className="text-2xl font-serif">Browse Worlds</h1>
          <div className="w-24" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for adventures..."
                className="w-full px-4 py-3 rounded-lg border-2 border-amber-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-amber-50 focus:border-amber-500 focus:outline-none shadow-md"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-md transition-colors font-semibold"
            >
              Search
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent" />
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4"> empty</div>
            <h2 className="text-xl font-serif text-stone-600 dark:text-amber-200 mb-2">
              No Worlds Found
            </h2>
            <p className="text-stone-500 dark:text-amber-300">
              Be the first to create a public adventure!
            </p>
            <Link
              href="/stories/create"
              className="mt-4 inline-block px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-md transition-colors"
            >
              Create a Story
            </Link>
          </div>
        ) : (
          <>
            {/* Stories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.map((story) => (
                <Link
                  key={story.id}
                  href={`/stories/${story.id}`}
                  className="group block bg-white dark:bg-stone-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden border-2 border-amber-200 dark:border-stone-700 hover:border-amber-400 dark:hover:border-amber-600"
                >
                  <div className="p-6">
                    <h3 className="text-xl font-serif font-bold text-stone-800 dark:text-amber-50 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors mb-2">
                      {story.title}
                    </h3>
                    <p className="text-stone-600 dark:text-amber-200 text-sm line-clamp-3 mb-4">
                      {story.description || "No description provided"}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {story.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs bg-amber-100 dark:bg-stone-700 text-amber-700 dark:text-amber-300 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                      {story.tags.length > 3 && (
                        <span className="px-2 py-1 text-xs bg-amber-100 dark:bg-stone-700 text-amber-700 dark:text-amber-300 rounded-full">
                          +{story.tags.length - 3}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm text-stone-500 dark:text-amber-300">
                      <span> plays</span>
                      <span> {formatDate(story.created_at)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-stone-300 dark:disabled:bg-stone-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-stone-600 dark:text-amber-200">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-stone-300 dark:disabled:bg-stone-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}