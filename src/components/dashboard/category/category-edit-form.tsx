'use client';

import { updateCategory } from '@/actions/categories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { SingleImageUpload } from '../single-image-upload';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  name: z.string().min(1, 'Input category name'),
  imageUrl: z.string().min(1, 'Upload category image'),
});

type FormValues = z.infer<typeof formSchema>;

interface Category {
  id: string;
  name: string;
  imageUrl: string | null;
}

interface CategoryEditFormProps {
  category: Category;
}

export function CategoryEditForm({ category }: CategoryEditFormProps) {
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category.name,
      imageUrl: category.imageUrl || '',
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: FormValues) {
    try {
      const result = await updateCategory(category.id, values.name);
      if (result.success) {
        toast.success('Category updated successfully');
        router.push('/dashboard/categories');
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Operation failed');
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
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input placeholder="Input category name" {...field} />
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
              <FormLabel>Category Image</FormLabel>
              <FormControl>
                <SingleImageUpload value={field.value} onChange={field.onChange} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Updating...' : 'Update Category'}
        </Button>
      </form>
    </Form>
  );
}
