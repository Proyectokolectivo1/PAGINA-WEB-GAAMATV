'use client'

import { useState, useEffect } from 'react'

export default function ImageWithFallback({ 
  src, 
  alt, 
  className, 
  fallbackSrc = '/placeholder-news.svg',
  ...props 
}) {
  // Utility to convert Google Drive viewer links to direct image links
  const processUrl = (url) => {
    if (!url) return fallbackSrc;
    if (typeof url !== 'string') return url;
    
    if (url.includes('drive.google.com/file/d/')) {
      const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1200`;
      }
    } else if (url.includes('drive.google.com/open?id=')) {
      const match = url.match(/id=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1200`;
      }
    }
    return url;
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
