/**
 * GoogleAccountBanner
 *
 * Shows the signed-in Google account and a quick-launch button for a
 * third-party platform.
 *
 * How the "auto-login" works:
 *   The user signs into DropWin with Google → their browser stores
 *   Google session cookies.  When they open BigSpy / TikTok / Amazon /
 *   AliExpress in a new tab those sites call Google's OAuth endpoint and
 *   find an active session, so they log the user in automatically.
 *   We can't inject credentials into cross-origin iframes (browser
 *   security prevents it), but clicking "Open [Platform]" opens a full
 *   tab where the browser's Google cookies do the work.
 */

import { ExternalLink, CheckCircle2, AlertCircle, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface GoogleAccountBannerProps {
  /** Display name shown in the button, e.g. "BigSpy" */
  platformName: string;
  /** Full URL to open in a new tab */
  platformUrl: string;
}

export function GoogleAccountBanner({ platformName, platformUrl }: GoogleAccountBannerProps) {
  const { user, signInWithGoogle } = useAuth();
  const email = user?.email ?? "";
  const avatar = user?.user_metadata?.avatar_url as string | undefined;
  const name   = (user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? email) as string;

  const handleGoogleLogin = async () => {
    await signInWithGoogle();
  };

  if (!user) {
    // Not signed in — prompt to connect Google
    return (
      <div className="mx-4 mt-3 mb-1 flex items-center justify-between gap-3 rounded-lg border border-warning/40 bg-warning/5 px-3 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <AlertCircle className="w-4 h-4 text-warning flex-shrink-0" />
          <span className="text-xs text-muted-foreground truncate">
            Sign in with Google to auto-login to {platformName}
          </span>
        </div>
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5 flex-shrink-0" onClick={handleGoogleLogin}>
          <LogIn className="w-3.5 h-3.5" />
          Sign in
        </Button>
      </div>
    );
  }

  // Signed in — show account + launch button
  return (
    <div className="mx-4 mt-3 mb-1 flex items-center justify-between gap-3 rounded-lg border border-success/30 bg-success/5 px-3 py-2">
      <div className="flex items-center gap-2 min-w-0">
        {avatar ? (
          <img src={avatar} alt={name} className="w-5 h-5 rounded-full flex-shrink-0 object-cover" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
        )}
        <div className="min-w-0">
          <p className="text-xs font-medium text-foreground truncate leading-tight">{name}</p>
          <p className="text-[10px] text-muted-foreground truncate leading-tight">{email}</p>
        </div>
      </div>
      <Button
        size="sm"
        className="h-7 text-xs gap-1.5 flex-shrink-0"
        onClick={() => window.open(platformUrl, "_blank", "noopener,noreferrer")}
      >
        <ExternalLink className="w-3 h-3" />
        Open {platformName}
      </Button>
    </div>
  );
}
