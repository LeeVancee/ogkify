'use client';

import { useState } from 'react';
import Dropzone from 'react-dropzone';
import { X, Upload } from 'lucide-react';
import Image from 'next/image';
import { useUploadThing } from '@/lib/uploadthing';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface UploadThingImageProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export function UploadThingImage({ value, onChange, disabled }: UploadThingImageProps) {
  const [files, setFiles] = useState<File[]>([]);

  const onRemove = (url: string) => {
    onChange(value.filter((current) => current !== url));
  };

  const { startUpload, isUploading } = useUploadThing('imageUploader', {
    onClientUploadComplete: (res) => {
      if (res) {
        // 获取所有上传成功的图片 URL
        const uploadedUrls = res.map((file) => file.url);
        // 将新上传的 URL 添加到现有的 value 中
        onChange([...value, ...uploadedUrls]);
        setFiles([]);
        toast.success('Image uploaded successfully');
      }
    },
    onUploadError: (error) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  const handleUpload = () => {
    if (files.length > 0) {
      startUpload(files);
    }
  };

  return (
    <div className="space-y-4">
      {/* 已上传图片预览 */}
      <div className="flex items-center gap-4 flex-wrap">
        {value.map((url) => (
          <div key={url} className="relative h-[200px] w-[200px] rounded-md overflow-hidden">
            <div className="absolute top-2 right-2 z-10">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="flex h-7 w-7 items-center justify-center rounded-full p-0 text-white"
                onClick={() => onRemove(url)}
                disabled={disabled || isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Image fill className="object-cover" alt="商品图片" src={url} />
          </div>
        ))}
      </div>

      {/* 自定义Dropzone */}
      <Dropzone
        disabled={disabled || isUploading}
        maxFiles={4}
        maxSize={5 * 1024 * 1024}
        accept={{
          'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
        }}
        onDrop={(acceptedFiles) => setFiles(acceptedFiles)}
      >
        {({ getRootProps, getInputProps, isDragActive, fileRejections }) => (
          <div className="space-y-4">
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed 
                p-8
                h-[200px]
                rounded-lg 
                transition 
                cursor-pointer
                flex flex-col items-center justify-center
                relative
                ${isDragActive ? 'border-primary bg-primary/10' : 'border-muted hover:border-muted-foreground'}
                ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
                ${fileRejections.length > 0 ? 'border-destructive' : ''}
              `}
            >
              <input {...getInputProps()} />
              {files.length > 0 ? (
                <div className="space-y-4 text-center">
                  <div className="flex items-center justify-center flex-col">
                    {files.map((file, index) => (
                      <p key={index} className="text-sm text-muted-foreground">
                        {file.name}
                      </p>
                    ))}
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFiles([]);
                      }}
                      disabled={isUploading}
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                    >
                      Cancel
                    </Button>
                  </div>
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpload();
                    }}
                    disabled={isUploading}
                    size="sm"
                  >
                    {isUploading ? (
                      'Uploading...'
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Confirm Upload
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {isDragActive ? 'Drop to upload' : 'Drop images here or click to select'}
                  </p>
                  {fileRejections.length > 0 && (
                    <p className="text-sm text-destructive">File format is incorrect or exceeds size limit</p>
                  )}
                  <p className="text-xs text-muted-foreground">Supported formats: JPG, PNG, GIF, WEBP (max 5MB)</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Dropzone>
    </div>
  );
}
