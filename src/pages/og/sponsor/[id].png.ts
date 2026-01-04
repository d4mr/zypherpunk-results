import type { APIRoute, GetStaticPaths } from 'astro';
import { generateOgImage } from '../../../lib/og';
import { getAllSponsors } from '../../../lib/sponsors';
import { getProjectsWithAwardsFromSponsor } from '../../../lib/awards';

export const getStaticPaths: GetStaticPaths = async () => {
  const sponsors = getAllSponsors();
  return sponsors.map(sponsor => ({
    params: { id: sponsor.id },
  }));
};

export const GET: APIRoute = async ({ params }) => {
  const { id } = params;
  
  if (!id) {
    return new Response('Not found', { status: 404 });
  }

  const sponsors = getAllSponsors();
  const sponsor = sponsors.find(s => s.id === id);
  
  if (!sponsor) {
    return new Response('Not found', { status: 404 });
  }

  const nameVariations = [sponsor.name, sponsor.displayName, sponsor.id];
  const winningProjects = getProjectsWithAwardsFromSponsor(nameVariations);
  
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
    title: sponsor.name,
    subtitle: sponsor.description,
    badge: 'Zypherpunk Sponsor',
    faviconUrl: sponsor.logo || null,
    stats: [
      sponsor.totalPrize ? { label: 'Prize Pool', value: sponsor.totalPrize, isGold: true } : null,
      { label: 'Winners', value: winningProjects.length.toString() },
      totalAwarded > 0 ? { label: 'Awarded', value: `$${totalAwarded.toLocaleString()}`, isGold: true } : null,
    ].filter(Boolean) as Array<{ label: string; value: string; isGold?: boolean }>,
  });

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
