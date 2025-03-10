// components/image-url-preview.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';

type ImageUrlPreviewProps = {
    imageUrl: string;
    className?: string;
};

export const ImageUrlPreview: React.FC<ImageUrlPreviewProps> = ({
    imageUrl,
    className = 'h-40 w-full'
}) => {
    const [isValid, setIsValid] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    if (!imageUrl.trim()) {
        return (
            <div className={`${className} bg-gray-100 flex items-center justify-center rounded-md border border-dashed border-gray-300`}>
                <p className="text-gray-400 text-sm">No image URL provided</p>
            </div>
        );
    }

    return (
        <div className={`${className} relative rounded-md overflow-hidden bg-gray-100`}>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-blue-500 border-gray-200"></div>
                </div>
            )}

            {!isValid ? (
                <div className="absolute inset-0 flex items-center justify-center bg-red-50 border border-red-200">
                    <div className="text-red-500 text-center p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Invalid image URL
                    </div>
                </div>
            ) : (
                <Image
                    src={imageUrl}
                    alt="Image preview"
                    fill
                    className="object-cover"
                    onLoadStart={() => {
                        setIsLoading(true);
                        setIsValid(true);
                    }}
                    onLoad={() => {
                        setIsLoading(false);
                        setIsValid(true);
                    }}
                    onError={() => {
                        setIsLoading(false);
                        setIsValid(false);
                    }}
                />
            )}
        </div>
    );
};

export default ImageUrlPreview;