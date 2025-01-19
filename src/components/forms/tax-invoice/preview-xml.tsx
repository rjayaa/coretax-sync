// src/components/forms/tax-invoice/preview-xml.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText } from "lucide-react";
import type { HeaderData, FakturData, DetailItem } from "@/types/tax-invoice";

interface PreviewXMLProps {
  headerData: HeaderData;
  fakturData: FakturData;
  detailItems: DetailItem[];
  xmlOutput: string;
  error: string;
  onGenerateXML: () => void;
  onDownloadXML: () => void;
}

export default function PreviewXML({
  xmlOutput,
  error,
  onGenerateXML,
  onDownloadXML
}: PreviewXMLProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Button onClick={onGenerateXML} className="flex-1">
          <FileText className="mr-2 h-4 w-4" />
          Generate XML
        </Button>
        {xmlOutput && (
          <Button onClick={onDownloadXML} variant="outline" className="flex-1">
            Download XML
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {xmlOutput && (
        <div className="border rounded p-4 bg-gray-50 h-96 overflow-auto">
          <pre className="text-sm whitespace-pre-wrap">{xmlOutput}</pre>
        </div>
      )}
    </div>
  );
}