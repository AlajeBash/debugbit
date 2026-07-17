import { SignIn } from "@clerk/nextjs";

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
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-[#7c3aed] hover:bg-[#6d28d9] text-white',
              card: 'bg-[#0b0f19] border border-[#1f2937] text-white shadow-xl rounded-2xl',
              headerTitle: 'text-white',
              headerSubtitle: 'text-[#9ca3af]',
              socialButtonsBlockButton: 'bg-[#111827] border border-[#1f2937] text-white hover:bg-[#1f2937]',
              formFieldLabel: 'text-[#d1d5db]',
              formFieldInput: 'bg-[#030712] border border-[#1f2937] text-white',
              footerActionText: 'text-[#9ca3af]',
              footerActionLink: 'text-[#a78bfa] hover:text-[#c084fc]',
            }
          }}
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
        />
      </div>
    </div>
  );
}
