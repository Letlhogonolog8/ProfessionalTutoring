import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Document, User } from "@shared/schema";
import { Download, FileText, File, FileImage, Film, Music, Archive, Trash2, Share, ExternalLink, Users } from "lucide-react";
import { format } from "date-fns";

export default function TutorDocuments() {
  const { user } = useAuth();
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<Document | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareWithStudentId, setShareWithStudentId] = useState<string>("all");

  // Fetch documents
  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  // Fetch students
  const { data: students = [], isLoading: studentsLoading } = useQuery<User[]>({
    queryKey: ["/api/users?role=student"],
  });

  const { data: sessions = [] } = useQuery<any[]>({
    queryKey: ["/api/sessions"],
  });

  // Delete document mutation
  const deleteDocument = useMutation({
    mutationFn: async (documentId: number) => {
      await apiRequest("DELETE", `/api/documents/${documentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      setShowDeleteDialog(false);
    },
  });

  const shareDocument = useMutation({
    mutationFn: async ({ documentId, sharedWithId }: { documentId: number; sharedWithId: number | null }) => {
      const res = await apiRequest("PUT", `/api/documents/${documentId}`, { sharedWithId });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      setShowShareDialog(false);
      setSelectedFile(null);
    },
  });

  // Filter documents
  const myDocuments = documents.filter(doc => doc.uploaderId === user?.id);
  const sharedWithMe = documents.filter(doc => 
    doc.uploaderId !== user?.id && 
    (doc.sharedWithId === user?.id || doc.sharedWithId === null)
  );
  // Allow sharing with all registered students, not just session-linked ones
  const tutorStudents = students;

  // Handle file upload completion
  const handleFileUploaded = (fileData: any) => {
    setShowUploadDialog(false);
  };

  // Handle document deletion
  const handleDeleteDocument = (document: Document) => {
    setSelectedFile(document);
    setShowDeleteDialog(true);
  };

  const confirmDeleteDocument = () => {
    if (selectedFile) {
      deleteDocument.mutate(selectedFile.id);
    }
  };

  // Handle document sharing
  const handleShareDocument = (document: Document) => {
    setSelectedFile(document);
    setShareWithStudentId("all");
    setShowShareDialog(true);
  };

  // Get file icon based on file type
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <FileImage className="h-6 w-6" />;
    if (fileType.startsWith('video/')) return <Film className="h-6 w-6" />;
    if (fileType.startsWith('audio/')) return <Music className="h-6 w-6" />;
    if (fileType.includes('pdf')) return <FileText className="h-6 w-6" />;
    if (fileType.includes('zip') || fileType.includes('rar')) return <Archive className="h-6 w-6" />;
    return <File className="h-6 w-6" />;
  };

  // Format file size
  const formatFileSize = (sizeInBytes: number) => {
    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(2)} KB`;
    return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Get uploader name
  const getUploaderName = (uploaderId: number) => {
    if (uploaderId === user?.id) return "You";
    const student = students.find(s => s.id === uploaderId);
    return student?.fullName || "Unknown User";
  };

  // Get share status
  const getShareStatus = (document: Document) => {
    if (document.sharedWithId === null) return "Shared with all students";
    if (document.sharedWithId) {
      const student = students.find(s => s.id === document.sharedWithId);
      return `Shared with ${student?.fullName || 'Unknown Student'}`;
    }
    return "Not shared";
  };

  // Render document card
  const renderDocumentCard = (document: Document) => {
    const isOwner = document.uploaderId === user?.id;
    const uploaderName = getUploaderName(document.uploaderId);
    const shareStatus = getShareStatus(document);
    
    return (
      <Card key={document.id} className="mb-4">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                {getFileIcon(document.type)}
              </div>
              <div>
                <h3 className="font-medium">{document.name}</h3>
                <div className="flex items-center mt-1 text-xs text-muted-foreground">
                  <span className="mr-2">
                    {formatFileSize(document.size)}
                  </span>
                  <span className="mr-2">•</span>
                  <span>
                    Uploaded {format(new Date(document.uploadTime), "MMM d, yyyy")}
                  </span>
                  <span className="mx-2">•</span>
                  <span>
                    By {uploaderName}
                  </span>
                </div>
                {isOwner && document.sharedWithId !== undefined && (
                  <div className="flex items-center mt-2 text-xs">
                    <Users className="h-3 w-3 mr-1 text-muted-foreground" />
                    <span className="text-muted-foreground">{shareStatus}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" size="icon" asChild>
                <a href={document.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              {isOwner && (
                <>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleShareDocument(document)}
                  >
                    <Share className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="text-destructive"
                    onClick={() => handleDeleteDocument(document)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground mt-2">
            Manage and share educational resources with your students
          </p>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm text-muted-foreground">
              Total files: {documents.length}
            </span>
          </div>
          <Button 
            onClick={() => setShowUploadDialog(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90"
          >
            Upload New Document
          </Button>
        </div>

        <Tabs defaultValue="my-documents">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-documents">
              My Documents ({myDocuments.length})
            </TabsTrigger>
            <TabsTrigger value="shared-with-me">
              Shared with Me ({sharedWithMe.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-documents" className="mt-6">
            {isLoading ? (
              <div className="text-center py-12">Loading documents...</div>
            ) : myDocuments.length > 0 ? (
              <div>
                {myDocuments.map(renderDocumentCard)}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  You haven't uploaded any documents yet
                </div>
                <Button 
                  onClick={() => setShowUploadDialog(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90"
                >
                  Upload Document
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="shared-with-me" className="mt-6">
            {isLoading ? (
              <div className="text-center py-12">Loading documents...</div>
            ) : sharedWithMe.length > 0 ? (
              <div>
                {sharedWithMe.map(renderDocumentCard)}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No documents have been shared with you yet
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Document Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle>Document Sharing Guidelines</CardTitle>
            <CardDescription>
              Best practices for sharing educational resources with students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Resource Types</h3>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Research methodology guides and templates</li>
                  <li>Sample papers with proper citation formats</li>
                  <li>Data analysis examples and code snippets</li>
                  <li>Tutorial videos on specific research techniques</li>
                  <li>Academic journal articles and literature reviews</li>
                </ul>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Sharing Best Practices</h3>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Ensure all shared documents respect copyright and academic integrity standards</li>
                  <li>Provide clear context when sharing resources with students</li>
                  <li>Consider student-specific needs when sharing targeted materials</li>
                  <li>Use descriptive file names to make resources easily searchable</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a document to share with your students
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <FileUpload 
              acceptedTypes="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,image/*,video/*"
              maxSizeMB={20}
              onFileUploaded={handleFileUploaded}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedFile && (
            <div className="py-4 flex items-center space-x-4">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                {getFileIcon(selectedFile.type)}
              </div>
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(selectedFile.size)} • Uploaded {format(new Date(selectedFile.uploadTime), "MMM d, yyyy")}
                </p>
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteDocument}
              disabled={deleteDocument.isPending}
            >
              {deleteDocument.isPending ? "Deleting..." : "Delete Document"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Document</DialogTitle>
            <DialogDescription>
              Choose who you want to share this document with
            </DialogDescription>
          </DialogHeader>
          
          {selectedFile && (
            <div className="py-4">
              <div className="flex items-center space-x-4 mb-4">
                <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                  {getFileIcon(selectedFile.type)}
                </div>
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Share with:</label>
                  <Select value={shareWithStudentId} onValueChange={setShareWithStudentId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select who to share with" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Students</SelectItem>
                      {tutorStudents.map(student => (
                        <SelectItem key={student.id} value={student.id.toString()}>
                          {student.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowShareDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90"
                    onClick={() => {
                      if (!selectedFile) return;
                      shareDocument.mutate({
                        documentId: selectedFile.id,
                        sharedWithId: shareWithStudentId === "all" ? null : parseInt(shareWithStudentId, 10),
                      });
                    }}
                    disabled={shareDocument.isPending}
                  >
                    {shareDocument.isPending ? "Sharing..." : "Share Document"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
