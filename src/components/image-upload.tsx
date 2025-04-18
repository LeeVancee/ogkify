"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { X, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"

interface ImageUploadProps {
  value: string[]
  onChange: (value: string[]) => void
  disabled?: boolean
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setIsUploading(true)

      try {
        // In a real app, this would upload to a storage service like Vercel Blob
        // For this demo, we'll create object URLs
        const newImages = acceptedFiles.map((file) => URL.createObjectURL(file))

        onChange([...value, ...newImages])
      } catch (error) {
        console.error("Error uploading images:", error)
      } finally {
        setIsUploading(false)
      }
    },
    [value, onChange],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    disabled: isUploading || disabled,
    maxFiles: 5,
  })

  const removeImage = (index: number) => {
    const newImages = [...value]
    newImages.splice(index, 1)
    onChange(newImages)
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-md p-6 cursor-pointer text-center transition-colors
          ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/20"}
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-2">
          <Upload className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm font-medium">
            {isDragActive ? "Drop the files here" : "Drag & drop images here or click to select"}
          </p>
          <p className="text-xs text-muted-foreground">Upload up to 5 images (PNG, JPG, JPEG, WEBP)</p>
        </div>
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {value.map((image, index) => (
            <div key={index} className="group relative aspect-square rounded-md overflow-hidden border">
              <img
                src={image || "/placeholder.svg"}
                alt={`Product image ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
