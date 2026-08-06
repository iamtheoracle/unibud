import * as React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * UNIBUD notification system — lightweight, non-blocking toasts.
 * Top slide-in (mobile + desktop), no background dim, swipe-to-dismiss,
 * queued, auto-dismiss 2–4s, optional action buttons.
 */
const ToastProvider = React.forwardRef(({ ...props }, ref) => (
  <div ref={ref} {...props} />
));
ToastProvider.displayName = "ToastProvider";

const ToastViewport = () => null;

const variants = {
  default: "glass-strong border-border text-foreground",
  destructive: "bg-destructive/95 border-destructive text-destructive-foreground",
  success: "glass-strong border-success/40 text-foreground",
};

const Toast = React.forwardRef(({ className, variant = "default", onDismiss, ...props }, ref) => (
  <motion.div
    ref={ref}
    layout
    initial={{ opacity: 0, y: -48, scale: 0.96 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -48, scale: 0.96 }}
    transition={{ type: "spring", stiffness: 380, damping: 32 }}
    drag="y"
    dragConstraints={{ top: 0, bottom: 0 }}
    dragElastic={{ top: 0.6, bottom: 0.1 }}
    onDragEnd={(_, info) => { if (info.offset.y < -50 || info.offset.y > 120) onDismiss?.(); }}
    className={cn(
      "pointer-events-auto relative flex w-full items-start justify-between gap-3 rounded-2xl px-4 py-3.5 shadow-premium",
      variants[variant] || variants.default,
      className
    )}
    {...props}
  />
));
Toast.displayName = "Toast";

const ToastAction = React.forwardRef(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold text-primary bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-colors",
      className
    )}
    {...props}
  />
));
ToastAction.displayName = "ToastAction";

const ToastClose = React.forwardRef(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "shrink-0 rounded-full p-1 text-muted-foreground hover:text-foreground transition-colors",
      className
    )}
    {...props}
  >
    <X className="h-4 w-4" />
  </button>
));
ToastClose.displayName = "ToastClose";

const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-[14px] font-semibold leading-snug", className)} {...props} />
));
ToastTitle.displayName = "ToastTitle";

const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-[13px] opacity-80 leading-snug", className)} {...props} />
));
ToastDescription.displayName = "ToastDescription";

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};