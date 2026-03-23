"use client";

import * as React from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Mail, Eye, EyeOff, RotateCcw, CheckCircle2, Circle } from "lucide-react";
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

const ForgotPasswordPage = () => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isCodeSent, setIsCodeSent] = React.useState(false);
  const [countdown, setCountdown] = React.useState(0);

  // Password Validation States
  const validations = {
    length: password.length >= 6,
    number: /[0-9]/.test(password),
    letter: /[a-zA-Z]/.test(password),
    symbol: /[^a-zA-Z0-9]/.test(password),
  };

  const isPasswordValid = Object.values(validations).every(Boolean);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleRequestCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isLoaded || countdown > 0) return;

    setIsLoading(true);
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setIsCodeSent(true);
      setCountdown(60);
      toast.success("Code sent!");
    } catch (err) {
       const clerkError = err as ClerkError;

      if (clerkError.errors?.[0]?.code === "session_exists") {
        toast.info("Active session detected. Please sign out first.");
      } else {
        toast.error("Error", { 
          description: clerkError.errors?.[0]?.message || "Account not found." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    if (!isPasswordValid) {
      return toast.error("Invalid Password", { description: "Please meet all requirements." });
    }

    setIsLoading(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        toast.success("Password Updated!");
        router.push("/dashboard");
      }
     } catch (err) {
        const clerkError = err as ClerkError;
        
        toast.error("Resent failed", {
        description: clerkError.errors?.[0]?.message || "Invald code",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50/40 px-4">
      <Card className="w-full max-w-100 md:max-w-112.5 lg:max-w-120 border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] rounded-[2.5rem] bg-white overflow-hidden transition-all duration-500">
        <CardContent className="p-8 md:p-12">
          
          <Link href="/sign-in" className="inline-flex items-center text-slate-400 hover:text-blue-600 text-sm font-medium mb-8 group">
            <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
            Back to Login
          </Link>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              {isCodeSent ? "Verify Email" : "Reset Password"}
            </h2>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed">
              {isCodeSent 
                ? `Verification code sent to ${email}` 
                : "Enter your email to receive a password reset code."}
            </p>
          </div>

          {!isCodeSent ? (
            <form onSubmit={handleRequestCode} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-slate-600 font-semibold text-xs ml-1 uppercase tracking-widest">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-4 h-5 w-5 text-slate-300" />
                  <Input 
                    className="bg-slate-50 border-slate-200 h-14 rounded-2xl pl-12 text-lg focus:ring-2 focus:ring-blue-500/10 transition-all"
                    type="email" 
                    placeholder="name@example.com"
                    required 
                    onChange={(e) => setEmail(e.target.value)} 
                  />
                </div>
              </div>
              <Button disabled={isLoading} className="w-full h-14 bg-blue-600 hover:bg-blue-700 rounded-2xl font-bold text-lg shadow-xl shadow-blue-100 transition-all active:scale-[0.98]">
                {isLoading ? <Loader2 className="animate-spin" /> : "Send Reset Code"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-end px-1">
                  <Label className="text-slate-600 font-semibold text-xs uppercase tracking-widest">6-Digit Code</Label>
                  <button 
                    type="button" 
                    disabled={countdown > 0 || isLoading}
                    onClick={() => handleRequestCode()}
                    className="text-xs font-bold text-blue-600 disabled:text-slate-400 flex items-center gap-1 hover:underline transition-all"
                  >
                    <RotateCcw size={12} className={isLoading ? "animate-spin" : ""} />
                    {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
                  </button>
                </div>
                <Input 
                  className="bg-slate-50 border-slate-200 h-16 rounded-2xl text-center text-3xl font-black tracking-[0.5em] focus:border-blue-500 transition-all"
                  type="text" 
                  maxLength={6}
                  placeholder="000000"
                  required 
                  onChange={(e) => setCode(e.target.value)} 
                />
              </div>

              <div className="space-y-3">
                <Label className="text-slate-600 font-semibold text-xs ml-1 uppercase tracking-widest">New Password</Label>
                <div className="relative">
                  <Input 
                    className="bg-slate-50 border-slate-200 h-14 rounded-2xl pr-12 text-lg"
                    type={showPw ? "text" : "password"} 
                    placeholder="••••••••"
                    required 
                    onChange={(e) => setPassword(e.target.value)} 
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
                    {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {/* Password Strength Checklist */}
                <div className="grid grid-cols-2 gap-2 mt-2 px-1">
                  <ValidationItem label="6+ Characters" met={validations.length} />
                  <ValidationItem label="Letters" met={validations.letter} />
                  <ValidationItem label="Numbers" met={validations.number} />
                  <ValidationItem label="Symbols" met={validations.symbol} />
                </div>
              </div>

              <Button 
                disabled={isLoading || !isPasswordValid} 
                className={`w-full h-14 rounded-2xl font-bold text-lg shadow-xl transition-all active:scale-[0.98] ${
                  isPasswordValid ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100' : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                {isLoading ? <Loader2 className="animate-spin" /> : "Update Password"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Sub-component for the checklist
const ValidationItem = ({ label, met }: { label: string; met: boolean }) => (
  <div className={`flex items-center gap-2 text-[10px] md:text-xs transition-colors ${met ? 'text-green-600' : 'text-slate-400'}`}>
    {met ? <CheckCircle2 size={14} /> : <Circle size={14} className="opacity-40" />}
    {label}
  </div>
);

export default ForgotPasswordPage;