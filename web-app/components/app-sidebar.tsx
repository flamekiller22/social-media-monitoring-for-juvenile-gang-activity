"use client"

import * as React from "react"
import {
  House,
  Key,
  User,
  UserRoundPlus
} from "lucide-react"

// import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
// import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Image from "next/image"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  existing: [
    {
      name: "Search Keyword",
      url: "#",
      icon: Key,
    },
    {
      name: "Search User",
      url: "#",
      icon: User,
    }
  ],
  add: [
    {
        name: "Add Keyword",
        url: "/dashboard/add-keyword",
        icon: Key,
    },
    {
        name: "Add User",
        url: "/dashboard/add-user",
        icon: UserRoundPlus,
    },
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      className="top-[--header-height] !h-[calc(100svh-var(--header-height))]"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center text-sidebar-primary-foreground">
                  {/* <Command className="size-4" /> */}
                  <Image src="/Delhi_Police_Logo.png" alt="" width={30} height={30} />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">VIT Bhopal</span>
                  <span className="truncate text-xs">EPICS Project</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild size="sm">
                    <a href="/dashboard">
                        <House />
                        <span>Home</span>
                    </a>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroup>
        {/* <NavMain items={data.navMain} /> */}
        <NavProjects title="Search Existing Data" projects={data.existing} />
        <NavProjects title="Add New Data" projects={data.add} />
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
