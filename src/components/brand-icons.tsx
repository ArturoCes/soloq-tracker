import type { SVGProps } from "react";

export function TwitchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M4.5 2 3 5.5v14h5V22l3-2.5h4L21 14V2H4.5Zm14.5 11-3 3h-4l-3 2.5V16H5V4h14v9Z" />
      <path d="M15.5 6.5h2V12h-2V6.5Zm-5 0h2V12h-2V6.5Z" />
    </svg>
  );
}

export function KickIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M3 3h5v5h2V6h2V3h9v6h-3v3h-2v2h2v3h3v6h-9v-3h-2v-3H8v5H3V3Z" />
    </svg>
  );
}

export function TikTokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M16.6 2h-3.2v13.4a3 3 0 1 1-2.1-2.86V9.4a6.1 6.1 0 1 0 5.3 6.05V8.3a7.8 7.8 0 0 0 4.6 1.5V6.6a4.6 4.6 0 0 1-4.6-4.6Z" />
    </svg>
  );
}

export function YouTubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M21.6 7.2s-.2-1.5-.8-2.1c-.8-.8-1.7-.8-2.1-.9C15.9 4 12 4 12 4s-3.9 0-6.7.2c-.4 0-1.3.1-2.1.9-.6.6-.8 2.1-.8 2.1S2.2 9 2.2 10.7v2.6C2.2 15 2.4 16.8 2.4 16.8s.2 1.5.8 2.1c.8.8 1.8.8 2.3.9 1.7.1 7.1.2 7.1.2s3.9 0 6.7-.2c.4 0 1.3-.1 2.1-.9.6-.6.8-2.1.8-2.1s.2-1.8.2-3.5v-2.6c0-1.7-.2-3.5-.2-3.5ZM9.9 14.6V8.9l5.6 2.9-5.6 2.8Z" />
    </svg>
  );
}
