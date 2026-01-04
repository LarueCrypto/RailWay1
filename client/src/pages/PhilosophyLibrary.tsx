import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Upload, FileText, Image, Trash2, Eye, EyeOff, 
  BookOpen, Sparkles, Loader2, FileUp, FolderOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useUpload } from "@/hooks/use-upload";
import type { PhilosophyDocument } from "@shared/schema";

const CATEGORIES = [
  { value: "personal", label: "Personal Values" },
  { value: "business", label: "Business Philosophy" },
  { value: "spiritual", label: "Spiritual/Religious" },
  { value: "productivity", label: "Productivity" },
  { value: "health", label: "Health & Wellness" },
  { value: "success", label: "Success Principles" },
  { value: "mindfulness", label: "Mindfulness" },
  { value: "finance", label: "Financial Wisdom" },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(fileType: string) {
  if (fileType === 'pdf') return FileText;
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileType)) return Image;
  return FileText;
}

function DocumentCard({ doc, onDelete, onToggleAi }: { 
  doc: PhilosophyDocument; 
  onDelete: (id: number) => void;
  onToggleAi: (id: number) => void;
}) {
  const FileIcon = getFileIcon(doc.fileType);
  const category = CATEGORIES.find(c => c.value === doc.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className={cn(
        "p-4 hover-elevate transition-all",
        !doc.useForAi && "opacity-60"
      )}>
        <div className="flex items-start gap-3">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
            doc.fileType === 'pdf' ? "bg-red-100 dark:bg-red-900/30" : "bg-blue-100 dark:bg-blue-900/30"
          )}>
            <FileIcon className={cn(
              "w-6 h-6",
              doc.fileType === 'pdf' ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"
            )} />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{doc.title}</h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                {category?.label || doc.category}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatFileSize(doc.fileSize)}
              </span>
              <span className="text-xs text-muted-foreground">
                {doc.fileType.toUpperCase()}
              </span>
            </div>
            
            {doc.isProcessed && doc.keyThemes && doc.keyThemes.length > 0 && (
              <div className="flex items-center gap-1 mt-2 flex-wrap">
                <Sparkles className="w-3 h-3 text-primary" />
                {doc.keyThemes.slice(0, 3).map((theme, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {theme}
                  </Badge>
                ))}
              </div>
            )}
            
            {!doc.isProcessed && (
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" />
                Processing...
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleAi(doc.id)}
              className={cn(
                "transition-colors",
                doc.useForAi ? "text-primary" : "text-muted-foreground"
              )}
              title={doc.useForAi ? "Included in AI context" : "Excluded from AI context"}
              data-testid={`button-toggle-ai-${doc.id}`}
            >
              {doc.useForAi ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive"
              onClick={() => onDelete(doc.id)}
              data-testid={`button-delete-doc-${doc.id}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export default function PhilosophyLibrary() {
  const { toast } = useToast();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docTitle, setDocTitle] = useState("");
  const [docCategory, setDocCategory] = useState("personal");
  
  const { uploadFile, isUploading, progress } = useUpload({
    onSuccess: (response) => {
      console.log("File uploaded to:", response.objectPath);
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { data: documents = [], isLoading } = useQuery<PhilosophyDocument[]>({
    queryKey: ["/api/philosophy-documents"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      fileName: string;
      fileType: string;
      fileSize: number;
      objectPath: string;
      category: string;
    }) => {
      const res = await apiRequest("POST", "/api/philosophy-documents", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/philosophy-documents"] });
      setUploadOpen(false);
      setSelectedFile(null);
      setDocTitle("");
      setDocCategory("personal");
      toast({
        title: "Document Uploaded",
        description: "Your philosophy document has been added to the library.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Save",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/philosophy-documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/philosophy-documents"] });
      toast({ title: "Document Deleted" });
    },
  });

  const toggleAiMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/philosophy-documents/${id}/toggle-ai`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/philosophy-documents"] });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const validTypes = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp'];
      
      if (!validTypes.includes(ext)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF or image file (JPG, PNG, GIF, WebP)",
          variant: "destructive",
        });
        return;
      }
      
      if (file.size > 999 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Maximum file size is 999MB",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
      if (!docTitle) {
        setDocTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !docTitle) return;
    
    const uploadResult = await uploadFile(selectedFile);
    if (!uploadResult) return;
    
    const ext = selectedFile.name.split('.').pop()?.toLowerCase() || '';
    
    createMutation.mutate({
      title: docTitle,
      fileName: selectedFile.name,
      fileType: ext,
      fileSize: selectedFile.size,
      objectPath: uploadResult.objectPath,
      category: docCategory,
    });
  };

  const activeCount = documents.filter(d => d.useForAi).length;
  const processedCount = documents.filter(d => d.isProcessed).length;

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-display font-bold luminescent flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-primary" />
              Philosophy Library
            </h1>
            <p className="text-muted-foreground mt-1">
              Upload your guiding documents to personalize AI recommendations
            </p>
          </div>
          
          <Button 
            size="lg" 
            className="rounded-xl shadow-lg shadow-primary/20"
            onClick={() => setUploadOpen(true)}
            data-testid="button-upload-document"
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload Document
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{documents.length}</p>
                <p className="text-sm text-muted-foreground">Documents</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeCount}</p>
                <p className="text-sm text-muted-foreground">Active for AI</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{processedCount}</p>
                <p className="text-sm text-muted-foreground">Processed</p>
              </div>
            </div>
          </Card>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : documents.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <FileUp className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-display font-bold text-lg mb-2">No Documents Yet</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Upload your philosophy documents, favorite books, personal values statements, 
              or any guiding texts to help personalize your AI recommendations.
            </p>
            <Button onClick={() => setUploadOpen(true)} data-testid="button-first-upload">
              <Upload className="w-4 h-4 mr-2" />
              Upload Your First Document
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {documents.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  onDelete={(id) => deleteMutation.mutate(id)}
                  onToggleAi={(id) => toggleAiMutation.mutate(id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Upload Document</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Document Title</Label>
                <Input
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g., Personal Values Statement"
                  className="rounded-xl"
                  data-testid="input-doc-title"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={docCategory} onValueChange={setDocCategory}>
                  <SelectTrigger className="rounded-xl" data-testid="select-doc-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>File (PDF or Image)</Label>
                <div className={cn(
                  "border-2 border-dashed rounded-xl p-6 text-center transition-colors",
                  selectedFile ? "border-primary bg-primary/5" : "border-muted-foreground/30"
                )}>
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileText className="w-8 h-8 text-primary" />
                      <div className="text-left">
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFile(null)}
                      >
                        Change
                      </Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                        onChange={handleFileSelect}
                        data-testid="input-file"
                      />
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-8 h-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          Click to browse or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PDF, JPG, PNG, GIF, WebP (max 999MB)
                        </p>
                      </div>
                    </label>
                  )}
                </div>
              </div>
              
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
              
              <Button
                className="w-full rounded-xl"
                onClick={handleUpload}
                disabled={!selectedFile || !docTitle || isUploading || createMutation.isPending}
                data-testid="button-submit-upload"
              >
                {isUploading || createMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isUploading ? "Uploading..." : "Saving..."}
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </>
                )}
              </Button>
              
              <p className="text-xs text-muted-foreground text-center">
                Your documents are stored securely and used only to personalize your AI recommendations.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
