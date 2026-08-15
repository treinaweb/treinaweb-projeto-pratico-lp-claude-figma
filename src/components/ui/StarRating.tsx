const STARS = [0, 1, 2, 3, 4] as const;

function Star({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={20}
      height={20}
      aria-hidden
      className={filled ? "text-accent" : "text-black/15"}
    >
      <path
        fill="currentColor"
        d="M10 0.5l2.633 6.09 6.617 0.62-5.007 4.412 1.485 6.478L10 14.9l-5.728 3.2 1.485-6.478L0.75 7.21l6.617-0.62z"
      />
    </svg>
  );
}

export default function StarRating({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={`${value} out of 5 stars`}
      className={`flex items-center gap-1 ${className}`}
    >
      {STARS.map((index) => (
        <Star key={index} filled={index < value} />
      ))}
    </div>
  );
}
