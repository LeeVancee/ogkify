import type { Category } from "./types"

// Mock data for categories
const categories: Category[] = [
  {
    id: "electronics",
    name: "Electronics",
    description: "Gadgets and electronic devices",
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    id: "clothing",
    name: "Clothing",
    description: "Apparel and fashion items",
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    id: "home",
    name: "Home & Kitchen",
    description: "Products for your home",
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    id: "beauty",
    name: "Beauty & Personal Care",
    description: "Skincare, makeup, and personal care items",
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    id: "sports",
    name: "Sports & Outdoors",
    description: "Equipment for sports and outdoor activities",
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    id: "books",
    name: "Books",
    description: "Books, e-books, and audiobooks",
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    id: "toys",
    name: "Toys & Games",
    description: "Toys, games, and entertainment for all ages",
    image: "/placeholder.svg?height=400&width=400",
  },
]

export async function getCategories() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  return categories
}

export async function getCategory(id: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200))

  return categories.find((category) => category.id === id) || null
}
