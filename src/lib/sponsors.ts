// Sponsor data from our extracted results
import sponsorsData from "../../data/sponsors.json";

export interface SponsorBounty {
  track: string;
  amount: string;
  type: "general" | "project-specific";
  description: string;
  prizes?: string[];
}

export interface Sponsor {
  id: string;
  name: string;
  displayName: string;
  website: string;
  logo: string;
  totalPrize: string | null;
  prizeNote: string;
  description: string;
  bounties?: SponsorBounty[];
}

export interface SponsorsData {
  sponsors: Sponsor[];
}

const data = sponsorsData as SponsorsData;

export function getAllSponsors(): Sponsor[] {
  return data.sponsors;
}

export function getSponsorById(id: string): Sponsor | undefined {
  return data.sponsors.find(s => s.id === id);
}

export function getSponsorByName(name: string): Sponsor | undefined {
  // Try exact match first
  let sponsor = data.sponsors.find(s => 
    s.name.toLowerCase() === name.toLowerCase() ||
    s.displayName.toLowerCase() === name.toLowerCase()
  );
  
  if (sponsor) return sponsor;
  
  // Try partial match (for cases like "ECC (Electric Coin Company)" matching "Electric Coin Company")
  sponsor = data.sponsors.find(s => 
    name.toLowerCase().includes(s.displayName.toLowerCase()) ||
    name.toLowerCase().includes(s.name.toLowerCase()) ||
    s.name.toLowerCase().includes(name.toLowerCase())
  );
  
  return sponsor;
}

// Map award sponsor names to sponsor IDs for lookup
const sponsorNameMap: Record<string, string> = {
  "NEAR": "near",
  "Near": "near",
  "near": "near",
  "Tachyon": "tachyon",
  "Project Tachyon": "tachyon",
  "Starknet": "starknet",
  "Network School": "network-school",
  "Mina": "mina",
  "Mina Protocol": "mina",
  "Axelar": "axelar",
  "Axelar Network": "axelar",
  "Arcium": "arcium",
  "Aztec": "aztec",
  "Aztec Labs": "aztec",
  "ECC": "ecc",
  "ECC (Electric Coin Company)": "ecc",
  "Electric Coin Company": "ecc",
  "Osmosis": "osmosis",
  "Miden": "miden",
  "Fhenix": "fhenix",
  "Helius": "helius",
  "Zcash Community Grants": "zcash-grants",
  "ZCG": "zcash-grants",
  "Nillion": "nillion",
  "Unstoppable Wallet": "unstoppable-wallet",
  "Unstoppable": "unstoppable-wallet",
  "Pump Fun": "pump-fun",
  "Pump.fun": "pump-fun",
  "Gemini": "gemini",
  "Bitlux": "bitlux",
  "RayBot": "raybot",
  "Raybot": "raybot",
  "Noah": "noah",
  "Noah by Plena Finance": "noah",
  "Star": "star",
  "Mintlify": "mintlify",
  "Alliance": "alliance",
  "Alliance DAO": "alliance",
};

export function getSponsorForAward(sponsorName: string): Sponsor | undefined {
  const id = sponsorNameMap[sponsorName];
  if (id) {
    return getSponsorById(id);
  }
  // Fall back to name matching
  return getSponsorByName(sponsorName);
}

export function getSponsorsWithPrizes(): Sponsor[] {
  return data.sponsors.filter(s => s.totalPrize !== null);
}

export function getSponsorWebsite(sponsorName: string): string | undefined {
  const sponsor = getSponsorForAward(sponsorName);
  return sponsor?.website;
}

/**
 * Find the specific bounty that matches an award's track
 */
export function getBountyForAward(sponsorName: string, track?: string): SponsorBounty | undefined {
  const sponsor = getSponsorForAward(sponsorName);
  if (!sponsor?.bounties || sponsor.bounties.length === 0) return undefined;
  
  // If no track specified, return the first bounty
  if (!track) return sponsor.bounties[0];
  
  // Try to find a bounty matching the track
  const normalizedTrack = track.toLowerCase();
  
  // Exact match first
  let bounty = sponsor.bounties.find(b => 
    b.track.toLowerCase() === normalizedTrack
  );
  if (bounty) return bounty;
  
  // Partial match (track name contains bounty track or vice versa)
  bounty = sponsor.bounties.find(b => 
    normalizedTrack.includes(b.track.toLowerCase()) ||
    b.track.toLowerCase().includes(normalizedTrack)
  );
  if (bounty) return bounty;
  
  // Check for "All Tracks" bounty
  bounty = sponsor.bounties.find(b => 
    b.track.toLowerCase() === "all tracks"
  );
  if (bounty) return bounty;
  
  // Fall back to first bounty
  return sponsor.bounties[0];
}

/**
 * Get all unique tracks from all sponsors
 */
export function getAllTracks(): string[] {
  const tracks = new Set<string>();
  data.sponsors.forEach(sponsor => {
    sponsor.bounties?.forEach(bounty => {
      if (bounty.track && bounty.track !== "All Tracks") {
        tracks.add(bounty.track);
      }
    });
  });
  return Array.from(tracks).sort();
}

// Map short track names (from projects.json) to full bounty track names (from sponsors.json)
const trackNameMap: Record<string, string[]> = {
  "content": ["privacy-focused content & media", "private focused content & media"],
  "privacy-focused content & media": ["content", "private focused content & media"],
  "private focused content & media": ["content", "privacy-focused content & media"],
  "cross-chain privacy solutions": ["cross-chain"],
  "private payments & transactions": ["private payments", "private payments and transactions"],
  "private payments": ["private payments & transactions", "private payments and transactions"],
  "private payments and transactions": ["private payments & transactions", "private payments"],
  "privacy infrastructure & developer tools": ["developer tools", "infrastructure"],
  "self-custody & wallet innovation": ["wallet", "wallets"],
  "private defi & trading": ["defi", "trading"],
  "zcash data & analytics": ["data", "analytics"],
  "creative privacy applications": ["creative"],
  "privacy-preserving ai & computation": ["ai", "computation"],
};

/**
 * Get all sponsors that have bounties for a specific track
 */
export function getSponsorsForTrack(track: string): Array<{ sponsor: Sponsor; bounty: SponsorBounty }> {
  const normalizedTrack = track.toLowerCase();
  const alternateNames = trackNameMap[normalizedTrack] || [];
  const results: Array<{ sponsor: Sponsor; bounty: SponsorBounty }> = [];
  
  data.sponsors.forEach(sponsor => {
    sponsor.bounties?.forEach(bounty => {
      const bountyTrack = bounty.track.toLowerCase();
      if (
        bountyTrack === normalizedTrack ||
        bountyTrack === "all tracks" ||
        alternateNames.includes(bountyTrack) ||
        // Also check if the bounty track maps to our track
        (trackNameMap[bountyTrack] && trackNameMap[bountyTrack].includes(normalizedTrack))
      ) {
        results.push({ sponsor, bounty });
      }
    });
  });
  
  return results;
}
