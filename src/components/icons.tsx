import type { ReactNode } from "react";

// Dahili ikon seti: 24px ızgara, 1.75 çizgi, currentColor. Yeni bağımlılık eklenmez.
const PATHS = {
  calendar: <><rect x="3.5" y="5" width="17" height="15.5" rx="3" /><path d="M8 3v4M16 3v4M3.5 10h17" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  checkCircle: <><circle cx="12" cy="12" r="8.5" /><path d="m8.5 12.3 2.4 2.4 4.6-5" /></>,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  phone: <path d="M5 4.5h3.2l1.6 4-2 1.3a11 11 0 0 0 5.4 5.4l1.3-2 4 1.6V18a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 3 6.7 2 2 0 0 1 5 4.5Z" />,
  pin: <><path d="M12 21s6.5-5.6 6.5-11a6.5 6.5 0 1 0-13 0c0 5.4 6.5 11 6.5 11Z" /><circle cx="12" cy="10" r="2.3" /></>,
  scissors: <><circle cx="6.5" cy="6.5" r="2.5" /><circle cx="6.5" cy="17.5" r="2.5" /><path d="M8.7 7.8 20 16M8.7 16.2 20 8" /></>,
  list: <path d="M8.5 6.5H20M8.5 12H20M8.5 17.5H20M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01" />,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M12 3v2.2M12 18.8V21M4.6 7.5l1.9 1.1M17.5 15.4l1.9 1.1M4.6 16.5l1.9-1.1M17.5 8.6l1.9-1.1" /></>,
  logout: <><path d="M9.5 4.5h-3a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h3" /><path d="M15 8l4 4-4 4M19 12H9.5" /></>,
  chevronRight: <path d="m9.5 6 6 6-6 6" />,
  chevronLeft: <path d="m14.5 6-6 6 6 6" />,
  arrowRight: <path d="M5 12h14m-5-5.5L19.5 12 14 17.5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  trash: <><path d="M4.5 7h15M9.5 7V4.8h5V7M6.5 7l.8 12h9.4l.8-12" /></>,
  user: <><circle cx="12" cy="8.5" r="3.6" /><path d="M4.8 20c.5-3.6 3.3-5.6 7.2-5.6s6.7 2 7.2 5.6" /></>,
  users: <><circle cx="9" cy="8.5" r="3.2" /><path d="M3.5 19.5c.4-3.2 2.6-5 5.5-5s5.1 1.8 5.5 5" /><path d="M16 5.6a3 3 0 0 1 0 5.8M17.5 14.7c1.7.5 2.8 2 3 4.3" /></>,
  wallet: <><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3" /><rect x="3.5" y="7.5" width="17" height="12" rx="2.5" /><path d="M16.5 13.5h.01" /></>,
  gauge: <><path d="M4.5 16.5a7.5 7.5 0 1 1 15 0" /><path d="m12 16.5 3.5-5" /></>,
  bell: <><path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 1.5h-15L6 16.5Z" /><path d="M10 20.5h4" /></>,
  shield: <><path d="M12 3.5 5 6v5.5c0 4.2 2.8 7.4 7 9 4.2-1.6 7-4.8 7-9V6l-7-2.5Z" /><path d="m9 12 2.2 2.2 3.8-4" /></>,
  lock: <><rect x="4.5" y="10.5" width="15" height="10" rx="2.5" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></>,
  sparkle: <path d="M12 3.5 13.9 9l5.6 1.9-5.6 1.9L12 18.5l-1.9-5.7L4.5 11 10.1 9 12 3.5Z" />,
  download: <path d="M12 4.5v11m0 0-4-4m4 4 4-4M5 19.5h14" />,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></>,
  inbox: <><path d="M4 13.5 6.5 5.5h11l2.5 8" /><path d="M4 13.5v5a1.5 1.5 0 0 0 1.5 1.5h13a1.5 1.5 0 0 0 1.5-1.5v-5h-4.5l-1 2h-5l-1-2H4Z" /></>,
  message: <path d="M4.5 6.5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H11l-4.5 3.5v-3.5a2 2 0 0 1-2-2v-8Z" />,
  github: <path d="M9 19c-4 1.3-4-2-6-2.5m12 4.5v-3.2a2.8 2.8 0 0 0-.8-2.2c2.700-.3 5.500-1.300 5.500-6a4.600 4.600 0 0 0-1.300-3.200 4.300 4.300 0 0 0-.1-3.200s-1-.3-3.300 1.300a11.400 11.400 0 0 0-6 0C6.700 3.500 5.700 3.800 5.700 3.800a4.300 4.300 0 0 0-.1 3.200A4.600 4.600 0 0 0 4.300 10.200c0 4.600 2.800 5.600 5.500 6a2.800 2.800 0 0 0-.8 2.200V21" />,
  server: <><rect x="3.5" y="4" width="17" height="6.5" rx="2" /><rect x="3.5" y="13.500" width="17" height="6.500" rx="2" /><path d="M7 7.250h.01M7 16.750h.01" /></>,
  zap: <path d="M13 3 5 13.500h6L10 21l8-10.500h-6L13 3Z" />,
  layers: <><path d="m12 4 8.500 4.500L12 13 3.500 8.500 12 4Z" /><path d="m3.500 12.500 8.500 4.500 8.500-4.500M3.500 16.500 12 21l8.500-4.500" /></>,
  globe: <><circle cx="12" cy="12" r="8.500" /><path d="M3.500 12h17M12 3.500c2.500 2.600 3.500 5.400 3.500 8.500s-1 5.900-3.500 8.500c-2.500-2.600-3.500-5.400-3.500-8.500S9.500 6.100 12 3.500Z" /></>,
  code: <path d="m8.500 7-5 5 5 5m7-10 5 5-5 5M13.500 5l-3 14" />,
  chevronDown: <path d="m6 9.500 6 6 6-6" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  play: <path d="M8 5.500v13l11-6.500-11-6.500Z" />,
  mouse: <><rect x="6.500" y="3" width="11" height="18" rx="5.500" /><path d="M12 7v3" /></>,
  note: <><path d="M6 4.5h9l3.5 3.5v11.5H6V4.5Z" /><path d="M9 11h6M9 14.5h4" /></>,
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 18, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {PATHS[name]}
    </svg>
  );
}
