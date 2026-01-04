import type { SearchableProject } from "../lib/search";

interface Props {
  project: SearchableProject;
  index?: number;
}

export function ProjectCard({ project, index = 0 }: Props) {
  const { devfolio } = project;
  // Use optimized images (set at build time), these are already webp URLs
  const coverImg = devfolio._optimizedCover ?? null;
  const favicon = devfolio._optimizedFavicon ?? null;
  const builders = devfolio.builders || [];

  return (
    <a
      href={`/project/${devfolio.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50 transition-colors duration-150 hover:border-gray-700 hover:bg-gray-900/80"
    >
      {/* Image */}
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

        {/* Prize badge */}
        {project.totalUSD > 0 && (
          <div className="absolute right-3 top-3 rounded-md border border-gold/20 bg-black/70 px-2 py-1 backdrop-blur-sm">
            <span className="font-mono text-sm font-bold text-gold">
              ${project.totalUSD.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start gap-3">
          {/* Project icon */}
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
            <div className="flex items-start justify-between gap-2">
              <h3 className="truncate font-medium text-white transition-colors duration-150 group-hover:text-accent">
                {devfolio.name}
              </h3>
              {project.awardCount > 0 && (
                <span
                  className="shrink-0 rounded bg-accent/10 px-1.5 py-0.5 font-mono text-xs text-accent"
                  title={`${project.awardCount} awards from ${project.sponsors.length} sponsors`}
                >
                  {project.awardCount}×
                </span>
              )}
            </div>

            {devfolio.tagline && (
              <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                {devfolio.tagline}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-gray-800/50 pt-3">
          {/* Builders */}
          <div className="flex items-center">
            {builders.slice(0, 3).map((builder, i) => (
              <div
                key={builder.username}
                className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full border-2 border-gray-900 bg-gray-700 text-[10px] font-medium text-gray-300"
                style={{ marginLeft: i > 0 ? "-6px" : 0, zIndex: 3 - i }}
                title={
                  `${builder.first_name || ""} ${builder.last_name || ""}`.trim() ||
                  builder.username
                }
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

          {/* Sponsors */}
          {project.sponsors.length > 0 && (
            <span className="truncate text-right font-mono text-[11px] text-muted-foreground">
              {project.sponsors.slice(0, 2).join(" · ")}
              {project.sponsors.length > 2 && ` +${project.sponsors.length - 2}`}
            </span>
          )}
        </div>
      </div>
    </a>
  );
}
