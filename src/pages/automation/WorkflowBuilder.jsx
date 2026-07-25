import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Save, Play, Plus, Trash2, ArrowDown, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { TRIGGERS, ACTIONS, CONDITION_FIELDS, CONDITION_OPS, triggerLabel } from "@/lib/automation/manifest";

export default function WorkflowBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [trigger, setTrigger] = useState("manual");
  const [triggerConfig, setTriggerConfig] = useState({});
  const [conditions, setConditions] = useState([]);
  const [actions, setActions] = useState([]);
  const [status, setStatus] = useState("draft");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try { const a = await base44.entities.Automation.get(id); setName(a.name||""); setDescription(a.description||""); setTrigger(a.trigger||"manual"); setTriggerConfig(a.trigger_config||{}); setConditions(a.conditions||[]); setActions(a.actions||[]); setStatus(a.status||"draft"); } catch {}
    })();
  }, [id]);

  const triggerDef = TRIGGERS.find((t) => t.key === trigger) || TRIGGERS[0];

  const addCondition = () => setConditions([...conditions, { field: "course_code", op: "==", value: "" }]);
  const addAction = (key) => setActions([...actions, { key, config: {} }]);
  const setActionCfg = (i, k, v) => { const n = [...actions]; n[i] = { ...n[i], config: { ...n[i].config, [k]: v } }; setActions(n); };

  const save = async () => {
    if (!name.trim()) { toast({ title: "Name required" }); return; }
    setSaving(true);
    const payload = { name, description, trigger, trigger_config: triggerConfig, conditions, actions, status };
    try {
      if (id) { await base44.entities.Automation.update(id, payload); toast({ title: "Saved" }); }
      else { const created = await base44.entities.Automation.create(payload); toast({ title: "Created" }); navigate(`/automation/builder/${created.id}`); }
    } catch { toast({ title: "Save failed" }); }
    finally { setSaving(false); }
  };

  const test = async () => {
    if (!id) { toast({ title: "Save first to test" }); return; }
    setTesting(true);
    try { const res = await base44.functions.invoke("runAutomation", { automation_id: id, source: "manual" }); toast({ title: res.data?.status === "success" ? "Test passed" : "Test had errors" }); }
    catch { toast({ title: "Test failed" }); }
    finally { setTesting(false); }
  };

  return (
    <div className="w-full max-w-[720px] mx-auto px-5 pt-6 pb-28 safe-area-pt space-y-5">
      <Link to="/automation" className="text-[13px] text-muted-foreground flex items-center gap-1"><ArrowLeft className="w-4 h-4" />Automation Center</Link>
      <h1 className="text-[22px] font-heading font-bold">{id ? "Edit automation" : "New automation"}</h1>

      <div className="glass-card radius-lg p-4 space-y-3">
        <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. CSC201 assignment alerts" /></div>
        <div><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="What this automation does" /></div>
      </div>

      {/* Trigger */}
      <div className="glass-card radius-lg p-4 space-y-3">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Trigger</p>
        <Select value={trigger} onValueChange={(v) => { setTrigger(v); setTriggerConfig({}); }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TRIGGERS.map((t) => <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>)}</SelectContent></Select>
        {triggerDef.configFields.map((f) => (
          <div key={f.key}><Label>{f.label}</Label><Input value={triggerConfig[f.key] || ""} onChange={(e) => setTriggerConfig({ ...triggerConfig, [f.key]: e.target.value })} placeholder={f.placeholder} /></div>
        ))}
        <div className="flex justify-center"><ArrowDown className="w-4 h-4 text-muted-foreground" /></div>
      </div>

      {/* Conditions */}
      <div className="glass-card radius-lg p-4 space-y-3">
        <div className="flex items-center justify-between"><p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Conditions</p><Button variant="ghost" size="sm" onClick={addCondition}><Plus className="w-4 h-4 mr-1" />Add</Button></div>
        {conditions.length === 0 && <p className="text-[12px] text-muted-foreground">No conditions — runs on every trigger.</p>}
        {conditions.map((c, i) => (
          <div key={i} className="flex items-center gap-2">
            <Select value={c.field} onValueChange={(v) => { const n = [...conditions]; n[i] = { ...n[i], field: v }; setConditions(n); }}><SelectTrigger className="flex-1"><SelectValue /></SelectTrigger><SelectContent>{CONDITION_FIELDS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent></Select>
            <Select value={c.op} onValueChange={(v) => { const n = [...conditions]; n[i] = { ...n[i], op: v }; setConditions(n); }}><SelectTrigger className="w-[90px]"><SelectValue /></SelectTrigger><SelectContent>{CONDITION_OPS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select>
            <Input value={c.value} onChange={(e) => { const n = [...conditions]; n[i] = { ...n[i], value: e.target.value }; setConditions(n); }} placeholder="value" className="flex-1" />
            <button onClick={() => setConditions(conditions.filter((_, x) => x !== i))} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
        <div className="flex justify-center"><ArrowDown className="w-4 h-4 text-muted-foreground" /></div>
      </div>

      {/* Actions */}
      <div className="glass-card radius-lg p-4 space-y-3">
        <div className="flex items-center justify-between"><p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Actions</p>
          <Select value="" onValueChange={(v) => addAction(v)}><SelectTrigger className="w-[180px]"><span className="text-muted-foreground flex items-center gap-1"><Plus className="w-4 h-4" />Add action</span></SelectTrigger><SelectContent>{ACTIONS.map((a) => <SelectItem key={a.key} value={a.key}>{a.label}</SelectItem>)}</SelectContent></Select>
        </div>
        {actions.length === 0 && <p className="text-[12px] text-muted-foreground">Add at least one action.</p>}
        {actions.map((a, i) => {
          const def = ACTIONS.find((x) => x.key === a.key);
          return (
            <div key={i} className="glass-card radius-md p-3 space-y-2">
              <div className="flex items-center gap-2"><Zap className={`w-4 h-4 ${def?.immediate ? "text-success" : "text-warning"}`} /><span className="font-semibold text-[13px] flex-1">{def?.label}</span><span className="text-[10px] text-muted-foreground">{def?.immediate ? "immediate" : "suggestion"}</span><button onClick={() => setActions(actions.filter((_, x) => x !== i))} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button></div>
              {(def?.configFields || []).map((f) => (
                f.key === "body"
                  ? <div key={f.key}><Label>{f.label}</Label><Textarea value={a.config?.[f.key] || ""} onChange={(e) => setActionCfg(i, f.key, e.target.value)} rows={2} placeholder={f.placeholder} /></div>
                  : <div key={f.key}><Label>{f.label}</Label><Input value={a.config?.[f.key] || ""} onChange={(e) => setActionCfg(i, f.key, e.target.value)} placeholder={f.placeholder} /></div>
              ))}
            </div>
          );
        })}
      </div>

      <div className="glass-card radius-lg p-4 space-y-3">
        <Label>Status</Label>
        <Select value={status} onValueChange={setStatus}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="paused">Paused</SelectItem></SelectContent></Select>
        <div className="flex gap-2">
          <Button onClick={save} disabled={saving} className="flex-1"><Save className="w-4 h-4 mr-1" />{saving ? "Saving…" : "Save"}</Button>
          <Button onClick={test} disabled={testing || !id} variant="secondary">{testing ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Play className="w-4 h-4 mr-1" />}Test</Button>
        </div>
        <p className="text-[11px] text-muted-foreground">Automations never delete data, modify grades, or share personal info. Suggestion actions require your approval.</p>
      </div>
    </div>
  );
}