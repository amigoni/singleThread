import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useEffect, useRef } from "react";
import { useVirtualizer, VirtualItem } from "@tanstack/react-virtual";
import { NoteRow } from "./NoteRow";

interface NotesListProps {
  onNoteClick: (noteId: Id<"notes">) => void;
}

export function NotesList({ onNoteClick }: NotesListProps) {
  const notes = useQuery(api.notes.list) || [];
  const parentRef = useRef<HTMLDivElement>(null);
  const reversedNotes = [...notes].reverse();
  const isInitialMount = useRef(true);

  const virtualizer = useVirtualizer({
    count: reversedNotes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 116, // 100px for content + 16px for margin
    overscan: 5,
    paddingStart: 20,
    paddingEnd: 20,
  });

  // Scroll to bottom on initial load
  useEffect(() => {
    if (!notes.length) return;

    if (isInitialMount.current) {
      requestAnimationFrame(() => {
        if (parentRef.current) {
          const scrollOffset = virtualizer.getTotalSize() - parentRef.current.clientHeight;
          parentRef.current.scrollTop = scrollOffset;
          isInitialMount.current = false;
        }
      });
    }
  }, [notes, virtualizer]);

  return (
    <div 
      ref={parentRef}
      className="flex-1 overflow-y-auto"
      style={{ 
        height: 'calc(100vh - 160px)',
        paddingLeft: '1px',  // Prevent potential edge cutoff
        paddingRight: '1px'
      }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow: VirtualItem) => {
          const note = reversedNotes[virtualRow.index];
          return (
            <div
              key={note._id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                padding: '8px 0',
              }}
            >
              <NoteRow 
                note={note}
                onClick={onNoteClick}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
} 