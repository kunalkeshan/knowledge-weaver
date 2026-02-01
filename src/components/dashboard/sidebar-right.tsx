import { Plus } from 'lucide-react'
import * as React from 'react'

import { Calendars } from '@/components/dashboard/calendars'
import { DatePicker } from '@/components/dashboard/date-picker'
import { NavUser } from '@/components/dashboard/nav-user'
import { AgentKnowledgeBaseSidebar } from '@/components/knowledge-base'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar'

const calendars = [
  {
    name: 'My Calendars',
    items: ['Personal', 'Work', 'Family'],
  },
  {
    name: 'Favorites',
    items: ['Holidays', 'Birthdays'],
  },
  {
    name: 'Other',
    items: ['Travel', 'Reminders', 'Deadlines'],
  },
]

interface SidebarRightProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    name: string
    email: string
    image?: string | null
  }
  /** When provided, shows knowledge base management instead of calendar */
  agentId?: string
}

const SIDEBAR_RIGHT_WIDTH = '22rem'

export function SidebarRight({ user, agentId, ...props }: SidebarRightProps) {
  return (
    <Sidebar
      collapsible="none"
      className="sticky top-0 hidden h-svh max-w-(--sidebar-width) overflow-x-hidden border-l lg:flex"
      style={{ '--sidebar-width': SIDEBAR_RIGHT_WIDTH } as React.CSSProperties}
      {...props}
    >
      <SidebarHeader className="h-16 border-b border-sidebar-border">
        <NavUser user={user} />
      </SidebarHeader>
      {agentId ? (
        <SidebarContent className="flex min-h-0 min-w-0 flex-col overflow-hidden p-0">
          <AgentKnowledgeBaseSidebar agentId={agentId} />
        </SidebarContent>
      ) : (
        <>
          <SidebarContent>
            <DatePicker />
            <SidebarSeparator className="mx-0" />
            <Calendars calendars={calendars} />
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Plus />
                  <span>New Calendar</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </>
      )}
    </Sidebar>
  )
}
