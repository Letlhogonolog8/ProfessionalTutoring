import { useState, useRef } from "react";
import { UploadCloud, X, File, FileText, FileImage, Film, Music, Archive, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

interface FileUploadProps {
  acceptedTypes?: string;
  maxSizeMB?: number;
  onFileUploaded?: (fileData: any) => void;
  sharedWithId?: number | null;
}

export function FileUpload({ 
  acceptedTypes = "*", 
  maxSizeMB = 10,
  onFileUploaded,
  sharedWithId = null
}: FileUploadProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <FileImage className="h-6 w-6" />;
    if (fileType.startsWith('video/')) return <Film className="h-6 w-6" />;
    if (fileType.startsWith('audio/')) return <Music className="h-6 w-6" />;
    if (fileType.includes('pdf')) return <FileText className="h-6 w-6" />;
    if (fileType.includes('zip') || fileType.includes('rar')) return <Archive className="h-6 w-6" />;
    return <File className="h-6 w-6" />;
  };
  
  const upload = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const xhr = new XMLHttpRequest();
      await new Promise<void>((resolve, reject) => {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 90));
        };
        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(xhr.responseText)));
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.open("POST", "/api/upload");
        xhr.withCredentials = true;
        xhr.send(formData);
      });

      const uploadResult = JSON.parse(xhr.responseText) as { url: string; name: string; type: string; size: number };
      setUploadProgress(95);

      const docData = {
        name: uploadResult.name,
        url: uploadResult.url,
        uploaderId: user!.id,
        sharedWithId: sharedWithId,
        type: uploadResult.type,
        size: uploadResult.size,
      };

      const res = await apiRequest("POST", "/api/documents", docData);
      setUploadProgress(100);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "File uploaded successfully",
        description: `${file?.name} has been uploaded.`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      
      if (onFileUploaded) {
        onFileUploaded(data);
      }
      
      // Reset state
      setFile(null);
      setUploadProgress(0);
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
      setUploadProgress(0);
    }
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    validateAndSetFile(selectedFile);
  };
  
  const validateAndSetFile = (selectedFile?: File | null) => {
    if (!selectedFile) return;
    
    // Check file size
    if (selectedFile.size > maxSizeBytes) {
      toast({
        title: "File too large",
        description: `Maximum file size is ${maxSizeMB}MB.`,
        variant: "destructive",
      });
      return;
    }
    
    // Check file type if acceptedTypes is not "*"
    if (acceptedTypes !== "*") {
      const fileTypeOk = acceptedTypes.split(',').some(type => {
        if (type.includes('*')) {
          // Handle wildcard types like "image/*"
          const typeCategory = type.split('/')[0];
          return selectedFile.type.startsWith(typeCategory);
        }
        return selectedFile.type === type;
      });
      
      if (!fileTypeOk) {
        toast({
          title: "Invalid file type",
          description: `Accepted file types: ${acceptedTypes}`,
          variant: "destructive",
        });
        return;
      }
    }
    
    setFile(selectedFile);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const selectedFile = e.dataTransfer.files[0];
    validateAndSetFile(selectedFile);
  };
  
  const handleUpload = () => {
    if (!file) return;
    upload.mutate(file);
  };
  
  const handleCancel = () => {
    setFile(null);
    setUploadProgress(0);
  };
  
  const promptFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        onChange={handleFileChange}
        className="hidden"
      />
      
      {!file ? (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragging 
              ? "border-primary bg-primary/5" 
              : "border-muted-foreground/25 hover:border-primary/50"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={promptFileSelect}
        >
          <UploadCloud className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-1">Upload a file</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Drag and drop or click to select
          </p>
          <p className="text-xs text-muted-foreground">
            Max size: {maxSizeMB}MB
            {acceptedTypes !== "*" && ` • Accepted: ${acceptedTypes}`}
          </p>
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              {getFileIcon(file.type)}
              <div className="ml-3">
                <p className="font-medium truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type || "Unknown type"}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleCancel}
              disabled={upload.isPending}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {uploadProgress > 0 && uploadProgress < 100 ? (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-muted-foreground text-right">{uploadProgress}%</p>
            </div>
          ) : (
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCancel}
                disabled={upload.isPending}
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleUpload}
                disabled={upload.isPending}
                className="bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90"
              >
                {upload.isPending ? "Uploading..." : "Upload"}
              </Button>
            </div>
          )}
        </div>
      )}
      
      {upload.isError && (
        <div className="mt-2 flex items-center text-destructive text-sm">
          <AlertCircle className="h-4 w-4 mr-1" />
          <span>Upload failed. Please try again.</span>
        </div>
      )}
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
