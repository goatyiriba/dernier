import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Download,
  User,
  Calendar,
  Building2,
  Smartphone,
  QrCode,
  Edit,
  Trash2,
  MoreVertical
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const categoryColors = {
  policy: "bg-red-100 text-red-800",
  handbook: "bg-blue-100 text-blue-800",
  form: "bg-green-100 text-green-800",
  procedure: "bg-purple-100 text-purple-800",
  training: "bg-amber-100 text-amber-800",
  mobile_app: "bg-emerald-100 text-emerald-800",
  other: "bg-slate-100 text-slate-800"
};

const accessLevelColors = {
  all: "bg-green-100 text-green-800",
  department_specific: "bg-blue-100 text-blue-800",
  specific_employees: "bg-purple-100 text-purple-800",
  admin_only: "bg-red-100 text-red-800"
};

export default function DocumentCard({ 
  document, 
  uploaderName, 
  onDownload, 
  onShowQRCode, 
  onEdit,
  onDelete,
  isEmployee = false,
  canEdit = false,
  canDelete = false,
  currentUserId
}) {
  const handleDownload = () => {
    if (onDownload && typeof onDownload === 'function') {
      onDownload();
    } else {
      window.open(document.file_url, '_blank');
    }
  };

  const handleShowQRCode = () => {
    if (onShowQRCode && typeof onShowQRCode === 'function') {
      onShowQRCode();
    }
  };

  const handleEdit = () => {
    if (onEdit && typeof onEdit === 'function') {
      onEdit(document);
    }
  };

  const handleDelete = () => {
    if (onDelete && typeof onDelete === 'function') {
      onDelete(document);
    }
  };

  const getFileTypeIcon = (fileType) => {
    if (fileType === 'apk') return Smartphone;
    return FileText;
  };

  const FileTypeIcon = getFileTypeIcon(document.file_type);
  const isAPK = document.file_type === 'apk' || document.category === 'mobile_app';
  
  // Vérifier si l'utilisateur peut modifier/supprimer
  const canUserEdit = canEdit || document.uploaded_by === currentUserId;
  const canUserDelete = canDelete || document.uploaded_by === currentUserId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
        <CardContent className="p-6">
          <div className="flex flex-col space-y-4">
            {/* Header avec menu actions */}
            <div className="flex items-start gap-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isAPK ? 'bg-green-50' : 'bg-blue-50'
              }`}>
                <FileTypeIcon className={`w-6 h-6 ${
                  isAPK ? 'text-green-600' : 'text-blue-600'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 text-lg truncate">{document.title}</h3>
                {document.description && (
                  <p className="text-sm text-slate-600 mt-1 line-clamp-2">{document.description}</p>
                )}
              </div>
              
              {/* Menu actions */}
              {(canUserEdit || canUserDelete) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {canUserEdit && (
                      <DropdownMenuItem onClick={handleEdit}>
                        <Edit className="w-4 h-4 mr-2" />
                        Modifier
                      </DropdownMenuItem>
                    )}
                    {canUserEdit && canUserDelete && <DropdownMenuSeparator />}
                    {canUserDelete && (
                      <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge className={categoryColors[document.category] || categoryColors.other}>
                {document.category}
              </Badge>
              <Badge className={accessLevelColors[document.access_level]}>
                {document.access_level === "all" ? "Tous les employés" :
                 document.access_level === "department_specific" ? "Département uniquement" :
                 document.access_level === "specific_employees" ? "Employés spécifiques" :
                 "Admin uniquement"}
              </Badge>
              {document.file_type && (
                <Badge variant="outline">
                  {document.file_type.toUpperCase()}
                </Badge>
              )}
              {document.version && (
                <Badge variant="secondary">
                  v{document.version}
                </Badge>
              )}
            </div>

            {/* Comments du partageur */}
            {document.comments && (
              <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-400">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">💬 Commentaire: </span>
                  {document.comments}
                </p>
              </div>
            )}

            {/* Instructions d'installation pour APK */}
            {isAPK && document.install_instructions && (
              <div className="bg-amber-50 p-3 rounded-lg border-l-4 border-amber-400">
                <div className="flex items-start gap-2">
                  <Smartphone className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-amber-800 mb-1">Instructions d'installation:</p>
                    <p className="text-xs text-amber-700">{document.install_instructions}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="space-y-2 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Partagé par {uploaderName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(document.created_date), "MMM d, yyyy")}</span>
              </div>
              {document.download_count > 0 && (
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <span>{document.download_count} téléchargements</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {document.tags && document.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {document.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="hover:bg-blue-50 hover:border-blue-200"
              >
                <Download className="w-4 h-4 mr-1" />
                Télécharger
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShowQRCode}
                className="hover:bg-green-50 hover:border-green-200"
              >
                <QrCode className="w-4 h-4 mr-1" />
                QR Code
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}