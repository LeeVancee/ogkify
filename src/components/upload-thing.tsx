'use client';

import { UploadDropzone } from '@/lib/uploadthing';
import { X } from 'lucide-react';
import Image from 'next/image';

interface UploadThingImageProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export function UploadThingImage({ value, onChange, disabled }: UploadThingImageProps) {
  const onRemove = (url: string) => {
    onChange(value.filter((current) => current !== url));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {value.map((url) => (
          <div key={url} className="relative h-[200px] w-[200px] rounded-md overflow-hidden">
            <div className="absolute top-2 right-2 z-10">
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500 p-1 text-white transition hover:opacity-75"
                onClick={() => onRemove(url)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <Image fill className="object-cover" alt="商品图片" src={url} />
          </div>
        ))}
      </div>
      <UploadDropzone
        endpoint="imageUploader"
        onClientUploadComplete={(res) => {
          if (res) {
            onChange([...value, res[0].url]);
          }
        }}
        onUploadError={(error: Error) => {
          console.error('上传失败:', error);
        }}
        disabled={disabled}
      />
    </div>
  );
}
