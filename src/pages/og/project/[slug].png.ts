import type { APIRoute, GetStaticPaths } from 'astro';
import { generateOgImage } from '../../../lib/og';
import { getAllProjects } from '../../../lib/awards';
import { fetchProjects, extractSlugFromUrl, getImageUrl } from '../../../lib/devfolio';

export const getStaticPaths: GetStaticPaths = async () => {
  const allAwards = getAllProjects();
  const slugs = allAwards
    .map(award => extractSlugFromUrl(award.url))
    .filter((slug): slug is string => slug !== null);

  return slugs.map(slug => ({
    params: { slug },
  }));
};

export const GET: APIRoute = async ({ params }) => {
  const { slug } = params;
  
  if (!slug) {
    return new Response('Not found', { status: 404 });
  }

  const allAwards = getAllProjects();
  const award = allAwards.find(a => extractSlugFromUrl(a.url) === slug);
  
  const projectsMap = await fetchProjects([slug]);
  const project = projectsMap.get(slug);

  // Get favicon URL
  const faviconUrl = project?._favicon ? getImageUrl(project._favicon) : null;
  
  // Get builder avatars
  const avatars = project?.builders?.map(b => ({
    url: b._profile_image ? getImageUrl(b._profile_image) : null,
    name: b.first_name || b.username,
  })) || [];

  const png = await generateOgImage({
    title: project?.name || award?.name || slug,
    subtitle: project?.tagline || undefined,
    badge: 'Zypherpunk Winner',
    faviconUrl,
    avatars,
    stats: award ? [
      { label: 'Total Prize', value: `$${award.totalUSD.toLocaleString()}`, isGold: true },
      { label: 'Awards', value: award.awards.length.toString() },
      { label: 'Sponsors', value: [...new Set(award.awards.map(a => a.sponsor))].length.toString() },
    ] : undefined,
  });

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
