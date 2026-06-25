import { useState, useCallback } from "react";
import { UploadCloud, FileText, Loader2 } from "lucide-react";

export const FileDropzone = ({ accept, onFile, loading, label, hint, testid }) => {
  const [dragging, setDragging] = useState(false);
  const [filename, setFilename] = useState("");

  const handleFiles = useCallback(
    (files) => {
      if (files && files.length > 0) {
        setFilename(files[0].name);
        onFile(files[0]);
      }
    },
    [onFile]
  );

  return (
    <label
      data-testid={testid}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`flex flex-col items-center justify-center text-center border-2 border-dashed rounded-xl p-10 cursor-pointer transition-colors duration-200 ${
        dragging ? "border-primary bg-primary/10" : "border-primary/30 bg-primary/5 hover:bg-primary/10"
      } ${loading ? "pointer-events-none opacity-70" : ""}`}
    >
      <input
        type="file"
        accept={accept}
        className="hidden"
        disabled={loading}
        onChange={(e) => handleFiles(e.target.files)}
      />
      {loading ? (
        <Loader2 className="h-12 w-12 text-primary mb-4 animate-spin" />
      ) : (
        <UploadCloud className="h-12 w-12 text-primary mb-4" />
      )}
      <p className="font-heading text-lg font-medium text-foreground">{label}</p>
      <p className="text-sm text-muted-foreground mt-1">{hint}</p>
      {filename && !loading && (
        <span className="mt-4 inline-flex items-center gap-2 text-sm text-primary bg-secondary px-3 py-1 rounded-full">
          <FileText className="h-4 w-4" /> {filename}
        </span>
      )}
    </label>
  );
};
