'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UploadThingImage } from '@/components/dashboard/upload-thing';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { createProduct } from '@/actions/products';

interface Category {
  id: string;
  name: string;
}

interface Color {
  id: string;
  name: string;
  value: string;
}

interface Size {
  id: string;
  name: string;
  value: string;
}

interface ProductFormProps {
  categories: Category[];
  colors: Color[];
  sizes: Size[];
}

const productFormSchema = z.object({
  name: z.string().min(1, {
    message: '商品名称至少需要1个字符。',
  }),
  description: z.string().min(1, {
    message: '商品描述至少需要1个字符。',
  }),
  price: z.string().refine((val) => !isNaN(Number(val)), {
    message: '价格必须是有效的数字。',
  }),
  categoryId: z.string({
    required_error: '请选择一个分类。',
  }),
  colorIds: z.array(z.string()).min(1, {
    message: '请至少选择一种颜色。',
  }),
  sizeIds: z.array(z.string()).min(1, {
    message: '请至少选择一种尺寸。',
  }),
  images: z.array(z.string()).min(1, {
    message: '请至少上传一张商品图片。',
  }),
  isFeatured: z.boolean().default(false),
  isArchived: z.boolean().default(false),
});

type FormValues = z.infer<typeof productFormSchema>;

export function ProductForm({ categories, colors, sizes }: ProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<any>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      description: '',
      price: '',
      categoryId: '',
      colorIds: [],
      sizeIds: [],
      images: [],
      isFeatured: false,
      isArchived: false,
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);

    try {
      const result = await createProduct(values);

      if (result?.error) {
        toast.error(result.error);
      }
      router.push('/dashboard/products');
    } catch (error) {
      toast.error('创建商品失败。请稍后重试。');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>商品名称</FormLabel>
              <FormControl>
                <Input placeholder="输入商品名称" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>商品描述</FormLabel>
              <FormControl>
                <Textarea placeholder="描述商品..." className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>价格</FormLabel>
              <FormControl>
                <Input placeholder="99.99" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>分类</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <FormField
            control={form.control}
            name="isFeatured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">精选商品</FormLabel>
                  <FormDescription>精选商品将会显示在首页上。</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isArchived"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">归档商品</FormLabel>
                  <FormDescription>归档商品将不会显示在商店中。</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="colorIds"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel>颜色</FormLabel>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {colors.map((color) => (
                  <FormField
                    key={color.id}
                    control={form.control}
                    name="colorIds"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={color.id}
                          className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(color.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, color.id])
                                  : field.onChange(field.value?.filter((value: string) => value !== color.id));
                              }}
                            />
                          </FormControl>
                          <div className="flex items-center gap-2">
                            <div className="h-5 w-5 rounded-full border" style={{ backgroundColor: color.value }} />
                            <FormLabel className="font-normal">{color.name}</FormLabel>
                          </div>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sizeIds"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel>尺寸</FormLabel>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {sizes.map((size) => (
                  <FormField
                    key={size.id}
                    control={form.control}
                    name="sizeIds"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={size.id}
                          className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(size.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, size.id])
                                  : field.onChange(field.value?.filter((value: string) => value !== size.id));
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {size.name} ({size.value})
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>商品图片</FormLabel>
              <FormControl>
                <UploadThingImage value={field.value} onChange={field.onChange} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
          {isLoading ? '创建中...' : '创建商品'}
        </Button>
      </form>
    </Form>
  );
}
