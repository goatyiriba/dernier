import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  QrCode, 
  Download, 
  Share2, 
  Copy, 
  Check,
  Smartphone,
  FileText,
  X,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function QRCodeModal({ isOpen, onClose, document }) {
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (document && isOpen) {
      generateQRCode();
    }
  }, [document, isOpen]);

  const generateQRCode = async () => {
    setIsGenerating(true);
    try {
      const qrData = encodeURIComponent(document.file_url);
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${qrData}&format=png&margin=20&color=1F2937&bgcolor=FFFFFF&ecc=M`;
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.error("Erreur génération QR code:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le QR code",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "✅ Copié",
        description: "Lien copié dans le presse-papier",
      });
    } catch (error) {
      console.error("Erreur copie:", error);
      // Fallback pour les navigateurs qui ne supportent pas clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({
          title: "✅ Copié",
          description: "Lien copié dans le presse-papier",
        });
      } catch (fallbackError) {
        toast({
          title: "Erreur",
          description: "Impossible de copier le lien",
          variant: "destructive"
        });
      }
      document.body.removeChild(textArea);
    }
  };

  const shareDocument = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          text: document.description || `Téléchargez ${document.title}`,
          url: document.file_url
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          copyToClipboard(document.file_url);
        }
      }
    } else {
      copyToClipboard(document.file_url);
    }
  };

  const downloadQRCode = async () => {
    if (!qrCodeUrl) return;

    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-${document.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "✅ QR Code téléchargé",
        description: "Le QR code a été sauvegardé",
      });
    } catch (error) {
      console.error("Erreur téléchargement QR:", error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le QR code",
        variant: "destructive"
      });
    }
  };

  if (!document) return null;

  const isAPK = document.file_type === "apk" || document.category === "mobile_app";
  const FileIcon = isAPK ? Smartphone : FileText;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white rounded-3xl border border-gray-100 shadow-2xl">
        <DialogHeader className="relative">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="absolute right-0 top-0 h-8 w-8 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3 pt-2 pr-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                QR Code
              </DialogTitle>
              <p className="text-sm text-gray-500 mt-1">
                Scan pour télécharger
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Document Info */}
          <Card className="border border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm ${
                  isAPK 
                    ? 'bg-gradient-to-br from-green-100 to-emerald-100' 
                    : 'bg-gradient-to-br from-blue-100 to-indigo-100'
                }`}>
                  <FileIcon className={`w-5 h-5 ${
                    isAPK ? 'text-green-600' : 'text-blue-600'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate text-base">
                    {document.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      variant="outline" 
                      className="text-xs bg-white border-gray-200"
                    >
                      {document.file_type?.toUpperCase() || 'FILE'}
                    </Badge>
                    {document.version && (
                      <Badge className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                        v{document.version}
                      </Badge>
                    )}
                    {document.file_size && (
                      <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600">
                        {(document.file_size / 1024 / 1024).toFixed(1)} MB
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              {document.description && (
                <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                  {document.description}
                </p>
              )}
            </CardContent>
          </Card>

          {/* QR Code */}
          <div className="text-center">
            <div className="inline-block p-6 bg-white rounded-2xl shadow-lg border-2 border-gray-100">
              {isGenerating ? (
                <div className="w-70 h-70 flex items-center justify-center">
                  <div className="animate-spin w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full"></div>
                </div>
              ) : qrCodeUrl ? (
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code de téléchargement" 
                  className="w-70 h-70 mx-auto"
                  style={{ width: '280px', height: '280px' }}
                />
              ) : (
                <div className="w-70 h-70 flex items-center justify-center bg-gray-50 rounded-lg">
                  <QrCode className="w-12 h-12 text-gray-300" />
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-4 font-medium">
              📱 Scannez avec votre téléphone
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Utilisez l'appareil photo ou une app de scan QR
            </p>
          </div>

          {/* Lien direct */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Lien direct :</p>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600 truncate font-mono bg-white px-2 py-1 rounded border">
                  {document.file_url}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(document.file_url)}
                className="h-8 w-8 p-0 hover:bg-white transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-500" />
                )}
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-3 gap-3">
            <Button 
              variant="outline" 
              onClick={downloadQRCode}
              disabled={!qrCodeUrl}
              className="flex-1 border-gray-200 hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              QR Code
            </Button>
            <Button 
              variant="outline" 
              onClick={shareDocument}
              className="flex-1 border-gray-200 hover:bg-gray-50"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Partager
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open(document.file_url, '_blank')}
              className="flex-1 border-gray-200 hover:bg-gray-50"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Ouvrir
            </Button>
          </div>

          {/* Bouton principal */}
          <Button
            onClick={() => {
              window.open(document.file_url, '_blank');
              onClose();
            }}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
          >
            <Download className="w-5 h-5 mr-2" />
            Télécharger Maintenant
          </Button>

          {/* Instructions pour APK */}
          {isAPK && document.install_instructions && (
            <Card className="border border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Smartphone className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-amber-800 text-sm">
                      Instructions d'installation
                    </h4>
                    <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                      {document.install_instructions}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}