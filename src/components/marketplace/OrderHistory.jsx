import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { MessageCircle, ShoppingBag } from "lucide-react";

const TABS = [
  { key: "purchases", label: "My Purchases" },
  { key: "sales", label: "My Sales" },
];

const STATUS_STYLES = {
  pending: "bg-warning/10 text-warning",
  confirmed: "bg-primary/10 text-primary",
  completed: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
};

function formatPrice(amount) {
  return `₦${Number(amount || 0).toLocaleString()}`;
}

function formatDate(date) {
  if (!date) return "";
  try {
    return new Date(date).toLocaleDateString();
  } catch {
    return "";
  }
}

export default function OrderHistory({ user }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("purchases");

  const { data: purchases, isLoading: purchasesLoading } = useQuery({
    queryKey: ["marketplaceOrders", "purchases", user?.id],
    queryFn: () => base44.entities.MarketplaceOrder.filter({ buyer_id: user.id }, "-created_date", 50),
    enabled: !!user?.id,
  });

  const { data: sales, isLoading: salesLoading } = useQuery({
    queryKey: ["marketplaceOrders", "sales", user?.id],
    queryFn: async () => {
      try {
        return await base44.entities.MarketplaceOrder.filter({ seller_id: user.id }, "-created_date", 50);
      } catch {
        return await base44.entities.MarketplaceOrder.filter({ created_by_id: user.id }, "-created_date", 50);
      }
    },
    enabled: !!user?.id,
  });

  const orders = useMemo(
    () => (activeTab === "purchases" ? purchases || [] : sales || []),
    [activeTab, purchases, sales]
  );

  const isLoading = activeTab === "purchases" ? purchasesLoading : salesLoading;

  const contactOrder = async (order) => {
    const contact = order?.seller_contact || order?.contact || order?.seller_handle;
    if (contact) {
      await navigator.clipboard?.writeText(contact);
      toast({ title: "Contact copied", description: "Seller details copied to your clipboard." });
      return;
    }
    if (order?.conversation_id) {
      navigate(`/messages/${order.conversation_id}`);
      return;
    }
    toast({ title: "No contact available", description: "Contact details will appear once shared by the seller." });
  };

  return (
    <section className="space-y-4">
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap spring-tap ${
              activeTab === tab.key ? "bg-foreground text-background" : "bg-muted/30 text-muted-foreground border border-border/20"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-[22px] p-4 space-y-3">
              <div className="h-4 w-24 rounded-full shimmer" />
              <div className="h-5 w-32 rounded-full shimmer" />
              <div className="h-3 w-full rounded-full shimmer" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-card rounded-[24px] p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-muted/40 mx-auto mb-3 grid place-items-center">
            <ShoppingBag className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-[15px] font-semibold text-foreground">No orders yet</p>
          <p className="text-[12px] text-muted-foreground mt-1">Your marketplace orders will show up here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const status = order.status || "pending";
            return (
              <div key={order.id} className="glass-card rounded-[22px] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] text-muted-foreground">Order #{String(order.id).slice(0, 8)}</p>
                    <p className="text-[18px] font-bold text-primary mt-1">{formatPrice(order.amount)}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${STATUS_STYLES[status] || "bg-muted/40 text-foreground"}`}>
                    {status}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-[11px]">
                  <Meta label="Payment" value={(order.payment_method || "—").replaceAll("_", " ")} />
                  <Meta label="Date" value={formatDate(order.created_date)} />
                </div>
                <button
                  onClick={() => contactOrder(order)}
                  className="mt-4 w-full py-2.5 rounded-[14px] bg-primary/10 text-primary font-semibold text-[12px] spring-tap flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> Contact
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Meta({ label, value }) {
  return (
    <div className="rounded-[16px] bg-muted/20 border border-border/20 p-3">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground/70">{label}</p>
      <p className="text-[12px] font-semibold text-foreground mt-1 break-words">{value || "—"}</p>
    </div>
  );
}
