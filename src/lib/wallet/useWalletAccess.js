import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

/**
 * useWalletAccess — determines whether the current user has activated a
 * UNIBUD Wallet account. Only activated users see banking features; the
 * Wallet workspace and its navigation entry stay hidden for everyone else.
 * Shares the ["walletWallets"] query key so checks dedupe across the app.
 */
export function useWalletAccess() {
  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });
  const enabled = !!user;
  const { data: wallets, isLoading } = useQuery({
    queryKey: ["walletWallets"],
    queryFn: () => base44.entities.Wallet.list(),
    enabled,
  });
  const mine = (wallets || []).filter((w) => w.owner_id === user?.id || w.created_by_id === user?.id);
  return { hasWallet: mine.length > 0, isLoading: !enabled || isLoading, user, wallets: mine };
}