import { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ZoomIn, RotateCw } from 'lucide-react';

interface ImageCropperProps {
  image: string;
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedImage: Blob) => void;
  aspectRatio: number;
  cropShape?: 'rect' | 'round';
  title?: string;
}

export function ImageCropper({
  image,
  isOpen,
  onClose,
  onCropComplete,
  aspectRatio,
  cropShape = 'rect',
  title = 'Crop Image'
}: ImageCropperProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleCrop = useCallback(async () => {
    if (!imageRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imageRef.current;
    
    // Calculate crop dimensions based on aspect ratio
    let cropWidth, cropHeight;
    if (aspectRatio > 1) {
      // Wide image (banner)
      cropWidth = img.naturalWidth;
      cropHeight = img.naturalWidth / aspectRatio;
    } else {
      // Square or tall image (logo)
      cropWidth = Math.min(img.naturalWidth, img.naturalHeight);
      cropHeight = cropWidth / aspectRatio;
    }

    // Center the crop
    const cropX = (img.naturalWidth - cropWidth) / 2;
    const cropY = (img.naturalHeight - cropHeight) / 2;

    // Set canvas size to desired output
    const outputSize = aspectRatio > 1 ? 1920 : 512; // 1920x1080 for banner, 512x512 for logo
    canvas.width = outputSize;
    canvas.height = outputSize / aspectRatio;

    // Apply zoom and rotation
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Draw the cropped image
    ctx.drawImage(
      img,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );

    ctx.restore();

    // Convert to blob
    canvas.toBlob(
      (blob) => {
        if (blob) {
          onCropComplete(blob);
        }
      },
      'image/jpeg',
      0.95
    );
  }, [zoom, rotation, aspectRatio, onCropComplete]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview Area */}
          <div className="relative w-full h-96 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
            <img
              ref={imageRef}
              src={image}
              alt="Crop preview"
              className="max-w-full max-h-full object-contain"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transition: 'transform 0.2s ease-out'
              }}
              crossOrigin="anonymous"
            />
            
            {/* Crop overlay guide */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div 
                className="border-2 border-white shadow-lg"
                style={{
                  width: aspectRatio > 1 ? '80%' : '50%',
                  aspectRatio: aspectRatio.toString(),
                  borderRadius: cropShape === 'round' ? '50%' : '8px',
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
                }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {/* Zoom */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <ZoomIn className="h-4 w-4" />
                  Zoom
                </label>
                <span className="text-sm text-muted-foreground">{zoom.toFixed(1)}x</span>
              </div>
              <Slider
                value={[zoom]}
                onValueChange={(value) => setZoom(value[0])}
                min={0.5}
                max={3}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Rotation */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <RotateCw className="h-4 w-4" />
                  Rotation
                </label>
                <span className="text-sm text-muted-foreground">{rotation}°</span>
              </div>
              <Slider
                value={[rotation]}
                onValueChange={(value) => setRotation(value[0])}
                min={0}
                max={360}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCrop}>
            Crop & Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
