"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, clearAdminToken, setAdminToken, verifyAdminSession } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Already signed in? Skip the form. Backend down? Show the form anyway.
  useEffect(() => {
    let cancelled = false;
    verifyAdminSession().then(({ ok, reachable }) => {
      if (cancelled) return;
      if (ok) {
        router.replace("/admin");
      } else {
        clearAdminToken(); // drop stale tokens so requests start clean
        setChecking(false);
        if (!reachable) {
          toast.error("Cannot reach the server. Check that the API is running.");
        }
      }
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api<{ token: string }>("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setAdminToken(res.token);
      toast.success("Welcome back");
      router.replace("/admin");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
      setPassword("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-sm gap-0 p-8">
        {checking ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center text-center">
              <Logo />
              <p className="mt-1 text-[11px] font-medium tracking-widest text-muted-foreground uppercase">
                Admin Console
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4" autoComplete="on">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="size-4 animate-spin" />}
                Sign in
              </Button>
            </form>
          </>
        )}
      </Card>
    </div>
  );
}
