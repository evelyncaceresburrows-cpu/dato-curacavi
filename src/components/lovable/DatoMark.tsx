/**
 * DatoMark — logo oficial Dato 68: pin con sol, cerros, valle y campos.
 * Portado del mockup Claude Design (shared.jsx > DatoMark).
 *
 * SVG escalable: pasale `size` en px (default 24).
 */
import { useId } from "react";

interface Props {
  size?: number;
  /** Permite override de la paleta para casos como dark splash. */
  palette?: {
    cream: string;
    valley: string;
    valleyMid: string;
    field: string;
    sun: string;
  };
}

const DEFAULT_PALETTE = {
  cream: "#F5F0E6",
  valley: "#1F4A2D",
  valleyMid: "#3F7B47",
  field: "#A8C77A",
  sun: "#F4C24A",
};

const DROP_PATH =
  "M32 3 C 48.5 3, 60 15.2, 60 31 C 60 44.8, 50.4 54.4, 32 78 C 13.6 54.4, 4 44.8, 4 31 C 4 15.2, 15.5 3, 32 3 Z";

export function DatoMark({ size = 24, palette = DEFAULT_PALETTE }: Props) {
  const uid = useId();
  return (
    <svg
      width={size}
      height={(size * 82) / 64}
      viewBox="0 0 64 82"
      style={{ display: "block" }}
      aria-hidden="true"
    >
      <defs>
        <clipPath id={uid}>
          <path d={DROP_PATH} />
        </clipPath>
      </defs>
      <path d={DROP_PATH} fill={palette.cream} />
      <g clipPath={`url(#${uid})`}>
        <circle cx="32" cy="22" r="5.2" fill={palette.sun} />
        <line
          x1="6"
          y1="30"
          x2="58"
          y2="30"
          stroke={palette.valley}
          strokeWidth="0.6"
          opacity="0.35"
        />
        <path d="M6 30 L 58 30 L 56 52 Q 32 58 8 52 Z" fill={palette.field} />
        {[
          "M10 33 L 54 33",
          "M9 37 Q 32 38 55 37",
          "M8 42 Q 32 44 56 42",
          "M8 47 Q 32 50 56 47",
        ].map((d, i) => (
          <path
            key={i}
            d={d}
            stroke={palette.cream}
            strokeWidth="0.7"
            fill="none"
            strokeLinecap="round"
          />
        ))}
        <path
          d="M6 30 Q 11 25 16 28 Q 20 30 24 26 Q 30 17 36 22 Q 40 26 44 23 Q 50 20 55 27 Q 58 30 58 30 L 58 38 L 6 38 Z"
          fill={palette.valley}
        />
        <path
          d="M11 28 Q 14 26 16 28 L 14 30 Z"
          fill={palette.valleyMid}
          opacity="0.85"
        />
        <path
          d="M27 24 Q 30 17 33 21 L 30 30 L 25 30 Z"
          fill={palette.valleyMid}
          opacity="0.85"
        />
        <path
          d="M46 24 Q 50 20 53 25 L 50 30 Z"
          fill={palette.valleyMid}
          opacity="0.85"
        />
      </g>
      <path
        d={DROP_PATH}
        fill="none"
        stroke={palette.valley}
        strokeWidth="3.5"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
