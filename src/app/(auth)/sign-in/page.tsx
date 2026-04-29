"use client";

import * as React from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";

export const dynamic = "force-dynamic";

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
        
        // Success Toast
        toast.success("Welcome back!", {
          description: "Signed in to EDUKATE2026 successfully.",
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
      
      {/* Width updated to match Sign-Up for consistency */}
      <Card className="w-full max-w-120 border border-blue-200 shadow-[0_20px_50px_rgba(8,112,184,0.08)] rounded-lg bg-white overflow-hidden transition-all duration-300">
        <CardContent className="p-8 md:p-12">
          
          {/* Tabs UI */}
          <div className="flex justify-center gap-12 mb-10 border-b border-slate-100">
            <button type="button" className="pb-4 text-2xl font-bold text-blue-600 border-b-4 border-blue-600">
              Log in
            </button>
            <Link href="/sign-up/sign-up">
              <button type="button" className="pb-4 text-2xl font-bold text-slate-300 hover:text-slate-400 transition-all">
                Sign Up
              </button>
            </Link>
          </div>

          <form onSubmit={handleSignIn} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <Label className="text-slate-500 font-medium text-sm ml-1 uppercase tracking-wider">Your Email</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-300" />
                <Input 
                  className="bg-slate-50/50 border-slate-200 h-12 rounded-xl pl-12 focus-visible:ring-2 focus-visible:ring-blue-500/10 transition-all"
                  type="email" 
                  placeholder="name@example.com"
                  required 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <Label className="text-slate-500 font-medium text-sm uppercase tracking-wider">Password</Label>
                <Link href="/forgot-password" className="text-slate-400 italic text-xs hover:text-blue-500 transition-colors">
                  forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-300" />
                <Input 
                  className="bg-slate-50/50 border-slate-200 h-12 rounded-xl pl-12 pr-12 focus-visible:ring-2 focus-visible:ring-blue-500/10 transition-all"
                  type={showPw ? "text" : "password"} 
                  placeholder="••••••••"
                  required 
                  onChange={(e) => setPassword(e.target.value)} 
                />
                <button 
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-3 text-slate-400 hover:text-blue-600 transition-colors"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              disabled={isLoading}
              type="submit" 
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-100 mt-4 active:scale-95 transition-all"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                "Log in"
              )}
            </Button>

            <div className="pt-6 text-center">
               <p className="text-slate-400 text-sm">
                Need an account? <Link href="/presign-up " className="font-bold text-slate-600 hover:text-blue-600 hover:underline transition-all">Create Account</Link>
               </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default SignInPage;