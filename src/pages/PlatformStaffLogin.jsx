import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Lock, ArrowLeft, AlertCircle, Eye, EyeOff } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { isPlatformRole, isOracleRole } from "@/lib/portalConfig";
import UnibudMark from "@/components/brand/UnibudMark";

export default function PlatformStaffLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    base44.auth.isAuthenticated().then((authed) => {
      if (authed) {
        base44.auth.me().then((user) => {
          if (isPlatformRole(user.role) || isOracleRole(user.role)) {
            navigate("/portal", { replace: true });
          } else {
            navigate("/", { replace: true });
          }
        });
      }
    });
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError("");
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      const user = await base44.auth.me();
      if (isPlatformRole(user.role) || isOracleRole(user.role)) {
        window.location.href = "/portal";
      } else {
        setError("This portal is for platform staff only. Use the appropriate sign-in option.");
        await base44.auth.logout();
      }
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      <motion.div
        className="absolute top-[-15%] left-[-10%] w-[70%] h-[45%] rounded-full bg-primary/[0.06] blur-[120px] pointer-events-none"
        animate={{ x: [0, 40, 0], y: [0, 25, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[40%] rounded-full bg-primary/[0.03] blur-[100px] pointer-events-none"
        animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        <Link to="/welcome" className="absolute top-6 left-6 flex items-center gap-2 text-n3 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-[13px] font-medium">Back</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-[20px] bg-black flex items-center justify-center mb-3 gold-glow relative">
              <UnibudMark className="w-7 h-7 text-primary" />
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-error flex items-center justify-center">
                <Shield className="w-3 h-3 text-white" />
              </div>
            </div>
            <h1 className="font-heading font-extrabold text-[22px] tracking-tight text-white">Operations Center</h1>
            <p className="text-[12px] text-n3 mt-1 text-center">Authorized personnel only · Invitation required</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 rounded-[16px] bg-error/10 border border-error/20 mb-4"
            >
              <AlertCircle className="w-4 h-4 text-error flex-shrink-0" />
              <p className="text-[12px] text-error font-medium">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-[12px] font-semibold text-white mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@myrealm.network"
                className="w-full h-[48px] px-4 rounded-[16px] bg-n7 border border-n6 text-[14px] text-white placeholder:text-n4 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-n6 transition-all"
                required
              />
            </div>
            <div>
              <label className="text-[12px] font-semibold text-white mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-[48px] px-4 pr-12 rounded-[16px] bg-n7 border border-n6 text-[14px] text-white placeholder:text-n4 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-n6 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-n4 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="w-full h-[52px] rounded-[16px] bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                  <Lock className="w-[18px] h-[18px]" />
                </motion.div>
              ) : (
                <>
                  <Shield className="w-[18px] h-[18px]" strokeWidth={2} />
                  Access Operations Center
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[11px] text-n4 leading-relaxed">
              No registration available. Access is granted by invitation only.
              <br />
              Contact a Super Admin or Oracle to request access.
            </p>
            <Link to="/forgot-password" className="text-[12px] text-primary hover:underline mt-2 inline-block">
              Forgot password?
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-n7 text-center">
            <p className="text-[10px] text-n4">A My Realm Product</p>
            <p className="text-[9px] text-n4/60 mt-0.5">My Realm Network Limited · RC: 9645700</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}