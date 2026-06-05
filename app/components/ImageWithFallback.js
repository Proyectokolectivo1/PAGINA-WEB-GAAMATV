'use client'

import { useState, useEffect } from 'react'

export default function ImageWithFallback({ 
  src, 
  alt, 
  className, 
  fallbackSrc = '/placeholder-news.svg',
  ...props 
}) {
  // Utility to convert Google Drive viewer links to direct image links and proxy them
  const processUrl = (url) => {
    if (!url) return fallbackSrc;
    if (typeof url !== 'string') return url;
    
    let processed = url;
    if (url.includes('drive.google.com/file/d/')) {
      const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        processed = `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1200`;
      }
    } else if (url.includes('drive.google.com/open?id=')) {
      const match = url.match(/id=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        processed = `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1200`;
      }
    } else if (url.includes('drive.google.com/uc?')) {
      const match = url.match(/id=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        processed = `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1200`;
      }
    }

    // Proxy Google Drive links through the backend to avoid 403 errors and CORS blocks
    if (processed.includes('drive.google.com') || processed.includes('googleusercontent.com')) {
      return `/api/og-image?url=${encodeURIComponent(processed)}`;
    }
    
    return processed;
  };

  const [imgSrc, setImgSrc] = useState(() => processUrl(src))

  useEffect(() => {
    setImgSrc(processUrl(src))
  }, [src])

  const handleError = () => {
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc)
    }
  }

  return (
    <img
      {...props}
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
    />
  )
}
