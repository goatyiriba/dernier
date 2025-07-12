
import React, { useState, useEffect } from "react";
import { Document, Employee } from "@/api/supabaseEntities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Plus,
  Search,
  Upload,
  Download,
  Folder,
  Eye,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

import DocumentCard from "../components/documents/DocumentCard";
import UploadDocumentModal from "../components/documents/UploadDocumentModal";

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
    // Increased interval to reduce API calls
    const intervalId = setInterval(loadData, 120000); // 2 minutes instead of 15 seconds
    return () => clearInterval(intervalId);
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Loading documents data...");
      
      // Sequential loading with delays to avoid rate limits
      const documentData = await Document.list("-created_date");
      console.log("Documents loaded:", documentData.length);
      
      // Add delay before next API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let employeeData = [];
      try {
        employeeData = await Employee.list();
        console.log("Employees loaded:", employeeData.length);
      } catch (employeeError) {
        console.warn("Could not load employee data for document enrichment:", employeeError);
        // Continue without employee data - documents will still work
        toast({
          title: "Avertissement",
          description: "Impossible de charger les données des employés. Les noms des uploaders ne seront pas disponibles.",
          variant: "default"
        });
      }
      
      setDocuments(documentData);
      setEmployees(employeeData);
      
    } catch (error) {
      console.error("Error loading documents:", error);
      
      if (error.message && error.message.includes('429')) {
        setError("Trop de requêtes simultanées. Veuillez patienter quelques instants.");
        toast({
          title: "Rate Limit Atteint",
          description: "Trop de requêtes simultanées. L'application va réessayer automatiquement dans quelques instants.",
          variant: "destructive"
        });
        
        // Retry after 5 seconds if rate limited
        setTimeout(() => {
          if (error) { // Only retry if still in error state
            loadData();
          }
        }, 5000);
      } else {
        setError("Erreur lors du chargement des documents. Veuillez réessayer.");
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

  const getUploaderName = (uploaderId) => {
    if (employees.length === 0) return "Chargement...";
    const employee = employees.find(e => e.id === uploaderId);
    return employee ? `${employee.first_name} ${employee.last_name}` : "Admin";
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = searchTerm === "" || 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
    
    return matchesSearch && matchesCategory && doc.is_active;
  });

  const categories = ["policy", "handbook", "form", "procedure", "training", "other"];
  
  const stats = {
    total: documents.filter(d => d.is_active).length,
    policies: documents.filter(d => d.category === "policy" && d.is_active).length,
    forms: documents.filter(d => d.category === "form" && d.is_active).length,
    training: documents.filter(d => d.category === "training" && d.is_active).length
  };

  const handleUploadDocument = async (documentData) => {
    try {
      console.log("Tentative de sauvegarde du document:", documentData);
      
      // Validation côté client avant envoi
      if (!documentData.title || !documentData.file_url) {
        throw new Error("Titre et fichier sont obligatoires");
      }

      // Nettoyer les données avant envoi
      const cleanedData = {
        title: documentData.title.trim(),
        description: documentData.description?.trim() || "",
        file_url: documentData.file_url,
        file_type: documentData.file_type || "unknown",
        category: documentData.category || "other",
        uploaded_by: "admin", // Hardcodé pour l'admin
        access_level: documentData.access_level || "all",
        department_filter: documentData.access_level === "department_specific" ? documentData.department_filter : null,
        is_active: true
      };

      console.log("Données nettoyées pour sauvegarde:", cleanedData);

      const newDocument = await Document.create(cleanedData);
      console.log("Document créé avec succès:", newDocument);
      
      setShowUploadModal(false);
      
      // Délai avant rechargement pour éviter les conflits
      setTimeout(() => {
        loadData();
      }, 1000);
      
      toast({
        title: "Succès",
        description: "Document partagé avec succès!",
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
              <AlertTriangle className="w-12 h-12 text-red-600" />
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
              Document Management
            </h1>
            <p className="text-slate-600">
              Organize and share company documents and resources
            </p>
          </div>
          <Button
            onClick={() => setShowUploadModal(true)}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg"
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload Document
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
                  <p className="text-sm font-medium text-slate-600">Policies</p>
                  <p className="text-2xl font-bold text-red-600">{stats.policies}</p>
                </div>
                <Folder className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Forms</p>
                  <p className="text-2xl font-bold text-green-600">{stats.forms}</p>
                </div>
                <Eye className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Training</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.training}</p>
                </div>
                <Download className="w-8 h-8 text-purple-600" />
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
                  placeholder="Search documents..."
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
                  All
                </Button>
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category)}
                    className="h-12 capitalize"
                  >
                    {category}
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
                    uploaderName={getUploaderName(document.uploaded_by)}
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
                          ? "Aucun document n'a encore été uploadé." 
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
        />
      </div>
    </div>
  );
}
