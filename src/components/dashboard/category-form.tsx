'use client';

import { createCategory } from '@/actions/categories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { SingleImageUpload } from './single-image-upload';

const formSchema = z.object({
  name: z.string().min(1, '请输入分类名称'),
  imageUrl: z.string().min(1, '请上传分类图片'),
});

type FormValues = z.infer<typeof formSchema>;

export function CategoryForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      imageUrl: '',
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: FormValues) {
    try {
      const result = await createCategory(values);
      if (result.success) {
        toast.success('分类创建成功');
        form.reset();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('操作失败');
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
              <FormLabel>分类名称</FormLabel>
              <FormControl>
                <Input placeholder="输入分类名称" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>分类图片</FormLabel>
              <FormControl>
                <SingleImageUpload value={field.value} onChange={field.onChange} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? '创建中...' : '创建分类'}
        </Button>
      </form>
    </Form>
  );
}
