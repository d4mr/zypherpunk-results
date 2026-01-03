import Fuse from "fuse.js";
import type { Project } from "./devfolio";
import type { ProjectWithAwards } from "./awards";

export interface SearchableProject {
  // Core identifiers
  slug: string;
  name: string;
  tagline: string;
  
  // Searchable text
  builderNames: string[];
  builderUsernames: string[];
  hashtags: string[];
  
  // Award data for filtering
  sponsors: string[];
  tracks: string[];
  totalUSD: number;
  awardCount: number;
  
  // Full data references
  devfolio: Project;
  awards: ProjectWithAwards | undefined;
}

export function buildSearchIndex(
  projects: Array<{ devfolio: Project; awards: ProjectWithAwards | undefined }>
): SearchableProject[] {
  return projects.map(({ devfolio, awards }) => {
    const builderNames = devfolio.builders?.map(
      (b) => `${b.first_name || ""} ${b.last_name || ""}`.trim()
    ).filter(Boolean) || [];
    
    const builderUsernames = devfolio.builders?.map((b) => b.username) || [];
    
    const hashtags = devfolio.hashtags?.map((h) => h.hashtag.name) || [];
    
    const sponsors = [...new Set(awards?.awards.map((a) => a.sponsor) || [])];
    
    const tracks = [...new Set(
      awards?.awards.map((a) => a.track).filter(Boolean) as string[]
    )];

    return {
      slug: devfolio.slug,
      name: devfolio.name,
      tagline: devfolio.tagline || "",
      builderNames,
      builderUsernames,
      hashtags,
      sponsors,
      tracks,
      totalUSD: awards?.totalUSD || 0,
      awardCount: awards?.awards.length || 0,
      devfolio,
      awards,
    };
  });
}

export function createFuseInstance(projects: SearchableProject[]) {
  return new Fuse(projects, {
    keys: [
      { name: "name", weight: 2 },
      { name: "tagline", weight: 1 },
      { name: "builderNames", weight: 1.5 },
      { name: "builderUsernames", weight: 1.5 },
      { name: "hashtags", weight: 1 },
      { name: "sponsors", weight: 1.2 },
      { name: "tracks", weight: 1.2 },
    ],
    threshold: 0.3,
    ignoreLocation: true,
    includeScore: true,
    includeMatches: true,
  });
}

export type SortOption = 
  | "prize-desc" 
  | "prize-asc" 
  | "awards-desc" 
  | "name-asc" 
  | "name-desc";

export function sortProjects(
  projects: SearchableProject[],
  sortBy: SortOption
): SearchableProject[] {
  const sorted = [...projects];
  
  switch (sortBy) {
    case "prize-desc":
      return sorted.sort((a, b) => b.totalUSD - a.totalUSD);
    case "prize-asc":
      return sorted.sort((a, b) => a.totalUSD - b.totalUSD);
    case "awards-desc":
      return sorted.sort((a, b) => b.awardCount - a.awardCount);
    case "name-asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "name-desc":
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    default:
      return sorted;
  }
}

export function filterProjects(
  projects: SearchableProject[],
  filters: {
    sponsors?: string[];
    tracks?: string[];
    minPrize?: number;
    maxPrize?: number;
  }
): SearchableProject[] {
  return projects.filter((p) => {
    // Sponsor filter
    if (filters.sponsors?.length) {
      const hasMatchingSponsor = filters.sponsors.some((s) =>
        p.sponsors.includes(s)
      );
      if (!hasMatchingSponsor) return false;
    }

    // Track filter
    if (filters.tracks?.length) {
      const hasMatchingTrack = filters.tracks.some((t) =>
        p.tracks.includes(t)
      );
      if (!hasMatchingTrack) return false;
    }

    // Prize range filter
    if (filters.minPrize !== undefined && p.totalUSD < filters.minPrize) {
      return false;
    }
    if (filters.maxPrize !== undefined && p.totalUSD > filters.maxPrize) {
      return false;
    }

    return true;
  });
}

export function getAllSponsors(projects: SearchableProject[]): string[] {
  const sponsors = new Set<string>();
  projects.forEach((p) => p.sponsors.forEach((s) => sponsors.add(s)));
  return Array.from(sponsors).sort();
}

export function getAllTracks(projects: SearchableProject[]): string[] {
  const tracks = new Set<string>();
  projects.forEach((p) => p.tracks.forEach((t) => tracks.add(t)));
  return Array.from(tracks).sort();
}

export function getAllHashtags(projects: SearchableProject[]): string[] {
  const hashtags = new Set<string>();
  projects.forEach((p) => p.hashtags.forEach((h) => hashtags.add(h)));
  return Array.from(hashtags).sort();
}
