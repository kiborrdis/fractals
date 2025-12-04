import * as React from "react";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { MantineProvider } from "@mantine/core";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <React.StrictMode>
        <MantineProvider defaultColorScheme='dark'>
          <Outlet />
        </MantineProvider>
      </React.StrictMode>

      <TanStackRouterDevtools position='bottom-right' />
    </>
  );
}
