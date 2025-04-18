import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import Link from "next/link"

export default function CheckoutSuccessPage() {
  return (
    <div className="container flex flex-col items-center justify-center px-4 py-16 md:px-6">
      <CheckCircle className="mb-4 h-16 w-16 text-green-500" />
      <h1 className="mb-2 text-2xl font-bold">Order Confirmed!</h1>
      <p className="mb-8 max-w-md text-center text-muted-foreground">
        Thank you for your purchase. Your order has been confirmed and will be shipped soon. We've sent a confirmation
        email with your order details.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/account/orders">View Orders</Link>
        </Button>
      </div>
    </div>
  )
}
