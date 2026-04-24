'use client'

import { useState } from 'react'

export default function ImageWithFallback({ 
  src, 
  alt, 
  className, 
  fallbackSrc = '/placeholder-news.svg',
  ...props 
}) {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc)

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
