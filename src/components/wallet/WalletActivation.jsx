import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Wallet, ShieldCheck, Zap, TrendingUp, Sparkles, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { queryClientInstance } from "@/lib/query-client";

const BENEFITS = [
  { icon: Zap, title: "Instant transfers", desc: "Move money between accounts in seconds." },
  { icon: ShieldCheck, title: "Oracle-secured", desc: "Every transaction protected by Oracle." },
  { icon: TrendingUp, title: "Smart savings", desc: "Goals, budgets, and Spark insights." },
];

/** Shown when a user opens /wallet without an activated UNIBUD Wallet. */
export default function WalletActivation({ user }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activating, setActivating] = useState(false);

  const activate = async () => {
    setActivating(true);
    try {
      await base44.entities.Wallet.create({
        owner_type: "student",
        owner_id: user?.id,
        owner_name: user?.full_name ? `${user.full_name} · Student Wallet` : "Student Wallet",
        balance: 0,
        available_balance: 0,
        currency: "NGN",
        status: "active",
        institution_id: user?.data?.institution_id || "",
      });
      await queryClientInstance.invalidateQueries({ queryKey: ["walletWallets"] });
      toast({ title: "Wallet activated 🎉", description: "Welcome to UNIBUD Wallet." });
    } catch (e) {
      toast({ title: "Couldn't activate", description: e.message || "Please try again later." });
    }
    setActivating(false);
  };

  return (
    <div className="min-h-screen flex flex-col pb-10">
      <div className="pt-12 pb-3 px-5 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-card soft-shadow flex items-center justify-center spring-tap border border-border/30">
          <ArrowLeft className="w-[18px] h-[18px] text-foreground" strokeWidth={2} />
        </button>
        <div className="flex-1">
          <h1 className="font-heading font-extrabold text-[24px] text-foreground">Wallet</h1>
          <p className="text-[12px] text-muted-foreground">Activate to start banking</p>
        </div>
      </div>

      <div className="flex-1 px-5 flex flex-col max-w-[560px] mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-[28px] p-6 soft-shadow border border-white/10 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, hsl(222 75% 17%), hsl(221 83% 34%))" }}
        >
          <div className="absolute -right-10 -top-10 w-36 h-36 rounded-full bg-white/5 blur-2xl" />
          <Wallet className="w-8 h-8 text-white mb-3 relative" strokeWidth={1.8} />
          <h2 className="font-heading font-extrabold text-[22px] text-white tracking-tight relative">UNIBUD Wallet</h2>
          <p className="text-[13px] text-white/70 mt-1 relative">Premium banking built for student life.</p>
        </motion.div>

        <div className="mt-5 space-y-3">
          {BENEFITS.map((b) => (
            <div key={b.title} className="flex items-center gap-3 p-3.5 rounded-[20px] bg-card soft-shadow border border-border/40">
              <div className="w-10 h-10 rounded-[14px] bg-primary/8 flex items-center justify-center flex-shrink-0">
                <b.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-foreground">{b.title}</p>
                <p className="text-[11px] text-muted-foreground">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={activate}
          disabled={activating}
          className="w-full mt-6 py-3.5 rounded-[18px] bg-primary text-primary-foreground text-[14px] font-semibold spring-tap flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {activating ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Activating…</>
          ) : (
            <><Sparkles className="w-4 h-4" /> Activate my Wallet</>
          )}
        </button>
        <p className="text-[11px] text-muted-foreground text-center mt-3 leading-relaxed">
          By activating, you agree to UNIBUD Wallet terms. Oracle secures your account.
        </p>
      </div>
    </div>
  );
}