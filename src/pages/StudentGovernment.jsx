import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  ArrowLeft, Crown, Users, Vote, ChevronRight, Building,
  GraduationCap, Shield, CheckCircle2, Clock, Calendar,
} from "lucide-react";

const BODIES = ["SUG", "SRC", "Guild Council", "Student Parliament", "Student Senate"];

export default function StudentGovernment() {
  const [tab, setTab] = useState("sug");
  const navigate = useNavigate();

  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });
  const { data: govBodies } = useQuery({
    queryKey: ["studentGovBodies"],
    queryFn: () => base44.entities.StudentGovernmentBody.filter({ university: user?.university }),
    enabled: !!user?.university,
  });
  const { data: classLeaders } = useQuery({
    queryKey: ["classLeaderships"],
    queryFn: () => base44.entities.ClassLeadership.filter({ university: user?.university }),
    enabled: !!user?.university,
  });

  const govBody = govBodies?.[0];
  const myClass = classLeaders?.find(c =>
    c.department === user?.department && c.level === user?.level
  ) || classLeaders?.[0];

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="pt-12 pb-4 px-5 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-card soft-shadow flex items-center justify-center spring-tap border border-border/30">
          <ArrowLeft className="w-[18px] h-[18px] text-foreground" strokeWidth={2} />
        </button>
        <div className="flex-1">
          <h1 className="font-heading font-extrabold text-[24px] tracking-tight text-foreground">Student Government</h1>
          <p className="text-[12px] text-muted-foreground">{user?.university || "Your University"}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center gold-glow">
          <Shield className="w-5 h-5 text-primary-foreground" />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4 flex gap-1.5 p-1 bg-muted/60 rounded-[16px]">
        <button onClick={() => setTab("sug")}
          className={`flex-1 py-2.5 rounded-[12px] text-[11px] font-semibold transition-all ${tab === "sug" ? "bg-card text-foreground soft-shadow" : "text-muted-foreground"}`}>
          Student Government
        </button>
        <button onClick={() => setTab("class")}
          className={`flex-1 py-2.5 rounded-[12px] text-[11px] font-semibold transition-all ${tab === "class" ? "bg-card text-foreground soft-shadow" : "text-muted-foreground"}`}>
          Class Leadership
        </button>
      </div>

      {tab === "sug" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          {govBody ? (
            <div className="px-4 space-y-4">
              {/* Body header */}
              <div className="bg-card rounded-[24px] p-5 soft-shadow border border-border/40">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-[18px] bg-primary/10 flex items-center justify-center">
                    <Crown className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <p className="font-heading font-bold text-[17px] text-foreground">{govBody.body_name || govBody.body_type}</p>
                    <p className="text-[12px] text-muted-foreground">{govBody.university}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-success/10 text-success text-[10px] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Active Term
                  </span>
                  {govBody.term_end && (
                    <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-[10px] font-semibold flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Until {new Date(govBody.term_end).toLocaleDateString("en", { month: "short", year: "numeric" })}
                    </span>
                  )}
                </div>
              </div>

              {/* Executive members */}
              <div>
                <h3 className="font-heading font-bold text-[15px] text-foreground mb-3 px-1">Executive Council</h3>
                <div className="space-y-2.5">
                  {govBody.president_name && <LeaderRow name={govBody.president_name} position="President" icon={Crown} color="text-primary" bg="bg-primary/10" />}
                  {govBody.vice_president_name && <LeaderRow name={govBody.vice_president_name} position="Vice President" icon={Users} color="text-info" bg="bg-info/10" />}
                  {govBody.secretary_name && <LeaderRow name={govBody.secretary_name} position="Secretary" icon={Shield} color="text-purple" bg="bg-purple/10" />}
                  {govBody.treasurer_name && <LeaderRow name={govBody.treasurer_name} position="Treasurer" icon={Users} color="text-success" bg="bg-success/10" />}
                  {govBody.pro_name && <LeaderRow name={govBody.pro_name} position="PRO" icon={Users} color="text-warning" bg="bg-warning/10" />}
                </div>
              </div>

              {/* Committee members */}
              {govBody.committee_members && govBody.committee_members.length > 0 && (
                <div>
                  <h3 className="font-heading font-bold text-[15px] text-foreground mb-3 px-1">Committee Members</h3>
                  <div className="space-y-2.5">
                    {govBody.committee_members.map((member, i) => (
                      <LeaderRow key={i} name={member.name} position={member.position} icon={Users} color="text-muted-foreground" bg="bg-muted" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <EmptyState icon={Shield} title="No government configured" subtitle="Your university hasn't set up its student government yet." />
          )}
        </motion.div>
      )}

      {tab === "class" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          {myClass ? (
            <div className="px-4 space-y-4">
              {/* Class header */}
              <div className="bg-card rounded-[24px] p-5 soft-shadow border border-border/40">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-14 h-14 rounded-[18px] bg-info/10 flex items-center justify-center">
                    <GraduationCap className="w-7 h-7 text-info" />
                  </div>
                  <div>
                    <p className="font-heading font-bold text-[16px] text-foreground">{myClass.department}</p>
                    <p className="text-[12px] text-muted-foreground">{myClass.level || "All Levels"} · {myClass.faculty}</p>
                  </div>
                </div>
              </div>

              {/* Leadership */}
              <div>
                <h3 className="font-heading font-bold text-[15px] text-foreground mb-3 px-1">Class Representatives</h3>
                <div className="space-y-2.5">
                  {myClass.class_governor_name && <LeaderRow name={myClass.class_governor_name} position="Class Governor" icon={Crown} color="text-primary" bg="bg-primary/10" />}
                  {myClass.assistant_governor_name && <LeaderRow name={myClass.assistant_governor_name} position="Assistant Governor" icon={Users} color="text-info" bg="bg-info/10" />}
                  {myClass.course_rep_name && <LeaderRow name={myClass.course_rep_name} position="Course Representative" icon={Shield} color="text-purple" bg="bg-purple/10" />}
                  {myClass.dept_rep_name && <LeaderRow name={myClass.dept_rep_name} position="Department Representative" icon={Users} color="text-success" bg="bg-success/10" />}
                  {myClass.faculty_rep_name && <LeaderRow name={myClass.faculty_rep_name} position="Faculty Representative" icon={Users} color="text-warning" bg="bg-warning/10" />}
                </div>
              </div>

              {/* Election status */}
              <div className="bg-card rounded-[20px] p-4 soft-shadow border border-border/40">
                <div className="flex items-center gap-2 mb-2">
                  <Vote className="w-4 h-4 text-primary" />
                  <p className="font-heading font-semibold text-[13px] text-foreground">Election Status</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                    myClass.election_status === "completed" ? "bg-success/10 text-success" :
                    myClass.election_status === "voting" ? "bg-primary/10 text-primary" :
                    "bg-warning/10 text-warning"
                  }`}>
                    {myClass.election_status === "completed" ? "Term Active" :
                     myClass.election_status === "voting" ? "Voting Open" :
                     myClass.election_status === "nomination" ? "Nominations Open" :
                     myClass.election_status === "campaigning" ? "Campaigning" : "Not Started"}
                  </span>
                  {myClass.term_end && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Until {new Date(myClass.term_end).toLocaleDateString("en", { month: "short", year: "numeric" })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <EmptyState icon={GraduationCap} title="No class leadership" subtitle="Your class hasn't elected representatives yet." />
          )}
        </motion.div>
      )}
    </div>
  );
}

function LeaderRow({ name, position, icon: Icon, color, bg }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-[20px] p-3.5 soft-shadow border border-border/40 flex items-center gap-3 card-hover"
    >
      <div className={`w-10 h-10 rounded-[14px] ${bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${color}`} strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-heading font-semibold text-[13px] text-foreground truncate">{name}</p>
        <p className="text-[11px] text-muted-foreground">{position}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </motion.div>
  );
}

function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="text-center py-12 px-4">
      <div className="w-14 h-14 rounded-[20px] bg-muted flex items-center justify-center mx-auto mb-3">
        <Icon className="w-6 h-6 text-muted-foreground" strokeWidth={1.8} />
      </div>
      <p className="text-[13px] font-semibold text-foreground">{title}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>
    </div>
  );
}