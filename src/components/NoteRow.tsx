import { Id } from "@convex/_generated/dataModel";
import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Linkify from "linkify-react";
import { LinkPreview } from "./LinkPreview";

interface NoteRowProps {
  note: {
    _id: Id<"notes">;
    content: string;
    imageUrl?: string | null;
    updatedTime?: number;
    _creationTime: number;
    linkMetadata?: {
      url: string;
      title: string;
      description?: string;
      icon?: string;
      image?: string;
    };
  };
  onClick: (noteId: Id<"notes">) => void;
}

const linkifyOptions = {
  className: "text-blue-600 hover:text-blue-800 hover:underline",
  target: "_blank",
  rel: "noopener noreferrer",
  onClick: (e: React.MouseEvent) => e.stopPropagation(),
};

export const NoteRow = memo(function NoteRow({ note, onClick }: NoteRowProps) {
  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };

  // Remove URL from content if we have link metadata
  const displayContent = note.linkMetadata 
    ? note.content.replace(note.linkMetadata.url, '').trim()
    : note.content;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden w-full h-full"
          onClick={() => onClick(note._id)}
        >
          <CardContent className="p-4">
            <div className="flex gap-4 items-start w-full overflow-hidden">
              {note.imageUrl && (
                <Avatar className="w-16 h-16 rounded-lg">
                  <AvatarImage src={note.imageUrl} alt="Note attachment" className="object-cover" />
                  <AvatarFallback>IMG</AvatarFallback>
                </Avatar>
              )}
              <div className="flex-1 min-w-0 space-y-2">
                {displayContent && (
                  <div className="text-gray-800 break-words">
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
                    compact={true}
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </TooltipTrigger>
      <TooltipContent side="bottom" align="end" sideOffset={-20}>
        <p>{formatDate(note.updatedTime || note._creationTime)}</p>
      </TooltipContent>
    </Tooltip>
  );
}); 