import * as Popover from "@radix-ui/react-popover";

interface SponsorBounty {
  track: string;
  amount: string;
  type: "general" | "project-specific";
  description: string;
  prizes?: string[];
}

interface Sponsor {
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

interface AwardCardProps {
  sponsor: string;
  track?: string;
  amount: string;
  sponsorData?: Sponsor;
  bountyData?: SponsorBounty;
}

export function AwardCard({ sponsor, track, amount, sponsorData, bountyData }: AwardCardProps) {
  const hasPopover = !!sponsorData;

  const cardContent = (
    <div
      className={`
        flex items-center justify-between rounded-lg border px-4 py-3 transition-all !outline-none
        ${hasPopover 
          ? "border-gray-800 bg-gray-900/50 hover:border-accent/50 hover:bg-gray-900/80 cursor-pointer" 
          : "border-gray-800 bg-gray-900/50"
        }
      `}
    >
      <div className="flex items-center gap-3">
        {sponsorData && (
          sponsorData.logo ? (
            <img 
              src={sponsorData.logo} 
              alt={sponsorData.displayName}
              className="h-6 w-6 rounded bg-gray-800 object-contain p-0.5 shrink-0"
              loading="lazy"
            />
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded bg-gray-800 shrink-0">
              <span className="text-xs font-bold text-gray-400">
                {sponsorData.displayName.charAt(0)}
              </span>
            </div>
          )
        )}
        <div className="min-w-0">
          <div className="text-sm font-medium text-white truncate">{sponsor}</div>
          {track && (
            <div className="text-xs text-muted-foreground truncate">{track}</div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-3">
        <span className="font-mono text-sm font-bold text-gold">{amount}</span>
        {hasPopover && (
          <svg 
            className="h-3.5 w-3.5 text-muted-foreground"
            viewBox="0 0 16 16" 
            fill="currentColor"
          >
            <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm0 14A6 6 0 1 1 8 2a6 6 0 0 1 0 12zm-.5-3h1v1h-1v-1zm.5-7a2.5 2.5 0 0 0-2.5 2.5h1A1.5 1.5 0 1 1 8 8c-.55 0-1 .45-1 1v1h1V9.08A2.5 2.5 0 0 0 8 4z"/>
          </svg>
        )}
      </div>
    </div>
  );

  if (!hasPopover) {
    return cardContent;
  }

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        {cardContent}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="z-50 w-[calc(100vw-2rem)] max-w-96 rounded-2xl ring-1 ring-accent/30 bg-gray-900 shadow-2xl shadow-black/60 !outline-none animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
          sideOffset={8}
          side="top"
          align="center"
          collisionPadding={16}
        >
          <a 
            href={`/sponsor/${sponsorData.id}`}
            className="block p-5 transition-colors hover:bg-gray-800/50 rounded-2xl"
          >
            {/* Sponsor Header */}
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <span className="font-display text-lg font-semibold text-white">
                  {sponsorData.name}
                </span>
                {sponsorData.totalPrize && (
                  <div className="mt-1 text-sm text-accent">
                    {sponsorData.totalPrize} {sponsorData.prizeNote} total
                  </div>
                )}
              </div>
              <span
                className="flex items-center gap-1.5 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-gray-300 shrink-0"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 3h7v7M13 3L6 10" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                View Sponsor
              </span>
            </div>

            {/* Track-specific bounty info */}
            {bountyData ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-[11px] font-medium uppercase tracking-wide ${
                    bountyData.type === "project-specific" 
                      ? "bg-accent/15 text-accent" 
                      : "bg-gray-800 text-gray-300"
                  }`}>
                    {bountyData.type === "project-specific" ? "Specific Bounty" : "General Bounty"}
                  </span>
                  <span className="text-sm text-gray-400">{bountyData.track}</span>
                </div>
                <p className="text-sm leading-relaxed text-gray-300">
                  {bountyData.description}
                </p>
                {bountyData.prizes && bountyData.prizes.length > 0 && (
                  <div className="pt-1">
                    <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Prize Distribution
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {bountyData.prizes.map((prize, i) => (
                        <span 
                          key={i}
                          className="rounded-md bg-gray-800 px-2.5 py-1 font-mono text-xs text-gray-200"
                        >
                          {prize}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-gray-300">
                {sponsorData.description}
              </p>
            )}
          </a>

          <Popover.Arrow className="fill-gray-900" width={14} height={7} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

// Provider wrapper for the page
interface AwardsSectionProps {
  awards: Array<{
    sponsor: string;
    track?: string;
    amount: string;
  }>;
  sponsorsMap: Record<string, Sponsor>;
  bountiesMap: Record<string, SponsorBounty | undefined>;
}

export function AwardsSection({ awards, sponsorsMap, bountiesMap }: AwardsSectionProps) {
  if (awards.length === 0) return null;

  return (
    <section className="mb-10">
      <h2 className="mb-4 font-display text-xl text-white">Awards</h2>
      <div className="grid gap-2 sm:grid-cols-2">
        {awards.map((award, i) => {
          const key = `${award.sponsor}-${award.track || ""}`;
          return (
            <AwardCard
              key={`${award.sponsor}-${i}`}
              sponsor={award.sponsor}
              track={award.track}
              amount={award.amount}
              sponsorData={sponsorsMap[award.sponsor]}
              bountyData={bountiesMap[key]}
            />
          );
        })}
      </div>
    </section>
  );
}
