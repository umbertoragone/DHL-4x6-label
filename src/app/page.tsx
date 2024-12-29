"use client";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { PDFDocument } from "pdf-lib";
import { CloudUpload } from "lucide-react";
import Footer from "@/components/Footer";

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [croppedPdf, setCroppedPdf] = useState<Uint8Array | null>(null);
  const [croppedPdfUrl, setCroppedPdfUrl] = useState<string | null>(null);

  const cropPdf = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    firstPage.scale(0.85, 0.85);
    firstPage.setCropBox(48, 45, 288, 432);
    const croppedPdfBytes = await pdfDoc.save();
    setCroppedPdf(croppedPdfBytes);
    const blob = new Blob([croppedPdfBytes], { type: "application/pdf" });
    setCroppedPdfUrl(URL.createObjectURL(blob));
  };

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setFile(file);
    await cropPdf(file);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const downloadCroppedPdf = () => {
    if (croppedPdf) {
      const blob = new Blob([croppedPdf], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${file?.name.replace(".pdf", "")}-cropped.pdf`;
      link.click();
    }
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-neutral-100 dark:bg-neutral-900 gap-2 p-8">
      <div className="flex flex-col items-center justify-center gap-2">
        <h1 className="text-4xl font-bold text-neutral-800 dark:text-neutral-200">
          DHL 4x6&quot; Label Cropper
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Crop a DHL transport label into a 4x6&quot; PDF for printing
        </p>
      </div>
      {!croppedPdf && (
        <div
          {...getRootProps()}
          className="flex flex-col items-center w-72 border-2 border-dashed border-neutral-400 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-center text-sm text-neutral-500 cursor-pointer backdrop-blur-sm gap-4 mt-12 p-6"
        >
          <input {...getInputProps({ accept: "application/pdf" })} />
          <CloudUpload className="text-5xl text-neutral-500 w-10 h-10" />
          <p>Drag & Drop a PDF file here</p>
          <span>or</span>
          <button className="rounded-lg font-semibold bg-blue-500 text-sm text-white dark:bg-blue-600 dark:text-neutral-200 hover:bg-blue-600 dark:hover:bg-blue-700 shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 px-4 py-2">
            Upload PDF
          </button>
        </div>
      )}
      {file && (
        <p className="text-center text-neutral-700 dark:text-neutral-300">
          Selected File: {file.name}
        </p>
      )}
      {croppedPdfUrl && (
        <div className="mt-4 w-80">
          <p className="text-center text-neutral-700 dark:text-neutral-300 mb-2">
            Preview:
          </p>
          <iframe
            src={croppedPdfUrl}
            className="w-full h-[29.5rem] border border-neutral-400 dark:border-neutral-600 rounded"
            title="PDF Preview"
          ></iframe>
          <div className="flex justify-center gap-2 mt-4">
            <button
              onClick={() => {
                setFile(null);
                setCroppedPdf(null);
                setCroppedPdfUrl(null);
              }}
              className="rounded-lg bg-red-600 hover:bg-red-700 font-semibold text-sm text-white shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 px-4 py-2"
            >
              Cancel
            </button>
            <button
              onClick={downloadCroppedPdf}
              className="rounded-lg bg-green-700 hover:bg-green-800 font-semibold text-sm text-white shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 px-4 py-2"
            >
              Download
            </button>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
