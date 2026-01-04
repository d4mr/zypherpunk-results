import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { SearchableProject } from "../lib/search";
import type { ProjectAward } from "../lib/awards";

interface TrackProject extends SearchableProject {
  trackAwards: ProjectAward[];
}

interface Props {
  projects: TrackProject[];
  trackColor: string;
}

type SortMode = "prize" | "sponsor";

// Color classes
const colorClasses: Record<string, { border: string; text: string }> = {
  emerald: { border: "border-emerald-500/30", text: "text-emerald-400" },
  violet: { border: "border-violet-500/30", text: "text-violet-400" },
  amber: { border: "border-amber-500/30", text: "text-amber-400" },
  sky: { border: "border-sky-500/30", text: "text-sky-400" },
  rose: { border: "border-rose-500/30", text: "text-rose-400" },
  orange: { border: "border-orange-500/30", text: "text-orange-400" },
  cyan: { border: "border-cyan-500/30", text: "text-cyan-400" },
  pink: { border: "border-pink-500/30", text: "text-pink-400" },
  indigo: { border: "border-indigo-500/30", text: "text-indigo-400" },
  gray: { border: "border-gray-500/30", text: "text-gray-400" },
};

function ProjectCard({ project, filterSponsor }: { project: TrackProject; filterSponsor?: string }) {
  const { devfolio, trackAwards } = project;
  // If filterSponsor is provided, only show awards from that sponsor
  const displayAwards = filterSponsor 
    ? trackAwards.filter(a => a.sponsor === filterSponsor)
    : trackAwards;
  const coverImg = devfolio._optimizedCover ?? null;
  const favicon = devfolio._optimizedFavicon ?? null;
  const builders = devfolio.builders || [];

  return (
    <a
      href={`/project/${devfolio.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50 transition-colors duration-150 hover:border-gray-700 hover:bg-gray-900/80"
    >
      {/* Cover Image */}
      <div className="relative aspect-video overflow-hidden bg-gray-800">
        {coverImg ? (
          <>
            <img
              src={coverImg}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <span className="font-display text-5xl italic text-gray-700">
              {devfolio.name.charAt(0)}
            </span>
          </div>
        )}

        {/* Award badges */}
        <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1.5">
          {displayAwards.map((award, i) => (
            <span 
              key={i}
              className="rounded-md border border-gold/30 bg-black/70 px-2 py-0.5 font-mono text-xs font-bold text-gold backdrop-blur-sm"
            >
              {award.amount}
            </span>
          ))}
        </div>

        {/* Sponsor badges - top right (only show if not filtering by sponsor) */}
        {!filterSponsor && displayAwards.length > 0 && (
          <div className="absolute right-2 top-2 flex flex-wrap justify-end gap-1">
            {[...new Set(displayAwards.map(a => a.sponsor))].map((sponsor, i) => (
              <div 
                key={i}
                className="rounded-md border border-gray-700 bg-gray-900/90 px-2 py-1 text-xs font-medium text-gray-300 backdrop-blur-sm"
              >
                {sponsor}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start gap-3">
          {favicon ? (
            <img
              src={favicon}
              alt=""
              className="h-10 w-10 shrink-0 rounded-lg border border-gray-800 bg-gray-800 object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-800 bg-gray-800 font-display text-lg italic text-muted-foreground">
              {devfolio.name.charAt(0)}
            </div>
          )}
          
          <div className="flex flex-1 flex-col gap-1 overflow-hidden">
            <h3 className="truncate font-medium text-white transition-colors duration-150 group-hover:text-accent">
              {devfolio.name}
            </h3>
            {devfolio.tagline && (
              <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                {devfolio.tagline}
              </p>
            )}
          </div>
        </div>

        {/* Footer with builders */}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-gray-800/50 pt-3">
          <div className="flex items-center">
            {builders.slice(0, 3).map((builder, i) => (
              <div
                key={builder.username}
                className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full border-2 border-gray-900 bg-gray-700 text-[10px] font-medium text-gray-300"
                style={{ marginLeft: i > 0 ? "-6px" : 0, zIndex: 3 - i }}
                title={`${builder.first_name || ""} ${builder.last_name || ""}`.trim() || builder.username}
              >
                {(builder._optimizedAvatar || builder._profile_image) ? (
                  <img
                    src={builder._optimizedAvatar || builder._profile_image!}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (builder.first_name?.[0] || builder.username[0]).toUpperCase()
                )}
              </div>
            ))}
            {builders.length > 3 && (
              <span className="ml-1.5 text-xs text-muted-foreground">
                +{builders.length - 3}
              </span>
            )}
          </div>

          {project.totalUSD > 0 && (
            <span className="font-mono text-xs text-muted-foreground">
              ${project.totalUSD.toLocaleString()} total
            </span>
          )}
        </div>
      </div>
    </a>
  );
}

export function TrackProjectGrid({ projects, trackColor }: Props) {
  const [sortMode, setSortMode] = useState<SortMode>("prize");
  const color = colorClasses[trackColor] || colorClasses.gray;

  // Get unique sponsors
  const sponsors = useMemo(() => {
    const sponsorSet = new Set<string>();
    projects.forEach(p => p.trackAwards.forEach(a => sponsorSet.add(a.sponsor)));
    return Array.from(sponsorSet).sort();
  }, [projects]);

  // Group by sponsor - a project appears under each sponsor it has awards from
  const projectsBySponsor = useMemo(() => {
    const grouped: Record<string, TrackProject[]> = {};
    projects.forEach(project => {
      // Get unique sponsors from this project's track awards
      const projectSponsors = [...new Set(project.trackAwards.map(a => a.sponsor))];
      projectSponsors.forEach(sponsor => {
        if (!grouped[sponsor]) grouped[sponsor] = [];
        grouped[sponsor].push(project);
      });
    });
    return grouped;
  }, [projects]);

  // Sort by prize
  const projectsByPrize = useMemo(() => {
    return [...projects].sort((a, b) => {
      const aAmount = parseAmount(a.trackAwards[0]?.amount || "");
      const bAmount = parseAmount(b.trackAwards[0]?.amount || "");
      return bAmount - aAmount;
    });
  }, [projects]);

  const hasMultipleSponsors = sponsors.length > 1;

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-xl text-white">
          Winning Projects
          <span className="ml-2 text-base font-normal text-muted-foreground">
            ({projects.length})
          </span>
        </h2>

        {hasMultipleSponsors && (
          <div className="flex gap-1 rounded-lg border border-gray-800 bg-gray-900/50 p-1">
            <button
              onClick={() => setSortMode("prize")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                sortMode === "prize"
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              By Prize
            </button>
            <button
              onClick={() => setSortMode("sponsor")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                sortMode === "sponsor"
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              By Sponsor
            </button>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {sortMode === "sponsor" && hasMultipleSponsors ? (
          <motion.div
            key="by-sponsor"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-10"
          >
            {sponsors.map((sponsor) => {
              const sponsorProjects = projectsBySponsor[sponsor] || [];
              if (sponsorProjects.length === 0) return null;
              
              return (
                <div key={sponsor}>
                  <div className="mb-4 flex items-center gap-3">
                    <a 
                      href={`/sponsor/${sponsor.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                      className="font-medium text-white hover:text-accent transition-colors"
                    >
                      {sponsor}
                    </a>
                    <span className="text-sm text-muted-foreground">
                      {sponsorProjects.length} project{sponsorProjects.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {sponsorProjects.map((project) => (
                      <ProjectCard key={project.slug} project={project} filterSponsor={sponsor} />
                    ))}
                  </div>
                </div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="by-prize"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {projectsByPrize.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function parseAmount(amount: string): number {
  if (!amount) return 0;
  if (amount.includes("NIL") || amount.includes("credits") || amount.includes("ZEC") || amount.includes("Plan")) {
    return 0;
  }
  const match = amount.match(/\$?([\d,]+)/);
  return match ? parseInt(match[1].replace(/,/g, "")) : 0;
}
