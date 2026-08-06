/**
 * OsTopBar — backward-compatibility shim.
 * The canonical top bar is now GlobalTopBar, rendered globally in AppShell.
 * This re-export ensures any remaining direct imports don't break.
 */
export { default } from "@/components/layout/GlobalTopBar";