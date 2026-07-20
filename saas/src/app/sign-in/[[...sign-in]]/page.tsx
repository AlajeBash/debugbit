"use client";

import { SignIn, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { dark } from "@clerk/themes";

export default function Page() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/dashboard");
    }
  }, [isSignedIn, isLoaded, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#030712] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 flex flex-col items-center">
        <div className="text-center mb-4">
          <h2 className="font-outfit text-3xl font-extrabold tracking-tight text-white">
            Debug<span className="text-[#a78bfa]">Bit</span>
          </h2>
          <p className="mt-2 text-sm text-[#9ca3af] font-sans">
            AI-Powered Developer Intelligence Gateway
          </p>
        </div>
        <SignIn 
          appearance={{
            baseTheme: dark,
            elements: {
              formButtonPrimary: 'bg-[#7c3aed] hover:bg-[#6d28d9] text-white border-none shadow-md shadow-[#7c3aed]/25',
              card: 'bg-[#0b0f19] border border-[#1f2937] text-white shadow-xl rounded-2xl',
              headerTitle: 'text-white font-bold',
              headerSubtitle: 'text-gray-200 font-medium',
              dividerText: 'text-gray-300 font-semibold',
              socialButtonsBlockButton: 'bg-[#111827] border border-[#1f2937] text-white hover:bg-[#1f2937]',
              formFieldLabel: 'text-[#d1d5db]',
              formFieldInput: 'bg-[#030712] border border-[#1f2937] text-white focus:border-[#7c3aed]',
              footerActionText: 'text-[#9ca3af]',
              footerActionLink: 'text-[#a78bfa] hover:text-[#c084fc]',
            }
          }}
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          afterSignInUrl="/dashboard"
          afterSignUpUrl="/dashboard"
        />
      </div>
    </div>
  );
}
