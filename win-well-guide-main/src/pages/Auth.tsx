import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";

const Auth = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">DropWin</CardTitle>
          <CardDescription>
            Authentication is temporarily disabled for this preview deployment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lock className="h-6 w-6" />
          </div>
          <p className="text-sm text-muted-foreground">
            Sign in and sign up are turned off until the Supabase backend and tables are ready.
          </p>
          <Button asChild className="w-full">
            <Link to="/">Continue To App</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
