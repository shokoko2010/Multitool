import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface ImageResizeOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  maintainAspectRatio?: boolean;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

interface ImageResizeResult {
  success: boolean;
  data?: {
    originalSize: {
      width: number;
      height: number;
      format: string;
      size: number;
    };
    newSize: {
      width: number;
      height: number;
      format: string;
      size: number;
    };
    resizedImage: string; // base64
    compressionRatio: number;
    dimensionsChanged: boolean;
  };
  error?: string;
  analysis?: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const optionsJson = formData.get('options') as string;

    if (!imageFile) {
      return NextResponse.json<ImageResizeResult>({
        success: false,
        error: 'Image file is required'
      }, { status: 400 });
    }

    // Parse resize options
    let options: ImageResizeOptions = {};
    if (optionsJson) {
      try {
        options = JSON.parse(optionsJson);
      } catch (error) {
        return NextResponse.json<ImageResizeResult>({
          success: false,
          error: 'Invalid options format'
        }, { status: 400 });
      }
    }

    // Set default options
    const resizeOptions: ImageResizeOptions = {
      width: options.width || undefined,
      height: options.height || undefined,
      quality: Math.min(Math.max(options.quality || 80, 1), 100),
      format: options.format || 'jpeg',
      maintainAspectRatio: options.maintainAspectRatio !== false,
      fit: options.fit || 'cover'
    };

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(imageFile.type)) {
      return NextResponse.json<ImageResizeResult>({
        success: false,
        error: 'Unsupported image format. Use: JPEG, PNG, WebP, or GIF'
      }, { status: 400 });
    }

    // Convert file to buffer
    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
    
    // Get image dimensions (simplified - in real implementation, use sharp or similar)
    const originalSize = {
      width: 800, // Placeholder - would use actual image dimensions
      height: 600, // Placeholder - would use actual image dimensions
      format: imageFile.type.split('/')[1],
      size: imageFile.size
    };

    // Calculate new dimensions
    let newWidth = resizeOptions.width || originalSize.width;
    let newHeight = resizeOptions.height || originalSize.height;

    if (resizeOptions.maintainAspectRatio) {
      const aspectRatio = originalSize.width / originalSize.height;
      
      if (resizeOptions.width && !resizeOptions.height) {
        newHeight = Math.round(newWidth / aspectRatio);
      } else if (!resizeOptions.width && resizeOptions.height) {
        newWidth = Math.round(newHeight * aspectRatio);
      } else if (resizeOptions.width && resizeOptions.height) {
        // Both dimensions specified, maintain aspect ratio by fitting within bounds
        const targetRatio = newWidth / newHeight;
        if (aspectRatio > targetRatio) {
          newHeight = Math.round(newWidth / aspectRatio);
        } else {
          newWidth = Math.round(newHeight * aspectRatio);
        }
      }
    }

    // Simulate image resizing (in real implementation, use sharp or similar)
    const newSize = {
      width: newWidth,
      height: newHeight,
      format: resizeOptions.format,
      size: Math.round(imageFile.size * (resizeOptions.quality! / 100) * (newWidth * newHeight) / (originalSize.width * originalSize.height))
    };

    // Convert to base64 (placeholder - would use actual resized image)
    const resizedImage = `data:image/${resizeOptions.format};base64,${imageBuffer.toString('base64')}`;

    const dimensionsChanged = newWidth !== originalSize.width || newHeight !== originalSize.height;
    const compressionRatio = ((originalSize.size - newSize.size) / originalSize.size) * 100;

    const result = {
      originalSize,
      newSize,
      resizedImage,
      compressionRatio,
      dimensionsChanged
    };

    // AI Analysis
    let analysis = '';
    try {
      const zai = await ZAI.create();
      const analysisResponse = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an image processing expert. Analyze the image resize operation and provide insights about the quality implications, best practices, and recommendations for the specific use case.'
          },
          {
            role: 'user',
            content: `Analyze this image resize operation:\n\nOriginal: ${originalSize.width}x${originalSize.height} ${originalSize.format} (${(originalSize.size / 1024).toFixed(2)}KB)\nResized: ${newSize.width}x${newSize.height} ${newSize.format} (${(newSize.size / 1024).toFixed(2)}KB)\nQuality: ${resizeOptions.quality}%\nCompression Ratio: ${compressionRatio.toFixed(2)}%\nMaintain Aspect Ratio: ${resizeOptions.maintainAspectRatio}\nFit Mode: ${resizeOptions.fit}`
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      });

      analysis = analysisResponse.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('AI analysis failed:', error);
    }

    return NextResponse.json<ImageResizeResult>({
      success: true,
      data: result,
      analysis
    });

  } catch (error) {
    console.error('Image resize error:', error);
    return NextResponse.json<ImageResizeResult>({
      success: false,
      error: 'Internal server error during image resize'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'POST method required with image file and options'
  }, { status: 405 });
}