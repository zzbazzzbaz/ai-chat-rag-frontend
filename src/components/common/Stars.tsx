import { useState, useEffect } from 'react'

interface Star {
  id: number
  x: number
  y: number
  size: number
  delay: number
}

export function Stars() {
  const [stars, setStars] = useState<Star[]>([])
  
  useEffect(() => {
    const newStars = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 2,
      delay: Math.random() * 3,
    }))
    setStars(newStars)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-blue-400/40 animate-twinkle"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
