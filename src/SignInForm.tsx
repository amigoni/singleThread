"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      formData.set("flow", "signIn");
      await signIn("password", formData);
      
      toast({
        title: "Signed in successfully!",
        description: "Welcome to SingleThread",
      });
    } catch (error) {
      console.error("Authentication error:", error);
      
      let errorMessage = "Invalid email or password. Please try again.";
      
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes("Invalid credentials")) {
          errorMessage = "Invalid email or password. Please try again.";
        } else if (error.message.includes("User not found")) {
          errorMessage = "Account not found. Please check your email address.";
        }
      }
      
      toast({
        title: "Sign-in failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <form
        className="flex flex-col gap-4"
        onSubmit={handleSubmit}
      >
        <Input 
          type="email" 
          name="email" 
          placeholder="Email" 
          required 
          className="h-10"
          disabled={submitting}
        />
        <Input 
          type="password" 
          name="password" 
          placeholder="Password" 
          required 
          className="h-10"
          disabled={submitting}
        />
        <Button 
          type="submit" 
          disabled={submitting}
          className="h-10"
        >
          {submitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
