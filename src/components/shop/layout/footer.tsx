import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className=" px-4 py-12 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold">NextShop</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Your modern e-commerce solution for all your shopping needs.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="font-medium">Shop</div>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/products" className="hover:underline">
                All Products
              </Link>
              <Link href="/categories" className="hover:underline">
                Categories
              </Link>
              <Link href="/products?sort=newest" className="hover:underline">
                New Arrivals
              </Link>
              <Link href="/products?sort=bestselling" className="hover:underline">
                Best Sellers
              </Link>
            </nav>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="font-medium">Company</div>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/about" className="hover:underline">
                About Us
              </Link>
              <Link href="/contact" className="hover:underline">
                Contact
              </Link>
              <Link href="/terms" className="hover:underline">
                Terms & Conditions
              </Link>
              <Link href="/privacy" className="hover:underline">
                Privacy Policy
              </Link>
            </nav>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="font-medium">Newsletter</div>
            <p className="text-sm text-muted-foreground">Subscribe to our newsletter for updates and promotions.</p>
            <form className="mt-2 flex gap-2">
              <Input type="email" placeholder="Enter your email" className="max-w-[220px]" required />
              <Button type="submit">Subscribe</Button>
            </form>
            <div className="mt-4 flex gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                  <Facebook className="h-5 w-5" />
                  <span className="sr-only">Facebook</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                  <Instagram className="h-5 w-5" />
                  <span className="sr-only">Instagram</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                  <Twitter className="h-5 w-5" />
                  <span className="sr-only">Twitter</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t pt-6 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} NextShop. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
