import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

/**
 * ConfirmDialog — full-screen modal reserved for critical confirmations and
 * destructive actions (delete account, log out all devices, irreversible ops).
 * Use sparingly; default to non-blocking toasts for everyday feedback.
 */
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
}) {
  return (
    <AlertDialog open={open} onOpenChange={(v) => { if (!v) onCancel?.(); }}>
      <AlertDialogContent className="max-w-[380px] rounded-3xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[18px] font-heading font-semibold">{title}</AlertDialogTitle>
          {description && <AlertDialogDescription className="text-[14px] leading-relaxed">{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row gap-2">
          <AlertDialogCancel className="flex-1 rounded-full mt-0">{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={cn("flex-1 rounded-full", destructive && "bg-destructive text-destructive-foreground hover:bg-destructive/90")}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}