"use client"

import { useState } from "react"
import type { Product } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Star } from "lucide-react"

interface ProductTabsProps {
  product: Product
}

export function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState("description")

  const tabs = [
    { id: "description", label: "Description" },
    { id: "specifications", label: "Specifications" },
    { id: "reviews", label: `Reviews (${product.reviews})` },
  ]

  return (
    <div className="mt-12">
      <div className="border-b">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2 text-sm font-medium whitespace-nowrap",
                activeTab === tab.id
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="py-6">
        {activeTab === "description" && (
          <div className="prose max-w-none">
            <p>{product.description}</p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
              ea commodo consequat.
            </p>
            <p>
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est
              laborum.
            </p>
          </div>
        )}

        {activeTab === "specifications" && (
          <div className="grid gap-4">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {product.specifications?.map((spec) => (
                <div key={spec.name} className="grid grid-cols-2 gap-2 border-b pb-2">
                  <div className="font-medium">{spec.name}</div>
                  <div className="text-muted-foreground">{spec.value}</div>
                </div>
              )) || <p className="text-muted-foreground">No specifications available.</p>}
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="grid gap-6">
            {product.reviewsList?.map((review) => (
              <div key={review.id} className="grid gap-2">
                <div className="flex items-center gap-2">
                  <div className="font-medium">{review.author}</div>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating ? "fill-primary text-primary" : "fill-muted text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground">{review.date}</div>
                </div>
                <p className="text-muted-foreground">{review.content}</p>
              </div>
            )) || <p className="text-muted-foreground">No reviews yet.</p>}
          </div>
        )}
      </div>
    </div>
  )
}
