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
  return data.projects.slice(0, limit);
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
