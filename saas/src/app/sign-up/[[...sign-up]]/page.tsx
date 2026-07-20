import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function Page() {
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
        <SignUp 
          appearance={{
            baseTheme: dark,
            elements: {
              formButtonPrimary: 'bg-[#7c3aed] hover:bg-[#6d28d9] text-white border-none shadow-md shadow-[#7c3aed]/25',
              card: 'bg-[#0b0f19] border border-[#1f2937] text-white shadow-xl rounded-2xl',
              headerTitle: 'text-white font-bold',
              headerSubtitle: 'text-[#9ca3af]',
              socialButtonsBlockButton: 'bg-[#111827] border border-[#1f2937] text-white hover:bg-[#1f2937]',
              formFieldLabel: 'text-[#d1d5db]',
              formFieldInput: 'bg-[#030712] border border-[#1f2937] text-white focus:border-[#7c3aed]',
              footerActionText: 'text-[#9ca3af]',
              footerActionLink: 'text-[#a78bfa] hover:text-[#c084fc]',
            }
          }}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          afterSignInUrl="/dashboard"
          afterSignUpUrl="/dashboard"
        />
      </div>
    </div>
  );
}
