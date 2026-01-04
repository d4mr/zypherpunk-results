import type { APIRoute, GetStaticPaths } from 'astro';
import { generateOgImage } from '../../../lib/og';
import { getAllTracksFromProjects, getProjectsByTrack } from '../../../lib/awards';
import { getSponsorsForTrack } from '../../../lib/sponsors';

function slugify(track: string): string {
  return track
    .toLowerCase()
    .replace(/[&]/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const getStaticPaths: GetStaticPaths = async () => {
  const tracks = getAllTracksFromProjects();
  return tracks.map(track => ({
    params: { slug: slugify(track) },
    props: { track },
  }));
};

export const GET: APIRoute = async ({ params, props }) => {
  const { slug } = params;
  const track = (props as { track?: string })?.track;
  
  if (!slug || !track) {
    return new Response('Not found', { status: 404 });
  }

  const winningProjects = getProjectsByTrack(track);
  const sponsorsWithBounties = getSponsorsForTrack(track);
  
  const totalAwarded = winningProjects.reduce((sum, { awards }) => {
    return sum + awards.reduce((aSum, a) => {
      const match = a.amount.match(/\$?([\d,]+)/);
      if (match && !a.amount.includes("NIL") && !a.amount.includes("credits") && !a.amount.includes("ZEC")) {
        return aSum + parseInt(match[1].replace(/,/g, ""));
      }
      return aSum;
    }, 0);
  }, 0);

  const png = await generateOgImage({
    title: track,
    badge: 'Zypherpunk Track',
    stats: [
      { label: 'Winners', value: winningProjects.length.toString() },
      { label: 'Sponsors', value: sponsorsWithBounties.length.toString() },
      totalAwarded > 0 ? { label: 'Awarded', value: `$${totalAwarded.toLocaleString()}`, isGold: true } : null,
    ].filter(Boolean) as Array<{ label: string; value: string; isGold?: boolean }>,
  });

  return new Response(png as Uint8Array, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
