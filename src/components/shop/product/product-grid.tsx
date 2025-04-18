import Link from "next/link"
import Image from "next/image"
import type { Product } from "@/lib/types"
import { formatPrice } from "@/lib/utils"

interface ProductGridProps {
  products: Product[]
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-center text-muted-foreground">No products found.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <Link key={product.id} href={`/products/${product.id}`} className="group overflow-hidden rounded-lg border">
          <div className="aspect-square overflow-hidden bg-muted">
            <Image
              src={product.images[0] || "/placeholder.svg?height=400&width=400"}
              alt={product.name}
              width={400}
              height={400}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="p-4">
            <h3 className="font-medium">{product.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{product.category}</p>
            <p className="mt-2 font-medium">{formatPrice(product.price)}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}
