import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  ArrowLeft, Users, MessageCircle, ListTodo, Video, Mic, Share2,
  Send, Plus, CheckCircle2, Circle, Loader2,
  Calendar, Link2,
} from "lucide-react";

const TABS = [
  { key: "chat", label: "Chat", icon: MessageCircle },
  { key: "tasks", label: "Tasks", icon: ListTodo },
  { key: "members", label: "Members", icon: Users },
];

export default function StudyGroupDetail() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("chat");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: "", due_date: "", priority: "medium" });
  const scrollRef = useRef(null);

  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });

  const { data: group } = useQuery({
    queryKey: ["studyGroup", groupId],
    queryFn: () => base44.entities.StudyGroup.get(groupId),
  });

  const { data: messages } = useQuery({
    queryKey: ["groupMessages", groupId],
    queryFn: () => base44.entities.StudyGroupMessage.filter({ group_id: groupId }, "created_date", 100),
  });

  const { data: tasks } = useQuery({
    queryKey: ["groupTasks", groupId],
    queryFn: () => base44.entities.StudyGroupTask.filter({ group_id: groupId }, "due_date", 50),
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const unsub = base44.entities.StudyGroupMessage.subscribe((event) => {
      if (event.data?.group_id === groupId) {
        qc.invalidateQueries({ queryKey: ["groupMessages", groupId] });
      }
    });
    return unsub;
  }, [groupId, qc]);

  const handleSend = async () => {
    if (!message.trim() || sending) return;
    const msg = message.trim();
    setMessage("");
    setSending(true);
    // Optimistic: append immediately
    const tempId = "temp_" + Date.now();
    const optimisticMsg = { id: tempId, group_id: groupId, sender_name: user?.preferred_name || user?.full_name || "Student", message: msg, type: "text" };
    qc.setQueryData(["groupMessages", groupId], (old) => [...(old || []), optimisticMsg]);
    try {
      await base44.entities.StudyGroupMessage.create({
        group_id: groupId,
        sender_name: user?.preferred_name || user?.full_name || "Student",
        message: msg,
        type: "text",
      });
      qc.invalidateQueries({ queryKey: ["groupMessages", groupId] });
    } catch (err) {
      // Rollback on failure
      qc.setQueryData(["groupMessages", groupId], (old) => (old || []).filter((m) => m.id !== tempId));
      setMessage(msg);
    }
    setSending(false);
  };

  const handleCreateTask = async () => {
    if (!taskForm.title.trim()) return;
    try {
      await base44.entities.StudyGroupTask.create({
        group_id: groupId,
        title: taskForm.title.trim(),
        due_date: taskForm.due_date || undefined,
        priority: taskForm.priority,
        status: "todo",
      });
      qc.invalidateQueries({ queryKey: ["groupTasks", groupId] });
      setShowTaskForm(false);
      setTaskForm({ title: "", due_date: "", priority: "medium" });
    } catch (err) {}
  };

  const toggleTask = async (task) => {
    const newStatus = task.status === "done" ? "todo" : "done";
    // Optimistic: update immediately
    qc.setQueryData(["groupTasks", groupId], (old) => (old || []).map((t) => t.id === task.id ? { ...t, status: newStatus } : t));
    try {
      await base44.entities.StudyGroupTask.update(task.id, { status: newStatus });
      qc.invalidateQueries({ queryKey: ["groupTasks", groupId] });
    } catch (err) {
      // Rollback
      qc.setQueryData(["groupTasks", groupId], (old) => (old || []).map((t) => t.id === task.id ? { ...t, status: task.status } : t));
    }
  };

  const [joining, setJoining] = useState(false);
  const handleJoin = async () => {
    if (joining) return;
    setJoining(true);
    // Optimistic: update immediately
    qc.setQueryData(["studyGroup", groupId], (old) => old ? { ...old, is_joined: true, members_count: (old.members_count || 0) + 1 } : old);
    qc.invalidateQueries({ queryKey: ["studyGroups"] });
    try {
      await base44.entities.StudyGroup.update(groupId, {
        is_joined: true,
        members_count: (group?.members_count || 0) + 1,
      });
      await base44.entities.StudyGroupMessage.create({
        group_id: groupId,
        sender_name: "System",
        message: `${user?.preferred_name || user?.full_name || "A student"} joined the group`,
        type: "system",
      });
      qc.invalidateQueries({ queryKey: ["studyGroup", groupId] });
      qc.invalidateQueries({ queryKey: ["groupMessages", groupId] });
    } catch (err) {
      // Rollback
      qc.setQueryData(["studyGroup", groupId], (old) => old ? { ...old, is_joined: false, members_count: (old.members_count || 1) - 1 } : old);
    }
    setJoining(false);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: group?.name, text: `Join my study group: ${group?.name}`, url: window.location.href });
    } else {
      navigator.clipboard?.writeText(window.location.href);
    }
  };

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const accent = group.accent_color || "hsl(var(--unibud-gold))";
  const isJoined = group.is_joined;

  return (
    <div className="min-h-screen pb-8 flex flex-col">
      {/* Header */}
      <div className="pt-12 pb-3 px-5 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-card soft-shadow flex items-center justify-center spring-tap border border-border/30">
          <ArrowLeft className="w-[18px] h-[18px] text-foreground" strokeWidth={2} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-heading font-bold text-[16px] text-foreground truncate">{group.name}</h1>
          <p className="text-[11px] text-muted-foreground">{group.members_count || 0} members · {group.course_code || group.subject || "General"}</p>
        </div>
        <button onClick={handleShare} className="w-10 h-10 rounded-full bg-card soft-shadow flex items-center justify-center spring-tap border border-border/30">
          <Share2 className="w-[18px] h-[18px] text-muted-foreground" strokeWidth={2} />
        </button>
      </div>

      {/* Group info card */}
      <div className="px-4 mb-3">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-[20px] p-4 soft-shadow border border-border/40"
        >
          {group.description && (
            <p className="text-[12px] text-muted-foreground leading-relaxed mb-3">{group.description}</p>
          )}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {group.course_code && <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">{group.course_code}</span>}
            {group.lecturer && <span className="px-2 py-0.5 rounded-full bg-info/10 text-info text-[10px] font-semibold">{group.lecturer}</span>}
            {group.department && <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-semibold">{group.department}</span>}
            {group.semester && <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-semibold">{group.semester}</span>}
          </div>
          {!isJoined ? (
            <button onClick={handleJoin} className="w-full py-2.5 rounded-[14px] bg-primary text-primary-foreground text-[13px] font-semibold spring-tap">
              Join Study Group
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button className="flex-1 py-2.5 rounded-[12px] bg-info/10 text-info text-[12px] font-semibold flex items-center justify-center gap-1.5 spring-tap">
                <Video className="w-4 h-4" /> Video Room
              </button>
              <button className="flex-1 py-2.5 rounded-[12px] bg-success/10 text-success text-[12px] font-semibold flex items-center justify-center gap-1.5 spring-tap">
                <Mic className="w-4 h-4" /> Voice Room
              </button>
              <button onClick={handleShare} className="w-10 h-10 rounded-[12px] bg-muted flex items-center justify-center spring-tap">
                <Link2 className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-3">
        <div className="flex gap-1 p-1 bg-muted/60 rounded-[14px]">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 rounded-[10px] text-[11px] font-semibold transition-all flex items-center justify-center gap-1 ${activeTab === tab.key ? "bg-card text-foreground soft-shadow" : "text-muted-foreground"}`}>
              <tab.icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 flex-1">
        {activeTab === "chat" && (
          <div className="flex flex-col h-[400px]">
            <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2.5 no-scrollbar pb-2">
              {(messages || []).length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-[12px] text-muted-foreground">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                (messages || []).map((msg, i) => {
                  if (msg.type === "system") {
                    return (
                      <div key={i} className="text-center py-1">
                        <span className="text-[10px] text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">{msg.message}</span>
                      </div>
                    );
                  }
                  const isOwn = msg.sender_name === (user?.preferred_name || user?.full_name);
                  return (
                    <div key={i} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] ${isOwn ? "bg-primary text-primary-foreground rounded-[16px] rounded-br-md" : "bg-card border border-border/40 rounded-[16px] rounded-bl-md"} px-3.5 py-2 soft-shadow`}>
                        {!isOwn && <p className="text-[9px] font-semibold text-primary mb-0.5">{msg.sender_name}</p>}
                        <p className="text-[12px] leading-relaxed">{msg.message}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {isJoined && (
              <div className="flex items-end gap-2 pt-2">
                <input value={message} onChange={e => setMessage(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder="Type a message..." disabled={sending}
                  className="flex-1 px-3.5 py-2.5 rounded-[16px] bg-card border border-border/40 text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/20 soft-shadow disabled:opacity-50" />
                <button onClick={handleSend} disabled={!message.trim() || sending}
                  className="w-10 h-10 rounded-[16px] bg-primary flex items-center justify-center text-primary-foreground spring-tap disabled:opacity-50">
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "tasks" && (
          <div className="space-y-2">
            <button onClick={() => setShowTaskForm(!showTaskForm)} className="w-full py-2.5 rounded-[14px] bg-primary/10 text-primary text-[12px] font-semibold flex items-center justify-center gap-1.5 spring-tap">
              <Plus className="w-4 h-4" /> Add Task
            </button>
            <AnimatePresence>
              {showTaskForm && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="bg-card rounded-[16px] p-3 border border-border/40 space-y-2">
                    <input value={taskForm.title} onChange={e => setTaskForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="Task title..." className="w-full px-3 py-2 rounded-[10px] bg-muted/50 border border-border/40 text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    <div className="flex gap-2">
                      <input type="date" value={taskForm.due_date} onChange={e => setTaskForm(f => ({ ...f, due_date: e.target.value }))}
                        className="flex-1 px-3 py-2 rounded-[10px] bg-muted/50 border border-border/40 text-[11px] focus:outline-none focus:ring-2 focus:ring-primary/30" />
                      <select value={taskForm.priority} onChange={e => setTaskForm(f => ({ ...f, priority: e.target.value }))}
                        className="px-3 py-2 rounded-[10px] bg-muted/50 border border-border/40 text-[11px] focus:outline-none">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <button onClick={handleCreateTask} disabled={!taskForm.title.trim()}
                      className="w-full py-2 rounded-[10px] bg-primary text-primary-foreground text-[11px] font-semibold spring-tap disabled:opacity-50">
                      Create Task
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {(tasks || []).length === 0 ? (
              <div className="text-center py-8">
                <ListTodo className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-[12px] text-muted-foreground">No tasks yet. Add one to get organized!</p>
              </div>
            ) : (
              (tasks || []).map((task, i) => (
                <motion.div key={task.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                  className="bg-card rounded-[14px] p-3 border border-border/40 flex items-center gap-3">
                  <button onClick={() => toggleTask(task)}>
                    {task.status === "done" ? <CheckCircle2 className="w-5 h-5 text-success" /> : <Circle className="w-5 h-5 text-muted-foreground" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[12px] font-medium ${task.status === "done" ? "line-through text-muted-foreground" : "text-foreground"}`}>{task.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {task.due_date && <span className="text-[9px] text-muted-foreground flex items-center gap-0.5"><Calendar className="w-2.5 h-2.5" />{task.due_date}</span>}
                      <span className={`text-[9px] font-semibold ${task.priority === "high" ? "text-error" : task.priority === "medium" ? "text-warning" : "text-muted-foreground"}`}>{task.priority}</span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {activeTab === "members" && (
          <div className="space-y-2">
            <div className="bg-card rounded-[16px] p-4 border border-border/40 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="font-heading font-bold text-primary-foreground text-[14px]">{(group.host_name || "H").charAt(0)}</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[13px] text-foreground">{group.host_name || "Host"}</p>
                <p className="text-[10px] text-primary font-semibold">Group Admin</p>
              </div>
            </div>
            <div className="bg-card rounded-[16px] p-4 border border-border/40 flex items-center gap-3 opacity-60">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Users className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[13px] text-foreground">{(group.members_count || 1) - 1} other members</p>
                <p className="text-[10px] text-muted-foreground">Join to see everyone</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}