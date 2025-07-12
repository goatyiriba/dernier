
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, X, Check, AlertCircle, Smartphone, Share2, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/api/supabaseClient";

// Fonction d'upload de fichier pour Supabase
const uploadFile = async (file, path) => {
  const { data, error } = await supabase.storage
    .from('documents')
    .upload(path, file);
  
  if (error) throw error;
  return data;
};

// The 'departments' array is no longer used for access level selection, as it's replaced by specific employee assignment.
// const departments = ["Engineering", "Marketing", "Sales", "HR", "Finance", "Operations", "Design", "Legal"];

export default function UploadDocumentModal({ 
  isOpen, 
  onClose, 
  onSave, 
  isEmployee = false, 
  employeeName = "",
  editingDocument = null 
}) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "other",
    access_level: "all",
    file_url: "",
    file_type: "",
    file_size: 0,
    uploaded_by: "current_user",
    is_active: true,
    version: "",
    app_package: "",
    app_version_code: "",
    comments: "",
    install_instructions: "",
    tags: [],
    assigned_employees: []
  });
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newTag, setNewTag] = useState("");
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [employeesLoaded, setEmployeesLoaded] = useState(false);

  // Initialiser avec les données d'édition ou réinitialiser pour un nouveau document
  useEffect(() => {
    if (isOpen) {
      if (editingDocument) {
        setFormData({
          title: editingDocument.title || "",
          description: editingDocument.description || "",
          category: editingDocument.category || "other",
          access_level: editingDocument.access_level || "all",
          file_url: editingDocument.file_url || "",
          file_type: editingDocument.file_type || "",
          file_size: editingDocument.file_size || 0,
          uploaded_by: editingDocument.uploaded_by || "current_user",
          is_active: editingDocument.is_active !== false,
          version: editingDocument.version || "",
          app_package: editingDocument.app_package || "",
          app_version_code: editingDocument.app_version_code || "",
          comments: editingDocument.comments || "",
          install_instructions: editingDocument.install_instructions || "",
          tags: editingDocument.tags || [],
          assigned_employees: editingDocument.assigned_employees || []
        });
        // If editing a document with a file_url, set selectedFile to simulate it exists
        if (editingDocument.file_url) {
            setSelectedFile({
                name: editingDocument.title || 'fichier', // Fallback name
                size: editingDocument.file_size || 0,
                type: editingDocument.file_type || '',
            });
        }
      } else {
        // Reset for a new document
        handleReset(); // Use handleReset for full reset
      }
      setEmployeesLoaded(false); // Reset employee loaded status when modal opens
    }
  }, [editingDocument, isOpen]);

  // Charger les employés quand le niveau d'accès change ou le modal s'ouvre pour des employés spécifiques
  useEffect(() => {
    if (isOpen && formData.access_level === "specific_employees" && !employeesLoaded) {
      loadAvailableEmployees();
    }
  }, [isOpen, formData.access_level, employeesLoaded]);

  const loadAvailableEmployees = async () => {
    setIsLoadingEmployees(true);
    try {
      console.log("Chargement des employés...");
      
      let EmployeeModule;
      try {
        // Try dynamic import from '@/api/supabaseEntities'
        EmployeeModule = await import('@/api/supabaseEntities');
      } catch (e) {
        console.warn("Failed to import from '@/api/supabaseEntities', trying '@/api/integrations'", e);
        // Fallback to '@/api/integrations' if the new path fails
        EmployeeModule = await import('@/api/integrations');
      }

      const Employee = EmployeeModule.Employee;
      
      const employees = await Employee.list();
      
      console.log("Employés récupérés:", employees?.length || 0);
      
      if (employees && employees.length > 0) {
        setAvailableEmployees(employees);
        setEmployeesLoaded(true);
        console.log("Employés chargés avec succès:", employees.length);
      } else {
        console.warn("Aucun employé trouvé via Employee.list()");
        setAvailableEmployees([]);
        toast({
          title: "Information",
          description: "Aucun employé trouvé dans la base de données via l'API",
          variant: "default"
        });
      }
    } catch (error) {
      console.error("Erreur lors du chargement des employés via Employee.list:", error);
      
      // Fallback to /api/employees endpoint
      try {
        console.log("Tentative de chargement des employés via /api/employees...");
        const response = await fetch('/api/employees');
        if (response.ok) {
          const employees = await response.json();
          setAvailableEmployees(employees || []);
          setEmployeesLoaded(true);
          console.log("Employés chargés via /api/employees:", employees.length);
          if (employees.length === 0) {
              toast({
                title: "Information",
                description: "Aucun employé trouvé via l'API /api/employees",
                variant: "default"
              });
          }
        } else {
          throw new Error(`API call to /api/employees failed with status: ${response.status}`);
        }
      } catch (fallbackError) {
        console.error("Erreur fallback (API /api/employees):", fallbackError);
        setAvailableEmployees([]);
        toast({
          title: "Erreur",
          description: "Impossible de charger la liste des employés. Veuillez réessayer.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  // Fonction pour actualiser la liste des employés
  const refreshEmployees = () => {
    setEmployeesLoaded(false);
    setAvailableEmployees([]);
    loadAvailableEmployees();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier la taille du fichier (max 50MB pour les APK)
      const maxSize = file.name.toLowerCase().endsWith('.apk') ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({
          title: "Fichier trop volumineux",
          description: `La taille maximale autorisée est de ${maxSize / (1024 * 1024)}MB`,
          variant: "destructive"
        });
        return;
      }

      setSelectedFile(file);
      
      // Auto-remplir les champs basés sur le fichier
      const fileName = file.name.split('.')[0];
      const fileExtension = file.name.split('.').pop().toLowerCase();
      
      let category = formData.category;
      if (fileExtension === "apk") {
        category = "mobile_app";
      } else if (["pdf", "doc", "docx"].includes(fileExtension)) {
        if (category === "other" || ["policy", "handbook", "form", "procedure", "training"].includes(category)) {
          category = "form";
        }
      }
      
      setFormData(prev => ({
        ...prev,
        title: prev.title || fileName,
        file_type: fileExtension,
        file_size: file.size,
        category: category
      }));

      // Upload automatique du fichier
      handleUploadFile(file);
    }
  };

  const handleUploadFile = async (file) => {
    if (!file) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Simulation du progrès d'upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const path = `uploads/${Date.now()}-${file.name}`;
      const { data } = await uploadFile(file, path);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setFormData(prev => ({
        ...prev,
        file_url: data.publicUrl,
        file_type: file.type || file.name.split('.').pop().toLowerCase(),
        file_size: file.size
      }));

      toast({
        title: "Fichier uploadé",
        description: "Le fichier a été uploadé avec succès",
      });

    } catch (error) {
      console.error("Erreur upload:", error);
      toast({
        title: "Erreur d'upload",
        description: "Impossible d'uploader le fichier. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation des champs obligatoires
    if (!formData.title.trim()) {
      toast({
        title: "Champ obligatoire",
        description: "Le titre est obligatoire",
        variant: "destructive"
      });
      return;
    }

    // Only require file_url if creating a new document or editing an existing one without a file_url
    if (!formData.file_url && !editingDocument?.file_url) {
      toast({
        title: "Fichier manquant",
        description: "Veuillez sélectionner et uploader un fichier",
        variant: "destructive"
      });
      return;
    }

    // Validation spécifique pour les APK
    const isAPK = formData.file_type === "apk" || formData.category === "mobile_app";
    if (isAPK && !formData.version.trim()) {
      toast({
        title: "Version requise",
        description: "Veuillez spécifier la version de l'application",
        variant: "destructive"
      });
      return;
    }
    
    // Validation for specific employees access level
    if (formData.access_level === "specific_employees" && (!formData.assigned_employees || formData.assigned_employees.length === 0)) {
      toast({
        title: "Assignation requise",
        description: "Veuillez assigner au moins un employé pour ce niveau d'accès",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Préparer les données pour la sauvegarde
      const documentData = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        comments: formData.comments.trim(),
        install_instructions: formData.install_instructions.trim(),
        uploaded_by: formData.uploaded_by || "system",
        // Convert app_version_code to number if present
        app_version_code: formData.app_version_code ? parseInt(formData.app_version_code, 10) : null,
        tags: formData.tags.filter(tag => tag.trim() !== "")
      };

      // Remove assigned_employees if access level is not specific_employees
      if (documentData.access_level !== "specific_employees") {
          delete documentData.assigned_employees;
      }
      // Remove department_filter explicitly if it somehow persisted (it's removed from state now)
      delete documentData.department_filter;


      console.log("Données document à sauvegarder:", documentData);

      await onSave(documentData);
      
      // Reset du formulaire après succès
      handleReset();
      
      toast({
        title: "Document sauvegardé",
        description: "Le document a été partagé avec succès",
      });

    } catch (error) {
      console.error("Erreur sauvegarde document:", error);
      toast({
        title: "Erreur de sauvegarde",
        description: "Impossible de sauvegarder le document. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      title: "",
      description: "",
      category: "other",
      access_level: "all",
      file_url: "",
      file_type: "",
      file_size: 0,
      uploaded_by: "current_user",
      is_active: true,
      version: "",
      app_package: "",
      app_version_code: "",
      comments: "",
      install_instructions: "",
      tags: [],
      assigned_employees: []
    });
    setSelectedFile(null);
    setUploadProgress(0);
    setNewTag("");
    setAvailableEmployees([]);
    setEmployeesLoaded(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Réinitialiser la liste des employés assignés si on change le niveau d'accès
    if (field === 'access_level' && value !== 'specific_employees') {
      setFormData(prev => ({
        ...prev,
        assigned_employees: []
      }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const isAPK = formData.file_type === "apk" || formData.category === "mobile_app";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Upload className="w-5 h-5" />
            {editingDocument ? "Modifier le Document" : (isEmployee ? "Partager un Document" : "Uploader un Document")}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Upload de fichier */}
            <div className="space-y-2">
              <Label htmlFor="file">Fichier Document {editingDocument && formData.file_url ? "" : "*"}</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                {!selectedFile && !editingDocument?.file_url ? (
                  <div>
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Cliquez pour sélectionner un fichier ou glissez-déposez
                    </p>
                    <p className="text-xs text-gray-400">
                      PDF, DOC, DOCX, TXT, XLS, XLSX, PPT, PPTX, APK (max {isAPK ? "50" : "10"}MB)
                    </p>
                    <Input
                      id="file"
                      type="file"
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.ppt,.pptx,.apk"
                      className="hidden"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="mt-3"
                      onClick={() => document.getElementById('file').click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Sélectionner un fichier
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-3">
                      {isAPK ? (
                        <Smartphone className="w-8 h-8 text-green-600" />
                      ) : (
                        <FileText className="w-8 h-8 text-blue-600" />
                      )}
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{selectedFile?.name || editingDocument?.title || "Fichier existant"}</p>
                        <p className="text-sm text-gray-500">
                          {selectedFile?.size ? (selectedFile.size / 1024 / 1024).toFixed(2) : (editingDocument?.file_size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        {editingDocument?.file_url && !selectedFile && (
                          <p className="text-xs text-gray-500 italic">Fichier déjà uploadé</p>
                        )}
                      </div>
                      {formData.file_url && (
                        <Check className="w-6 h-6 text-green-600" />
                      )}
                    </div>
                    
                    {isUploading && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    )}
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedFile(null);
                        setFormData(prev => ({ ...prev, file_url: "", file_type: "", file_size: 0 }));
                      }}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Changer de fichier
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Titre */}
            <div className="space-y-2">
              <Label htmlFor="title">Titre du Document *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Entrez le titre du document"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Description du document (optionnelle)"
                rows={3}
              />
            </div>

            {/* Commentaires de partage */}
            <div className="space-y-2">
              <Label htmlFor="comments">Commentaires de Partage</Label>
              <Textarea
                id="comments"
                value={formData.comments}
                onChange={(e) => handleInputChange('comments', e.target.value)}
                placeholder="Ajoutez des commentaires sur ce document (recommandations, notes d'utilisation, etc.)"
                rows={3}
              />
            </div>

            {/* Catégorie et Version pour APK */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="policy">Politique</SelectItem>
                    <SelectItem value="handbook">Manuel</SelectItem>
                    <SelectItem value="form">Formulaire</SelectItem>
                    <SelectItem value="procedure">Procédure</SelectItem>
                    <SelectItem value="training">Formation</SelectItem>
                    <SelectItem value="mobile_app">Application Mobile</SelectItem>
                    <SelectItem value="software">Logiciel</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isAPK && (
                <div className="space-y-2">
                  <Label htmlFor="version">Version de l'Application *</Label>
                  <Input
                    id="version"
                    value={formData.version}
                    onChange={(e) => handleInputChange('version', e.target.value)}
                    placeholder="ex: 1.2.3"
                    required={isAPK}
                  />
                </div>
              )}
            </div>

            {/* Champs spécifiques aux APK */}
            {isAPK && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="app_package">Package de l'Application</Label>
                    <Input
                      id="app_package"
                      value={formData.app_package}
                      onChange={(e) => handleInputChange('app_package', e.target.value)}
                      placeholder="com.exemple.monapp"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="app_version_code">Code de Version</Label>
                    <Input
                      id="app_version_code"
                      type="number"
                      value={formData.app_version_code}
                      onChange={(e) => handleInputChange('app_version_code', e.target.value)}
                      placeholder="ex: 123"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="install_instructions">Instructions d'Installation</Label>
                  <Textarea
                    id="install_instructions"
                    value={formData.install_instructions}
                    onChange={(e) => handleInputChange('install_instructions', e.target.value)}
                    placeholder="Instructions pour installer l'application (autoriser sources inconnues, etc.)"
                    rows={3}
                  />
                </div>
              </>
            )}

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2 flex-wrap mb-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Ajouter un tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Ajouter
                </Button>
              </div>
            </div>

            <Separator />

            {/* Niveau d'accès - Modification pour assignation par employé */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="access_level">Niveau d'accès</Label>
                <Select
                  value={formData.access_level}
                  onValueChange={(value) => handleInputChange('access_level', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les employés</SelectItem>
                    <SelectItem value="specific_employees">Employés spécifiques</SelectItem>
                    <SelectItem value="department_specific">Département spécifique</SelectItem>
                    {!isEmployee && <SelectItem value="admin_only">Admin uniquement</SelectItem>}
                  </SelectContent>
                </Select>
              </div>

              {formData.access_level === "specific_employees" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Employés Assignés</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={refreshEmployees}
                      disabled={isLoadingEmployees}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingEmployees ? 'animate-spin' : ''}`} />
                      Actualiser
                    </Button>
                  </div>
                  
                  {isLoadingEmployees ? (
                    <div className="flex items-center justify-center p-6 text-gray-500 bg-gray-50 rounded-lg">
                      <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mr-3"></div>
                      Chargement des employés...
                    </div>
                  ) : availableEmployees.length === 0 ? (
                    <div className="text-center py-6 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-3">Aucun employé disponible</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={refreshEmployees}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Réessayer
                      </Button>
                    </div>
                  ) : (
                    <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                      <div className="p-3 space-y-2">
                        {availableEmployees.map(emp => (
                          <label key={emp.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.assigned_employees?.includes(emp.id) || false}
                              onChange={(e) => {
                                const currentAssigned = formData.assigned_employees || [];
                                if (e.target.checked) {
                                  handleInputChange('assigned_employees', [...currentAssigned, emp.id]);
                                } else {
                                  handleInputChange('assigned_employees', currentAssigned.filter(id => id !== emp.id));
                                }
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 text-sm">
                                {emp.first_name} {emp.last_name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {emp.department} • {emp.position}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {formData.assigned_employees && formData.assigned_employees.length > 0 && (
                    <p className="text-sm text-blue-600">
                      {formData.assigned_employees.length} employé(s) sélectionné(s)
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Aperçu des paramètres - Mise à jour pour assignation */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Aperçu du Partage</h4>
              <div className="space-y-1 text-sm text-blue-700">
                <p><strong>Partagé par:</strong> {employeeName || "Vous"}</p>
                <p><strong>Titre:</strong> {formData.title || "Non défini"}</p>
                <p><strong>Type:</strong> {isAPK ? "Application Mobile APK" : "Document"}</p>
                <p><strong>Catégorie:</strong> {formData.category}</p>
                {isAPK && formData.version && <p><strong>Version:</strong> {formData.version}</p>}
                <p><strong>Accès:</strong> {
                  formData.access_level === "all" ? "Tous les employés" :
                  formData.access_level === "specific_employees" ? 
                    `${formData.assigned_employees?.length || 0} employé(s) assigné(s)` :
                  formData.access_level === "department_specific" ? "Département spécifique" :
                  "Administrateurs seulement"
                }</p>
                <p><strong>Fichier:</strong> {selectedFile?.name || editingDocument?.title || "Aucun fichier sélectionné"}</p>
                {isAPK && (
                  <p className="text-green-700">
                    <strong>Note:</strong> Les applications APK sont automatiquement validées et visibles par les assignés.
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={
                isSubmitting || 
                isUploading || 
                (!formData.file_url && !editingDocument?.file_url) ||
                !formData.title.trim() || 
                (isAPK && !formData.version.trim()) || 
                (formData.access_level === "specific_employees" && (!formData.assigned_employees || formData.assigned_employees.length === 0))
              }
              className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 mr-2" />
                  {editingDocument ? "Enregistrer les modifications" : "Partager le Document"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
