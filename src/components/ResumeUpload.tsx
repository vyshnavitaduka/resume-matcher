import React from 'react';
import { FileText, Upload, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface ResumeUploadProps {
  onUpload: (files: FileList) => void;
  files: { id: string; name: string; isAnalyzing: boolean }[];
  onRemove: (id: string) => void;
  isUploading: boolean;
  onSelect: (id: string) => void;
  selectedId: string | null;
}

export function ResumeUpload({ onUpload, files, onRemove, isUploading, onSelect, selectedId }: ResumeUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false);

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const droppedFiles = e.dataTransfer.files;
          if (droppedFiles.length > 0) onUpload(droppedFiles);
        }}
        className={cn(
          "border-2 border-dashed border-ink/20 rounded-lg p-8 text-center transition-all",
          isDragging && "border-ink bg-ink/5 scale-[0.99]",
          "hover:border-ink/40"
        )}
      >
        <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm font-medium">Drag & drop resumes here</p>
        <p className="text-xs opacity-50 mt-1">Supports .pdf, .docx, .txt</p>
        <input
          type="file"
          multiple
          accept=".pdf,.docx,.txt"
          className="hidden"
          id="file-upload"
          onChange={(e) => {
            const selectedFiles = e.target.files;
            if (selectedFiles && selectedFiles.length > 0) onUpload(selectedFiles);
          }}
        />
        <label
          htmlFor="file-upload"
          className={cn(
            "mt-4 inline-block px-4 py-2 bg-ink text-bg text-xs font-mono uppercase tracking-widest cursor-pointer hover:opacity-90",
            isUploading && "opacity-50 cursor-not-allowed"
          )}
        >
          {isUploading ? 'Uploading...' : 'Browse Files'}
        </label>
      </div>

      <div className="space-y-2">
        {files.map((file) => (
          <div
            key={file.id}
            onClick={() => onSelect(file.id)}
            className={cn(
              "data-row p-3 flex items-center justify-between group",
              selectedId === file.id && "bg-ink text-bg"
            )}
          >
            <div className="flex items-center gap-3">
              <FileText className={cn("w-4 h-4 opacity-50", selectedId === file.id && "opacity-100")} />
              <div>
                <p className="text-sm font-medium">{file.name}</p>
                {file.isAnalyzing && (
                  <p className="text-[10px] font-mono uppercase tracking-widest animate-pulse">Analyzing...</p>
                )}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(file.id);
              }}
              className={cn(
                "p-1 opacity-0 group-hover:opacity-100 hover:bg-bg hover:text-ink rounded transition-all",
                selectedId === file.id && "hover:bg-bg/20 text-bg opacity-100"
              )}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
