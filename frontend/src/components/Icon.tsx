import type { SVGProps } from 'react';

type IconName =
  | 'search'
  | 'package'
  | 'location'
  | 'bell'
  | 'mail'
  | 'calendar'
  | 'arrowLeft'
  | 'plus'
  | 'reward'
  | 'check'
  | 'close'
  | 'clipboard'
  | 'basket'
  | 'tag'
  | 'user'
  | 'shield';

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

const PATHS: Record<IconName, { viewBox?: string; node: JSX.Element }> = {
  search: {
    node: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </>
    )
  },
  package: {
    node: (
      <>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
        <path d="M12 22V12" />
      </>
    )
  },
  location: {
    node: (
      <>
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </>
    )
  },
  bell: {
    node: (
      <>
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </>
    )
  },
  mail: {
    node: (
      <>
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-10 6L2 7" />
      </>
    )
  },
  calendar: {
    node: (
      <>
        <rect width="18" height="18" x="3" y="4" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </>
    )
  },
  arrowLeft: {
    node: (
      <>
        <path d="M19 12H5" />
        <path d="m12 19-7-7 7-7" />
      </>
    )
  },
  plus: {
    node: (
      <>
        <path d="M12 5v14M5 12h14" />
      </>
    )
  },
  reward: {
    node: (
      <>
        <circle cx="12" cy="8" r="6" />
        <path d="M15.5 12.5 17 22l-5-3-5 3 1.5-9.5" />
      </>
    )
  },
  check: {
    node: <path d="M20 6 9 17l-5-5" />
  },
  close: {
    node: (
      <>
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </>
    )
  },
  clipboard: {
    node: (
      <>
        <rect width="8" height="4" x="8" y="2" rx="1" />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      </>
    )
  },
  basket: {
    node: (
      <>
        <path d="m5 11 4-7" />
        <path d="m19 11-4-7" />
        <path d="M2 11h20" />
        <path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.6-7.4" />
        <path d="M9 15a1 1 0 1 0 2 0 1 1 0 1 0-2 0" />
        <path d="M13 15a1 1 0 1 0 2 0 1 1 0 1 0-2 0" />
      </>
    )
  },
  tag: {
    node: (
      <>
        <path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z" />
        <circle cx="7" cy="7" r="1.5" />
      </>
    )
  },
  user: {
    node: (
      <>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </>
    )
  },
  shield: {
    node: (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      </>
    )
  }
};

export function Icon({ name, size = 16, ...rest }: IconProps) {
  const def = PATHS[name];
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox={def.viewBox ?? '0 0 24 24'}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {def.node}
    </svg>
  );
}
