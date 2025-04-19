'use client';

import { useState, useEffect } from 'react';
import type * as React from 'react';
import { LayoutDashboard, ShoppingBag, ShoppingCart, Package, Palette, Ruler, Grid, ChevronDown } from 'lucide-react';
import { usePathname } from 'next/navigation';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { ActiveLink } from './active-link';
import { NavMain } from './nav-main';
import { NavUser } from './nav-user';

// Navigation item type definition
interface NavItem {
  title?: string;
  url?: string;
  icon?: React.ElementType;
  items: { title: string; url: string }[];
}

// EMS navigation data
const emsNavigation = [
  {
    title: '仪表盘',
    url: '/dashboard',
    icon: LayoutDashboard,
    items: [],
  },

  {
    title: '分类管理',
    url: '/dashboard/categories',
    icon: Grid,
    items: [],
  },
  {
    title: '颜色管理',
    url: '/dashboard/colors',
    icon: Palette,
    items: [],
  },
  {
    title: '尺寸管理',
    url: '/dashboard/sizes',
    icon: Ruler,
    items: [],
  },
  {
    title: '商品管理',
    url: '/dashboard/products',
    icon: Package,
    items: [
      {
        title: '所有商品',
        url: '/dashboard/products',
      },
      {
        title: '添加商品',
        url: '/dashboard/products/new',
      },
    ],
  },

  {
    title: '订单管理',
    url: '/dashboard/orders',
    icon: ShoppingCart,
    items: [
      {
        title: '所有订单',
        url: '/dashboard/orders',
      },
      {
        title: '待处理',
        url: '/dashboard/orders/pending',
      },
      {
        title: '已完成',
        url: '/dashboard/orders/completed',
      },
    ],
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
                  <span className="font-semibold">电商管理系统</span>
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
