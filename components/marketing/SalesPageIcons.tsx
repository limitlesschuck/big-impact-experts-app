// Small line-art icons for /membership's "Enhance Every Area", "How Our
// Program Works", and Guarantee sections -- inline SVGs rather than
// porting the design reference's absolutely-positioned-div glyph hack,
// which achieves the same visual result more robustly and stays
// Tailwind-friendly. Each uses currentColor so a wrapping element's text
// color tints it.

const ICON_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "w-6 h-6",
};

export function EyeIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M2 12c2.4-4.4 6-6.5 10-6.5s7.6 2.1 10 6.5c-2.4 4.4-6 6.5-10 6.5S4.4 16.4 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function MicIcon() {
  return (
    <svg {...ICON_PROPS}>
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0014 0M12 18v4M9 22h6" />
    </svg>
  );
}

export function TargetIcon() {
  return (
    <svg {...ICON_PROPS}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 12l7-7" />
    </svg>
  );
}

export function PartnershipIcon() {
  return (
    <svg {...ICON_PROPS}>
      <circle cx="9" cy="12" r="5.5" />
      <circle cx="15" cy="12" r="5.5" />
    </svg>
  );
}

export function StoryIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M4 5.5A2.5 2.5 0 016.5 3H20v14H6.5A2.5 2.5 0 004 14.5v-9z" />
      <path d="M4 14.5A2.5 2.5 0 006.5 17H16" />
      <path d="M16 17l2 4-4-2-4 2 2-4" />
    </svg>
  );
}

export function CalendarCheckIcon() {
  return (
    <svg {...ICON_PROPS}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
      <path d="M8.5 15l2 2 4.5-4.5" />
    </svg>
  );
}

export function ChecklistIcon() {
  return (
    <svg {...ICON_PROPS}>
      <rect x="4" y="4" width="6" height="6" rx="1.5" />
      <path d="M5.5 7l1 1 2-2" />
      <rect x="4" y="14" width="6" height="6" rx="1.5" />
      <path d="M5.5 17l1 1 2-2" />
      <path d="M13 7h7M13 17h7" />
    </svg>
  );
}

export function PlayCircleIcon() {
  return (
    <svg {...ICON_PROPS}>
      <circle cx="12" cy="12" r="9" />
      <path d="M10 8.5l6 3.5-6 3.5v-7z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function NetworkIcon() {
  return (
    <svg {...ICON_PROPS}>
      <circle cx="12" cy="12" r="2.5" />
      <circle cx="12" cy="4" r="1.75" />
      <circle cx="19.5" cy="16" r="1.75" />
      <circle cx="4.5" cy="16" r="1.75" />
      <path d="M12 6.25V9.7M13.9 13.4l3.9 2.2M10.1 13.4l-3.9 2.2" />
    </svg>
  );
}

export function CheckBadgeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-7 h-7"
    >
      <path d="M6 12.5l4 4 8-9" />
    </svg>
  );
}

export function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}
