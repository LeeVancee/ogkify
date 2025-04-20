'use client';
import type * as React from 'react';
import { LayoutDashboard, ShoppingBag, ShoppingCart, Package, Palette, Ruler, Grid } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

import { ActiveLink } from './active-link';
import { NavMain } from './nav-main';
import { NavUser } from './nav-user';

// Navigation item type definition

// EMS navigation data
const emsNavigation = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
    items: [],
  },

  {
    title: 'Categories',
    url: '/dashboard/categories',
    icon: Grid,
    items: [
      {
        title: 'All Categories',
        url: '/dashboard/categories',
      },
      {
        title: 'Add Category',
        url: '/dashboard/categories/new',
      },
    ],
  },
  {
    title: 'Colors',
    url: '/dashboard/colors',
    icon: Palette,
    items: [
      {
        title: 'All Colors',
        url: '/dashboard/colors',
      },
      {
        title: 'Add Color',
        url: '/dashboard/colors/new',
      },
    ],
  },
  {
    title: 'Sizes',
    url: '/dashboard/sizes',
    icon: Ruler,
    items: [
      {
        title: 'All Sizes',
        url: '/dashboard/sizes',
      },
      {
        title: 'Add Size',
        url: '/dashboard/sizes/new',
      },
    ],
  },
  {
    title: 'Products',
    url: '/dashboard/products',
    icon: Package,
    items: [
      {
        title: 'All Products',
        url: '/dashboard/products',
      },
      {
        title: 'Add Product',
        url: '/dashboard/products/new',
      },
    ],
  },

  {
    title: 'Orders',
    url: '/dashboard/orders',
    icon: ShoppingCart,
    items: [],
  },
];

export function EnhancedSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <ActiveLink href="/dashboard" exact>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <ShoppingBag className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">OGKIFY</span>
                  <span className="">v1.0.0</span>
                </div>
              </ActiveLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={emsNavigation} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
