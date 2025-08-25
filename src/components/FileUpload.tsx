import React, { useState, useRef } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: 'uploading' | 'success' | 'error';
  progress: number;
}

const FILE_WEBHOOK_URL = 'https://influenceragent.app.n8n.cloud/webhook-test/05695b56-dc5f-4b6c-9a6d-e5b5cceb27fe';

export const FileUpload: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const uploadFile = async (file: File): Promise<void> => {
    const fileId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    const newFile: UploadedFile = {
      id: fileId,
      name: file.name,
      size: file.size,
      status: 'uploading',
      progress: 0,
    };

    setFiles(prev => [...prev, newFile]);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('filename', file.name);
      formData.append('size', file.size.toString());

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, progress: Math.min(f.progress + 10, 90) } : f
        ));
      }, 100);

      const response = await fetch(FILE_WEBHOOK_URL, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: 'success', progress: 100 } : f
      ));

      toast({
        title: 'Success',
        description: `File "${file.name}" uploaded successfully!`,
      });

    } catch (error) {
      console.error('Error uploading file:', error);
      
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: 'error', progress: 0 } : f
      ));

      toast({
        title: 'Upload Failed',
        description: `Failed to upload "${file.name}". Please try again.`,
        variant: 'destructive',
      });
    }
  };

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    Array.from(fileList).forEach(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: 'File Too Large',
          description: `"${file.name}" is too large. Maximum size is 10MB.`,
          variant: 'destructive',
        });
        return;
      }
      uploadFile(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const retryUpload = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file) {
      // Create a new file object for retry - in real app you'd store the original File object
      toast({
        title: 'Retry',
        description: 'Please select the file again to retry upload.',
      });
    }
  };

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--panel-bg)' }}>
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--panel-border)' }}>
        <h3 className="font-semibold text-lg flex items-center space-x-2">
          <Upload className="w-5 h-5" />
          <span>File Upload</span>
        </h3>
        <p className="text-sm opacity-75 mt-1">
          Upload files to send to your n8n workflow
        </p>
      </div>

      {/* Upload Zone */}
      <div className="p-4 flex-1">
        <div
          className={`upload-zone p-8 text-center cursor-pointer ${isDragOver ? 'border-solid' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h4 className="text-lg font-medium mb-2">
            {isDragOver ? 'Drop files here' : 'Upload Files'}
          </h4>
          <p className="text-sm opacity-75 mb-4">
            Drag and drop files here, or click to browse
          </p>
          <Button variant="outline" className="mb-2">
            Choose Files
          </Button>
          <p className="text-xs opacity-50">
            Maximum file size: 10MB
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-6 space-y-3">
            <h4 className="font-medium">Uploaded Files</h4>
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 rounded-lg border"
                style={{ 
                  background: 'var(--input-bg)', 
                  borderColor: 'var(--input-border)' 
                }}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <File className="w-8 h-8 text-blue-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs opacity-75">{formatFileSize(file.size)}</p>
                    
                    {file.status === 'uploading' && (
                      <Progress value={file.progress} className="w-full mt-1" />
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {file.status === 'uploading' && (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  )}
                  
                  {file.status === 'success' && (
                    <CheckCircle className="w-4 h-4" style={{ color: 'var(--success)' }} />
                  )}
                  
                  {file.status === 'error' && (
                    <>
                      <AlertCircle className="w-4 h-4" style={{ color: 'var(--error)' }} />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => retryUpload(file.id)}
                      >
                        Retry
                      </Button>
                    </>
                  )}
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFile(file.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};