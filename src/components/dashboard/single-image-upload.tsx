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
        toast.success('图片上传成功');
      }
    },
    onUploadError: (error) => {
      toast.error(`上传失败: ${error.message}`);
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
                    <ImagePlus className="mx-auto h-10 w-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {isDragActive ? '松开以上传文件' : '拖放图片到这里，或点击选择图片'}
                    </p>
                    {fileRejections.length > 0 && (
                      <p className="text-sm text-destructive">文件格式不正确或超过大小限制</p>
                    )}
                    <p className="text-xs text-muted-foreground">支持的格式: JPG, PNG, GIF, WEBP (最大 4MB)</p>
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
