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
import { updateProduct } from '@/actions/products';

const formSchema = z.object({
  name: z.string().min(1, {
    message: 'Product name must be at least 1 character.',
  }),
  description: z.string().min(1, {
    message: 'Product description must be at least 1 character.',
  }),
  price: z.string().refine((val) => !isNaN(Number(val)), {
    message: 'Price must be a valid number.',
  }),
  categoryId: z.string({
    required_error: 'Please select a category.',
  }),
  colorIds: z.array(z.string()).min(1, {
    message: 'Please select at least one color.',
  }),
  sizeIds: z.array(z.string()).min(1, {
    message: 'Please select at least one size.',
  }),
  images: z.array(z.string()).min(1, {
    message: 'Please upload at least one product image.',
  }),
  isFeatured: z.boolean().default(false),
  isArchived: z.boolean().default(false),
});

interface ProductFormValues {
  id: string;
  name: string;
  description: string;
  price: string;
  categoryId: string;
  colorIds: string[];
  sizeIds: string[];
  images: string[];
  isFeatured: boolean;
  isArchived: boolean;
}

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

interface EditProductFormProps {
  product: ProductFormValues;
  categories: Category[];
  colors: Color[];
  sizes: Size[];
}

export function EditProductForm({ product, categories, colors, sizes }: EditProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product.name,
      description: product.description,
      price: product.price,
      categoryId: product.categoryId,
      colorIds: product.colorIds,
      sizeIds: product.sizeIds,
      images: product.images,
      isFeatured: product.isFeatured,
      isArchived: product.isArchived,
    },
  });

  async function onSubmit(values: any) {
    setIsLoading(true);

    try {
      const result = await updateProduct(product.id, values);

      if (result?.error) {
        toast.error(result.error);
        setIsLoading(false);
      }
      toast.success('Product updated successfully');
      router.push('/dashboard/products');
    } catch (error) {
      toast.error('Update product failed. Please try again later.');
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
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="Input product name" {...field} />
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
              <FormLabel>Product Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe product..." className="resize-none" {...field} />
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
              <FormLabel>Price</FormLabel>
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
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
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
                  <FormLabel className="text-base">Featured Product</FormLabel>
                  <FormDescription>Featured products will be displayed on the homepage.</FormDescription>
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
                  <FormLabel className="text-base">Archived Product</FormLabel>
                  <FormDescription>Archived products will not be displayed in the store.</FormDescription>
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
                <FormLabel>Color</FormLabel>
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
                <FormLabel>Size</FormLabel>
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
              <FormLabel>Product Images</FormLabel>
              <FormControl>
                <UploadThingImage value={field.value} onChange={field.onChange} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update Product'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push('/dashboard/products')}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
