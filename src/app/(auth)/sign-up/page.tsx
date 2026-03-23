"use client";

import * as React from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, User, Mail, Lock, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";

interface ClerkError {
  errors: Array<{
    message: string;
    code?: string;
  }>;
}

const SignUpPage = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  // Form States
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  
  // UI States
  const [showPw, setShowPw] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Password Validation Logic
  const validations = {
    length: password.length >= 6,
    number: /[0-9]/.test(password),
    letter: /[a-zA-Z]/.test(password),
    symbol: /[^a-zA-Z0-9]/.test(password),
  };

  const isPasswordValid = Object.values(validations).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    if (!isPasswordValid) {
      return toast.error("Weak Password", {
        description: "Please meet all security requirements."
      });
    }

    setIsLoading(true);
    try {
      // Included username in the creation call
      const result = await signUp.create({ 
        username,
        emailAddress: email, 
        password 
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        toast.success("Account created!", { description: "Welcome to EDUKATE2026." });
        router.push("/dashboard");
      }
    } catch (err) {
      const clerkError = err as ClerkError;
      toast.error("Registration Failed", {
        description: clerkError.errors?.[0]?.message || "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50/50 px-4">
      <Card className="w-full max-w-[440px] border border-slate-200 shadow-[0_20px_50px_rgba(8,112,184,0.08)] rounded-[2.5rem] bg-white overflow-hidden">
        <CardContent className="p-10">
          
          <div className="flex justify-center gap-12 mb-10 border-b border-slate-100">
            <Link href="/sign-in" className="pb-4 text-2xl font-bold text-slate-300 hover:text-slate-400 transition-all">
              Log in
            </Link>
            <button type="button" className="pb-4 text-2xl font-bold text-blue-600 border-b-4 border-blue-600">
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Input */}
            <div className="space-y-2">
              <Label className="text-slate-500 font-medium text-sm ml-1">Username</Label>
              <div className="relative">
                <User className="absolute left-4 top-3 text-slate-300 h-5 w-5" />
                <Input 
                  className="bg-slate-50/50 border-slate-200 h-12 rounded-xl pl-12 focus:ring-2 focus:ring-blue-500/10"
                  type="text" 
                  placeholder="johndoe"
                  required 
                  onChange={(e) => setUsername(e.target.value)} 
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <Label className="text-slate-500 font-medium text-sm ml-1">Your Email</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-3 text-slate-300 h-5 w-5" />
                <Input 
                  className="bg-slate-50/50 border-slate-200 h-12 rounded-xl pl-12 focus:ring-2 focus:ring-blue-500/10"
                  type="email" 
                  placeholder="name@example.com"
                  required 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label className="text-slate-500 font-medium text-sm ml-1">Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-3 text-slate-300 h-5 w-5" />
                <Input 
                  className="bg-slate-50/50 border-slate-200 h-12 rounded-xl pl-12 pr-12 focus:ring-2 focus:ring-blue-500/10"
                  type={showPw ? "text" : "password"} 
                  placeholder="••••••••"
                  required 
                  onChange={(e) => setPassword(e.target.value)} 
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-3 text-slate-400 hover:text-blue-600 transition-colors">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Real-time Validation UI */}
              <div className="grid grid-cols-2 gap-2 mt-3 px-1">
                <ValidationCheck label="6+ Chars" met={validations.length} />
                <ValidationCheck label="Letters" met={validations.letter} />
                <ValidationCheck label="Numbers" met={validations.number} />
                <ValidationCheck label="Symbols" met={validations.symbol} />
              </div>
            </div>
            
            <Button 
              disabled={isLoading || !isPasswordValid}
              className={`w-full h-12 rounded-xl font-bold shadow-lg transition-all active:scale-95 mt-4 ${
                isPasswordValid 
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200" 
                : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
              }`}
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper component for validation checks
const ValidationCheck = ({ label, met }: { label: string; met: boolean }) => (
  <div className={`flex items-center gap-2 text-[11px] font-medium transition-colors ${met ? "text-green-600" : "text-slate-400"}`}>
    {met ? <CheckCircle2 size={12} /> : <Circle size={12} className="opacity-50" />}
    {label}
  </div>
);

export default SignUpPage;