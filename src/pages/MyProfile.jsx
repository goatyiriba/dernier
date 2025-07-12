
import React, { useState, useEffect } from "react";
import { Employee, AuthService } from "@/api/supabaseEntities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User as UserIcon,
  Save,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Users,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Database,
  Shield,
  Lock,
  Info,
  Trophy,
  Clock,
  Palette
} from "lucide-react";
import { format } from "date-fns";
import BadgeSystem from '../components/gamification/BadgeSystem';
import AvatarGenerator from '../components/ui/AvatarGenerator';
import { UploadFile } from '@/api/integrations';
import AvatarSelector from '../components/ui/AvatarSelector';

export default function MyProfile() {
  const [currentUser, setCurrentUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    start_date: "",
    profile_picture: "",
    skills: [],
    emergency_contact: "",
    address: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [allEmployees, setAllEmployees] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showGamification, setShowGamification] = useState(false);
  const { toast } = useToast();

  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    setIsLoading(true);
    setError(null);
    setDebugInfo(null);

    try {
      console.log('🔄 === DEBUT DIAGNOSTIC PROFILE ===');

      // 1. Récupérer l'utilisateur actuel
      console.log('1️⃣ Récupération utilisateur actuel...');
      let currentUserData = await User.me();
      console.log('👤 Utilisateur trouvé:', {
        id: currentUserData.id,
        email: currentUserData.email,
        full_name: currentUserData.full_name,
        employee_id: currentUserData.employee_id,
        role: currentUserData.role,
        is_active: currentUserData.is_active,
        last_login: currentUserData.last_login,
        created_date: currentUserData.created_date
      });

      setCurrentUser(currentUserData);

      // CORRECTION: Mettre à jour la dernière connexion si elle est vide
      if (!currentUserData.last_login || currentUserData.last_login === 'Jamais') {
        console.log('🔄 Mise à jour de la dernière connexion...');
        try {
          await User.update(currentUserData.id, {
            last_login: new Date().toISOString()
          });
          console.log('✅ Dernière connexion mise à jour');

          // Récupérer les données utilisateur mises à jour
          const updatedUser = await User.me();
          setCurrentUser(updatedUser);
          currentUserData = updatedUser;
          console.log('📊 Utilisateur mis à jour:', {
            last_login: updatedUser.last_login
          });
        } catch (updateError) {
          console.warn('⚠️ Impossible de mettre à jour last_login:', updateError);
        }
      }

      // Déterminer si l'utilisateur est admin
      const userIsAdmin = currentUserData.role === 'admin' || currentUserData.email === 'syllacloud@gmail.com';
      setIsAdmin(userIsAdmin);
      console.log('🔐 Statut admin:', userIsAdmin);

      if (!currentUserData) {
        throw new Error('❌ Utilisateur non authentifié');
      }

      // 2. Récupérer TOUS les employés pour diagnostic
      console.log('2️⃣ Récupération de tous les employés...');
      const allEmployeesData = await Employee.list();
      console.log('👥 Tous les employés dans la base:', allEmployeesData.length);

      setAllEmployees(allEmployeesData);

      // 3. Recherche de l'employé correspondant avec plusieurs stratégies
      console.log('3️⃣ Recherche de l\'employé correspondant...');
      let employeeData = null;
      let searchStrategy = '';

      // Stratégie 1: Par employee_id si disponible
      if (currentUserData.employee_id) {
        console.log('🔍 Stratégie 1: Recherche par employee_id:', currentUserData.employee_id);
        employeeData = allEmployeesData.find(emp => emp.id === currentUserData.employee_id);
        if (employeeData) {
          searchStrategy = 'employee_id';
          console.log('✅ Employé trouvé par employee_id:', employeeData.id);
        }
      }

      // Stratégie 2: Par email si pas trouvé
      if (!employeeData && currentUserData.email) {
        console.log('🔍 Stratégie 2: Recherche par email:', currentUserData.email);
        employeeData = allEmployeesData.find(emp => emp.email === currentUserData.email);
        if (employeeData) {
          searchStrategy = 'email';
          console.log('✅ Employé trouvé par email:', employeeData.id);
        }
      }

      // Stratégie 3: Par nom complet si disponible
      if (!employeeData && currentUserData.full_name) {
        console.log('🔍 Stratégie 3: Recherche par nom complet:', currentUserData.full_name);
        const [firstName, ...lastNameParts] = currentUserData.full_name.split(' ');
        const lastName = lastNameParts.join(' ');

        employeeData = allEmployeesData.find(emp =>
          emp.first_name?.toLowerCase() === firstName?.toLowerCase() &&
          emp.last_name?.toLowerCase() === lastName?.toLowerCase()
        );
        if (employeeData) {
          searchStrategy = 'full_name';
          console.log('✅ Employé trouvé par nom complet:', employeeData.id);
        }
      }

      // 4. Préparer les informations de diagnostic
      const diagnostic = {
        user_info: {
          id: currentUserData.id,
          email: currentUserData.email,
          full_name: currentUserData.full_name,
          employee_id: currentUserData.employee_id,
          role: currentUserData.role,
          is_active: currentUserData.is_active,
          last_login: currentUserData.last_login
        },
        employee_search: {
          strategy_used: searchStrategy,
          found: !!employeeData,
          employee_id: employeeData?.id,
          total_employees: allEmployeesData.length
        },
        suggestions: []
      };

      if (!employeeData) {
        console.log('❌ Aucun employé trouvé avec les stratégies automatiques');

        // Recherche approximative pour suggestions
        const possibleMatches = allEmployeesData.filter(emp => {
          const emailMatch = emp.email && currentUserData.email &&
            emp.email.toLowerCase().includes(currentUserData.email.split('@')[0].toLowerCase());
          const nameMatch = currentUserData.full_name &&
            (emp.first_name?.toLowerCase().includes(currentUserData.full_name.split(' ')[0]?.toLowerCase()) ||
             emp.last_name?.toLowerCase().includes(currentUserData.full_name.split(' ').slice(-1)[0]?.toLowerCase()));
          return emailMatch || nameMatch;
        });

        diagnostic.suggestions = possibleMatches.slice(0, 5).map(emp => ({
          id: emp.id,
          name: `${emp.first_name || ''} ${emp.last_name || ''}`.trim(),
          email: emp.email,
          department: emp.department,
          position: emp.position
        }));

        console.log('💡 Suggestions trouvées:', diagnostic.suggestions.length);
      }

      setDebugInfo(diagnostic);

      if (employeeData) {
        console.log('✅ Configuration du profil employé:', {
          id: employeeData.id,
          name: `${employeeData.first_name} ${employeeData.last_name}`,
          email: employeeData.email,
          department: employeeData.department,
          position: employeeData.position
        });

        setEmployee(employeeData);

        // 4. Remplir le formulaire avec les données de l'employé
        console.log('4️⃣ Remplissage du formulaire...');
        const newFormData = {
          first_name: employeeData.first_name || "",
          last_name: employeeData.last_name || "",
          email: employeeData.email || "",
          phone: employeeData.phone || "",
          position: employeeData.position || "",
          department: employeeData.department || "",
          start_date: employeeData.start_date || "",
          profile_picture: employeeData.profile_picture || "",
          skills: employeeData.skills || [],
          emergency_contact: employeeData.emergency_contact || "",
          address: employeeData.address || ""
        };
        setFormData(newFormData);

        // Mettre à jour la référence employee_id dans User si nécessaire
        if (!currentUserData.employee_id || currentUserData.employee_id !== employeeData.id) {
          console.log('🔗 Mise à jour de la référence employee_id...');
          try {
            await User.update(currentUserData.id, {
              employee_id: employeeData.id
            });
            console.log('✅ Référence employee_id mise à jour');
          } catch (linkError) {
            console.warn('⚠️ Impossible de mettre à jour employee_id:', linkError);
          }
        }

        // Activer la gamification si l'employé est trouvé
        setShowGamification(true);
      } else {
        console.log('❌ Aucun employé correspondant trouvé');
        setShowGamification(false);
      }

      console.log('🔄 === FIN DIAGNOSTIC PROFILE ===');

    } catch (error) {
      console.error('❌ Erreur lors du chargement du profil:', error);
      setError(error.message);

      // Diagnostic d'erreur
      setDebugInfo({
        error: {
          message: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        },
        user_info: currentUser ? {
          id: currentUser.id,
          email: currentUser.email
        } : null
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!employee) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder: aucun profil employé associé",
        variant: "destructive"
      });
      return;
    }

    // CORRECTION: Seuls les admins peuvent sauvegarder les modifications du profil employé
    if (!isAdmin) {
      toast({
        title: "Accès refusé",
        description: "Seuls les administrateurs peuvent modifier le profil employé. Contactez votre responsable RH.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      console.log('💾 Sauvegarde du profil employé...');

      await Employee.update(employee.id, formData);

      console.log('✅ Profil employé sauvegardé avec succès');

      toast({
        title: "Profil mis à jour",
        description: "Les informations employé ont été sauvegardées avec succès",
        duration: 3000,
      });

      // Recharger les données pour confirmation
      await loadProfileData();

    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: "Impossible de sauvegarder les modifications",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // CORRECTION: Fonction pour les employés - rediriger vers la demande de modification
  const requestProfileChange = () => {
    toast({
      title: "Demande de modification",
      description: "Pour modifier vos informations, contactez votre responsable RH ou utilisez le système de demandes.",
      duration: 5000,
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvatarSave = async (avatarData) => {
    if (!employee) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder: aucun profil employé associé",
        variant: "destructive"
      });
      return;
    }

    setIsUploadingPhoto(true);

    try {
      console.log('🎨 Sauvegarde du nouvel avatar...');
      
      // Les données d'avatar contiennent profile_picture et avatar_style
      await Employee.update(employee.id, avatarData);
      console.log('✅ Avatar mis à jour avec succès');
      
      setShowAvatarSelector(false);
      
      toast({
        title: "Avatar mis à jour",
        description: "Votre avatar a été personnalisé avec succès",
        duration: 3000,
      });

      // Recharger les données pour afficher le nouvel avatar
      await loadProfileData();

    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de l\'avatar:', error);
      toast({
        title: "Erreur de sauvegarde d'avatar",
        description: "Impossible de mettre à jour votre avatar.",
        variant: "destructive"
      });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const linkToEmployee = async (selectedEmployeeId) => {
    try {
      console.log('🔗 Liaison avec l\'employé:', selectedEmployeeId);

      // Mettre à jour la référence dans User
      await User.update(currentUser.id, {
        employee_id: selectedEmployeeId
      });

      toast({
        title: "Liaison réussie",
        description: "Votre profil a été lié avec succès",
        duration: 3000,
      });

      // Recharger les données
      await loadProfileData();

    } catch (error) {
      console.error('❌ Erreur liaison employé:', error);
      toast({
        title: "Erreur de liaison",
        description: "Impossible de lier le profil employé",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Chargement du profil
                </h3>
                <p className="text-sm text-gray-500">
                  Récupération de vos informations personnelles...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* En-tête */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Mon Profil</h1>
          <p className="text-gray-600">
            Gérez vos informations personnelles et professionnelles
          </p>
        </div>

        {/* Informations de diagnostic en cas d'erreur */}
        {debugInfo && !employee && (
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800">
                <AlertTriangle className="w-5 h-5" />
                Diagnostic du Profil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Informations utilisateur */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Informations Utilisateur:</h4>
                <div className="bg-white p-3 rounded-lg text-sm space-y-1">
                  <p><strong>Email:</strong> {debugInfo.user_info?.email}</p>
                  <p><strong>Nom:</strong> {debugInfo.user_info?.full_name || 'Non défini'}</p>
                  <p><strong>Rôle:</strong> {debugInfo.user_info?.role}</p>
                  <p><strong>Employee ID:</strong> {debugInfo.user_info?.employee_id || 'Non défini'}</p>
                </div>
              </div>

              {/* Résultat de recherche */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Recherche d'Employé:</h4>
                <div className="bg-white p-3 rounded-lg text-sm">
                  <p><strong>Statut:</strong> {debugInfo.employee_search?.found ? '✅ Trouvé' : '❌ Non trouvé'}</p>
                  {debugInfo.employee_search?.strategy_used && (
                    <p><strong>Méthode:</strong> {debugInfo.employee_search.strategy_used}</p>
                  )}
                  <p><strong>Total employés:</strong> {debugInfo.employee_search?.total_employees}</p>
                </div>
              </div>

              {/* Suggestions */}
              {debugInfo.suggestions && debugInfo.suggestions.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Suggestions de Liaison:</h4>
                  <div className="space-y-2">
                    {debugInfo.suggestions.map((suggestion) => (
                      <div
                        key={suggestion.id}
                        className="bg-white p-3 rounded-lg border flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">{suggestion.name}</p>
                          <p className="text-sm text-gray-600">{suggestion.email}</p>
                          <p className="text-xs text-gray-500">
                            {suggestion.department} • {suggestion.position}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => linkToEmployee(suggestion.id)}
                          className="ml-4"
                        >
                          Lier
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Si vous ne trouvez pas votre profil employé, contactez votre administrateur RH
                  pour qu'il crée votre fiche employé ou corrige les informations.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Profil utilisateur de base */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              Informations Utilisateur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>{currentUser?.email}</span>
                  </div>
                </div>
                <div>
                  <Label>Nom Complet</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <UserIcon className="w-4 h-4 text-gray-500" />
                    <span>{currentUser?.full_name || 'Non défini'}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label>Rôle</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Shield className="w-4 h-4 text-gray-500" />
                    <Badge variant={isAdmin ? "destructive" : "secondary"}>
                      {isAdmin ? 'Administrateur' : 'Employé'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>Dernière Connexion</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>
                      {currentUser?.last_login && currentUser.last_login !== 'Jamais'
                        ? format(new Date(currentUser.last_login), 'dd/MM/yyyy HH:mm')
                        : 'Première connexion'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profil employé si trouvé */}
        {employee && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Profil Employé
                    {!isAdmin && (
                      <Badge variant="secondary" className="ml-2">
                        <Lock className="w-3 h-3 mr-1" />
                        Lecture seule
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {isAdmin ? (
                      <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Sauvegarde...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Sauvegarder
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button onClick={requestProfileChange} variant="outline">
                        <Mail className="w-4 h-4 mr-2" />
                        Demander une modification
                      </Button>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!isAdmin && (
                  <Alert className="mb-6">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Ces informations sont gérées par votre département RH.
                      Vous pouvez cependant modifier votre photo de profil.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-6">
                  {/* Photo de profil avec possibilité de modification pour tous */}
                  <div className="flex flex-col items-center gap-6 p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl">
                    <div className="relative group">
                      {/* Avatar avec preview */}
                      <AvatarGenerator
                        firstName={formData.first_name}
                        lastName={formData.last_name}
                        email={formData.email}
                        department={formData.department}
                        profilePicture={formData.profile_picture}
                        size="2xl"
                        style={employee?.avatar_style || 'auto'}
                        className="ring-4 ring-white ring-offset-4 shadow-2xl group-hover:shadow-3xl transition-shadow duration-300"
                      />

                      {/* Overlay pour changer l'avatar - DISPONIBLE POUR TOUS */}
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/20"
                          onClick={() => setShowAvatarSelector(true)}
                          disabled={isUploadingPhoto}
                        >
                          <Palette className="w-5 h-5" />
                        </Button>
                      </div>

                      {/* Indicateur de upload */}
                      {isUploadingPhoto && (
                        <div className="absolute inset-0 bg-white bg-opacity-80 rounded-full flex items-center justify-center">
                          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
                        </div>
                      )}
                    </div>

                    {/* Informations employé */}
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-gray-900">
                        {formData.first_name} {formData.last_name}
                      </h3>
                      <p className="text-indigo-600 font-medium text-lg">{formData.position}</p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <Badge variant="outline">{formData.department}</Badge>
                        <Badge className={`${employee.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {employee.status}
                        </Badge>
                      </div>
                      {!formData.profile_picture && (
                        <p className="text-xs text-gray-500 mt-2">
                          Avatar généré automatiquement - Style: {employee?.avatar_style || 'auto'}
                        </p>
                      )}
                    </div>

                    {/* Contrôles avatar - DISPONIBLE POUR TOUS LES EMPLOYÉS */}
                    <div className="flex flex-col items-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAvatarSelector(true)}
                        disabled={isUploadingPhoto}
                        className="flex items-center gap-2 bg-white/80 backdrop-blur-sm hover:bg-white"
                      >
                        <Palette className="w-4 h-4" />
                        Personnaliser mon Avatar
                      </Button>

                      <p className="text-xs text-gray-500 text-center max-w-xs">
                        Choisissez parmi nos avatars ou uploadez votre photo personnelle
                      </p>
                    </div>
                  </div>

                  {/* Informations personnelles - Non modifiables sauf pour admin */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <UserIcon className="w-5 h-5" />
                        Informations Personnelles
                        {!isAdmin && (
                          <Badge variant="outline" className="ml-2">
                            <Lock className="w-3 h-3 mr-1" />
                            Géré par RH
                          </Badge>
                        )}
                      </h4>

                      <div className="space-y-3">
                        {/* First Name */}
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <UserIcon className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Prénom</p>
                            <p className="font-medium">{formData.first_name || 'Non défini'}</p>
                          </div>
                        </div>
                        {/* Last Name */}
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <UserIcon className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Nom</p>
                            <p className="font-medium">{formData.last_name || 'Non défini'}</p>
                          </div>
                        </div>
                        {/* Email */}
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">{formData.email}</p>
                          </div>
                        </div>

                        {/* Phone */}
                        {formData.phone && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Téléphone</p>
                              <p className="font-medium">{formData.phone}</p>
                            </div>
                          </div>
                        )}

                        {/* Address */}
                        {formData.address && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Adresse</p>
                              <p className="font-medium">{formData.address}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Informations professionnelles */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Briefcase className="w-5 h-5" />
                        Informations Professionnelles
                        {!isAdmin && (
                          <Badge variant="outline" className="ml-2">
                            <Lock className="w-3 h-3 mr-1" />
                            Géré par RH
                          </Badge>
                        )}
                      </h4>

                      <div className="space-y-3">
                        {/* Position */}
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Briefcase className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Poste</p>
                            <p className="font-medium">{formData.position || 'Non défini'}</p>
                          </div>
                        </div>
                        {/* Department */}
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Users className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Département</p>
                            <p className="font-medium">{formData.department}</p>
                          </div>
                        </div>
                        {/* Start Date */}
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Date de début</p>
                            <p className="font-medium">
                              {formData.start_date ? format(new Date(formData.start_date), 'dd/MM/yyyy') : 'Non définie'}
                            </p>
                          </div>
                        </div>

                        {/* Employee ID */}
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Database className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">ID Employé</p>
                            <p className="font-medium font-mono text-sm">{employee.id}</p>
                          </div>
                        </div>

                        {/* Employment Type */}
                        {employee.employment_type && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Briefcase className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Type d'emploi</p>
                              <p className="font-medium">{employee.employment_type || 'Non défini'}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contact d'urgence - Modifiable uniquement par admin */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Contact d'Urgence
                      {!isAdmin && (
                        <Badge variant="outline" className="ml-2">
                          <Lock className="w-3 h-3 mr-1" />
                          Géré par RH
                        </Badge>
                      )}
                    </h4>
                    {isAdmin ? (
                      <div>
                        <Label htmlFor="emergency_contact">Contact d'Urgence</Label>
                        <Input
                          id="emergency_contact"
                          value={formData.emergency_contact}
                          onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
                          placeholder="ex: Marie Dupont, 06 12 34 56 78, Épouse"
                          className="mt-2"
                        />
                      </div>
                    ) : (
                      <div className="p-4 bg-amber-50 rounded-lg">
                        <p className="text-gray-700">{formData.emergency_contact || 'Non défini'}</p>
                        <p className="text-xs text-amber-600 mt-2">
                          Pour modifier ces informations, contactez votre responsable RH
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Système de gamification */}
            {showGamification && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Mes Réalisations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BadgeSystem employeeId={employee.id} />
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Actions rapides */}
        <Card>
          <CardHeader>
            <CardTitle>Actions Rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <Button variant="outline" onClick={loadProfileData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualiser
              </Button>
              <Button variant="outline" asChild>
                <a href="/EmployeeDashboard">
                  <Database className="w-4 h-4 mr-2" />
                  Tableau de Bord
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/TimeClock">
                  <Clock className="w-4 h-4 mr-2" />
                  Pointeuse
                </a>
              </Button>
              {isAdmin && (
                <Button variant="outline" asChild>
                  <a href="/Employees">
                    <Users className="w-4 h-4 mr-2" />
                    Gestion Employés
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Avatar Selector Modal - ACCESSIBLE À TOUS LES EMPLOYÉS */}
        <AvatarSelector
          isOpen={showAvatarSelector}
          onClose={() => setShowAvatarSelector(false)}
          onSave={handleAvatarSave}
          currentAvatar={formData.profile_picture}
          firstName={formData.first_name}
          lastName={formData.last_name}
          email={formData.email}
          department={formData.department}
          currentStyle={employee?.avatar_style || 'auto'}
          title="Personnaliser votre Avatar"
          uploadFileFunction={UploadFile}
        />
      </div>
    </div>
  );
}
