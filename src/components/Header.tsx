import { SignOutButton } from "../SignOutButton";
import { Separator } from "@/components/ui/separator";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white w-full z-50">
      <div className="max-w-2xl mx-auto flex justify-between items-center p-4">
        <h2 className="text-xl font-semibold text-gray-800">Smart Notes</h2>
        <SignOutButton />
      </div>
      <Separator />
    </header>
  );
} 