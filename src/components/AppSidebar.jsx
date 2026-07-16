import { NavLink, useLocation } from "react-router-dom";
import {
  CreditCard,
  ChefHat,
  ShoppingCart,
  ShieldCheck,
  Settings,
  Store,
  Users,
  NotebookTabsIcon,
  NotebookTextIcon,
  UserCircle,
} from "lucide-react";
import { useCartCount } from "../context/CartContext";
import { useAuth, useHasRole } from "../context/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "./ui/sidebar";

const SYSADMIN_NAV_ITEMS = [
  { to: "/sysadmin", label: "SysAdmin", icon: ShieldCheck },
  { to: "/tenant", label: "Tenants Management", icon: Store },
  { to: "/user", label: "Users Management", icon: Users },
];

export default function AppSidebar() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const count = useCartCount();
  const isSysAdmin = useHasRole("SysAdmin");
  const isAdmin = useHasRole("Admin");
  const tenantId = user?.restaurantId;

  const ADMIN_NAV_ITEMS = [
    { to: `/admin/${tenantId}/user`, label: "Users Management", icon: Users },
    {
      to: `/admin/${tenantId}/category`,
      label: "Category Management",
      icon: NotebookTabsIcon,
    },
    {
      to: `/admin/${tenantId}/menu`,
      label: "Menu Management",
      icon: NotebookTextIcon,
    },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      render={<NavLink to="/profile" />}
                      isActive={pathname === "/profile"}
                      tooltip="My Profile"
                    >
                      <UserCircle />
                      <span>My Profile</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarMenuItem>
              {isSysAdmin &&
                SYSADMIN_NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                  <SidebarMenuItem key={to}>
                    <SidebarMenuButton
                      render={<NavLink to={to} />}
                      isActive={pathname === to}
                      tooltip={label}
                    >
                      <Icon />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<NavLink to="/admin" />}
                    isActive={pathname === "/admin"}
                    tooltip="Admin"
                  >
                    <Settings />
                    <span>Admin</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {isAdmin &&
                ADMIN_NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                  <SidebarMenuItem key={to}>
                    <SidebarMenuButton
                      render={<NavLink to={to} />}
                      isActive={pathname === to}
                      tooltip={label}
                    >
                      <Icon />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
