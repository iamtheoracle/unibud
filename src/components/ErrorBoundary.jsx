import React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { logger } from "@/lib/production/logger";

/**
 * ErrorBoundary — prevents a single component crash from white-screening
 * the whole app. Captures the error to the production logger and offers a
 * calm recovery path (reload / go home). Lives outside the router, so it
 * uses hard navigation rather than <Link>.
 */
export default class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    logger.error("react_crash", {
      message: error?.message,
      stack: info?.componentStack,
    });
  }

  reload = () => window.location.reload();
  goHome = () => { window.location.href = "/"; };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-background">
        <div className="max-w-[360px] text-center">
          <div className="w-16 h-16 rounded-[24px] bg-error/10 soft-shadow flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-error" strokeWidth={1.8} />
          </div>
          <h1 className="font-heading font-bold text-[20px] text-foreground mb-2">Something went wrong</h1>
          <p className="text-[13px] text-muted-foreground leading-relaxed mb-6">
            UNIBUD hit an unexpected issue. Your data is safe — try reloading, or head back home.
          </p>
          <div className="flex gap-2 justify-center">
            <button onClick={this.reload} className="px-4 py-2.5 rounded-[16px] bg-primary text-primary-foreground text-[13px] font-semibold spring-tap flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4" /> Reload
            </button>
            <button onClick={this.goHome} className="px-4 py-2.5 rounded-[16px] bg-card border border-border/40 text-foreground text-[13px] font-semibold spring-tap">
              Go home
            </button>
          </div>
        </div>
      </div>
    );
  }
}