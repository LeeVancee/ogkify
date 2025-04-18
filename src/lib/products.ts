import type { Product } from "./types"

// Mock data for products
const products: Product[] = [
  {
    id: "1",
    name: "Wireless Bluetooth Headphones",
    description: "Premium noise-cancelling headphones with crystal-clear sound quality and long battery life.",
    price: 199.99,
    images: [
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
    ],
    category: "electronics",
    inStock: true,
    rating: 4,
    reviews: 128,
    discount: 10,
    freeShipping: true,
    options: [
      {
        name: "Color",
        values: ["Black", "White", "Blue"],
      },
    ],
    specifications: [
      { name: "Battery Life", value: "Up to 30 hours" },
      { name: "Connectivity", value: "Bluetooth 5.0" },
      { name: "Noise Cancellation", value: "Active" },
      { name: "Weight", value: "250g" },
    ],
    reviewsList: [
      {
        id: "r1",
        author: "John D.",
        rating: 5,
        date: "2023-05-15",
        content:
          "Best headphones I've ever owned. The sound quality is amazing and the noise cancellation works perfectly.",
      },
      {
        id: "r2",
        author: "Sarah M.",
        rating: 4,
        date: "2023-04-22",
        content: "Great headphones, very comfortable for long listening sessions. Battery life is impressive.",
      },
    ],
  },
  {
    id: "2",
    name: "Smart Fitness Watch",
    description:
      "Track your fitness goals with this advanced smartwatch featuring heart rate monitoring, GPS, and more.",
    price: 149.99,
    images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
    category: "electronics",
    inStock: true,
    rating: 4,
    reviews: 95,
    discount: 0,
    freeShipping: true,
    options: [
      {
        name: "Color",
        values: ["Black", "Silver", "Rose Gold"],
      },
      {
        name: "Size",
        values: ["Small", "Medium", "Large"],
      },
    ],
    specifications: [
      { name: "Battery Life", value: "Up to 7 days" },
      { name: "Water Resistance", value: "5 ATM" },
      { name: "Display", value: '1.4" AMOLED' },
      { name: "Sensors", value: "Heart rate, GPS, Accelerometer" },
    ],
  },
  {
    id: "3",
    name: "Ultra HD 4K Smart TV",
    description: 'Experience stunning visuals with this 55" 4K Smart TV featuring HDR and built-in streaming apps.',
    price: 699.99,
    images: ["/placeholder.svg?height=600&width=600"],
    category: "electronics",
    inStock: true,
    rating: 5,
    reviews: 42,
    discount: 15,
    freeShipping: false,
    specifications: [
      { name: "Screen Size", value: "55 inches" },
      { name: "Resolution", value: "4K Ultra HD (3840 x 2160)" },
      { name: "HDR", value: "Yes" },
      { name: "Smart TV", value: "Yes, with voice control" },
    ],
  },
  {
    id: "4",
    name: "Premium Cotton T-Shirt",
    description: "Soft, comfortable, and stylish 100% cotton t-shirt perfect for everyday wear.",
    price: 24.99,
    images: [
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
    ],
    category: "clothing",
    inStock: true,
    rating: 4,
    reviews: 210,
    discount: 0,
    freeShipping: true,
    options: [
      {
        name: "Color",
        values: ["White", "Black", "Gray", "Navy", "Red"],
      },
      {
        name: "Size",
        values: ["XS", "S", "M", "L", "XL", "XXL"],
      },
    ],
  },
  {
    id: "5",
    name: "Stainless Steel Water Bottle",
    description: "Keep your drinks hot or cold for hours with this vacuum-insulated stainless steel water bottle.",
    price: 29.99,
    images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
    category: "home",
    inStock: true,
    rating: 5,
    reviews: 75,
    discount: 0,
    freeShipping: true,
    options: [
      {
        name: "Color",
        values: ["Silver", "Black", "Blue", "Red"],
      },
      {
        name: "Size",
        values: ["500ml", "750ml", "1L"],
      },
    ],
    specifications: [
      { name: "Material", value: "18/8 Stainless Steel" },
      { name: "Insulation", value: "Double-wall vacuum" },
      { name: "Keeps Cold", value: "Up to 24 hours" },
      { name: "Keeps Hot", value: "Up to 12 hours" },
    ],
  },
  {
    id: "6",
    name: "Organic Face Moisturizer",
    description:
      "Hydrate and nourish your skin with this all-natural, organic face moisturizer suitable for all skin types.",
    price: 34.99,
    images: ["/placeholder.svg?height=600&width=600"],
    category: "beauty",
    inStock: true,
    rating: 4,
    reviews: 63,
    discount: 5,
    freeShipping: true,
    specifications: [
      { name: "Size", value: "50ml" },
      { name: "Ingredients", value: "Organic Aloe Vera, Jojoba Oil, Shea Butter" },
      { name: "Skin Type", value: "All Skin Types" },
      { name: "Cruelty-Free", value: "Yes" },
    ],
  },
  {
    id: "7",
    name: "Ergonomic Office Chair",
    description:
      "Work comfortably with this adjustable ergonomic office chair featuring lumbar support and breathable mesh.",
    price: 199.99,
    images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
    category: "home",
    inStock: true,
    rating: 4,
    reviews: 38,
    discount: 0,
    freeShipping: false,
    options: [
      {
        name: "Color",
        values: ["Black", "Gray"],
      },
    ],
    specifications: [
      { name: "Material", value: "Mesh and Metal Frame" },
      { name: "Weight Capacity", value: "300 lbs" },
      { name: "Adjustable Height", value: "Yes" },
      { name: "Armrests", value: "Adjustable" },
    ],
  },
  {
    id: "8",
    name: "Wireless Charging Pad",
    description: "Charge your compatible devices wirelessly with this sleek and efficient charging pad.",
    price: 39.99,
    images: ["/placeholder.svg?height=600&width=600"],
    category: "electronics",
    inStock: true,
    rating: 4,
    reviews: 52,
    discount: 0,
    freeShipping: true,
    options: [
      {
        name: "Color",
        values: ["Black", "White"],
      },
    ],
    specifications: [
      { name: "Input", value: "USB-C" },
      { name: "Output", value: "15W Max" },
      { name: "Compatible With", value: "Qi-enabled devices" },
      { name: "LED Indicator", value: "Yes" },
    ],
  },
]

