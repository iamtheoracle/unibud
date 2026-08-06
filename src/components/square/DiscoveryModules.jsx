import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users, TrendingUp, Calendar, ShoppingBag, Mic, Award,
  Sparkles, ChevronRight, Circle,
} from "lucide-react";
import { Image } from "@/components/ui/image";

const EASE = [0.16, 1, 0.3, 1];

/* ── Module wrapper — floating glass card with section header ── */
function ModuleShell({ icon: Icon, title, to, children, fullWidth }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, ease: EASE }}
      className={fullWidth ? "px-4" : "px-4"}
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <Icon className="w-[16px] h-[16px] text-muted-foreground" strokeWidth={2} />
          <h3 className="text-[14px] font-bold text-foreground tracking-tight">{title}</h3>
        </div>
        {to && (
          <Link to={to} className="flex items-center gap-0.5 text-[12px] font-medium text-muted-foreground spring-tap hover:text-foreground transition-colors">
            See all <ChevronRight className="w-3 h-3" />
          </Link>
        )}
      </div>
      {children}
    </motion.section>
  );
}

/* ── Horizontal carousel shell ── */
function Carousel({ children }) {
  return (
    <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
      {children}
    </div>
  );
}

/* ── People You Should Know ── */
const DEMO_PEOPLE = [
  { name: "Adaeze O.", role: "CS · 300L", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80", mutual: 4 },
  { name: "Tunde A.", role: "Physics · 200L", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80", mutual: 7 },
  { name: "Zainab M.", role: "Biology · 400L", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80", mutual: 2 },
  { name: "Chidi O.", role: "Math · 300L", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80", mutual: 5 },
  { name: "Fatima B.", role: "Chem · 200L", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80", mutual: 3 },
];

export function PeopleToKnow() {
  return (
    <ModuleShell icon={Users} title="People You Should Know" to="/discover">
      <Carousel>
        {DEMO_PEOPLE.map((p, i) => (
          <div key={i} className="glass rounded-[20px] p-4 flex flex-col items-center gap-2 w-[130px] shrink-0 spring-tap hover:shadow-premium transition-shadow">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-border">
              <Image src={p.img} alt={p.name} fittingType="fill" className="w-full h-full" />
            </div>
            <div className="text-center">
              <p className="text-[13px] font-semibold text-foreground truncate">{p.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{p.role}</p>
            </div>
            <button className="px-4 py-1.5 rounded-full bg-foreground/10 text-foreground text-[12px] font-semibold spring-tap hover:bg-foreground/15 transition-colors">
              Follow
            </button>
          </div>
        ))}
      </Carousel>
    </ModuleShell>
  );
}

/* ── Communities For You ── */
const DEMO_COMMUNITIES = [
  { name: "CS Students Hub", members: "2.4k", img: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300&q=80" },
  { name: "Physics Society", members: "890", img: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=300&q=80" },
  { name: "Campus Innovators", members: "1.2k", img: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=300&q=80" },
  { name: "Debate Club", members: "456", img: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=300&q=80" },
];

export function CommunitiesForYou() {
  return (
    <ModuleShell icon={Circle} title="Communities For You" to="/communities">
      <Carousel>
        {DEMO_COMMUNITIES.map((c, i) => (
          <div key={i} className="glass rounded-[20px] overflow-hidden w-[180px] shrink-0 spring-tap hover:shadow-premium transition-shadow">
            <div className="h-24 relative">
              <Image src={c.img} alt={c.name} fittingType="fill" className="w-full h-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            <div className="p-3">
              <p className="text-[13px] font-semibold text-foreground truncate">{c.name}</p>
              <p className="text-[11px] text-muted-foreground">{c.members} members</p>
              <button className="mt-2 w-full py-1.5 rounded-full bg-foreground/10 text-foreground text-[12px] font-semibold spring-tap hover:bg-foreground/15 transition-colors">
                Join
              </button>
            </div>
          </div>
        ))}
      </Carousel>
    </ModuleShell>
  );
}

/* ── Trending On Campus ── */
const DEMO_TRENDING = [
  { tag: "#CSC301", posts: "142 posts", desc: "Data Structures assignment discussion" },
  { tag: "#ExamPrep", posts: "89 posts", desc: "Study group forming for midterms" },
  { tag: "#CampusLife", posts: "256 posts", desc: "Best study spots on campus" },
  { tag: "#Internships", posts: "67 posts", desc: "Summer 2026 applications open" },
];

export function TrendingOnCampus() {
  return (
    <ModuleShell icon={TrendingUp} title="Trending On Campus" to="/discover">
      <div className="glass rounded-[20px] divide-y divide-border/50">
        {DEMO_TRENDING.map((t, i) => (
          <div key={i} className="flex items-center gap-3 p-3.5 spring-tap hover:bg-white/[0.03] transition-colors">
            <div className="w-7 h-7 rounded-full bg-foreground/8 grid place-items-center text-[12px] font-bold text-muted-foreground">{i + 1}</div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-foreground">{t.tag}</p>
              <p className="text-[12px] text-muted-foreground truncate">{t.desc}</p>
            </div>
            <span className="text-[11px] text-muted-foreground/60">{t.posts}</span>
          </div>
        ))}
      </div>
    </ModuleShell>
  );
}

/* ── Events Nearby ── */
const DEMO_EVENTS = [
  { title: "Tech Symposium 2026", date: "Aug 15", img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&q=80", loc: "Main Auditorium" },
  { title: "Career Fair", date: "Aug 18", img: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=300&q=80", loc: "Student Centre" },
  { title: "Chess Championship", date: "Aug 20", img: "https://images.unsplash.com/photo-1528819622765-d6bcf99f5535?w=300&q=80", loc: "Games Room" },
  { title: "Research Showcase", date: "Aug 22", img: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=300&q=80", loc: "Science Block" },
];

export function EventsNearby() {
  return (
    <ModuleShell icon={Calendar} title="Events Nearby" to="/events">
      <Carousel>
        {DEMO_EVENTS.map((e, i) => (
          <Link key={i} to="/events" className="glass rounded-[20px] overflow-hidden w-[200px] shrink-0 spring-tap hover:shadow-premium transition-shadow group">
            <div className="h-28 relative">
              <Image src={e.img} alt={e.title} fittingType="fill" className="w-full h-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md glass-strong text-[10px] font-bold text-foreground">{e.date}</div>
            </div>
            <div className="p-3">
              <p className="text-[13px] font-semibold text-foreground truncate">{e.title}</p>
              <p className="text-[11px] text-muted-foreground truncate mt-0.5">{e.loc}</p>
            </div>
          </Link>
        ))}
      </Carousel>
    </ModuleShell>
  );
}

/* ── Marketplace Deals ── */
const DEMO_DEALS = [
  { title: "Scientific Calculator", price: "₦8,000", img: "https://images.unsplash.com/photo-1517959105821-eaf2591984ca?w=300&q=80" },
  { title: "Data Structures Textbook", price: "₦3,500", img: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&q=80" },
  { title: "Lab Coat (New)", price: "₦5,000", img: "https://images.unsplash.com/photo-1583912267550-d6c2ac3196c4?w=300&q=80" },
  { title: "Study Desk Lamp", price: "₦4,500", img: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300&q=80" },
];

export function MarketplaceDeals() {
  return (
    <ModuleShell icon={ShoppingBag} title="Marketplace Deals" to="/marketplace">
      <Carousel>
        {DEMO_DEALS.map((d, i) => (
          <Link key={i} to="/marketplace" className="glass rounded-[20px] overflow-hidden w-[160px] shrink-0 spring-tap hover:shadow-premium transition-shadow">
            <div className="h-28">
              <Image src={d.img} alt={d.title} fittingType="fill" className="w-full h-full" />
            </div>
            <div className="p-3">
              <p className="text-[13px] font-semibold text-foreground truncate">{d.title}</p>
              <p className="text-[15px] font-bold text-foreground mt-0.5">{d.price}</p>
            </div>
          </Link>
        ))}
      </Carousel>
    </ModuleShell>
  );
}

/* ── Podcasts You'll Like ── */
const DEMO_PODCASTS = [
  { title: "Campus Conversations", host: "Adaeze O.", img: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=300&q=80", duration: "32 min" },
  { title: "The Student Founder", host: "Chidi O.", img: "https://images.unsplash.com/photo-1486199577883-6595cd6d7f3b?w=300&q=80", duration: "45 min" },
  { title: "Research Matters", host: "Dr. Ibrahim", img: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&q=80", duration: "28 min" },
  { title: "Life After Uni", host: "Fatima B.", img: "https://images.unsplash.com/photo-1453738773917-9c3eff1db985?w=300&q=80", duration: "38 min" },
];

export function PodcastsForYou() {
  return (
    <ModuleShell icon={Mic} title="Podcasts You'll Like" to="/podcasts">
      <Carousel>
        {DEMO_PODCASTS.map((p, i) => (
          <Link key={i} to="/podcasts" className="glass rounded-[20px] p-3 w-[150px] shrink-0 spring-tap hover:shadow-premium transition-shadow flex flex-col gap-2">
            <div className="aspect-square rounded-[14px] overflow-hidden">
              <Image src={p.img} alt={p.title} fittingType="fill" className="w-full h-full" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-foreground leading-tight line-clamp-2">{p.title}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{p.host}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">{p.duration}</p>
            </div>
          </Link>
        ))}
      </Carousel>
    </ModuleShell>
  );
}

/* ── Creators To Follow ── */
const DEMO_CREATORS = [
  { name: "Adaeze Okafor", role: "Tech Creator", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80", followers: "12.4k" },
  { name: "Dr. Ibrahim", role: "Physics Educator", img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80", followers: "8.9k" },
  { name: "Tunde Arts", role: "Campus Photographer", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80", followers: "5.6k" },
  { name: "Zainab M.", role: "Science Communicator", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80", followers: "3.2k" },
];

export function CreatorsToFollow() {
  return (
    <ModuleShell icon={Sparkles} title="Creators To Follow" to="/discover">
      <Carousel>
        {DEMO_CREATORS.map((c, i) => (
          <div key={i} className="glass rounded-[20px] p-4 flex flex-col items-center gap-2 w-[140px] shrink-0 spring-tap hover:shadow-premium transition-shadow">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-border">
              <Image src={c.img} alt={c.name} fittingType="fill" className="w-full h-full" />
            </div>
            <div className="text-center">
              <p className="text-[13px] font-semibold text-foreground truncate">{c.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{c.role}</p>
              <p className="text-[10px] text-muted-foreground/60">{c.followers} followers</p>
            </div>
            <button className="px-4 py-1.5 rounded-full bg-foreground/10 text-foreground text-[12px] font-semibold spring-tap hover:bg-foreground/15 transition-colors">
              Follow
            </button>
          </div>
        ))}
      </Carousel>
    </ModuleShell>
  );
}

/* ── Scholarships You Might Like ── */
const DEMO_SCHOLARSHIPS = [
  { title: "Merit Excellence Award", amount: "₦500,000", deadline: "Sep 15", img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=300&q=80" },
  { title: "STEM Innovation Grant", amount: "₦750,000", deadline: "Oct 1", img: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=300&q=80" },
  { title: "Future Leaders Fund", amount: "₦1,000,000", deadline: "Oct 30", img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&q=80" },
];

export function ScholarshipsForYou() {
  return (
    <ModuleShell icon={Award} title="Scholarships You Might Like" to="/scholarships">
      <Carousel>
        {DEMO_SCHOLARSHIPS.map((s, i) => (
          <Link key={i} to="/scholarships" className="glass rounded-[20px] overflow-hidden w-[200px] shrink-0 spring-tap hover:shadow-premium transition-shadow">
            <div className="h-20 relative">
              <Image src={s.img} alt={s.title} fittingType="fill" className="w-full h-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-2 left-2 text-[16px] font-bold text-foreground">{s.amount}</div>
            </div>
            <div className="p-3">
              <p className="text-[13px] font-semibold text-foreground truncate">{s.title}</p>
              <p className="text-[11px] text-muted-foreground">Deadline: {s.deadline}</p>
            </div>
          </Link>
        ))}
      </Carousel>
    </ModuleShell>
  );
}

/* ── Live Now strip ── */
const DEMO_LIVE = [
  { name: "Study With Me", host: "Adaeze O.", viewers: 42 },
  { name: "PHY 203 Q&A", host: "Dr. Ibrahim", viewers: 89 },
  { name: "Chess Live", host: "Chess Club", viewers: 23 },
];

export function LiveNow() {
  return (
    <div className="px-4 py-2">
      <div className="flex gap-3 overflow-x-auto no-scrollbar">
        {DEMO_LIVE.map((l, i) => (
          <div key={i} className="glass rounded-full pl-2 pr-3 py-1.5 flex items-center gap-2 shrink-0 spring-tap hover:shadow-premium transition-shadow">
            <div className="w-2 h-2 rounded-full bg-red-500 live-pulse" />
            <span className="text-[12px] font-bold text-foreground">{l.name}</span>
            <span className="text-[10px] text-muted-foreground">· {l.viewers} watching</span>
          </div>
        ))}
      </div>
    </div>
  );
}