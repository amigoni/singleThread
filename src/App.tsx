import { useState, useEffect } from "react";
import { Id } from "@convex/_generated/dataModel";
import { Header } from "@/components/Header";
import { InputBar } from "@/components/InputBar";
import { NotesList } from "@/components/NotesList";
import { useQuery, useMutation, useAction, useConvexAuth } from "convex/react";
import { api } from "@convex/_generated/api";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ThreadView } from "@/components/ThreadView";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SignInForm } from "./SignInForm";
import { useToast } from "@/hooks/use-toast";

function AppContent() {
  const [threadView, setThreadView] = useState<Id<"notes"> | null>(null);
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { toast } = useToast();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show sign-in form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to SingleThread</h1>
              <p className="text-gray-600">Please sign in to access your notes</p>
            </div>
            <SignInForm />
          </div>
        </div>
      </div>
    );
  }

  // Show main app content when authenticated
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50 overflow-hidden flex flex-col">
        <Header />
        
        <main className="flex-1 w-full overflow-hidden pt-[72px] pb-[88px] px-4">
          <div className="max-w-2xl mx-auto h-full">
            <NotesList onNoteClick={setThreadView} />
          </div>
        </main>

        <InputBar />

        {/* Thread View */}
        <Sheet open={threadView !== null} onOpenChange={(open) => !open && setThreadView(null)}>
          <SheetContent side="right" className="w-full md:w-[400px] p-0 bg-white border-l shadow-lg">
            {threadView && (
              <ThreadView 
                noteId={threadView} 
                onClose={() => setThreadView(null)}
              />
            )}
          </SheetContent>
        </Sheet>
      </div>
    </TooltipProvider>
  );
}

export default function App() {
  return (
    <>
      <AppContent />
      <Toaster />
    </>
  );
}
