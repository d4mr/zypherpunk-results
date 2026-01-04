/**
 * Devfolio API client for fetching project data at build time.
 * Uses Astro's SSG - data is fetched once during build, not at runtime.
 */

const DEVFOLIO_API = "https://api.devfolio.co/v1/graphql";

const PROJECT_QUERY = `
  query GetProject($slug: citext!) {
    projects(where: {slug: {_eq: $slug}}) {
      name
      slug
      tagline
      description
      _cover_img
      _favicon
      video_url
      demo_url
      source_code_url
      links
      pictures
      created_at
      builders {
        first_name
        last_name
        username
        _profile_image
      }
      hashtags {
        hashtag {
          name
        }
      }
    }
  }
`;

export interface Builder {
  first_name: string | null;
  last_name: string | null;
  username: string;
  _profile_image: string | null;
  // Pre-optimized avatar URL (set at build time for homepage)
  _optimizedAvatar?: string | null;
}

export interface Hashtag {
  hashtag: {
    name: string;
  };
}

export interface DescriptionBlock {
  title: string;
  content: string;
  subtitle?: string;
}

export interface Project {
  name: string;
  slug: string;
  tagline: string | null;
  description: DescriptionBlock[] | null;
  _cover_img: string | null;
  _favicon: string | null;
  video_url: string | null;
  demo_url: string | null;
  source_code_url: string | null;
  links: string | null;
  pictures: string | null;
  created_at: string;
  builders: Builder[];
  hashtags: Hashtag[];
  // Pre-optimized image URLs (set at build time for homepage)
  _optimizedCover?: string | null;
  _optimizedFavicon?: string | null;
}

/**
 * Fetch a single project from Devfolio API.
 * Called at build time during SSG.
 */
export async function fetchProject(slug: string): Promise<Project | null> {
  try {
    const response = await fetch(DEVFOLIO_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: PROJECT_QUERY,
        variables: { slug },
      }),
    });

    const data = await response.json();
    return data.data?.projects?.[0] ?? null;
  } catch (error) {
    console.error(`Failed to fetch project ${slug}:`, error);
    return null;
  }
}

/**
 * Fetch multiple projects in parallel with batching to avoid rate limits.
 */
export async function fetchProjects(slugs: string[]): Promise<Map<string, Project>> {
  const results = new Map<string, Project>();
  const batchSize = 10;

  for (let i = 0; i < slugs.length; i += batchSize) {
    const batch = slugs.slice(i, i + batchSize);
    
    const projects = await Promise.all(
      batch.map(async (slug) => {
        const project = await fetchProject(slug);
        return { slug, project };
      })
    );

    for (const { slug, project } of projects) {
      if (project) {
        results.set(slug, project);
      }
    }

    // Small delay between batches
    if (i + batchSize < slugs.length) {
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  return results;
}

export function extractSlugFromUrl(url: string): string | null {
  const match = url.match(/devfolio\.co\/(?:projects|submissions)\/([^\/\?]+)/);
  return match?.[1] ?? null;
}

export function getImageUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `https://assets.devfolio.co/${path}`;
}

export function getPictures(pictures: string | null): string[] {
  if (!pictures) return [];
  return pictures.split(",").map(p => getImageUrl(p.trim())).filter(Boolean) as string[];
}

export function getLinks(links: string | null): string[] {
  if (!links) return [];
  return links.split(",").map(l => l.trim()).filter(Boolean);
}