interface GetProductsOptions {
  featured?: boolean
  category?: string
  sort?: string
  search?: string
}

export async function getProducts(options: GetProductsOptions = {}) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  let filteredProducts = [...products]

  // Filter by category
  if (options.category) {
    filteredProducts = filteredProducts.filter((product) => product.category === options.category)
  }

  // Filter by search query
  if (options.search) {
    const searchLower = options.search.toLowerCase()
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower),
    )
  }

  // Filter featured products
  if (options.featured) {
    filteredProducts = filteredProducts.filter((product) => product.discount > 0 || product.rating >= 4)
  }

  // Sort products
  if (options.sort) {
    switch (options.sort) {
      case "price-asc":
        filteredProducts.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        filteredProducts.sort((a, b) => b.price - a.price)
        break
      case "newest":
        // In a real app, you would sort by date
        filteredProducts.sort((a, b) => b.id.localeCompare(a.id))
        break
      case "bestselling":
        filteredProducts.sort((a, b) => b.reviews - a.reviews)
        break
      default:
        // Featured - sort by discount and rating
        filteredProducts.sort((a, b) => {
          if (a.discount !== b.discount) {
            return b.discount - a.discount
          }
          return b.rating - a.rating
        })
    }
  }

  return filteredProducts
}

export async function getProduct(id: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  return products.find((product) => product.id === id) || null
}

export async function getRelatedProducts(id: string, category: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  return products.filter((product) => product.id !== id && product.category === category).slice(0, 4)
}
