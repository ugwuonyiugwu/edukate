"use client";

import * as React from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";

// Proper TypeScript interface for Clerk errors
interface ClerkError {
  errors: Array<{
    message: string;
  }>;
}

const SignInPage = () => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  // Form States
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  
  // UI States
  const [showPw, setShowPw] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        toast.success("Welcome back!", {
          description: "Login successful.",
        });
        router.push("/dashboard");
      } else {
        console.log("Secondary step required:", result);
      }
    } catch (err: unknown) {
      const clerkError = err as ClerkError;
      toast.error("Login Failed", {
        description: clerkError.errors?.[0]?.message || "Invalid email or password",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50/40 px-4">
      
      {/* Reduced max-width and added premium shadow */}
      <Card className="w-full max-w-100 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-[2rem] bg-white overflow-hidden">
        <CardContent className="p-8">
          
          {/* Tabs UI - Slightly smaller text for better proportion */}
          <div className="flex justify-center gap-12 mb-8 border-b border-slate-50">
            <button type="button" className="pb-3 text-2xl font-bold text-blue-600 border-b-4 border-blue-600">
              Log in
            </button>
            <Link href="/sign-up">
              <button type="button" className="pb-3 text-2xl font-bold text-slate-300 hover:text-slate-400 transition-all">
                Sign Up
              </button>
            </Link>
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-1.5">
              <Label className="text-slate-500 font-medium text-xs ml-1 uppercase tracking-wider">Your Email</Label>
              <Input 
                className="bg-slate-50/50 border-slate-200 h-12 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500/20 transition-all"
                type="email" 
                placeholder="name@example.com"
                required 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <Label className="text-slate-500 font-medium text-xs ml-1 uppercase tracking-wider">Password</Label>
              <div className="relative">
                <Input 
                  className="bg-slate-50/50 border-slate-200 h-12 rounded-xl pr-12 focus-visible:ring-2 focus-visible:ring-blue-500/20 transition-all"
                  type={showPw ? "text" : "password"} 
                  placeholder="••••••••"
                  required 
                  onChange={(e) => setPassword(e.target.value)} 
                />
                <button 
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="text-right px-1">
                  <Link href="/forgot-password" className="text-slate-400 italic text-xs hover:text-blue-500 transition-colors">
                    forgot password?
                  </Link>
              </div>
            </div>

            <Button 
              disabled={isLoading}
              type="submit" 
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-100 mt-2 active:scale-95 transition-all"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying...</span>
                </div>
              ) : (
                "Log in"
              )}
            </Button>

            <div className="pt-6 text-center">
               <p className="text-slate-400 text-sm">
                Need an account? <Link href="/sign-up" className="font-bold text-slate-600 hover:text-blue-600 hover:underline">Sign Up</Link>
               </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default SignInPage;