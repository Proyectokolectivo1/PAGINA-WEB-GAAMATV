'use client'

import { useState, useEffect } from 'react'

function getDirectImageUrl(url) {
  if (!url) return url;
  try {
    // Google Drive format: /file/d/ID/...
    const driveMatch1 = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch1) return `https://drive.google.com/uc?export=view&id=${driveMatch1[1]}`;

    // Google Drive format: ?id=ID
    const driveMatch2 = url.match(/drive\.google\.com\/(?:open|uc)\?.*id=([a-zA-Z0-9_-]+)/);
    if (driveMatch2) return `https://drive.google.com/uc?export=view&id=${driveMatch2[1]}`;

    // Note: Terabox links cannot be converted to direct images because they block hotlinking.
    return url;
  } catch (e) {
    return url;
  }
}
export default function ImageWithFallback({ 
  src, 
  alt, 
  className, 
  fallbackSrc = '/placeholder-news.svg',
  ...props 
}) {
  const [imgSrc, setImgSrc] = useState(getDirectImageUrl(src) || fallbackSrc)

  useEffect(() => {
    setImgSrc(getDirectImageUrl(src) || fallbackSrc)
  }, [src, fallbackSrc])

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
