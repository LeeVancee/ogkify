"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface ProductGalleryProps {
  images: string[]
}

export function ProductGallery({ images }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)

  // If no images are provided, use a placeholder
  const displayImages = images.length > 0 ? images : ["/placeholder.svg?height=600&width=600"]

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-lg bg-muted">
        <Image
          src={displayImages[selectedImage] || "/placeholder.svg"}
          alt="Product image"
          width={600}
          height={600}
          className="h-full w-full object-cover"
        />
      </div>

      {displayImages.length > 1 && (
        <div className="flex gap-4 overflow-auto pb-2">
          {displayImages.map((image, index) => (
            <button
              key={index}
              className={cn(
                "relative h-20 w-20 cursor-pointer overflow-hidden rounded-lg bg-muted",
                selectedImage === index && "ring-2 ring-primary ring-offset-2",
              )}
              onClick={() => setSelectedImage(index)}
            >
              <Image
                src={image || "/placeholder.svg"}
                alt={`Product thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
