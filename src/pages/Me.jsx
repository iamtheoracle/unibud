import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Award, Rocket } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useDemoMode } from "@/lib/DemoModeContext";
import { toast } from "@/components/ui/use-toast";
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ProfileHeader from "@/components/profile/ProfileHeader";
import SocialProfileView from "@/components/profile/SocialProfileView";
import AcademicProfileView from "@/components/profile/AcademicProfileView";
import TransitionToStudent from "@/components/future-student/TransitionToStudent";
import GraduationTransition from "@/components/journey/GraduationTransition";

// Unified Profile — ONE person, TWO views: Social | Academic.
// Reached via the avatar entry point (route /me). Default view is Social.
export default function Me() {
  const { isDemoMode } = useDemoMode();
  const [view, setView] = useState("social"); // "social" | "academic"
  const [showTransition, setShowTransition] = useState(false);
  const [showGraduation, setShowGraduation] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    enabled: !isDemoMode,
  });

  // Real follower / following counts
  const { data: following } = useQuery({
    queryKey: ["following", user?.id],
    queryFn: () => base44.entities.Follow.filter({ follower_id: user.id, status: "active" }),
    enabled: !isDemoMode && !!user,
  });
  const { data: followers } = useQuery({
    queryKey: ["followers", user?.id],
    queryFn: () => base44.entities.Follow.filter({ following_id: user.id, status: "active" }),
    enabled: !isDemoMode && !!user,
  });

  const handleSignOut = () => base44.auth.logout("/login");

  const handleShare = () => {
    const url = `${window.location.origin}/me`;
    if (navigator.share) {
      navigator.share({ title: user?.full_name || "My UNIBUD profile", url }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(url);
      toast({ title: "Profile link copied" });
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await base44.entities.SupportTicket.create({
        subject: "Account Deletion Request",
        category: "general",
        priority: "urgent",
        status: "open",
        student_name: user?.full_name || user?.email || "Unknown",
        student_id: user?.id || "",
        messages: [{
          content: "User requested permanent account deletion.",
          author: user?.email || "user",
          created_at: new Date().toISOString(),
        }],
      });
      toast({ title: "Deletion request submitted", description: "Our support team will contact you within 48 hours." });
      setShowDeleteDialog(false);
      setTimeout(() => base44.auth.logout("/login"), 2000);
    } catch {
      toast({ title: "Something went wrong", description: "Could not submit your request. Please try again.", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  const followerCount = isDemoMode ? 0 : (followers || []).length;
  const followingCount = isDemoMode ? 0 : (following || []).length;

  const isFutureStudent = !isDemoMode && user?.user_type === "future_student";
  const canGraduate = !isDemoMode && (user?.user_type === "student" || user?.user_type === "postgraduate");

  return (
    <div className="min-h-screen pb-8">
      {/* Shared header */}
      <ProfileHeader
        user={user}
        isOwner
        followerCount={followerCount}
        followingCount={followingCount}
        onEdit={() => toast({ title: "Edit profile", description: "Profile editing is coming soon." })}
        onShare={handleShare}
        onSettings={() => toast({ title: "Settings", description: "A dedicated Settings hub is coming soon." })}
        onSignOut={handleSignOut}
        onDelete={() => setShowDeleteDialog(true)}
      />

      {/* Segmented control: Social | Academic */}
      <div className="px-5 mt-4 mb-1">
        <div className="relative flex p-1 rounded-full bg-muted/60 border border-border/40">
          {["social", "academic"].map((v) => {
            const active = view === v;
            return (
              <button
                key={v}
                onClick={() => setView(v)}
                className="relative flex-1 py-2 text-[13px] font-heading font-semibold capitalize transition-colors"
              >
                {active && (
                  <motion.div
                    layoutId="profileSegment"
                    className="absolute inset-0 rounded-full bg-card soft-shadow"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className={`relative ${active ? "text-foreground" : "text-muted-foreground"}`}>{v}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Journey transitions live in the Academic view (identity-stage banners) */}
      <AnimatePresence mode="wait">
        {view === "social" ? (
          <motion.div key="social" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <SocialProfileView user={user} />
          </motion.div>
        ) : (
          <motion.div key="academic" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {/* Future student transition */}
            {isFutureStudent && (
              <div className="px-5 mb-4 mt-4">
                <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Rocket className="w-5 h-5 text-white" />
                    <p className="font-heading font-bold text-[14px] text-white">Future Student</p>
                  </div>
                  <p className="text-[12px] text-white/85 leading-relaxed mb-3">
                    Been admitted? Transition to a full student profile — your history and progress stay with you.
                  </p>
                  <button
                    onClick={() => setShowTransition(true)}
                    className="w-full h-[44px] rounded-2xl bg-white/20 text-white font-heading font-semibold text-[13px] flex items-center justify-center gap-2 spring-tap"
                  >
                    <GraduationCap className="w-[18px] h-[18px]" /> Transition to Student Account
                  </button>
                </div>
                <TransitionToStudent open={showTransition} onClose={() => setShowTransition(false)} user={user} />
              </div>
            )}

            {/* Graduation transition */}
            {canGraduate && (
              <div className="px-5 mb-4 mt-4">
                <div className="rounded-2xl bg-gradient-to-br from-success/10 to-success/5 border border-success/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-5 h-5 text-success" />
                    <p className="font-heading font-bold text-[14px] text-foreground">
                      {user?.user_type === "postgraduate" ? "Completed Your Programme?" : "Graduating Soon?"}
                    </p>
                  </div>
                  <p className="text-[12px] text-muted-foreground leading-relaxed mb-3">
                    Transition to an Alumni profile or continue your journey. Your history and achievements will be preserved.
                  </p>
                  <button
                    onClick={() => setShowGraduation(true)}
                    className="w-full h-[44px] rounded-2xl bg-success text-white font-heading font-semibold text-[13px] flex items-center justify-center gap-2 spring-tap"
                  >
                    <GraduationCap className="w-[18px] h-[18px]" />
                    {user?.user_type === "postgraduate" ? "Complete Your Journey" : "Graduate & Transition"}
                  </button>
                </div>
                <GraduationTransition open={showGraduation} onClose={() => setShowGraduation(false)} user={user} />
              </div>
            )}

            <AcademicProfileView user={user} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete account dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-sm rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[16px] font-heading font-bold">Delete your account?</AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] leading-relaxed">
              This will permanently remove your profile, conversations, and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2">
            <AlertDialogCancel className="flex-1 h-[42px] rounded-2xl text-[13px] mt-0">Cancel</AlertDialogCancel>
            <button
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="flex-1 h-[42px] rounded-2xl bg-destructive text-destructive-foreground text-[13px] font-semibold hover:bg-destructive/90 disabled:opacity-50 transition-colors"
            >
              {isDeleting ? "Processing..." : "Delete Account"}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}