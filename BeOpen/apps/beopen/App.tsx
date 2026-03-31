import { App as AppProvider } from "@superblocksteam/library";
import { Outlet } from "react-router";
import { Toaster } from "./components/common/sonner";

export default function AppComponent() {
  return (
    <>
      {/* Do not remove the AppProvider */}
      <AppProvider className="h-full w-full">
        <Outlet />
      </AppProvider>
      <Toaster />
    </>
  );
}
