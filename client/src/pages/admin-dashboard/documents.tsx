import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Document, User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { FileText, Search, Trash2, Download, FileImage, FileArchive, File } from "lucide-react";
import { format } from "date-fns";

function FileIcon({ type }: { type: string }) {
  if (type.startsWith("image/")) return <FileImage className="h-5 w-5 text-blue-500" />;
  if (type === "application/pdf") return <FileText className="h-5 w-5 text-red-500" />;
  if (type.includes("zip") || type.includes("rar")) return <FileArchive className="h-5 w-5 text-yellow-500" />;
  return <File className="h-5 w-5 text-muted-foreground" />;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminDocuments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [deleteDoc, setDeleteDoc] = useState<Document | null>(null);

  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ["/api/admin/documents"],
  });
  const { data: allUsers = [] } = useQuery<User[]>({
    queryKey: ["/api/users?role=student"],
  });
  const { data: tutors = [] } = useQuery<User[]>({
    queryKey: ["/api/users?role=tutor"],
  });

  const userMap = [...allUsers, ...tutors].reduce<Record<number, User>>((acc, u) => {
    acc[u.id] = u;
    return acc;
  }, {});

  const filtered = documents.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (userMap[d.uploaderId]?.fullName ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/documents"] });
      toast({ title: "Document deleted" });
      setDeleteDoc(null);
    },
    onError: (err: Error) => toast({ title: "Delete failed", description: err.message, variant: "destructive" }),
  });

  const totalSize = documents.reduce((acc, d) => acc + d.size, 0);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Management</h1>
          <p className="text-muted-foreground mt-1">View and manage all uploaded files across the platform</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center text-lg font-bold">
                {documents.length}
              </div>
              <span className="text-sm font-medium text-muted-foreground">Total Files</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">{formatBytes(totalSize)}</p>
                <p className="text-xs text-muted-foreground">Total storage used</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center text-lg font-bold">
                {documents.filter(d => d.sharedWithId).length}
              </div>
              <span className="text-sm font-medium text-muted-foreground">Shared Files</span>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Documents</CardTitle>
            <CardDescription>{filtered.length} file{filtered.length !== 1 ? "s" : ""}</CardDescription>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by filename or uploader..." value={search}
                onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">Loading documents...</p>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  {search ? "No documents match your search" : "No documents uploaded yet"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map(doc => {
                  const uploader = userMap[doc.uploaderId];
                  const sharedWith = doc.sharedWithId ? userMap[doc.sharedWithId] : null;
                  return (
                    <div key={doc.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="flex-shrink-0"><FileIcon type={doc.type} /></div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{doc.name}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                            <span>{formatBytes(doc.size)}</span>
                            <span>·</span>
                            <span>Uploaded {format(new Date(doc.uploadTime), "MMM d, yyyy")}</span>
                            {uploader && <><span>·</span><span>by {uploader.fullName}</span></>}
                          </div>
                          {sharedWith && (
                            <p className="text-xs text-blue-600 mt-0.5">
                              Shared with {sharedWith.fullName}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          asChild>
                          <a href={doc.url} target="_blank" rel="noreferrer" download>
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button variant="ghost" size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteDoc(doc)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!deleteDoc} onOpenChange={() => setDeleteDoc(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Permanently delete <strong>{deleteDoc?.name}</strong>? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDoc(null)}>Cancel</Button>
            <Button variant="destructive" disabled={deleteMutation.isPending}
              onClick={() => deleteDoc && deleteMutation.mutate(deleteDoc.id)}>
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
