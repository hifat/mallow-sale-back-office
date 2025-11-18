"use client"

import type * as React from "react"
import { Package, ChefHat, Scale, BarChart3, Settings, LogOut, Warehouse, Tag, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useI18n } from "@/contexts/i18n-context"
import { useAuth } from "@/contexts/auth-context"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const getNavItems = (t: (key: string) => string) => [
  {
    titleKey: "navigation.dashboard",
    title: t("navigation.dashboard"),
    url: "/dashboard",
    icon: BarChart3,
  },
  {
    titleKey: "navigation.inventory",
    title: t("navigation.inventory"),
    url: "/inventory",
    icon: Package,
  },
  {
    titleKey: "navigation.shopping",
    title: t("navigation.shopping"),
    url: "/shopping",
    icon: ShoppingCart,
  },
  {
    titleKey: "navigation.stocks",
    title: t("navigation.stocks"),
    url: "/stocks",
    icon: Warehouse,
  },
  {
    titleKey: "navigation.suppliers",
    title: t("navigation.suppliers"),
    url: "/suppliers",
    icon: Package,
  },
  {
    titleKey: "navigation.recipes",
    title: t("navigation.recipes"),
    url: "/recipes",
    icon: ChefHat,
  },
  {
    titleKey: "navigation.promotions",
    title: t("navigation.promotions"),
    url: "/promotions",
    icon: Tag,
  },
  {
    titleKey: "navigation.usageUnits",
    title: t("navigation.usageUnits"),
    url: "/usage-units",
    icon: Scale,
  },
  {
    titleKey: "navigation.settings",
    title: t("navigation.settings"),
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { t } = useI18n()
  const { signOut } = useAuth()
  
  const navItems = getNavItems(t)

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="bg-white" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-yellow-500 text-white">
                  <Package className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-gray-900">Mallow Sale</span>
                  <span className="truncate text-xs text-gray-600">Back Office</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-600">{t("common.management")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.titleKey}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                    className="data-[active=true]:bg-yellow-100 data-[active=true]:text-yellow-900 hover:bg-yellow-50"
                  >
                    <Link href={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="hover:bg-red-50 hover:text-red-700"
              tooltip={t("common.logout")}
              onClick={signOut}
            >
              <LogOut className="size-4" />
              <span>{t("common.logout")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
