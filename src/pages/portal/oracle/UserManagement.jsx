import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Shield, MoreVertical, ChevronDown, UserCog } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { KpiCard, SectionCard, DataTable, PortalBadge, StatusPill } from "@/components/portal/PortalUI";
import { ROLE_HIERARCHY, normalizeRole } from "@/lib/portalConfig";

export default function UserManagement() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [editingUser, setEditingUser] = useState(null);

  const { data: users } = useQuery({
    queryKey: ["portalUsers"],
    queryFn: () => base44.entities.User.list(),
    retry: false,
  });

  const filtered = (users || []).filter((u) => {
    const matchesSearch = !search ||
      (u.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase());
    const normalizedRole = normalizeRole(u.role);
    const matchesRole = roleFilter === "all" || normalizedRole === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleCounts = ROLE_HIERARCHY.map((r) => ({
    ...r,
    count: (users || []).filter((u) => normalizeRole(u.role) === r.key).length,
  }));

  const handleRoleChange = async (userId, newRole) => {
    try {
      await base44.entities.User.update(userId, { role: newRole });
      await base44.entities.AuditLog.create({
        action: "user_role_changed",
        actor_name: "Oracle",
        actor_role: "oracle",
        target_type: "user",
        target_name: editingUser?.email || "Unknown",
        details: `User role changed to ${newRole}.`,
        severity: "warning",
      });
      queryClient.invalidateQueries({ queryKey: ["portalUsers"] });
      queryClient.invalidateQueries({ queryKey: ["portalAuditLogs"] });
    } catch (err) {
      console.error("Failed to update role:", err);
    }
    setEditingUser(null);
  };

  const columns = [
    {
      key: "name",
      header: "User",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-[12px] font-bold text-primary-foreground">
            {(row.full_name || row.email || "U").charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-[13px] text-foreground">{row.full_name || "Unnamed"}</p>
            <p className="text-[11px] text-muted-foreground">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (row) => <PortalBadge role={normalizeRole(row.role)} />,
    },
    { key: "university", header: "University", render: (row) => <span className="text-[12px] text-muted-foreground">{row.university || "—"}</span> },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <button
          onClick={() => setEditingUser(row)}
          className="px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted text-[12px] font-semibold text-foreground flex items-center gap-1.5 transition-colors"
        >
          <UserCog className="w-3.5 h-3.5" />
          Manage
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-extrabold text-[26px] tracking-tight text-foreground">User Management</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Manage user roles, permissions, and access across the platform.</p>
      </div>

      {/* Role distribution */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {roleCounts.map((r, i) => (
          <motion.div
            key={r.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-card rounded-xl p-3.5 border border-border/40 soft-shadow text-center"
          >
            <p className="text-[22px] font-heading font-extrabold text-foreground">{r.count}</p>
            <p className="text-[10px] font-semibold text-muted-foreground mt-0.5 leading-tight">{r.name}</p>
          </motion.div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-card border border-border/40 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 soft-shadow"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-11 px-4 rounded-xl bg-card border border-border/40 text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 soft-shadow"
        >
          <option value="all">All Roles</option>
          {ROLE_HIERARCHY.map((r) => (
            <option key={r.key} value={r.key}>{r.name}</option>
          ))}
        </select>
      </div>

      {/* Users Table */}
      <SectionCard title="Platform Users" description={`${filtered.length} user${filtered.length !== 1 ? "s" : ""} found`}>
        <DataTable columns={columns} data={filtered} emptyMessage="No users found" />
      </SectionCard>

      {/* Role Change Dialog */}
      <AnimatePresence>
        {editingUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditingUser(null)}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl p-6 max-w-md w-full border border-border/40 elevated-shadow"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-[16px] font-bold text-primary-foreground">
                  {(editingUser.full_name || editingUser.email || "U").charAt(0)}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-[16px] text-foreground">{editingUser.full_name || "Unnamed"}</h3>
                  <p className="text-[12px] text-muted-foreground">{editingUser.email}</p>
                </div>
              </div>
              <p className="text-[13px] font-semibold text-foreground mb-3">Assign Role</p>
              <div className="space-y-2">
                {ROLE_HIERARCHY.map((r) => (
                  <button
                    key={r.key}
                    onClick={() => handleRoleChange(editingUser.id, r.key)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${
                      normalizeRole(editingUser.role) === r.key
                        ? "bg-primary/10 border-primary/30"
                        : "bg-muted/30 border-border/20 hover:bg-muted/50"
                    }`}
                  >
                    <div className="text-left">
                      <p className="text-[13px] font-semibold text-foreground">{r.name}</p>
                      <p className="text-[11px] text-muted-foreground">{r.description}</p>
                    </div>
                    {normalizeRole(editingUser.role) === r.key && <Shield className="w-4 h-4 text-primary" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}