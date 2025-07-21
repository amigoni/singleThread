import { useState, useEffect } from "react";
import { Id } from "@convex/_generated/dataModel";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Edit as EditIcon, Trash2 } from "lucide-react";
import Linkify from "linkify-react";
import { LinkPreview } from "./LinkPreview";

const linkifyOptions = {
  className: "text-blue-600 hover:text-blue-800 hover:underline",
  target: "_blank",
  rel: "noopener noreferrer",
};

interface Message {
  _id: Id<"messages">;
  content: string;
  type: "user" | "ai";
  threadId: Id<"threads">;
  createdTime: number;
}

interface ThreadViewProps {
  noteId: Id<"notes">;
  onClose?: () => void;
}

export function ThreadView({ noteId, onClose }: ThreadViewProps) {
  const [input, setInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const note = useQuery(api.notes.getNote, { noteId });
  const getOrCreateThread = useMutation(api.notes.getOrCreateThread);
  const sendMessage = useMutation(api.messages.sendMessage);
  const askAI = useAction(api.threads.askAI);
  const updateNote = useMutation(api.notes.update);
  const deleteNote = useMutation(api.notes.deleteNote);
  const [threadId, setThreadId] = useState<Id<"threads"> | null>(null);
  const messages = useQuery(api.messages.listMessages, 
    threadId ? { threadId } : "skip"
  ) || [];

  useEffect(() => {
    async function initThread() {
      const id = await getOrCreateThread({ noteId });
      setThreadId(id);
    }
    initThread();
  }, [noteId, getOrCreateThread]);

  useEffect(() => {
    if (note) {
      setEditContent(note.content);
    }
  }, [note]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !threadId) return;
    
    await sendMessage({ 
      threadId,
      content: input.trim(),
      type: "user",
    });
    setInput("");
  };

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !threadId) return;
    
    await askAI({ 
      threadId,
      noteId,
      question: input.trim(),
    });
    setInput("");
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;
    await updateNote({ 
      noteId,
      content: editContent.trim(),
      imageId: note?.imageId,
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await deleteNote({ noteId });
    onClose?.();
  };

  if (!note) return null;

  // Remove URL from content if we have link metadata
  const displayContent = note.linkMetadata 
    ? note.content.replace(note.linkMetadata.url, '').trim()
    : note.content;

  return (
    <div className="h-full flex flex-col">
      <SheetHeader className="px-6 py-4">
        <div className="flex items-center justify-between w-full">
          <SheetTitle>Note Details</SheetTitle>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
            >
              <EditIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SheetHeader>
      <Separator />

      {showDeleteConfirm && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <div className="text-sm text-red-800 mb-3">
            Are you sure you want to delete this note? This action cannot be undone.
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
            >
              Delete Note
            </Button>
          </div>
        </div>
      )}

      <Card className=" shadow-none border-none">
        <CardContent className="space-y-2">
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <>
              {note.imageUrl && (
                <img 
                  src={note.imageUrl} 
                  alt="Note attachment" 
                  className="mt-2 w-full max-h-60 object-contain rounded-lg"
                />
              )}
              {displayContent && (
                <div className="mt-2 break-words">
                  <Linkify options={linkifyOptions}>{displayContent}</Linkify>
                </div>
              )}
              
              {note.linkMetadata && (
                <LinkPreview
                  url={note.linkMetadata.url}
                  title={note.linkMetadata.title}
                  description={note.linkMetadata.description}
                  icon={note.linkMetadata.icon}
                  image={note.linkMetadata.image}
                  compact={false}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Separator />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message: Message) => (
          <Card key={message._id} className={message.type === "ai" ? "bg-blue-50 border-blue-100" : "bg-gray-50 border-gray-100"}>
            <CardContent className="pt-4">
              <div className="text-sm text-gray-500 mb-1">
                {message.type === "ai" ? "AI Assistant" : "You"}
              </div>
              <span className="break-words">
                <Linkify options={linkifyOptions}>{message.content}</Linkify>
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />

      <div className="p-4 space-y-2">
        <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="secondary"
              onClick={handleSendMessage}
              disabled={!input.trim()}
            >
              Add Message
            </Button>
            <Button
              onClick={handleAskAI}
              disabled={!input.trim()}
            >
              Ask AI
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 