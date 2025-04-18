'use client';

import { useState, useEffect } from 'react';
import type * as React from 'react';
import { LayoutDashboard, ShoppingBag, ShoppingCart, Package, Palette, Ruler, Grid, ChevronDown } from 'lucide-react';
import { usePathname } from 'next/navigation';

import {
  Sidebar,
  SidebarContent,
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

// Navigation item type definition
interface NavItem {
  title: string;
  url: string;
  icon?: React.ElementType;
  items: { title: string; url: string }[];
}

// EMS navigation data
const emsNavigation: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
    items: [],
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
    title: 'Categories',
    url: '/dashboard/categories',
    icon: Grid,
    items: [],
  },
  {
    title: 'Colors',
    url: '/dashboard/colors',
    icon: Palette,
    items: [],
  },
  {
    title: 'Sizes',
    url: '/dashboard/sizes',
    icon: Ruler,
    items: [],
  },
  {
    title: 'Orders',
    url: '/dashboard/orders',
    icon: ShoppingCart,
    items: [
      {
        title: 'All Orders',
        url: '/dashboard/orders',
      },
      {
        title: 'Pending',
        url: '/dashboard/orders/pending',
      },
      {
        title: 'Completed',
        url: '/dashboard/orders/completed',
      },
    ],
  },
];

export function EnhancedSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  // Track expanded state for each navigation item with items
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  // Auto-expand sections based on current path
  useEffect(() => {
    const newExpandedState: Record<string, boolean> = {};

    emsNavigation.forEach((item) => {
      // If this section or any of its children match the current path, expand it
      const shouldExpand =
        item.url === pathname ||
        item.items.some((subItem) => subItem.url === pathname || pathname.startsWith(subItem.url));

      if (shouldExpand) {
        newExpandedState[item.title] = true;
      } else if (expandedItems[item.title] !== undefined) {
        // Preserve existing state if already set
        newExpandedState[item.title] = expandedItems[item.title];
      } else {
        // Default to collapsed
        newExpandedState[item.title] = false;
      }
    });

    setExpandedItems(newExpandedState);
  }, [pathname]);

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  // Check if an item is currently expanded
  const isExpanded = (title: string) => !!expandedItems[title];

  // Check if a nav item or any of its children is active
  const isNavItemActive = (item: NavItem) => {
    return pathname === item.url || (item.items.length > 0 && item.items.some((subItem) => subItem.url === pathname));
  };

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
                  <span className="font-semibold">EMS Admin</span>
                  <span className="">v1.0.0</span>
                </div>
              </ActiveLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {emsNavigation.map((item) => (
              <SidebarMenuItem key={item.title}>
                {item.items.length > 0 ? (
                  <Collapsible
                    open={isExpanded(item.title)}
                    onOpenChange={() => toggleExpanded(item.title)}
                    className="w-full"
                  >
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        className={cn(
                          'w-full justify-between',
                          isNavItemActive(item) && 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                        )}
                      >
                        <div className="flex items-center">
                          {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                          <span>{item.title}</span>
                        </div>
                        <ChevronDown
                          className={cn(
                            'h-4 w-4 transition-transform duration-200',
                            isExpanded(item.title) ? 'rotate-180' : 'rotate-0'
                          )}
                        />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="animate-accordion-down overflow-hidden data-[state=closed]:animate-accordion-up">
                      <SidebarMenuSub className="ml-0 border-l border-sidebar-border pl-4 mt-1">
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild>
                              <ActiveLink
                                href={subItem.url}
                                activeClassName="text-sidebar-accent-foreground font-medium"
                                exact
                              >
                                {subItem.title}
                              </ActiveLink>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <SidebarMenuButton asChild>
                    <ActiveLink href={item.url}>
                      {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                      {item.title}
                    </ActiveLink>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
