import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { SearchableProject } from "../lib/search";
import type { ProjectAward } from "../lib/awards";

// Extended type with sponsor-specific awards
interface SponsorProject extends SearchableProject {
  sponsorAwards: ProjectAward[];
}

interface Props {
  projects: SponsorProject[];
  sponsorTracks: string[];
  trackColors: Record<string, string>;
}

type ViewMode = "by-track" | "by-prize";

// Color classes for tracks
const colorClasses: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", badge: "bg-emerald-500/20 text-emerald-300" },
  violet: { bg: "bg-violet-500/10", border: "border-violet-500/30", text: "text-violet-400", badge: "bg-violet-500/20 text-violet-300" },
  amber: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", badge: "bg-amber-500/20 text-amber-300" },
  sky: { bg: "bg-sky-500/10", border: "border-sky-500/30", text: "text-sky-400", badge: "bg-sky-500/20 text-sky-300" },
  rose: { bg: "bg-rose-500/10", border: "border-rose-500/30", text: "text-rose-400", badge: "bg-rose-500/20 text-rose-300" },
  orange: { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400", badge: "bg-orange-500/20 text-orange-300" },
  cyan: { bg: "bg-cyan-500/10", border: "border-cyan-500/30", text: "text-cyan-400", badge: "bg-cyan-500/20 text-cyan-300" },
  pink: { bg: "bg-pink-500/10", border: "border-pink-500/30", text: "text-pink-400", badge: "bg-pink-500/20 text-pink-300" },
  indigo: { bg: "bg-indigo-500/10", border: "border-indigo-500/30", text: "text-indigo-400", badge: "bg-indigo-500/20 text-indigo-300" },
  gray: { bg: "bg-gray-500/10", border: "border-gray-500/30", text: "text-gray-400", badge: "bg-gray-500/20 text-gray-300" },
};

function getTrackColor(track: string, trackColors: Record<string, string>) {
  const colorName = trackColors[track] || "gray";
  return colorClasses[colorName] || colorClasses.gray;
}

function ProjectCard({ 
  project, 
  trackColors,
  showTrack = true,
}: { 
  project: SponsorProject; 
  trackColors: Record<string, string>;
  showTrack?: boolean;
}) {
  const { devfolio, sponsorAwards } = project;
  const coverImg = devfolio._optimizedCover ?? null;
  const favicon = devfolio._optimizedFavicon ?? null;
  const builders = devfolio.builders || [];
  
  // Get the track for this sponsor's award
  const awardTrack = sponsorAwards[0]?.track;
  const trackColor = awardTrack ? getTrackColor(awardTrack, trackColors) : null;

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

        {/* Award badges from this sponsor */}
        <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1.5">
          {sponsorAwards.map((award, i) => (
            <span 
              key={i}
              className="rounded-md border border-gold/30 bg-black/70 px-2 py-0.5 font-mono text-xs font-bold text-gold backdrop-blur-sm"
            >
              {award.amount}
            </span>
          ))}
        </div>

        {/* Track badge - top right */}
        {showTrack && awardTrack && trackColor && (
          <div className={`absolute right-2 top-2 rounded-md border ${trackColor.border} bg-gray-900/90 px-2 py-1 text-xs font-medium ${trackColor.text} backdrop-blur-sm`}>
            {awardTrack.replace("Privacy-Preserving ", "").replace("Privacy-Focused ", "").replace(" & ", " / ")}
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

export function SponsorProjectGrid({ projects, sponsorTracks, trackColors }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>("by-track");

  // Group projects by track
  const projectsByTrack = useMemo(() => {
    const grouped: Record<string, SponsorProject[]> = {};
    
    projects.forEach(project => {
      const track = project.sponsorAwards[0]?.track || "Other";
      if (!grouped[track]) {
        grouped[track] = [];
      }
      grouped[track].push(project);
    });

    // Sort tracks by number of projects
    const sortedTracks = Object.keys(grouped).sort((a, b) => {
      // Put "Other" at the end
      if (a === "Other") return 1;
      if (b === "Other") return -1;
      return grouped[b].length - grouped[a].length;
    });

    return { grouped, sortedTracks };
  }, [projects]);

  // Sort by prize amount
  const projectsByPrize = useMemo(() => {
    return [...projects].sort((a, b) => {
      const aAmount = parseAmount(a.sponsorAwards[0]?.amount || "");
      const bAmount = parseAmount(b.sponsorAwards[0]?.amount || "");
      return bAmount - aAmount;
    });
  }, [projects]);

  const hasMultipleTracks = projectsByTrack.sortedTracks.length > 1;

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-xl text-white">
          Winning Projects
          <span className="ml-2 text-base font-normal text-muted-foreground">
            ({projects.length})
          </span>
        </h2>

        {hasMultipleTracks && (
          <div className="flex gap-1 rounded-lg border border-gray-800 bg-gray-900/50 p-1">
            <button
              onClick={() => setViewMode("by-track")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === "by-track"
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              By Track
            </button>
            <button
              onClick={() => setViewMode("by-prize")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === "by-prize"
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              By Prize
            </button>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {viewMode === "by-track" && hasMultipleTracks ? (
          <motion.div
            key="by-track"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-10"
          >
            {projectsByTrack.sortedTracks.map((track) => {
              const trackProjects = projectsByTrack.grouped[track];
              const color = getTrackColor(track, trackColors);
              
              return (
                <div key={track}>
                  <div className={`mb-4 flex items-center gap-3 rounded-lg border ${color.border} ${color.bg} px-4 py-2.5`}>
                    <h3 className={`font-medium ${color.text}`}>{track}</h3>
                    <span className="text-sm text-muted-foreground">
                      {trackProjects.length} project{trackProjects.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {trackProjects.map((project) => (
                      <ProjectCard
                        key={project.slug}
                        project={project}
                        trackColors={trackColors}
                        showTrack={false}
                      />
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
              <ProjectCard
                key={project.slug}
                project={project}
                trackColors={trackColors}
                showTrack={hasMultipleTracks}
              />
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
