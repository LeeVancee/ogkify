'use client';

import { useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Slider } from '@/components/ui/slider';
import type { Category } from '@/lib/types';
import { Suspense } from 'react';

interface ProductFiltersProps {
  categories: Category[];
  colors?: { id: string; name: string; value: string }[];
  sizes?: { id: string; name: string; value: string }[];
  maxPrice?: number;
}

function ProductFiltersContent({ categories, colors = [], sizes = [], maxPrice = 5000 }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentCategory = searchParams.get('category');
  const currentSort = searchParams.get('sort') || 'featured';
  const isFeatured = searchParams.get('featured') === 'true';
  const currentMinPrice = Number(searchParams.get('minPrice') || '0');
  const currentMaxPrice = Number(searchParams.get('maxPrice') || maxPrice.toString());

  // 获取已选择的颜色和尺寸名称
  const currentColorNames = searchParams.getAll('color');
  const currentSizeNames = searchParams.getAll('size');

  const createQueryString = (params: Record<string, string | string[] | null>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(params)) {
      if (value === null) {
        newSearchParams.delete(key);
      } else if (Array.isArray(value)) {
        // 处理数组值，例如多选的颜色和尺寸
        newSearchParams.delete(key); // 先删除旧的参数
        for (const val of value) {
          newSearchParams.append(key, val);
        }
      } else {
        newSearchParams.set(key, value);
      }
    }

    return newSearchParams.toString();
  };

  const handleCategoryChange = (categoryId: string) => {
    // 找到对应的分类名称
    const categoryName = categories.find((cat) => cat.id === categoryId)?.name || categoryId;

    startTransition(() => {
      router.push(
        `/products?${createQueryString({
          category: currentCategory === categoryName ? null : categoryName,
        })}`
      );
    });
  };

  const handleFeaturedChange = (value: boolean) => {
    startTransition(() => {
      router.push(`/products?${createQueryString({ featured: value ? 'true' : null })}`);
    });
  };

  const handleColorChange = (color: { id: string; name: string; value: string }) => {
    const colorName = color.name; // 使用颜色名称而不是ID

    const newColors = currentColorNames.includes(colorName)
      ? currentColorNames.filter((name) => name !== colorName)
      : [...currentColorNames, colorName];

    startTransition(() => {
      router.push(`/products?${createQueryString({ color: newColors.length ? newColors : null })}`);
    });
  };

  const handleSizeChange = (size: { id: string; name: string; value: string }) => {
    const sizeName = size.value; // 使用尺寸值而不是ID

    const newSizes = currentSizeNames.includes(sizeName)
      ? currentSizeNames.filter((name) => name !== sizeName)
      : [...currentSizeNames, sizeName];

    startTransition(() => {
      router.push(`/products?${createQueryString({ size: newSizes.length ? newSizes : null })}`);
    });
  };

  const handlePriceChange = (values: number[]) => {
    if (values.length === 2) {
      const [min, max] = values;
      startTransition(() => {
        router.push(
          `/products?${createQueryString({
            minPrice: min > 0 ? min.toString() : null,
            maxPrice: max < maxPrice ? max.toString() : null,
          })}`
        );
      });
    }
  };

  const handleResetFilters = () => {
    startTransition(() => {
      router.push('/products');
    });
  };

  const hasActiveFilters =
    currentCategory ||
    currentSort !== 'featured' ||
    isFeatured ||
    currentMinPrice > 0 ||
    currentMaxPrice < maxPrice ||
    currentColorNames.length > 0 ||
    currentSizeNames.length > 0;

  return (
    <div className="grid gap-6">
      <Accordion type="multiple" defaultValue={['categories', 'featured', 'price']}>
        <AccordionItem value="categories">
          <AccordionTrigger>分类</AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={currentCategory === category.name}
                    onCheckedChange={() => handleCategoryChange(category.id)}
                  />
                  <Label htmlFor={`category-${category.id}`} className="text-sm font-normal">
                    {category.name}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="featured">
          <AccordionTrigger>特色商品</AccordionTrigger>
          <AccordionContent>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured-products"
                checked={isFeatured}
                onCheckedChange={(checked) => handleFeaturedChange(!!checked)}
              />
              <Label htmlFor="featured-products" className="text-sm font-normal">
                仅显示特色商品
              </Label>
            </div>
          </AccordionContent>
        </AccordionItem>

        {colors.length > 0 && (
          <AccordionItem value="colors">
            <AccordionTrigger>颜色</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 gap-2">
                {colors.map((color) => (
                  <div key={color.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`color-${color.id}`}
                      checked={currentColorNames.includes(color.name)}
                      onCheckedChange={() => handleColorChange(color)}
                    />
                    <div className="flex items-center gap-1.5">
                      <div className="h-4 w-4 rounded-full border" style={{ backgroundColor: color.value }} />
                      <Label htmlFor={`color-${color.id}`} className="text-sm font-normal">
                        {color.name}
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {sizes.length > 0 && (
          <AccordionItem value="sizes">
            <AccordionTrigger>尺寸</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 gap-2">
                {sizes.map((size) => (
                  <div key={size.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`size-${size.id}`}
                      checked={currentSizeNames.includes(size.value)}
                      onCheckedChange={() => handleSizeChange(size)}
                    />
                    <Label htmlFor={`size-${size.id}`} className="text-sm font-normal">
                      {size.value}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        <AccordionItem value="price">
          <AccordionTrigger>价格范围</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Slider
                defaultValue={[currentMinPrice, currentMaxPrice]}
                min={0}
                max={maxPrice}
                step={50}
                onValueCommit={handlePriceChange}
              />
              <div className="flex items-center justify-between">
                <p className="text-sm">￥{currentMinPrice}</p>
                <p className="text-sm">￥{currentMaxPrice}</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Button variant="outline" className="w-full" onClick={handleResetFilters} disabled={!hasActiveFilters}>
        清除筛选
      </Button>
    </div>
  );
}

export function ProductFilters(props: ProductFiltersProps) {
  return (
    <Suspense
      fallback={
        <div className="grid gap-6">
          <Accordion type="multiple" defaultValue={['categories', 'featured', 'price']}>
            <AccordionItem value="categories">
              <AccordionTrigger>分类</AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-2">
                  <div className="h-4 w-full rounded-md bg-muted animate-pulse" />
                  <div className="h-4 w-full rounded-md bg-muted animate-pulse" />
                  <div className="h-4 w-full rounded-md bg-muted animate-pulse" />
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="price">
              <AccordionTrigger>价格范围</AccordionTrigger>
              <AccordionContent>
                <div className="h-4 w-full rounded-md bg-muted animate-pulse mt-4" />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      }
    >
      <ProductFiltersContent {...props} />
    </Suspense>
  );
}
