"use client"

import { useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import type { Category } from "@/lib/types"

interface ProductFiltersProps {
  categories: Category[]
}

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentCategory = searchParams.get("category")
  const currentSort = searchParams.get("sort") || "featured"

  const createQueryString = (params: Record<string, string | null>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString())

    for (const [key, value] of Object.entries(params)) {
      if (value === null) {
        newSearchParams.delete(key)
      } else {
        newSearchParams.set(key, value)
      }
    }

    return newSearchParams.toString()
  }

  const handleCategoryChange = (categoryId: string) => {
    startTransition(() => {
      router.push(
        `/products?${createQueryString({
          category: currentCategory === categoryId ? null : categoryId,
        })}`,
      )
    })
  }

  const handleSortChange = (value: string) => {
    startTransition(() => {
      router.push(`/products?${createQueryString({ sort: value })}`)
    })
  }

  return (
    <div className="grid gap-6">
      <Accordion type="single" collapsible defaultValue="categories">
        <AccordionItem value="categories">
          <AccordionTrigger>Categories</AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={currentCategory === category.id}
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
        <AccordionItem value="sort">
          <AccordionTrigger>Sort By</AccordionTrigger>
          <AccordionContent>
            <RadioGroup value={currentSort} onValueChange={handleSortChange} className="grid gap-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="featured" id="sort-featured" />
                <Label htmlFor="sort-featured" className="text-sm font-normal">
                  Featured
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="newest" id="sort-newest" />
                <Label htmlFor="sort-newest" className="text-sm font-normal">
                  Newest
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="price-asc" id="sort-price-asc" />
                <Label htmlFor="sort-price-asc" className="text-sm font-normal">
                  Price: Low to High
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="price-desc" id="sort-price-desc" />
                <Label htmlFor="sort-price-desc" className="text-sm font-normal">
                  Price: High to Low
                </Label>
              </div>
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          startTransition(() => {
            router.push("/products")
          })
        }}
        disabled={!currentCategory && currentSort === "featured"}
      >
        Reset Filters
      </Button>
    </div>
  )
}
