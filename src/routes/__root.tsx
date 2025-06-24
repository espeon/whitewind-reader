import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ThemeProvider } from "@/components/theme-provider";

export const Route = createRootRoute({
  component: () => (
    <ThemeProvider>
      <div className="flex flex-col min-h-screen max-w-screen h-full w-full dark:bg-black dark:text-white">
        <Outlet />
      </div>
      <TanStackRouterDevtools />
    </ThemeProvider>
  ),
});
