import React from "react";
import { motion } from "framer-motion";
import {
  BadgeCheck, Building2, GraduationCap, MapPin, Star, Award,
  GitBranch, BookOpen, Users, Languages, Target, Link2, Clock,
} from "lucide-react";
import PremiumAvatar from "@/components/ui/PremiumAvatar";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

function ProfileSection({ icon: Icon, label, children }) {
  if (!children) return null;
  return (
    <div className="py-2.5 border-t border-border/30 first:border-t-0">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon className="w-3 h-3 text-muted-foreground" strokeWidth={2.2} />
        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      {children}
    </div>
  );
}

function TagList({ items }) {
  if (!items?.length) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item, i) => (
        <span key={i} className="px-2 py-0.5 rounded-full glass text-[10px] text-foreground">
          {typeof item === "string" ? item : item.name || item.title}
        </span>
      ))}
    </div>
  );
}

/**
 * CampusProfileCard — full student profile card with all campus connection fields.
 *
 * Props:
 *  - student: { name, image, verified, university, faculty, department, level, bio, skills: [], achievements: [], communities: [], projects: [], courses: [], interests: [], portfolio: [], social_links: {}, availability, current_goals: [], languages: [], badges: [] }
 *  - onConnect: () => void
 *  - onMessage: () => void
 *  - onSave: () => void
 */
export default function CampusProfileCard({ student, onConnect, onMessage, onSave }) {
  if (!student) return null;
  const s = student;
  const social = s.social_links || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="crystal-card rounded-[18px] overflow-hidden"
    >
      {/* Header with banner */}
      <div className="relative h-16 bg-gradient-to-br from-primary/10 via-transparent to-muted/20">
        <div className="absolute inset-0 glass-shine" />
      </div>

      <div className="px-4 -mt-8 relative">
        {/* Avatar + name */}
        <div className="flex items-end justify-between">
          <PremiumAvatar src={s.image} alt={s.name} size="xl" verified={s.verified} ring="verified" />
          {s.availability && (
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full mb-1",
              s.availability === "available" ? "bg-success/15" : "glass"
            )}>
              <motion.span
                animate={s.availability === "available" ? { opacity: [1, 0.4, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
                className={cn("w-1.5 h-1.5 rounded-full", s.availability === "available" ? "bg-success" : "bg-muted-foreground")}
              />
              <span className="text-[9px] font-bold text-muted-foreground capitalize">{s.availability}</span>
            </div>
          )}
        </div>

        <h3 className="font-heading font-bold text-[17px] text-foreground mt-2">{s.name}</h3>
        {s.verified && (
          <div className="flex items-center gap-1">
            <BadgeCheck className="w-3.5 h-3.5 text-primary" strokeWidth={2.2} />
            <span className="text-[10px] text-primary font-medium">Verified Student</span>
          </div>
        )}

        {/* Campus info */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {s.university && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full glass">
              <Building2 className="w-2.5 h-2.5 text-muted-foreground" strokeWidth={2.2} />
              <span className="text-[9px] text-foreground">{s.university}</span>
            </div>
          )}
          {s.faculty && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full glass">
              <GraduationCap className="w-2.5 h-2.5 text-muted-foreground" strokeWidth={2.2} />
              <span className="text-[9px] text-foreground">{s.faculty}</span>
            </div>
          )}
          {s.department && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full glass">
              <MapPin className="w-2.5 h-2.5 text-muted-foreground" strokeWidth={2.2} />
              <span className="text-[9px] text-foreground">{s.department}</span>
            </div>
          )}
          {s.level && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full glass">
              <Star className="w-2.5 h-2.5 text-muted-foreground" strokeWidth={2.2} />
              <span className="text-[9px] text-foreground">{s.level}</span>
            </div>
          )}
        </div>

        {/* Bio */}
        {s.bio && <p className="text-[12px] text-muted-foreground mt-2.5 leading-relaxed">{s.bio}</p>}

        {/* Sections */}
        <ProfileSection icon={BookOpen} label="Courses">
          <TagList items={s.courses} />
        </ProfileSection>

        <ProfileSection icon={Star} label="Interests">
          <TagList items={s.interests} />
        </ProfileSection>

        <ProfileSection icon={Award} label="Skills">
          <TagList items={s.skills} />
        </ProfileSection>

        <ProfileSection icon={GitBranch} label="Projects">
          {s.projects?.length > 0 && (
            <div className="space-y-1">
              {s.projects.slice(0, 3).map((p, i) => (
                <div key={i} className="flex items-center gap-1.5 p-1.5 rounded-[10px] glass">
                  <GitBranch className="w-3 h-3 text-primary flex-shrink-0" strokeWidth={2.2} />
                  <span className="text-[10px] text-foreground truncate flex-1">{typeof p === "string" ? p : p.title || p.name}</span>
                </div>
              ))}
            </div>
          )}
        </ProfileSection>

        <ProfileSection icon={Users} label="Communities">
          <TagList items={s.communities} />
        </ProfileSection>

        <ProfileSection icon={Target} label="Current Goals">
          {s.current_goals?.length > 0 && (
            <div className="space-y-1">
              {s.current_goals.map((g, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <Target className="w-2.5 h-2.5 text-primary mt-0.5 flex-shrink-0" strokeWidth={2.2} />
                  <span className="text-[10px] text-foreground">{g}</span>
                </div>
              ))}
            </div>
          )}
        </ProfileSection>

        <ProfileSection icon={Languages} label="Languages">
          <TagList items={s.languages} />
        </ProfileSection>

        <ProfileSection icon={Award} label="Achievements & Badges">
          {s.achievements?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {s.achievements.map((a, i) => (
                <div key={i} className="flex items-center gap-1 px-2 py-1 rounded-full bg-gold/10">
                  <Award className="w-2.5 h-2.5 text-gold" strokeWidth={2.2} />
                  <span className="text-[9px] font-medium text-foreground">{typeof a === "string" ? a : a.title}</span>
                </div>
              ))}
            </div>
          )}
        </ProfileSection>

        {/* Social links */}
        {(social.website || social.instagram || social.linkedin || social.twitter) && (
          <div className="py-2.5 border-t border-border/30">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Link2 className="w-3 h-3 text-muted-foreground" strokeWidth={2.2} />
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Social</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {social.website && <a href={social.website} target="_blank" rel="noreferrer" className="px-2 py-0.5 rounded-full glass text-[9px] text-primary spring-tap">Website</a>}
              {social.instagram && <a href={social.instagram} target="_blank" rel="noreferrer" className="px-2 py-0.5 rounded-full glass text-[9px] text-primary spring-tap">Instagram</a>}
              {social.linkedin && <a href={social.linkedin} target="_blank" rel="noreferrer" className="px-2 py-0.5 rounded-full glass text-[9px] text-primary spring-tap">LinkedIn</a>}
              {social.twitter && <a href={social.twitter} target="_blank" rel="noreferrer" className="px-2 py-0.5 rounded-full glass text-[9px] text-primary spring-tap">Twitter</a>}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 py-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onConnect}
            className="flex-1 h-9 rounded-full bg-primary text-[12px] font-bold text-primary-foreground spring-tap"
          >
            Connect
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onMessage}
            className="flex-1 h-9 rounded-full glass text-[12px] font-bold text-foreground spring-tap"
          >
            Message
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onSave}
            className="w-9 h-9 rounded-full glass flex items-center justify-center spring-tap"
          >
            <Clock className="w-4 h-4 text-foreground" strokeWidth={2.2} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}