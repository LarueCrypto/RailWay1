import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Pin, Trash2, Search, FileText, Lightbulb, Target, Calendar, X, Edit2, Sparkles, ListChecks, FileStack, Loader2, Check, User, Briefcase, Heart, BookOpen, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import type { Note } from "@shared/schema";

const categories = [
  { value: "personal", label: "Personal", icon: User },
  { value: "work", label: "Work", icon: Briefcase },
  { value: "health", label: "Health", icon: Heart },
  { value: "goals", label: "Goals", icon: Target },
  { value: "ideas", label: "Ideas", icon: Lightbulb },
  { value: "learning", label: "Learning", icon: BookOpen },
];

const colorOptions = [
  { value: "default", label: "Default", class: "bg-card" },
  { value: "yellow", label: "Yellow", class: "bg-yellow-100 dark:bg-yellow-900/30" },
  { value: "green", label: "Green", class: "bg-green-100 dark:bg-green-900/30" },
  { value: "blue", label: "Blue", class: "bg-blue-100 dark:bg-blue-900/30" },
  { value: "purple", label: "Purple", class: "bg-purple-100 dark:bg-purple-900/30" },
];

function NoteCard({ note, onEdit, onDelete, onTogglePin, onView, isSelected, onToggleSelect, selectionMode }: { 
  note: Note; 
  onEdit: (note: Note) => void;
  onDelete: (id: number) => void;
  onTogglePin: (id: number, pinned: boolean) => void;
  onView: (note: Note) => void;
  isSelected?: boolean;
  onToggleSelect?: (id: number) => void;
  selectionMode?: boolean;
}) {
  const colorClass = colorOptions.find(c => c.value === note.color)?.class || "bg-card";
  const CategoryIcon = categories.find(c => c.value === note.category)?.icon || FileText;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <Card 
        className={cn(
          "p-4 h-full flex flex-col gap-3 transition-all duration-200 hover:shadow-md cursor-pointer",
          colorClass,
          note.pinned && "ring-2 ring-primary/30",
          isSelected && "ring-2 ring-primary"
        )}
        onClick={() => selectionMode ? onToggleSelect?.(note.id) : onView(note)}
        data-testid={`card-note-${note.id}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {selectionMode && (
              <Checkbox 
                checked={isSelected} 
                onCheckedChange={() => onToggleSelect?.(note.id)}
                onClick={(e) => e.stopPropagation()}
                data-testid={`checkbox-select-note-${note.id}`}
              />
            )}
            <CategoryIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <h3 className="font-semibold text-sm truncate">{note.title}</h3>
          </div>
          {!selectionMode && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => { e.stopPropagation(); onTogglePin(note.id, !note.pinned); }}
                className={cn("w-7 h-7", note.pinned && "text-primary")}
                data-testid={`button-pin-note-${note.id}`}
              >
                <Pin className="w-3.5 h-3.5" fill={note.pinned ? "currentColor" : "none"} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => { e.stopPropagation(); onEdit(note); }}
                className="w-7 h-7"
                data-testid={`button-edit-note-${note.id}`}
              >
                <Edit2 className="w-3.5 h-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
                className="w-7 h-7 text-muted-foreground hover:text-destructive"
                data-testid={`button-delete-note-${note.id}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-3 flex-1 whitespace-pre-wrap">
          {note.content || "No content..."}
        </p>
        
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {note.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs py-0 px-1.5">
                {tag}
              </Badge>
            ))}
            {note.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">+{note.tags.length - 3}</span>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
          <Badge variant="secondary" className="text-xs">
            {categories.find(c => c.value === note.category)?.label || note.category || "Personal"}
          </Badge>
          <span>
            {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : ""}
          </span>
        </div>
        
        {note.aiSummary && (
          <div className="mt-2 pt-2 border-t border-border/50">
            <div className="flex items-center gap-1 text-xs text-primary mb-1">
              <Sparkles className="w-3 h-3" />
              <span>AI Summary</span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 break-words overflow-hidden">{note.aiSummary}</p>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

export default function Notes() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<Set<number>>(new Set());
  const [analysisDialogOpen, setAnalysisDialogOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{ action: string; result: string } | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "personal",
    color: "default",
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState("");

  const { data: notes = [], isLoading } = useQuery<Note[]>({
    queryKey: ["/api/notes"],
  });

  const [noteAiResult, setNoteAiResult] = useState<string | null>(null);
  const [noteAiAction, setNoteAiAction] = useState<string | null>(null);

  const analyzeMutation = useMutation({
    mutationFn: async ({ noteIds, action }: { noteIds: number[]; action: string }) => {
      const res = await apiRequest("POST", "/api/notes/analyze", { noteIds, action });
      return res as unknown as { action: string; result: string; notesAnalyzed: number };
    },
    onSuccess: (data) => {
      setAnalysisResult({ action: data.action, result: data.result });
      setAnalysisDialogOpen(true);
    },
  });

  const singleNoteAiMutation = useMutation({
    mutationFn: async ({ noteId, action }: { noteId: number; action: 'summarize' | 'organize' }) => {
      const res = await apiRequest("POST", `/api/notes/${noteId}/${action}`);
      return res as unknown as { noteId: number; action: string; result: string };
    },
    onSuccess: (data) => {
      setNoteAiResult(data.result);
      setNoteAiAction(data.action);
      if (data.action === 'summarize') {
        queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      }
    },
  });

  const organizeAllMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/notes/organize-all");
      return res as unknown as { action: string; result: string; notesCount: number; updatedCount?: number };
    },
    onSuccess: (data) => {
      setAnalysisResult({ action: data.action, result: data.result });
      setAnalysisDialogOpen(true);
      if (data.updatedCount && data.updatedCount > 0) {
        queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      }
    },
  });

  const handleToggleSelect = (id: number) => {
    const newSet = new Set(selectedNotes);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedNotes(newSet);
  };

  const handleSelectAll = () => {
    if (selectedNotes.size === filteredNotes.length) {
      setSelectedNotes(new Set());
    } else {
      setSelectedNotes(new Set(filteredNotes.map(n => n.id)));
    }
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedNotes(new Set());
  };

  const handleAnalyze = (action: 'summarize' | 'organize' | 'actionize') => {
    if (selectedNotes.size === 0) return;
    analyzeMutation.mutate({ noteIds: Array.from(selectedNotes), action });
  };

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => apiRequest("POST", "/api/notes", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: number } & typeof formData) => 
      apiRequest("PUT", `/api/notes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/notes/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/notes"] }),
  });

  const resetForm = () => {
    setFormData({ title: "", content: "", category: "personal", color: "default", tags: [] });
    setTagInput("");
    setEditingNote(null);
    setIsDialogOpen(false);
    setNoteAiResult(null);
    setNoteAiAction(null);
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content || "",
      category: note.category || "personal",
      color: note.color || "default",
      tags: note.tags || [],
    });
    setTagInput("");
    setNoteAiResult(null);
    setNoteAiAction(null);
    setIsDialogOpen(true);
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tagToRemove) });
  };

  const handleApplyAiResult = () => {
    if (noteAiResult && noteAiAction === 'organize') {
      setFormData({ ...formData, content: noteAiResult });
      setNoteAiResult(null);
      setNoteAiAction(null);
    } else if (noteAiResult && noteAiAction === 'summarize') {
      const newContent = formData.content + "\n\n---\n**AI Summary:**\n" + noteAiResult;
      setFormData({ ...formData, content: newContent });
      setNoteAiResult(null);
      setNoteAiAction(null);
    }
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) return;
    
    if (editingNote) {
      updateMutation.mutate({ id: editingNote.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleTogglePin = (id: number, pinned: boolean) => {
    apiRequest("PUT", `/api/notes/${id}`, { pinned })
      .then(() => queryClient.invalidateQueries({ queryKey: ["/api/notes"] }));
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (note.content || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || note.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const pinnedNotes = filteredNotes.filter(n => n.pinned);
  const unpinnedNotes = filteredNotes.filter(n => !n.pinned);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">Notes</h1>
            <p className="text-muted-foreground mt-1">Capture ideas, plans, and reflections</p>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {selectionMode ? (
              <>
                <Button variant="outline" size="sm" onClick={handleSelectAll} data-testid="button-select-all">
                  {selectedNotes.size === filteredNotes.length ? <X className="w-4 h-4 mr-1" /> : <Check className="w-4 h-4 mr-1" />}
                  {selectedNotes.size === filteredNotes.length ? "Deselect All" : "Select All"}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleAnalyze('summarize')}
                  disabled={selectedNotes.size === 0 || analyzeMutation.isPending}
                  data-testid="button-summarize"
                >
                  {analyzeMutation.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <FileStack className="w-4 h-4 mr-1" />}
                  Summarize
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleAnalyze('organize')}
                  disabled={selectedNotes.size === 0 || analyzeMutation.isPending}
                  data-testid="button-organize"
                >
                  {analyzeMutation.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <ListChecks className="w-4 h-4 mr-1" />}
                  Organize
                </Button>
                <Button 
                  size="sm"
                  onClick={() => handleAnalyze('actionize')}
                  disabled={selectedNotes.size === 0 || analyzeMutation.isPending}
                  data-testid="button-actionize"
                >
                  {analyzeMutation.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Sparkles className="w-4 h-4 mr-1" />}
                  Create Action Plan
                </Button>
                <Button variant="ghost" size="sm" onClick={exitSelectionMode}>
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => organizeAllMutation.mutate()} 
                  disabled={notes.length === 0 || organizeAllMutation.isPending}
                  data-testid="button-organize-all"
                >
                  {organizeAllMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ListChecks className="w-4 h-4 mr-2" />}
                  Organize All
                </Button>
                <Button variant="outline" onClick={() => setSelectionMode(true)} disabled={notes.length === 0} data-testid="button-ai-analyze">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Analyze
                </Button>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) resetForm();
                }}>
                  <DialogTrigger asChild>
                    <Button className="gap-2" data-testid="button-add-note">
                      <Plus className="w-4 h-4" />
                      New Note
                    </Button>
                  </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingNote ? "Edit Note" : "Create New Note"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <Input
                  placeholder="Note title..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  data-testid="input-note-title"
                />
                <Textarea
                  placeholder="Write your thoughts..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  data-testid="input-note-content"
                />
                
                {/* AI Actions for existing notes */}
                {editingNote && formData.content.trim().length >= 10 && (
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setNoteAiAction('summarize');
                        singleNoteAiMutation.mutate({ noteId: editingNote.id, action: 'summarize' });
                      }}
                      disabled={singleNoteAiMutation.isPending}
                      data-testid="button-note-summarize"
                    >
                      {singleNoteAiMutation.isPending && noteAiAction === 'summarize' ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <FileStack className="w-4 h-4 mr-1" />
                      )}
                      AI Summarize
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setNoteAiAction('organize');
                        singleNoteAiMutation.mutate({ noteId: editingNote.id, action: 'organize' });
                      }}
                      disabled={singleNoteAiMutation.isPending}
                      data-testid="button-note-organize"
                    >
                      {singleNoteAiMutation.isPending && noteAiAction === 'organize' ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <ListChecks className="w-4 h-4 mr-1" />
                      )}
                      AI Organize
                    </Button>
                  </div>
                )}

                {/* AI Result Display */}
                {noteAiResult && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-2" data-testid="panel-note-ai-result">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs" data-testid="badge-ai-action-type">
                        <Sparkles className="w-3 h-3 mr-1" />
                        {noteAiAction === 'summarize' ? 'AI Summary' : 'AI Organized'}
                      </Badge>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setNoteAiResult(null)} data-testid="button-dismiss-ai-result">
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <ScrollArea className="max-h-32">
                      <p className="text-sm whitespace-pre-wrap" data-testid="text-note-ai-result">{noteAiResult}</p>
                    </ScrollArea>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleApplyAiResult} data-testid="button-apply-ai-result">
                        <Check className="w-3 h-3 mr-1" />
                        {noteAiAction === 'organize' ? 'Replace Content' : 'Append to Note'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(noteAiResult)} data-testid="button-copy-ai-result">
                        Copy
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    Tags / Context
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      className="flex-1"
                      data-testid="input-note-tag"
                    />
                    <Button type="button" variant="outline" size="icon" onClick={handleAddTag} data-testid="button-add-tag">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {formData.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="gap-1 text-xs">
                          {tag}
                          <button 
                            onClick={() => handleRemoveTag(tag)} 
                            className="ml-1 hover:text-destructive"
                            data-testid={`button-remove-tag-${tag}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                      <SelectTrigger data-testid="select-note-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">Color</label>
                    <Select value={formData.color} onValueChange={(v) => setFormData({ ...formData, color: v })}>
                      <SelectTrigger data-testid="select-note-color">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {colorOptions.map(color => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center gap-2">
                              <div className={cn("w-4 h-4 rounded", color.class, "border")} />
                              {color.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  onClick={handleSubmit} 
                  disabled={!formData.title.trim() || createMutation.isPending || updateMutation.isPending}
                  className="w-full"
                  data-testid="button-save-note"
                >
                  {editingNote ? "Update Note" : "Create Note"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
              </>
            )}
          </div>
        </div>

        {selectionMode && selectedNotes.size > 0 && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-2 text-sm">
            <span className="font-medium">{selectedNotes.size}</span> note{selectedNotes.size !== 1 ? 's' : ''} selected for AI analysis
          </div>
        )}

        <Dialog open={analysisDialogOpen} onOpenChange={setAnalysisDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                AI Analysis Result
                {analysisResult && (
                  <Badge variant="secondary" className="ml-2">
                    {analysisResult.action === 'summarize' ? 'Summary' : 
                     analysisResult.action === 'organize' ? 'Organized' : 'Action Plan'}
                  </Badge>
                )}
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] mt-4">
              {analysisResult && (
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                  {analysisResult.result}
                </div>
              )}
            </ScrollArea>
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
              <Button variant="outline" onClick={() => setAnalysisDialogOpen(false)}>
                Close
              </Button>
              <Button 
                onClick={() => {
                  if (analysisResult) {
                    navigator.clipboard.writeText(analysisResult.result);
                  }
                }}
              >
                Copy to Clipboard
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Note Dialog */}
        <Dialog open={!!viewingNote} onOpenChange={(open) => !open && setViewingNote(null)}>
          <DialogContent className={cn("max-h-[85vh]", viewingNote?.aiSummary ? "max-w-4xl" : "max-w-2xl")}>
            {viewingNote && (
              <>
                <DialogHeader>
                  <div className="flex items-center justify-between gap-4">
                    <DialogTitle className="flex items-center gap-2" data-testid="text-view-note-title">
                      {(() => {
                        const CategoryIcon = categories.find(c => c.value === viewingNote.category)?.icon || FileText;
                        return <CategoryIcon className="w-5 h-5 text-muted-foreground" />;
                      })()}
                      {viewingNote.title}
                    </DialogTitle>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant="secondary">
                        {categories.find(c => c.value === viewingNote.category)?.label || "General"}
                      </Badge>
                      {viewingNote.pinned && (
                        <Pin className="w-4 h-4 text-primary" fill="currentColor" />
                      )}
                    </div>
                  </div>
                </DialogHeader>
                {viewingNote.tags && viewingNote.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {viewingNote.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs" data-testid={`badge-tag-${tag}`}>
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className={cn("mt-4 gap-4", viewingNote.aiSummary ? "grid grid-cols-1 md:grid-cols-2" : "")}>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-sm">Original Note</span>
                    </div>
                    <ScrollArea className="max-h-[45vh] flex-1 bg-muted/20 rounded-md p-3">
                      <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap" data-testid="text-view-note-content">
                        {viewingNote.content || "No content..."}
                      </div>
                    </ScrollArea>
                  </div>
                  
                  {viewingNote.aiSummary && (
                    <div className="flex flex-col overflow-hidden" data-testid="panel-view-ai-summary">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="font-medium text-sm">AI Summary</span>
                      </div>
                      <ScrollArea className="max-h-[45vh] flex-1 bg-primary/5 border border-primary/20 rounded-md p-3">
                        <div className="text-sm text-muted-foreground whitespace-pre-wrap break-words pr-2" data-testid="text-view-ai-summary">
                          {viewingNote.aiSummary}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t text-sm text-muted-foreground">
                  <span>
                    {viewingNote.updatedAt ? `Updated ${new Date(viewingNote.updatedAt).toLocaleDateString()}` : ""}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setViewingNote(null)} data-testid="button-close-view">
                      Close
                    </Button>
                    <Button onClick={() => { handleEdit(viewingNote); setViewingNote(null); }} data-testid="button-view-to-edit">
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-notes"
            />
            {searchQuery && (
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7"
                onClick={() => setSearchQuery("")}
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[160px]" data-testid="select-filter-category">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-48 animate-pulse bg-muted" />
            ))}
          </div>
        ) : filteredNotes.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold text-lg mb-2">
              {searchQuery || filterCategory !== "all" ? "No matching notes" : "No notes yet"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || filterCategory !== "all" 
                ? "Try adjusting your search or filters"
                : "Start capturing your ideas and plans"
              }
            </p>
            {!searchQuery && filterCategory === "all" && (
              <Button onClick={() => setIsDialogOpen(true)} data-testid="button-create-first-note">
                <Plus className="w-4 h-4 mr-2" />
                Create your first note
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-6">
            {pinnedNotes.length > 0 && (
              <div>
                <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <Pin className="w-3.5 h-3.5" />
                  Pinned ({pinnedNotes.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence mode="popLayout">
                    {pinnedNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onEdit={handleEdit}
                        onDelete={(id) => deleteMutation.mutate(id)}
                        onTogglePin={handleTogglePin}
                        onView={setViewingNote}
                        selectionMode={selectionMode}
                        isSelected={selectedNotes.has(note.id)}
                        onToggleSelect={handleToggleSelect}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
            
            {unpinnedNotes.length > 0 && (
              <div>
                {pinnedNotes.length > 0 && (
                  <h2 className="text-sm font-medium text-muted-foreground mb-3">
                    Other Notes ({unpinnedNotes.length})
                  </h2>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence mode="popLayout">
                    {unpinnedNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onEdit={handleEdit}
                        onDelete={(id) => deleteMutation.mutate(id)}
                        onTogglePin={handleTogglePin}
                        onView={setViewingNote}
                        selectionMode={selectionMode}
                        isSelected={selectedNotes.has(note.id)}
                        onToggleSelect={handleToggleSelect}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
