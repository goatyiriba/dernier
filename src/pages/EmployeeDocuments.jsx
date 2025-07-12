
import React, { useState, useEffect } from 'react';
import { Document, Employee, User } from '@/api/entities';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Download, 
  Search,
  Folder,
  AlertTriangle,
  RefreshCw,
  Upload,
  Smartphone,
  QrCode,
  Eye,
  Share2,
  Star,
  Clock,
  User as UserIcon
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import DocumentCard from "../components/documents/DocumentCard";
import UploadDocumentModal from "../components/documents/UploadDocumentModal";
import QRCodeModal from "../components/documents/QRCodeModal";

export default function EmployeeDocuments() {
  const [documents, setDocuments] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Loading employee documents...");
      
      const user = await User.me();
      setCurrentUser(user);
      console.log("Current user:", user);
      
      let employeeData = null;
      
      if (user && user.employee_id) {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        try {
          const employeeResults = await Employee.filter({ employee_id: user.employee_id });
          if (employeeResults.length > 0) {
            employeeData = employeeResults[0];
            console.log("Employee found by employee_id:", employeeData);
          }
        } catch (employeeError) {
          console.warn("Could not find employee by employee_id:", employeeError);
          
          if (user.email) {
            await new Promise(resolve => setTimeout(resolve, 300));
            try {
              const employeeResults = await Employee.filter({ email: user.email });
              if (employeeResults.length > 0) {
                employeeData = employeeResults[0];
                console.log("Employee found by email:", employeeData);
              }
            } catch (emailError) {
              console.warn("Could not find employee by email:", emailError);
            }
          }
        }
      }
      
      setEmployee(employeeData);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const allDocs = await Document.list('-created_date');
      console.log("All documents loaded:", allDocs.length);
      
      // Modification du filtrage pour l'assignation par employé
      let visibleDocs = [];
      if (employeeData) {
        visibleDocs = allDocs.filter(doc => 
          doc.is_active &&
          doc.is_approved !== false &&
          (doc.access_level === 'all' || 
          (doc.access_level === 'specific_employees' && doc.assigned_employees?.includes(employeeData.id)))
        );
      } else {
        visibleDocs = allDocs.filter(doc => 
          doc.is_active && 
          doc.is_approved !== false && 
          doc.access_level === 'all'
        );
      }
      
      console.log("Visible documents:", visibleDocs.length);
      setDocuments(visibleDocs);
      
    } catch (error) {
      console.error("Error loading documents:", error);
      
      if (error.message && error.message.includes('429')) {
        setError("Trop de requêtes simultanées. Veuillez patienter quelques instants.");
        toast({
          title: "Rate Limit Atteint",
          description: "Trop de requêtes simultanées. L'application va réessayer automatiquement.",
          variant: "destructive"
        });
        
        setTimeout(() => {
          if (error) { // Check if error state still exists, avoid re-retrying if cleared
            loadData();
          }
        }, 5000);
      } else {
        setError("Erreur lors du chargement des documents.");
        toast({
          title: "Erreur",
          description: "Impossible de charger les documents.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadDocument = async (documentData) => {
    try {
      console.log("Tentative de sauvegarde du document:", documentData);
      
      if (!documentData.title || !documentData.file_url) {
        throw new Error("Titre et fichier sont obligatoires");
      }

      const cleanedData = {
        title: documentData.title.trim(),
        description: documentData.description?.trim() || "",
        file_url: documentData.file_url,
        file_type: documentData.file_type || "unknown",
        file_size: documentData.file_size || 0,
        category: documentData.category || "other",
        uploaded_by: employee?.id || currentUser?.id || "unknown",
        uploaded_by_name: employee ? `${employee.first_name} ${employee.last_name}` : currentUser?.full_name || "Utilisateur",
        access_level: documentData.access_level || "all",
        assigned_employees: documentData.access_level === "specific_employees" ? documentData.assigned_employees : null,
        version: documentData.version || "",
        app_package: documentData.app_package || "",
        app_version_code: documentData.app_version_code || null,
        comments: documentData.comments || "",
        install_instructions: documentData.install_instructions || "",
        tags: documentData.tags || [],
        // APK automatiquement validés
        requires_approval: false,
        is_approved: true,
        is_active: true
      };

      console.log("Données nettoyées pour sauvegarde:", cleanedData);

      const newDocument = await Document.create(cleanedData);
      console.log("Document créé avec succès:", newDocument);
      
      setShowUploadModal(false);
      
      setTimeout(() => {
        loadData();
      }, 1000);
      
      const approvalMessage = cleanedData.requires_approval 
        ? " Le document sera visible après approbation par un administrateur." 
        : "";
      
      toast({
        title: "Succès",
        description: `Document partagé avec succès!${approvalMessage}`,
      });

    } catch (error) {
      console.error("Erreur lors de la sauvegarde du document:", error);
      
      let errorMessage = "Impossible de sauvegarder le document.";
      
      if (error.message && error.message.includes('rate limit')) {
        errorMessage = "Trop de requêtes. Veuillez patienter quelques instants.";
      } else if (error.message && error.message.includes('validation')) {
        errorMessage = "Données invalides. Vérifiez les champs obligatoires.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleEditDocument = (document) => {
    setEditingDocument(document);
    setShowEditModal(true);
  };

  const handleUpdateDocument = async (documentData) => {
    try {
      console.log("Mise à jour document:", editingDocument.id, documentData);
      
      const cleanedData = {
        title: documentData.title?.trim(),
        description: documentData.description?.trim(),
        file_url: documentData.file_url, // Only update if new file is selected
        file_type: documentData.file_type,
        file_size: documentData.file_size,
        category: documentData.category,
        access_level: documentData.access_level,
        assigned_employees: documentData.access_level === "specific_employees" ? documentData.assigned_employees : null,
        version: documentData.version,
        app_package: documentData.app_package,
        app_version_code: documentData.app_version_code,
        comments: documentData.comments,
        install_instructions: documentData.install_instructions,
        tags: documentData.tags,
        requires_approval: documentData.requires_approval,
        is_approved: documentData.is_approved,
        is_active: documentData.is_active
      };

      // Remove undefined properties to avoid overwriting with null/undefined if not provided by form
      Object.keys(cleanedData).forEach(key => cleanedData[key] === undefined && delete cleanedData[key]);

      await Document.update(editingDocument.id, cleanedData);
      
      setShowEditModal(false);
      setEditingDocument(null);
      
      setTimeout(() => {
        loadData();
      }, 1000);
      
      toast({
        title: "Succès",
        description: "Document mis à jour avec succès!",
      });

    } catch (error) {
      console.error("Erreur mise à jour document:", error);
      let errorMessage = "Impossible de mettre à jour le document.";
      if (error.message && error.message.includes('rate limit')) {
        errorMessage = "Trop de requêtes. Veuillez patienter quelques instants.";
      } else if (error.message && error.message.includes('validation')) {
        errorMessage = "Données invalides. Vérifiez les champs obligatoires.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleDeleteDocument = async (document) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer "${document.title}" ?`)) {
      return;
    }

    try {
      await Document.delete(document.id);
      
      setTimeout(() => {
        loadData();
      }, 1000);
      
      toast({
        title: "Succès",
        description: "Document supprimé avec succès!",
      });

    } catch (error) {
      console.error("Erreur suppression document:", error);
      let errorMessage = "Impossible de supprimer le document.";
      if (error.message && error.message.includes('rate limit')) {
        errorMessage = "Trop de requêtes. Veuillez patienter quelques instants.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleShowQRCode = (document) => {
    setSelectedDocument(document);
    setShowQRModal(true);
  };

  const handleDownload = async (document) => {
    try {
      // Incrémenter le compteur de téléchargements
      if (document.id) {
        await Document.update(document.id, {
          download_count: (document.download_count || 0) + 1
        });
      }
      
      // Ouvrir le lien de téléchargement
      window.open(document.file_url, '_blank');
      
      toast({
        title: "Téléchargement",
        description: "Le téléchargement a commencé",
      });
    } catch (error) {
      console.error("Erreur téléchargement:", error);
      // Ouvrir quand même le lien même si l'update échoue
      window.open(document.file_url, '_blank');
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = searchTerm === "" || 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.uploaded_by_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = ["policy", "handbook", "form", "procedure", "training", "mobile_app", "software", "other"];
  
  const categoryLabels = {
    policy: "Politiques",
    handbook: "Manuels", 
    form: "Formulaires",
    procedure: "Procédures",
    training: "Formation",
    mobile_app: "Applications Mobiles",
    software: "Logiciels",
    other: "Autres"
  };

  const stats = {
    total: filteredDocuments.length,
    mobile_apps: filteredDocuments.filter(d => d.category === "mobile_app" || d.file_type === "apk").length,
    documents: filteredDocuments.filter(d => ["pdf", "doc", "docx"].includes(d.file_type)).length,
    recent: filteredDocuments.filter(d => {
      const createdDate = new Date(d.created_date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return createdDate > weekAgo;
    }).length
  };

  const handleRetry = () => {
    setError(null);
    loadData();
  };

  // Error state
  if (error) {
    return (
      <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-red-50 border-red-200 shadow-md">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-4">
              <AlertTriangle className="w-10 h-10 text-red-600" />
              <div className="space-y-1">
                <p className="text-lg font-semibold text-red-900">Impossible de charger les documents</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <Button onClick={handleRetry} variant="destructive" className="mt-2">
                <RefreshCw className="w-4 h-4 mr-2" />
                Réessayer
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              Documents Partagés
            </h1>
            <p className="text-slate-600">
              Accédez et partagez des documents, applications et ressources de l'entreprise
            </p>
          </div>
          <Button
            onClick={() => setShowUploadModal(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-lg"
          >
            <Upload className="w-5 h-5 mr-2" />
            Partager un Document
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Documents</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Apps Mobiles</p>
                  <p className="text-2xl font-bold text-green-600">{stats.mobile_apps}</p>
                </div>
                <Smartphone className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Documents</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.documents}</p>
                </div>
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Récents</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.recent}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Rechercher documents, applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 bg-slate-50 border-0 focus:bg-white transition-colors"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  onClick={() => setSelectedCategory("all")}
                  className="h-12"
                >
                  Tous
                </Button>
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category)}
                    className="h-12"
                  >
                    {categoryLabels[category]}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">
              Documents ({filteredDocuments.length})
            </h2>
            {!isLoading && (
              <Button onClick={handleRetry} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualiser
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="wait">
              {isLoading ? (
                Array(6).fill(0).map((_, i) => (
                  <Card key={i} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-slate-200 rounded w-3/4" />
                        <div className="h-3 bg-slate-200 rounded w-1/2" />
                        <div className="h-6 bg-slate-200 rounded w-20" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : filteredDocuments.length > 0 ? (
                filteredDocuments.map((document) => (
                  <DocumentCard
                    key={document.id}
                    document={document}
                    uploaderName={document.uploaded_by_name || "Utilisateur"}
                    onDownload={() => handleDownload(document)}
                    onShowQRCode={() => handleShowQRCode(document)}
                    onEdit={handleEditDocument}
                    onDelete={handleDeleteDocument}
                    isEmployee={true}
                    canEdit={document.uploaded_by === employee?.id}
                    canDelete={document.uploaded_by === employee?.id}
                    currentUserId={employee?.id}
                  />
                ))
              ) : (
                <div className="col-span-full">
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="p-12 text-center">
                      <Folder className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-slate-800">Aucun document trouvé</h3>
                      <p className="text-slate-500 mt-2">
                        {documents.length === 0 
                          ? "Aucun document n'a encore été partagé." 
                          : "Essayez d'ajuster vos critères de recherche."
                        }
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Upload Document Modal */}
        <UploadDocumentModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onSave={handleUploadDocument}
          isEmployee={true}
          employeeName={employee ? `${employee.first_name} ${employee.last_name}` : currentUser?.full_name}
        />

        {/* Edit Document Modal */}
        {editingDocument && (
          <UploadDocumentModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setEditingDocument(null);
            }}
            onSave={handleUpdateDocument}
            isEmployee={true}
            employeeName={employee ? `${employee.first_name} ${employee.last_name}` : currentUser?.full_name}
            editingDocument={editingDocument}
          />
        )}

        {/* QR Code Modal */}
        {selectedDocument && (
          <QRCodeModal
            isOpen={showQRModal}
            onClose={() => {
              setShowQRModal(false);
              setSelectedDocument(null);
            }}
            document={selectedDocument}
          />
        )}
      </div>
    </div>
  );
}
