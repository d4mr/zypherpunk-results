import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { SearchableProject, SortOption } from "../lib/search";
import {
  createFuseInstance,
  sortProjects,
  filterProjects,
  getAllSponsors,
  getAllTracks,
} from "../lib/search";

interface Props {
  projects: SearchableProject[];
  onResults: (results: SearchableProject[]) => void;
}

export function SearchFilter({ projects, onResults }: Props) {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("prize-desc");
  const [selectedSponsors, setSelectedSponsors] = useState<string[]>([]);
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fuse = useMemo(() => createFuseInstance(projects), [projects]);
  const allSponsors = useMemo(() => getAllSponsors(projects), [projects]);
  const allTracks = useMemo(() => getAllTracks(projects), [projects]);

  // Keyboard shortcut for search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        inputRef.current?.blur();
        setQuery("");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Apply search, filters, and sorting
  useEffect(() => {
    let results: SearchableProject[];

    // Text search
    if (query.trim()) {
      const searchResults = fuse.search(query);
      results = searchResults.map((r) => r.item);
    } else {
      results = [...projects];
    }

    // Apply filters
    results = filterProjects(results, {
      sponsors: selectedSponsors.length ? selectedSponsors : undefined,
      tracks: selectedTracks.length ? selectedTracks : undefined,
    });

    // Apply sorting
    results = sortProjects(results, sortBy);

    onResults(results);
  }, [query, sortBy, selectedSponsors, selectedTracks, projects, fuse, onResults]);

  const toggleSponsor = useCallback((sponsor: string) => {
    setSelectedSponsors((prev) =>
      prev.includes(sponsor)
        ? prev.filter((s) => s !== sponsor)
        : [...prev, sponsor]
    );
  }, []);

  const toggleTrack = useCallback((track: string) => {
    setSelectedTracks((prev) =>
      prev.includes(track)
        ? prev.filter((t) => t !== track)
        : [...prev, track]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedSponsors([]);
    setSelectedTracks([]);
    setQuery("");
  }, []);

  const activeFilterCount = selectedSponsors.length + selectedTracks.length;

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="group relative flex-1">
          {/* Glow effect on focus */}
          <div className="pointer-events-none absolute -inset-0.5 rounded-xl bg-gradient-to-r from-accent/20 to-gold/20 opacity-0 blur transition-opacity group-focus-within:opacity-100" />
          
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <svg
                className="h-5 w-5 text-gray-500 transition-colors group-focus-within:text-accent"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects, builders, sponsors..."
              className="w-full rounded-xl border border-gray-800 bg-gray-900/80 py-3.5 pl-12 pr-20 text-white placeholder-gray-600 backdrop-blur-sm transition-all focus:border-gray-700 focus:bg-gray-900 focus:outline-none"
            />
            <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-4">
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="rounded p-1 text-gray-500 transition-colors hover:bg-gray-800 hover:text-gray-300"
                >
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              )}
              <kbd className="hidden rounded-md border border-gray-700/50 bg-gray-800/50 px-2 py-1 font-mono text-[10px] text-gray-500 sm:inline-block">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        {/* Sort & Filter controls */}
        <div className="flex items-stretch rounded-lg border border-gray-800 bg-gray-900">
          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="appearance-none border-none bg-transparent py-3 pl-4 pr-8 text-sm text-white focus:outline-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%23737373' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 12px center",
            }}
          >
            <option value="prize-desc">Highest Prize</option>
            <option value="prize-asc">Lowest Prize</option>
            <option value="awards-desc">Most Awards</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
          </select>

          {/* Divider */}
          <div className="my-2 w-px bg-gray-800" />

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 text-sm transition-colors ${
              activeFilterCount > 0
                ? "text-accent"
                : showFilters
                  ? "text-white"
                  : "text-gray-400 hover:text-white"
            }`}
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 01.628.74v2.288a2.25 2.25 0 01-.659 1.59l-4.682 4.683a2.25 2.25 0 00-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 018 18.25v-5.757a2.25 2.25 0 00-.659-1.591L2.659 6.22A2.25 2.25 0 012 4.629V2.34a.75.75 0 01.628-.74z"
                clipRule="evenodd"
              />
            </svg>
            {activeFilterCount > 0 ? (
              <span className="font-mono text-xs">{activeFilterCount}</span>
            ) : null}
          </button>
        </div>
      </div>

      {/* Filter panels */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-medium text-white">Filters</h3>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-400 transition-colors hover:text-white"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Sponsors */}
                <div>
                  <h4 className="mb-3 text-sm font-medium text-gray-400">
                    Sponsors ({allSponsors.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {allSponsors.map((sponsor) => (
                      <button
                        key={sponsor}
                        onClick={() => toggleSponsor(sponsor)}
                        className={`rounded-full border px-3 py-1.5 text-xs transition-all ${
                          selectedSponsors.includes(sponsor)
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300"
                        }`}
                      >
                        {sponsor}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tracks */}
                <div>
                  <h4 className="mb-3 text-sm font-medium text-gray-400">
                    Tracks ({allTracks.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {allTracks.map((track) => (
                      <button
                        key={track}
                        onClick={() => toggleTrack(track)}
                        className={`rounded-full border px-3 py-1.5 text-xs transition-all ${
                          selectedTracks.includes(track)
                            ? "border-gold bg-gold/10 text-gold"
                            : "border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300"
                        }`}
                      >
                        {track}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active filters display */}
      {activeFilterCount > 0 && !showFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">Active filters:</span>
          {selectedSponsors.map((sponsor) => (
            <button
              key={sponsor}
              onClick={() => toggleSponsor(sponsor)}
              className="flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-xs text-accent transition-colors hover:bg-accent/20"
            >
              {sponsor}
              <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          ))}
          {selectedTracks.map((track) => (
            <button
              key={track}
              onClick={() => toggleTrack(track)}
              className="flex items-center gap-1 rounded-full border border-gold/30 bg-gold/10 px-2.5 py-1 text-xs text-gold transition-colors hover:bg-gold/20"
            >
              {track}
              <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
