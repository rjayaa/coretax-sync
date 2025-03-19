'use client';

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, User, Lock, Eye, EyeOff } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Get the callbackUrl from URL params, default to dashboard
  const callbackUrl = searchParams ? searchParams.get("callbackUrl") || "/dashboard" : "/dashboard";

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated") {
      // Force navigation using window.location for more reliable redirection
      window.location.href = callbackUrl;
    }
  }, [status, callbackUrl]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  // Load remembered username if exists
  useEffect(() => {
    const rememberedUsername = localStorage.getItem('rememberMe');
    if (rememberedUsername) {
      form.setValue('username', rememberedUsername);
      form.setValue('rememberMe', true);
    }
  }, [form]);

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        username: data.username,
        password: data.password,
        redirect: false,
        callbackUrl: callbackUrl,
      });

      if (res?.error) {
        setError("Invalid username or password");
        setIsLoading(false);
        return;
      }

      // Handle remember me after successful login
      if (data.rememberMe) {
        localStorage.setItem('rememberMe', data.username);
      } else {
        localStorage.removeItem('rememberMe');
      }

      // Force navigation using window.location instead of Next.js router
      // This bypasses potential router-related issues
      window.location.href = callbackUrl;
      
    } catch (error) {
      setError("An error occurred during login");
      console.error("Login error:", error);
      setIsLoading(false);
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full mx-auto">
        {error && (
          <Alert variant="destructive" className="bg-red-900/50 border-red-500/50">
            <AlertDescription className="text-white">{error}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    disabled={isLoading}
                    placeholder="Username"
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    type={showPassword ? "text" : "password"}
                    disabled={isLoading}
                    placeholder="Password"
                    className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-300 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rememberMe"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="bg-white/10 border-white/20 data-[state=checked]:bg-white/20"
                />
              </FormControl>
              <FormLabel className="text-sm font-normal text-gray-200">
                Remember me
              </FormLabel>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isLoading || status === "loading"}
          className="login-btn w-full font-semibold tracking-wider py-3 mt-4 relative overflow-hidden"
          style={{
            background: "linear-gradient(to right, #890707, #c61111, #e52222)",
            boxShadow: "0 4px 15px rgba(137, 7, 7, 0.3)",
            transition: "all 0.3s",
          }}
        >
          {isLoading || status === "loading" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </Button>

        <style jsx>{`
          .login-btn:hover {
            background: linear-gradient(to right, #750606, #b30f0f, #d71f1f) !important;
            box-shadow: 0 5px 20px rgba(137, 7, 7, 0.5);
            transform: translateY(-2px);
          }

          .login-btn:active {
            transform: translateY(1px);
            box-shadow: 0 2px 10px rgba(137, 7, 7, 0.4);
          }

          .login-btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(to right,
                    rgba(255, 255, 255, 0) 0%,
                    rgba(255, 255, 255, 0.3) 50%,
                    rgba(255, 255, 255, 0) 100%);
            transform: skewX(-25deg);
            transition: all 0.75s;
          }

          .login-btn:hover::before {
            left: 100%;
          }
        `}</style>
      </form>
    </Form>
  );
}