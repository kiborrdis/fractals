import * as React from "react";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { MantineProvider, createTheme } from "@mantine/core";

export const Route = createRootRoute({
  component: RootComponent,
});

const theme = createTheme({
  primaryColor: 'green',
  defaultRadius: 'sm',
  colors: {
    dark: [
      '#C1C2C5', '#A6A7AB', '#909296', '#5c5f66',
      '#373A40', '#2C2E33', '#25262b', '#1A1B1E',
      '#141517', '#101113',
    ],
  },
  components: {
    Button: { defaultProps: { size: 'xs' } },
    TextInput: { defaultProps: { size: 'xs' } },
    NumberInput: { defaultProps: { size: 'xs' } },
    Select: { defaultProps: { size: 'xs' } },
    Paper: { defaultProps: { radius: 'md', p: 'md' } },
  },
});


function RootComponent() {
  return (
    <>
      <React.StrictMode>
        <MantineProvider theme={theme} defaultColorScheme='dark'>
          <Outlet />
        </MantineProvider>
      </React.StrictMode>

      <TanStackRouterDevtools position='bottom-right' />
    </>
  );
}
