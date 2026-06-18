import type { SVGProps } from "react";

/**
 * Coffee bean caricature mark — sage stroke, used as logo and brand motif.
 */
export function BeanMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <ellipse cx="24" cy="24" rx="14" ry="19" transform="rotate(-25 24 24)" fill="var(--coffee)" />
      <path
        d="M14.5 32.5 Q24 23 33.5 15.5"
        stroke="var(--cream)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BeanSilhouette(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <ellipse cx="100" cy="100" rx="55" ry="80" transform="rotate(-20 100 100)" fill="var(--sage)" opacity="0.35" />
      <path
        d="M60 145 Q100 100 140 55"
        stroke="var(--sage-deep)"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}
