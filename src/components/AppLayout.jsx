import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import { SidebarProvider, SidebarInset } from './ui/sidebar';

export default function AppLayout({ children, showSidebar = true }) {
  if (!showSidebar) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">{children}</main>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader showSidebarTrigger />
        <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
