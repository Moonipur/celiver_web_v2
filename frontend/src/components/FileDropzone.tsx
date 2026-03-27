import * as React from 'react'
import { useDropzone, type DropzoneOptions } from 'react-dropzone'
import { Upload, X, File as FileIcon, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils' // Standard shadcn utility
import { Button } from '@/components/ui/button'

interface FileDropzoneProps extends DropzoneOptions {
  files: File[]
  onFilesChange?: (files: File[]) => void
  className?: string
  isUploading?: boolean
}

export const FileDropzone = React.forwardRef<HTMLDivElement, FileDropzoneProps>(
  ({ files, onFilesChange, className, isUploading, ...options }, ref) => {
    const onDrop = React.useCallback(
      (acceptedFiles: File[]) => {
        // Just send the new combined list to the parent
        const newFiles = [...files, ...acceptedFiles]
        onFilesChange?.(newFiles)
      },
      [files, onFilesChange],
    )

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      ...options,
    })

    const removeFile = (index: number) => {
      // Just send the filtered list to the parent
      const newFiles = files.filter((_, i) => i !== index)
      onFilesChange?.(newFiles)
    }

    return (
      <div className={cn('w-full space-y-4', className)} ref={ref}>
        <div
          {...getRootProps()}
          className={cn(
            'relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl transition-all outline-none',
            'bg-background hover:bg-accent/50 border-muted-foreground/25',
            isDragActive &&
              'border-primary bg-primary/5 ring-2 ring-primary/20',
            isUploading && 'opacity-50 pointer-events-none',
          )}
        >
          <input {...getInputProps()} />

          <div className="flex flex-col items-center justify-center pb-6 pt-5">
            {isUploading ? (
              <Loader2 className="w-8 h-8 mb-3 text-muted-foreground animate-spin" />
            ) : (
              <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
            )}
            <p className="mb-2 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                Click to upload
              </span>{' '}
              or drag and drop
            </p>
            <p className="text-xs text-muted-foreground/70">
              XLSX or CSV file up to 10MB
            </p>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="grid gap-2">
            {files.map((file, i) => (
              <div
                key={`${file.name}-${i}`}
                className="flex items-center justify-between p-2 pl-3 border rounded-md bg-secondary/30"
              >
                <div className="flex items-center gap-3">
                  <FileIcon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium truncate max-w-50">
                    {file.name}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:text-destructive"
                  onClick={() => removeFile(i)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  },
)
