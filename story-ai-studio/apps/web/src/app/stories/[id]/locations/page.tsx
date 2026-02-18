"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Location {
  id: string;
  story_id: string;
  name: string;
  description: string;
  location_type: string;
  parent_id: string | null;
  image_url: string | null;
  is_visible: boolean;
}

interface LocationTree {
  id: string;
  name: string;
  location_type: string;
  children: LocationTree[];
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

export default function LocationsPage() {
  const params = useParams();
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationTree, setLocationTree] = useState<LocationTree[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "tree">("grid");

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.push("/auth/login");
          return;
        }

        // Fetch locations list
        const listResponse = await fetch(
          `http://localhost:8000/api/v1/locations?story_id=${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!listResponse.ok) {
          throw new Error("Failed to load locations");
        }

        const listData = await listResponse.json();
        setLocations(listData.locations || []);

        // Fetch location tree
        const treeResponse = await fetch(
          `http://localhost:8000/api/v1/locations/tree?story_id=${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (treeResponse.ok) {
          const treeData = await treeResponse.json();
          setLocationTree(treeData || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchLocations();
    }
  }, [params.id, router]);

  const handleDeleteLocation = async (locationId: string) => {
    if (!confirm("Are you sure you want to delete this location?")) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `http://localhost:8000/api/v1/locations/${locationId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setLocations(locations.filter((l) => l.id !== locationId));
      }
    } catch (err) {
      console.error("Failed to delete location:", err);
    }
  };

  const getLocationTypeInfo = (type: string) => {
    return LOCATION_TYPES.find((t) => t.value === type) || { label: type, icon: "📍" };
  };

  const renderTreeItem = (location: LocationTree, depth: number = 0) => (
    <div key={location.id} className="ml-4">
      <div className="flex items-center gap-2 py-2 px-3 hover:bg-slate-700/50 rounded-lg group">
        <span className="text-lg">{getLocationTypeInfo(location.location_type).icon}</span>
        <span className="text-slate-200">{location.name}</span>
        <span className="text-slate-500 text-sm">({location.location_type})</span>
        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
          <Link
            href={`/stories/${params.id}/locations/${location.id}`}
            className="text-amber-400 hover:text-amber-300 text-sm"
          >
            View
          </Link>
          <Link
            href={`/stories/${params.id}/locations/${location.id}/edit`}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            Edit
          </Link>
        </div>
      </div>
      {location.children && location.children.length > 0 && (
        <div className="border-l border-slate-700 ml-3">
          {location.children.map((child) => renderTreeItem(child, depth + 1))}
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-amber-400 text-xl">Loading locations...</div>
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
            <h1 className="text-4xl font-fantasy text-amber-400">Locations</h1>
            <p className="text-slate-400 mt-2">
              Build the world of your story with locations
            </p>
          </div>
          <div className="flex gap-4">
            <div className="flex bg-slate-700 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-2 ${viewMode === "grid" ? "bg-amber-600 text-white" : "text-slate-300 hover:bg-slate-600"}`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode("tree")}
                className={`px-4 py-2 ${viewMode === "tree" ? "bg-amber-600 text-white" : "text-slate-300 hover:bg-slate-600"}`}
              >
                Tree
              </button>
            </div>
            <Link href={`/stories/${params.id}/locations/create`} className="btn-fantasy">
              Create Location
            </Link>
          </div>
        </div>

        {/* Locations */}
        {locations.length === 0 ? (
          <div className="fantasy-card text-center py-12">
            <div className="text-6xl mb-4">🗺️</div>
            <h3 className="text-xl font-fantasy text-amber-400 mb-2">
              No Locations Yet
            </h3>
            <p className="text-slate-400 mb-6">
              Start building your world by creating the first location.
            </p>
            <Link href={`/stories/${params.id}/locations/create`} className="btn-fantasy">
              Create Your First Location
            </Link>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {locations.map((location) => {
              const typeInfo = getLocationTypeInfo(location.location_type);
              return (
                <div key={location.id} className="fantasy-card group">
                  <div className="flex items-start gap-4">
                    {/* Icon/Image */}
                    <div className="w-14 h-14 rounded-lg bg-slate-700 flex items-center justify-center text-2xl overflow-hidden">
                      {location.image_url ? (
                        <img
                          src={location.image_url}
                          alt={location.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{typeInfo.icon}</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <h3 className="text-lg font-fantasy text-amber-400">
                        {location.name}
                      </h3>
                      <p className="text-slate-400 text-sm">{typeInfo.label}</p>
                      <p className="text-slate-500 text-sm mt-1 line-clamp-2">
                        {location.description || "No description"}
                      </p>
                      {!location.is_visible && (
                        <span className="text-xs bg-slate-600 text-slate-300 px-2 py-0.5 rounded mt-1 inline-block">
                          Hidden
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700">
                    <Link
                      href={`/stories/${params.id}/locations/${location.id}`}
                      className="flex-1 text-center py-2 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                    >
                      View
                    </Link>
                    <Link
                      href={`/stories/${params.id}/locations/${location.id}/edit`}
                      className="flex-1 text-center py-2 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteLocation(location.id)}
                      className="px-4 py-2 rounded bg-red-900/50 hover:bg-red-800 text-red-400 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="fantasy-card">
            <h2 className="text-xl font-fantasy text-amber-400 mb-4">Location Hierarchy</h2>
            <div className="space-y-1">
              {locationTree.length > 0 ? (
                locationTree.map((loc) => renderTreeItem(loc))
              ) : (
                <p className="text-slate-400">No locations to display</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
