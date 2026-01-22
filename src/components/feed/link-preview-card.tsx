"use client";

interface LinkPreviewCardProps {
  url: string;
  title?: string | null;
  description?: string | null;
  image?: string | null;
  siteName?: string | null;
}

export function LinkPreviewCard({
  url,
  title,
  description,
  image,
  siteName,
}: LinkPreviewCardProps) {
  // Extract domain from URL for fallback
  const getDomain = (urlString: string): string => {
    try {
      return new URL(urlString).hostname.replace("www.", "");
    } catch {
      return urlString;
    }
  };

  const domain = siteName || getDomain(url);
  const hasOGData = title || description || image;

  // If no OG data, show simple link
  if (!hasOGData) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center text-sm text-[#58a6ff] hover:underline"
      >
        <span className="material-symbols-outlined text-base mr-1">link</span>
        {domain}
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block mt-3 rounded-xl overflow-hidden border border-[#30363d] bg-[#161b22] hover:border-[#58a6ff] transition-colors"
    >
      <div className="flex">
        {/* Image Section */}
        {image && (
          <div className="flex-shrink-0 w-[120px] h-[90px] md:w-[160px] md:h-[100px] bg-[#0d1117]">
            <img
              src={image}
              alt={title || "Link preview"}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Hide image container on error
                (e.target as HTMLImageElement).parentElement!.style.display = "none";
              }}
            />
          </div>
        )}

        {/* Content Section */}
        <div className="flex-1 p-3 min-w-0">
          {/* Site Name */}
          <div className="flex items-center gap-1.5 text-xs text-[#8b949e] mb-1">
            <span className="material-symbols-outlined text-sm">link</span>
            <span className="truncate">{domain}</span>
          </div>

          {/* Title */}
          {title && (
            <h4 className="text-sm font-medium text-[#e6edf3] line-clamp-1 mb-1">
              {title}
            </h4>
          )}

          {/* Description */}
          {description && (
            <p className="text-xs text-[#8b949e] line-clamp-2">
              {description}
            </p>
          )}
        </div>
      </div>
    </a>
  );
}
