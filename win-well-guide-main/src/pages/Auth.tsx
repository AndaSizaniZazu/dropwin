import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Zap, Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isSupabaseConfigured } from "@/integrations/supabase/client";

// Google "G" logo SVG
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();

  // Sign-in state
  const [signInEmail, setSignInEmail]       = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [showSignInPwd, setShowSignInPwd]   = useState(false);
  const [signInLoading, setSignInLoading]   = useState(false);

  // Sign-up state
  const [signUpName, setSignUpName]           = useState("");
  const [signUpEmail, setSignUpEmail]         = useState("");
  const [signUpPassword, setSignUpPassword]   = useState("");
  const [signUpConfirm, setSignUpConfirm]     = useState("");
  const [showSignUpPwd, setShowSignUpPwd]     = useState(false);
  const [signUpLoading, setSignUpLoading]     = useState(false);

  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    if (!isSupabaseConfigured) {
      toast({ title: "Not configured", description: "Supabase is not set up for this deployment.", variant: "destructive" });
      return;
    }
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      // Page will redirect via Supabase OAuth – no need to navigate()
    } catch (err) {
      toast({
        title: "Google sign-in failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
      setGoogleLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail || !signInPassword) {
      toast({ title: "Missing fields", description: "Enter your email and password.", variant: "destructive" });
      return;
    }
    setSignInLoading(true);
    try {
      await signInWithEmail(signInEmail, signInPassword);
      navigate("/");
    } catch (err) {
      toast({
        title: "Sign-in failed",
        description: err instanceof Error ? err.message : "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setSignInLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpName || !signUpEmail || !signUpPassword) {
      toast({ title: "Missing fields", description: "Fill in all required fields.", variant: "destructive" });
      return;
    }
    if (signUpPassword !== signUpConfirm) {
      toast({ title: "Passwords don't match", description: "Re-enter your password.", variant: "destructive" });
      return;
    }
    if (signUpPassword.length < 6) {
      toast({ title: "Password too short", description: "Use at least 6 characters.", variant: "destructive" });
      return;
    }
    setSignUpLoading(true);
    try {
      await signUpWithEmail(signUpEmail, signUpPassword, signUpName);
      toast({
        title: "Account created!",
        description: "Check your email to confirm your account, then sign in.",
      });
    } catch (err) {
      toast({
        title: "Sign-up failed",
        description: err instanceof Error ? err.message : "Could not create account",
        variant: "destructive",
      });
    } finally {
      setSignUpLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">

        {/* Branding */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary flex items-center justify-center">
            <Zap className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">DropWin</h1>
          <p className="text-muted-foreground text-sm">
            Your AI-powered dropshipping intelligence platform
          </p>
        </div>

        {/* Auth Card */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-center">Welcome back</CardTitle>
            <CardDescription className="text-center text-xs">
              Sign in with Google for one-click access to all platforms
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Google Button — primary CTA */}
            <Button
              variant="outline"
              className="w-full h-11 gap-3 border-border/80 hover:bg-muted/50"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              <span className="font-medium">Continue with Google</span>
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or use email</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Email / Password tabs */}
            <Tabs defaultValue="signin">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Create Account</TabsTrigger>
              </TabsList>

              {/* ── Sign In ── */}
              <TabsContent value="signin">
                <form onSubmit={handleEmailSignIn} className="space-y-3 pt-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="si-email" className="text-xs">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="si-email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-9"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="si-password" className="text-xs">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="si-password"
                        type={showSignInPwd ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-9 pr-10"
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignInPwd((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                      >
                        {showSignInPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={signInLoading}>
                    {signInLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Sign In
                  </Button>
                </form>
              </TabsContent>

              {/* ── Sign Up ── */}
              <TabsContent value="signup">
                <form onSubmit={handleEmailSignUp} className="space-y-3 pt-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="su-name" className="text-xs">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="su-name"
                        type="text"
                        placeholder="John Doe"
                        className="pl-9"
                        value={signUpName}
                        onChange={(e) => setSignUpName(e.target.value)}
                        autoComplete="name"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="su-email" className="text-xs">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="su-email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-9"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="su-password" className="text-xs">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="su-password"
                        type={showSignUpPwd ? "text" : "password"}
                        placeholder="Min. 6 characters"
                        className="pl-9 pr-10"
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignUpPwd((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                      >
                        {showSignUpPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="su-confirm" className="text-xs">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="su-confirm"
                        type="password"
                        placeholder="Repeat password"
                        className="pl-9"
                        value={signUpConfirm}
                        onChange={(e) => setSignUpConfirm(e.target.value)}
                        autoComplete="new-password"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={signUpLoading}>
                    {signUpLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Create Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Google benefits note */}
        <p className="text-center text-xs text-muted-foreground px-4">
          Signing in with Google unlocks one-click access to BigSpy, TikTok Ads,
          Amazon and AliExpress — your browser session handles the rest.
        </p>
      </div>
    </div>
  );
}
