// Award data from our extracted results
import projectsData from "../../data/projects.json";

export interface ProjectAward {
  sponsor: string;
  track?: string;
  amount: string;
}

export interface ProjectWithAwards {
  name: string;
  url: string;
  awards: ProjectAward[];
  totalUSD: number;
  otherPrizes: string[];
}

export interface AwardsData {
  meta: {
    totalProjects: number;
    totalAwards: number;
    totalUSD: number;
  };
  projects: ProjectWithAwards[];
}

const data = projectsData as AwardsData;

export function getAllProjects(): ProjectWithAwards[] {
  return data.projects;
}

export function getProjectByUrl(url: string): ProjectWithAwards | undefined {
  return data.projects.find(p => p.url === url);
}

export function getProjectBySlug(slug: string): ProjectWithAwards | undefined {
  return data.projects.find(p => p.url.includes(slug));
}

export function getMeta() {
  return data.meta;
}

export function getTopProjects(limit: number = 10): ProjectWithAwards[] {
  return [...data.projects]
    .sort((a, b) => (b.totalUSD || 0) - (a.totalUSD || 0))
    .slice(0, limit);
}

export function getAllSponsors(): string[] {
  const sponsors = new Set<string>();
  data.projects.forEach(p => {
    p.awards.forEach(a => sponsors.add(a.sponsor));
  });
  return Array.from(sponsors).sort();
}

export function getProjectsBySponsor(sponsor: string): ProjectWithAwards[] {
  return data.projects.filter(p => 
    p.awards.some(a => a.sponsor === sponsor)
  );
}

/**
 * Get projects that won awards from a sponsor (with flexible matching)
 * Returns projects with the specific awards from that sponsor
 */
export function getProjectsWithAwardsFromSponsor(sponsorNames: string[]): Array<{
  project: ProjectWithAwards;
  awards: ProjectAward[];
}> {
  const results: Array<{ project: ProjectWithAwards; awards: ProjectAward[] }> = [];
  
  data.projects.forEach(project => {
    const matchingAwards = project.awards.filter(a => 
      sponsorNames.some(name => 
        a.sponsor.toLowerCase() === name.toLowerCase() ||
        a.sponsor.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(a.sponsor.toLowerCase())
      )
    );
    
    if (matchingAwards.length > 0) {
      results.push({ project, awards: matchingAwards });
    }
  });
  
  // Sort by total USD from matching awards
  return results.sort((a, b) => {
    const aTotal = a.awards.reduce((sum, aw) => sum + parseAmount(aw.amount), 0);
    const bTotal = b.awards.reduce((sum, aw) => sum + parseAmount(aw.amount), 0);
    return bTotal - aTotal;
  });
}

/**
 * Parse amount string to USD number
 */
function parseAmount(amount: string): number {
  // Handle non-USD prizes
  if (amount.includes("NIL") || amount.includes("credits") || amount.includes("ZEC") || amount.includes("Plan")) {
    return 0;
  }
  const match = amount.match(/\$?([\d,]+)/);
  return match ? parseInt(match[1].replace(/,/g, "")) : 0;
}

/**
 * Get all unique tracks from projects
 */
export function getAllTracksFromProjects(): string[] {
  const tracks = new Set<string>();
  data.projects.forEach(p => {
    p.awards.forEach(a => {
      if (a.track) tracks.add(a.track);
    });
  });
  return Array.from(tracks).sort();
}

/**
 * Get projects that won in a specific track
 */
export function getProjectsByTrack(track: string): Array<{
  project: ProjectWithAwards;
  awards: ProjectAward[];
}> {
  const normalizedTrack = track.toLowerCase();
  const results: Array<{ project: ProjectWithAwards; awards: ProjectAward[] }> = [];
  
  data.projects.forEach(project => {
    const matchingAwards = project.awards.filter(a => 
      a.track && a.track.toLowerCase() === normalizedTrack
    );
    
    if (matchingAwards.length > 0) {
      results.push({ project, awards: matchingAwards });
    }
  });
  
  return results.sort((a, b) => {
    const aTotal = a.awards.reduce((sum, aw) => sum + parseAmount(aw.amount), 0);
    const bTotal = b.awards.reduce((sum, aw) => sum + parseAmount(aw.amount), 0);
    return bTotal - aTotal;
  });
}

export function formatAmount(amount: string): string {
  // Clean up amount display
  if (amount.includes("credits")) {
    return amount.replace("$", "").replace(" credits", " credits");
  }
  if (amount.includes("NIL")) {
    return amount;
  }
  // Ensure $ prefix for USD amounts
  if (!amount.startsWith("$")) {
    return `$${amount}`;
  }
  return amount;
}
