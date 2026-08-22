/** Inline brand icons (lucide v1 removed brand icons). */

export function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function SnapchatIcon({ className }: { className?: string }) {
  // Simplified ghost silhouette
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2c3 0 5 2.2 5 5.2v2c.8.6 1.9.9 2.7 1 .6.1.9.7.5 1.2-.5.7-1.4 1.1-2.2 1.3-.2 0-.3.3-.2.5.7 1.3 2 2.3 3.4 2.6.6.2.7.9.2 1.2-1 .7-2.3 1-3.5 1.1-.3 0-.5.2-.6.5-.2.7-.8 1.1-1.5 1-.7-.1-1.4-.3-2-.3-.7 0-1.2.6-1.8 1-.6.4-1.4.4-2 0-.6-.4-1.1-1-1.8-1-.6 0-1.3.2-2 .3-.7.1-1.3-.3-1.5-1-.1-.3-.3-.5-.6-.5-1.2-.1-2.5-.4-3.5-1.1-.5-.3-.4-1 .2-1.2 1.4-.3 2.7-1.3 3.4-2.6.1-.2 0-.5-.2-.5-.8-.2-1.7-.6-2.2-1.3-.4-.5-.1-1.1.5-1.2.8-.1 1.9-.4 2.7-1v-2C7 4.2 9 2 12 2z" />
    </svg>
  );
}

export function TiktokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.3 0 .58.05.85.13V9.4a6.33 6.33 0 0 0-.85-.05A6.34 6.34 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
    </svg>
  );
}

export function XBrandIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
