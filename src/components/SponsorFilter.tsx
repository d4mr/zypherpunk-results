import { motion } from "motion/react";

interface Props {
  sponsors: string[];
  selected: string | null;
  onSelect: (sponsor: string | null) => void;
}

export function SponsorFilter({ sponsors, selected, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={`rounded-full border px-3 py-1.5 font-mono text-xs transition-all ${
          selected === null
            ? "border-accent bg-accent/10 text-accent"
            : "border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300"
        }`}
      >
        All
      </button>
      {sponsors.map((sponsor) => (
        <button
          key={sponsor}
          onClick={() => onSelect(sponsor)}
          className={`rounded-full border px-3 py-1.5 font-mono text-xs transition-all ${
            selected === sponsor
              ? "border-accent bg-accent/10 text-accent"
              : "border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300"
          }`}
        >
          {sponsor}
        </button>
      ))}
    </div>
  );
}
