import React, { Dispatch, useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

import Image from "next/image";
import { Input } from '../ui/input';

interface FileUploaderProps {
  imageUrl: string;
  onFieldChange: (value: string) => void;
  setFiles: Dispatch<React.SetStateAction<File[]>>;
}

export function FileUploader({ imageUrl, onFieldChange, setFiles }: FileUploaderProps): React.ReactElement {
  const [error, setError] = useState<string | null>(null); // Stato per gestire gli errori

  const onDrop = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (acceptedFiles: File[], fileRejections: any[]) => {
      // Gestione dei file rifiutati
      if (fileRejections.length > 0) {
        setError("Formato file non supportato. Seleziona un'immagine valida.");
        return;
      }

      setError(null); // Resetta gli errori
      setFiles(acceptedFiles);

      // Carica l'immagine e genera l'URL
      const fileReader = new FileReader();
      fileReader.onload = () => {
        const uploadedUrl = fileReader.result as string;
        onFieldChange(uploadedUrl);
      };
      fileReader.readAsDataURL(acceptedFiles[0]);
    },
    [setFiles, onFieldChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/bmp': ['.bmp'],
      'image/svg+xml': ['.svg'],
      'image/webp': ['.webp'],
    },
  });

  const handleRemoveImage = () => {
    onFieldChange(""); // Resetta l'immagine
    setFiles([]); // Svuota i file
  };

  return (
    <div className="flex flex-col items-center">
      {!imageUrl ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed p-5 rounded-lg text-center cursor-pointer transition-all duration-200 ${
            isDragActive ? 'border-blue-500 bg-blue-100' : 'border-gray-300 bg-gray-50'
          } hover:bg-gray-100`}
        >
          <Input {...getInputProps()} />
          {isDragActive ? (
            <p className="text-blue-500 font-medium">Rilascia l&apos;immagine qui...</p>
          ) : (
            <p className="text-gray-600">Trascina un&apos;immagine qui o clicca per selezionarla</p>
          )}
        </div>
      ) : (
        <div className="relative">
          <Image
            src={imageUrl}
            width={250}
            height={500}
            alt="Anteprima"
            className="max-w-full max-h-48 rounded-lg shadow-md"
          />
          <button
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
          >
            ✕
          </button>
        </div>
      )}
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};
