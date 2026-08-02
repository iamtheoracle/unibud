import React from "react";
import ConnectedAccounts from "@/components/social/ConnectedAccounts";

/**
 * SocialAccountsCard — wraps the existing ConnectedAccounts component.
 * Shows connected social account previews and actions.
 */
export default function SocialAccountsCard() {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground mb-3">
        Connect your accounts to preview and share content across platforms.
      </p>
      <ConnectedAccounts />
    </div>
  );
}