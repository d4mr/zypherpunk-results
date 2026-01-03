import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ProjectCard } from "./ProjectCard";
import { SearchFilter } from "./SearchFilter";
import type { Project } from "../lib/devfolio";
import type { ProjectWithAwards } from "../lib/awards";
import { buildSearchIndex, type SearchableProject } from "../lib/search";

interface Props {
  projects: Array<{
    devfolio: Project;
    awards: ProjectWithAwards | undefined;
  }>;
}

export function ProjectGrid({ projects }: Props) {
  const searchableProjects = buildSearchIndex(projects);
  const [filteredProjects, setFilteredProjects] =
    useState<SearchableProject[]>(searchableProjects);

  const handleResults = useCallback((results: SearchableProject[]) => {
    setFilteredProjects(results);
  }, []);

  return (
    <div className="space-y-8">
      <SearchFilter projects={searchableProjects} onResults={handleResults} />

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {filteredProjects.length === searchableProjects.length ? (
            <>Showing all {filteredProjects.length} projects</>
          ) : (
            <>
              Showing {filteredProjects.length} of {searchableProjects.length}{" "}
              projects
            </>
          )}
        </p>
      </div>

      {/* Grid */}
      <AnimatePresence mode="wait">
        {filteredProjects.length > 0 ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filteredProjects.map((p, i) => (
              <ProjectCard key={p.slug} project={p} index={i} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center rounded-lg border border-gray-800 bg-gray-900/50 py-16"
          >
            <svg
              className="mb-4 h-12 w-12 text-gray-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <p className="text-lg font-medium text-gray-400">No projects found</p>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filters
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
