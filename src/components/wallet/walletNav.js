import {
  Home, Wallet, CreditCard, ArrowLeftRight, PiggyBank, Landmark,
  PieChart, Sparkles, ShieldCheck,
} from "lucide-react";

export const WALLET_TABS = [
  { key: "home", label: "Home", icon: Home },
  { key: "accounts", label: "Accounts", icon: Wallet },
  { key: "cards", label: "Cards", icon: CreditCard },
  { key: "activity", label: "Activity", icon: ArrowLeftRight },
  { key: "savings", label: "Savings", icon: PiggyBank },
  { key: "loans", label: "Loans", icon: Landmark },
  { key: "budget", label: "Budget", icon: PieChart },
  { key: "insights", label: "Insights", icon: Sparkles },
  { key: "security", label: "Security", icon: ShieldCheck },
];