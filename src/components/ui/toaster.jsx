import { AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <ToastProvider>
      <div className="fixed top-0 inset-x-0 z-[100] flex flex-col items-center gap-2 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pointer-events-none">
        <AnimatePresence initial={false}>
          {toasts.map(({ id, title, description, action, variant, open }) => (
            <Toast key={id} variant={variant} onDismiss={() => dismiss(id)} className="max-w-[420px] w-full">
              <div className="flex-1 min-w-0 grid gap-0.5">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && <ToastDescription>{description}</ToastDescription>}
              </div>
              {action}
              <ToastClose onClick={() => dismiss(id)} aria-label="Dismiss" />
            </Toast>
          ))}
        </AnimatePresence>
      </div>
      <ToastViewport />
    </ToastProvider>
  );
}