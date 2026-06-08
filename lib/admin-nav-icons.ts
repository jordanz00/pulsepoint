/**
 * Lucide icon map for admin nav — import only from Client Components.
 *
 * Server layouts pass `AdminNavItem.iconId` (plain string); client sidebar
 * resolves the React icon component here.
 */

import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BarChart2,
  CalendarDays,
  ClipboardList,
  Contact,
  Gavel,
  GraduationCap,
  Handshake,
  Heart,
  Landmark,
  LayoutDashboard,
  LayoutGrid,
  Megaphone,
  MessageCircle,
  Sparkles,
  Settings,
  ShoppingCart,
  Upload,
  Users,
} from "lucide-react";
import type { AdminNavIconId } from "@/lib/nav-config";

export const ADMIN_NAV_ICONS: Record<AdminNavIconId, LucideIcon> = {
  dashboard: LayoutDashboard,
  users: Users,
  calendar: CalendarDays,
  alert: AlertTriangle,
  graduation: GraduationCap,
  cart: ShoppingCart,
  heart: Heart,
  megaphone: Megaphone,
  chart: BarChart2,
  intelligence: Sparkles,
  crm: Contact,
  partnerships: Handshake,
  advocacy: Landmark,
  communities: MessageCircle,
  committees: Gavel,
  suite: LayoutGrid,
  settings: Settings,
  upload: Upload,
  clipboard: ClipboardList,
};

export function adminNavIcon(id: AdminNavIconId): LucideIcon {
  return ADMIN_NAV_ICONS[id];
}
