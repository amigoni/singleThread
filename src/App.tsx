import { useState, useEffect } from "react";
import { Id } from "@convex/_generated/dataModel";
import { Header } from "@/components/Header";
import { InputBar } from "@/components/InputBar";
import { NotesList } from "@/components/NotesList";
import { ConvexProvider, useQuery, useMutation, useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import { ConvexReactClient } from "convex/react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ThreadView } from "@/components/ThreadView";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

function AppContent() {
  const [threadView, setThreadView] = useState<Id<"notes"> | null>(null);

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
    <ConvexProvider client={convex}>
      <AppContent />
      <Toaster />
    </ConvexProvider>
  );
}
