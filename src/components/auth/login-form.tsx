// // components/auth/login-form.tsx
// 'use client'

// import { useState, useEffect } from 'react'
// import { useForm } from 'react-hook-form'
// import { signIn } from 'next-auth/react'
// import { useRouter } from 'next/navigation'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Checkbox } from '@/components/ui/checkbox'
// import { zodResolver } from '@hookform/resolvers/zod'
// import * as z from 'zod'

// const loginSchema = z.object({
//   username: z.string().min(1, 'Username is required'),
//   password: z.string().min(1, 'Password is required'),
//   rememberMe: z.boolean().default(false)
// })

// type LoginForm = z.infer<typeof loginSchema>

// export function LoginForm() {
//   const router = useRouter()
//   const [error, setError] = useState<string | null>(null)
  
//   const {
//     register,
//     handleSubmit,
//     setValue,
//     formState: { errors, isSubmitting },
//   } = useForm<LoginForm>({
//     resolver: zodResolver(loginSchema),
//     defaultValues: {
//       rememberMe: false
//     }
//   })

//   useEffect(() => {
//     // Check if there's a remembered username
//     const rememberedUsername = localStorage.getItem('rememberMe')
//     if (rememberedUsername) {
//       setValue('username', rememberedUsername)
//       setValue('rememberMe', true)
//     }
//   }, [setValue])

//   const onSubmit = async (data: LoginForm) => {
//     try {
//       // Handle remember me
//       if (data.rememberMe) {
//         localStorage.setItem('rememberMe', data.username)
//       } else {
//         localStorage.removeItem('rememberMe')
//       }

//       const response = await signIn('credentials', {
//         username: data.username,
//         password: data.password,
//         redirect: false,
//       })

//       if (response?.error) {
//         setError('Invalid username or password')
//         return
//       }

//       if (response?.ok) {
//         router.push('/company-selection')
//       }
//     } catch (error) {
//       setError('An error occurred. Please try again.')
//     }
//   }

//   return (
//     <div className="w-full max-w-md space-y-8 p-8 rounded-lg border bg-card">
//       <div className="space-y-2 text-center">
//         <h1 className="text-2xl font-bold">Tax Management System</h1>
//         <p className="text-gray-500">Enter your credentials to continue</p>
//       </div>
      
//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//         <div className="space-y-2">
//           <label className="text-sm font-medium" htmlFor="username">
//             Username
//           </label>
//           <Input
//             id="username"
//             placeholder="Enter your username"
//             {...register('username')}
//           />
//           {errors.username && (
//             <p className="text-sm text-red-500">{errors.username.message}</p>
//           )}
//         </div>
        
//         <div className="space-y-2">
//           <label className="text-sm font-medium" htmlFor="password">
//             Password
//           </label>
//           <Input
//             id="password"
//             type="password"
//             placeholder="Enter your password"
//             {...register('password')}
//           />
//           {errors.password && (
//             <p className="text-sm text-red-500">{errors.password.message}</p>
//           )}
//         </div>

//         <div className="flex items-center space-x-2">
//           <input
//             type="checkbox"
//             id="rememberMe"
//             {...register('rememberMe')}
//             className="h-4 w-4 rounded border-gray-300"
//           />
//           <label
//             htmlFor="rememberMe"
//             className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
//           >
//             Remember me
//           </label>
//         </div>

//         {error && (
//           <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
//             {error}
//           </div>
//         )}

//         <Button
//           type="submit"
//           className="w-full"
//           disabled={isSubmitting}
//         >
//           {isSubmitting ? 'Signing in...' : 'Sign in'}
//         </Button>
//       </form>
//     </div>
//   )
// }
// components/auth/login-form.tsx
'use client';

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, User, Lock } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string>("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  const isLoading = form.formState.isSubmitting;

  async function onSubmit(data: FormValues) {
    try {
      // Handle remember me
      if (data.rememberMe) {
        localStorage.setItem('rememberMe', data.username);
      } else {
        localStorage.removeItem('rememberMe');
      }

      const res = await signIn("credentials", {
        username: data.username,
        password: data.password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid username or password");
        return;
      }

      router.push("/company-selection");
      router.refresh();
    } catch (error) {
      setError("An error occurred during login");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    type="password"
                    disabled={isLoading}
                    placeholder="Password"
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
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
          disabled={isLoading}
          className="w-full bg-white/10 hover:bg-white/20 text-white"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>
    </Form>
  );
}