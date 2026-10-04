import { useState } from 'react';

const ClubThumbnail = ({ src, alt, children }) => {
  const [failedSrc, setFailedSrc] = useState(null);
  if (!src || failedSrc === src) return children;
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className="h-full w-full object-cover"
      onError={() => setFailedSrc(src)}
    />
  );
};

export default ClubThumbnail;
