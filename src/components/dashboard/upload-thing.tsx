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
        toast.success('图片上传成功');
      }
    },
    onUploadError: (error) => {
      toast.error(`上传失败: ${error.message}`);
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
                      清除选择
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
                      '上传中...'
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        确认上传
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {isDragActive ? '松开以上传文件' : '拖放图片到这里，或点击选择图片'}
                  </p>
                  {fileRejections.length > 0 && (
                    <p className="text-sm text-destructive">文件格式不正确或超过大小限制</p>
                  )}
                  <p className="text-xs text-muted-foreground">支持的格式: JPG, PNG, GIF, WEBP (最大 5MB)</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Dropzone>
    </div>
  );
}
