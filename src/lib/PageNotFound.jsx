import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Home } from 'lucide-react';

export default function PageNotFound({}) {
    const location = useLocation();
    const pageName = location.pathname.substring(1);

    const { data: authData, isFetched } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            try {
                const user = await base44.auth.me();
                return { user, isAuthenticated: true };
            } catch (error) {
                return { user: null, isAuthenticated: false };
            }
        }
    });

    return (
        <div className="min-h-screen flex items-center justify-center p-6 safe-area-pt">
          <div className="w-full max-w-md text-center">
            <div className="crystal-card p-10 fade-in-up">
              <p className="display-number text-[64px] text-muted-foreground/30">404</p>
              <div className="h-px w-14 bg-border/60 mx-auto my-5" />
              <h2 className="font-heading font-bold text-heading text-foreground tracking-tight">Page not found</h2>
              <p className="text-[13px] text-muted-foreground leading-relaxed mt-2.5 max-w-[260px] mx-auto">
                The page <span className="font-semibold text-foreground">"{pageName}"</span> could not be found.
              </p>

                    {isFetched && authData.isAuthenticated && authData.user?.role === 'admin' && (
                        <div className="mt-6 p-3.5 rounded-2xl bg-warning/8 border border-warning/20 text-left">
                            <p className="text-[12px] font-semibold text-foreground">Admin note</p>
                            <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
                                This page may not be implemented yet — ask Bud to build it.
                            </p>
                        </div>
                    )}

                    <button
                        onClick={() => { window.location.href = authData?.isAuthenticated ? '/home' : '/'; }}
                        className="mt-7 inline-flex items-center gap-2 h-11 px-6 rounded-full bg-primary text-primary-foreground font-heading font-semibold text-[13px] spring-tap ice-glow"
                    >
                        <Home className="w-[18px] h-[18px]" strokeWidth={2} /> Go Home
                    </button>
                </div>
            </div>
        </div>
    );
}