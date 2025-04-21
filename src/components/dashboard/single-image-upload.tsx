'use client';

import { useState } from 'react';
import Dropzone from 'react-dropzone';
import { X, Upload, ImagePlus } from 'lucide-react';
import Image from 'next/image';
import { useUploadThing } from '@/lib/uploadthing';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface SingleImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function SingleImageUpload({ value, onChange, disabled }: SingleImageUploadProps) {
  const [file, setFile] = useState<File | null>(null);

  const onRemove = () => {
    onChange('');
  };

  const { startUpload, isUploading } = useUploadThing('categoryImage', {
    onClientUploadComplete: (res) => {
      if (res) {
        onChange(res[0].url);
        setFile(null);
        toast.success('Image uploaded successfully');
      }
    },
    onUploadError: (error) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  const handleUpload = () => {
    if (file) {
      startUpload([file]);
    }
  };

  return (
    <div className="space-y-4">
      {value ? (
        <div className="relative h-[200px] w-[200px] rounded-md overflow-hidden">
          <div className="absolute top-2 right-2 z-10">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="flex h-7 w-7 items-center justify-center rounded-full p-0"
              onClick={onRemove}
              disabled={disabled || isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Image fill className="object-cover" alt="分类图片" src={value} />
        </div>
      ) : (
        <Dropzone
          disabled={disabled || isUploading}
          maxFiles={1}
          maxSize={4 * 1024 * 1024}
          accept={{
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
          }}
          onDrop={(acceptedFiles) => setFile(acceptedFiles[0])}
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
                {file ? (
                  <div className="space-y-4 text-center">
                    <div className="flex items-center justify-center flex-col">
                      <p className="text-sm text-muted-foreground">{file.name}</p>
                      <Button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
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
                    <ImagePlus className="mx-auto h-10 w-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {isDragActive ? 'Drop to upload' : 'Drop images here or click to select'}
                    </p>
                    {fileRejections.length > 0 && (
                      <p className="text-sm text-destructive">File format is incorrect or exceeds size limit</p>
                    )}
                    <p className="text-xs text-muted-foreground">Supported formats: JPG, PNG, GIF, WEBP (max 4MB)</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </Dropzone>
      )}
    </div>
  );
}
