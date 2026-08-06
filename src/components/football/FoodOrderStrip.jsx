import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Utensils, Plus, Check, Clock } from "lucide-react";

const DEMO = [
  { id: "f1", name: "Jollof Rice & Chicken", restaurant: "Campus Kitchen", price: 2500, image_url: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=300&q=80", category: "meals", prep_time_minutes: 20, rating: 4.8 },
  { id: "f2", name: "Pepperoni Pizza", restaurant: "Slice House", price: 4200, image_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&q=80", category: "meals", prep_time_minutes: 25, rating: 4.7 },
  { id: "f3", name: "Shawarma Wrap", restaurant: "Wrap Station", price: 1800, image_url: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=300&q=80", category: "snacks", prep_time_minutes: 15, rating: 4.9 },
  { id: "f4", name: "Chilled Smoothie", restaurant: "Blend Bar", price: 1200, image_url: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=300&q=80", category: "drinks", prep_time_minutes: 5, rating: 4.6 },
];

const EASE = [0.16, 1, 0.3, 1];

/**
 * FoodOrderStrip — in-built food ordering while watching matches.
 * Airbnb-style horizontal food cards with add-to-order.
 */
export default function FoodOrderStrip({ items = [] }) {
  const [cart, setCart] = useState({});
  const data = items.length > 0 ? items : DEMO;

  const add = (id) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const total = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = data.find((d) => d.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);
  const count = Object.values(cart).reduce((a, b) => a + b, 0);

  return (
    <section>
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <Utensils className="w-3.5 h-3.5 text-foreground" />
          <h2 className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">Hungry? Order while you watch</h2>
        </div>
        {count > 0 && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-foreground text-background">
            {count} · ₦{total.toLocaleString()}
          </span>
        )}
      </div>
      <div className="flex gap-2.5 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
        {data.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.05, 0.2), duration: 0.4, ease: EASE }}
            className="flex-shrink-0 w-[160px] rounded-2xl bg-card border border-border/30 overflow-hidden"
          >
            <div className="aspect-square bg-muted overflow-hidden relative">
              {item.image_url && <img src={item.image_url} alt="" className="w-full h-full object-cover" loading="lazy" />}
              <button
                onClick={() => add(item.id)}
                className="absolute bottom-1.5 right-1.5 w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center spring-tap"
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>
            <div className="p-2.5">
              <p className="text-[12px] font-semibold text-foreground leading-tight line-clamp-1">{item.name}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{item.restaurant}</p>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[12px] font-bold text-foreground">₦{item.price.toLocaleString()}</span>
                <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
                  <Clock className="w-2.5 h-2.5" /> {item.prep_time_minutes}m
                </span>
              </div>
            </div>
            <AnimatePresence>
              {cart[item.id] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex items-center justify-center gap-1 bg-foreground/10 py-1 text-[10px] font-bold text-foreground"
                >
                  <Check className="w-3 h-3" /> {cart[item.id]} in basket
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
}