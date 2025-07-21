import { useRef, useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, X, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function InputBar() {
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [detectedUrl, setDetectedUrl] = useState<string | null>(null);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const addNote = useMutation(api.notes.add);
  const generateUploadUrl = useMutation(api.notes.generateUploadUrl);

  // Detect URLs in input
  useEffect(() => {
    const urlMatch = input.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
      setDetectedUrl(urlMatch[0]);
    } else {
      setDetectedUrl(null);
    }
  }, [input]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !selectedImage) return;
    
    let imageId = undefined;
    if (selectedImage) {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": selectedImage.type },
        body: selectedImage,
      });
      
      if (!result.ok) {
        throw new Error(`Upload failed: ${await result.text()}`);
      }
      
      const { storageId } = await result.json();
      imageId = storageId;
    }
    
    await addNote({ 
      content: input.trim(),
      imageId,
    });
    setInput("");
    setSelectedImage(null);
    setDetectedUrl(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-sm p-4 w-full z-40">
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-3 w-full">
          {selectedImage && (
            <div className="relative w-full">
              <img
                src={URL.createObjectURL(selectedImage)}
                alt="Preview"
                className="w-full max-h-32 object-contain rounded-lg"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  setSelectedImage(null);
                  if (imageInputRef.current) {
                    imageInputRef.current.value = "";
                  }
                }}
                className="absolute top-2 right-2 h-8 w-8 bg-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {detectedUrl && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-sm bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <ExternalLink className="h-3 w-3 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm">
                      Link detected: {getDomainFromUrl(detectedUrl)}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Link preview will be available after saving
                    </div>
                    <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" />
                      {detectedUrl}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="flex gap-2 w-full">
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Add a note..."
              className="flex-1 min-w-0"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="flex-shrink-0"
              onClick={() => imageInputRef.current?.click()}
            >
              <Paperclip className="h-4 w-4" />
              <input
                type="file"
                ref={imageInputRef}
                accept="image/*"
                onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                className="hidden"
              />
            </Button>
            <Button
              type="submit"
              disabled={!input.trim() && !selectedImage}
              className="flex-shrink-0"
            >
              Add
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 