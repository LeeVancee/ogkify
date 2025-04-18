import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { CartItem } from "@/lib/types"
import { formatPrice } from "@/lib/utils"
import Image from "next/image"

interface CheckoutSummaryProps {
  items: CartItem[]
}

export function CheckoutSummary({ items }: CheckoutSummaryProps) {
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0)

  // Calculate shipping and tax (simplified for demo)
  const shipping = 0 // Free shipping
  const tax = subtotal * 0.1 // 10% tax
  const total = subtotal + shipping + tax

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-md border">
                <Image
                  src={item.image || "/placeholder.svg?height=64&width=64"}
                  alt={item.name}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 grid gap-0.5">
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-muted-foreground">Qty: {item.quantity}</div>
              </div>
              <div className="font-medium">{formatPrice(item.price * item.quantity)}</div>
            </div>
          ))}
        </div>

        <Separator />

        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Tax (10%)</span>
            <span>{formatPrice(tax)}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between font-medium">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        Prices and shipping costs are not confirmed until you've reached checkout.
      </CardFooter>
    </Card>
  )
}
