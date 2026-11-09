import { useState } from "react";
import { Star } from "lucide-react";

function StarRatingComponent({
  rating = 0,
  handleRatingChange,
  hoverRating: externalHoverRating,
  onHoverChange,
  size = "md",
  disabled = false,
}) {
  const [internalHover, setInternalHover] = useState(0);

  const activeHover = externalHoverRating !== undefined ? externalHoverRating : internalHover;
  const currentRating = activeHover > 0 ? activeHover : rating;

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-7 h-7",
  }[size] || "w-5 h-5";

  return (
    <div className="inline-flex items-center gap-1.5" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= currentRating;
        const isInteractive = Boolean(handleRatingChange) && !disabled;

        return (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => handleRatingChange && handleRatingChange(star)}
            onMouseEnter={() => {
              if (isInteractive) {
                setInternalHover(star);
                onHoverChange?.(star);
              }
            }}
            onMouseLeave={() => {
              if (isInteractive) {
                setInternalHover(0);
                onHoverChange?.(0);
              }
            }}
            className={`p-1 -m-1 rounded-sm transition-transform ${
              isInteractive
                ? "cursor-pointer hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black"
                : "cursor-default"
            } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            role="radio"
            aria-checked={star === rating}
          >
            <Star
              className={`${sizeClasses} transition-colors duration-150 ${
                isFilled
                  ? "fill-amber-400 text-amber-400 stroke-amber-400"
                  : "fill-zinc-100 text-zinc-300 stroke-zinc-300 hover:text-amber-300"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

export default StarRatingComponent;
