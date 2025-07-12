
import React, { useState, useEffect } from "react";
import { Employee, LeaveRequest, TimeEntry, Announcement, AuthService } from "@/api/supabaseEntities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Calendar,
  Clock,
  Bell,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Settings,
  BarChart3,
  Activity,
  UserPlus,
  FileText,
  MessageSquare,
  Award,
  DollarSign,
  Target,
  Zap,
  Shield,
  Database,
  Server,
  Globe,
  Wifi,
  WifiOff,
  RefreshCw,
  TestTube,
  Info,
  HelpCircle,
  Settings as SettingsIcon,
  User,
  UserPlus as UserPlusIcon,
  UserMinus,
  UserCheck as UserCheckIcon,
  UserX,
  UsersIcon,
  UserCog,
  UserEdit,
  UserSearch,
  UserTag,
  UserVoice,
  UserShield,
  UserStar,
  UserHeart,
  UserSmile,
  UserFrown,
  UserMeh,
  UserZap,
  UserGear,
  UserKey,
  UserLock,
  UserUnlock,
  UserAlert,
  UserBan,
  UserCheck2,
  UserClock,
  UserCrown,
  UserDollar,
  UserEdit2,
  UserMinus2,
  UserPlus2,
  UserSearch2,
  UserSettings,
  UserStar2,
  UserTag2,
  UserVoice2,
  UserX2,
  UserZap2,
  UserGear2,
  UserKey2,
  UserLock2,
  UserUnlock2,
  UserAlert2,
  UserBan2,
  UserCheck3,
  UserClock2,
  UserCrown2,
  UserDollar2,
  UserEdit3,
  UserMinus3,
  UserPlus3,
  UserSearch3,
  UserSettings2,
  UserStar3,
  UserTag3,
  UserVoice3,
  UserX3,
  UserZap3,
  UserGear3,
  UserKey3,
  UserLock3,
  UserUnlock3,
  UserAlert3,
  UserBan3,
  UserCheck4,
  UserClock3,
  UserCrown3,
  UserDollar3,
  UserEdit4,
  UserMinus4,
  UserPlus4,
  UserSearch4,
  UserSettings3,
  UserStar4,
  UserTag4,
  UserVoice4,
  UserX4,
  UserZap4,
  UserGear4,
  UserKey4,
  UserLock4,
  UserUnlock4,
  UserAlert4,
  UserBan4,
  UserCheck5,
  UserClock4,
  UserCrown4,
  UserDollar4,
  UserEdit5,
  UserMinus5,
  UserPlus5,
  UserSearch5,
  UserSettings4,
  UserStar5,
  UserTag5,
  UserVoice5,
  UserX5,
  UserZap5,
  UserGear5,
  UserKey5,
  UserLock5,
  UserUnlock5,
  UserAlert5,
  UserBan5
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import SupabaseConnectionTest from "@/components/admin/SupabaseConnectionTest";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    pendingLeaveRequests: 0,
    todayTimeEntries: 0,
    recentAnnouncements: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Charger les statistiques
      const [
        employees,
        leaveRequests,
        timeEntries,
        announcements
      ] = await Promise.all([
        Employee.getAll(),
        LeaveRequest.getAll(),
        TimeEntry.getAll(),
        Announcement.getAll()
      ]);

      const today = new Date().toISOString().split('T')[0];
      
      setStats({
        totalEmployees: employees?.length || 0,
        activeEmployees: employees?.filter(emp => emp.status === 'active').length || 0,
        pendingLeaveRequests: leaveRequests?.filter(req => req.status === 'pending').length || 0,
        todayTimeEntries: timeEntries?.filter(entry => entry.date === today).length || 0,
        recentAnnouncements: announcements?.filter(ann => ann.is_published).length || 0
      });

    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du dashboard",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord Administrateur</h1>
          <p className="text-gray-600">Gestion complète de votre organisation</p>
        </div>
        <Button onClick={loadDashboardData} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="employees">Employés</TabsTrigger>
          <TabsTrigger value="system">Système</TabsTrigger>
          <TabsTrigger value="connection">Connexion</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Statistiques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Employés</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalEmployees}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeEmployees} actifs
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Congés en attente</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingLeaveRequests}</div>
                <p className="text-xs text-muted-foreground">
                  Demandes à traiter
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pointages aujourd'hui</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.todayTimeEntries}</div>
                <p className="text-xs text-muted-foreground">
                  Entrées enregistrées
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Annonces actives</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.recentAnnouncements}</div>
                <p className="text-xs text-muted-foreground">
                  Annonces publiées
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Performance</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">98%</div>
                <p className="text-xs text-muted-foreground">
                  Taux de satisfaction
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Actions rapides */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Actions Rapides
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <UserPlus className="w-6 h-6 mb-2" />
                  <span className="text-sm">Ajouter Employé</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Bell className="w-6 h-6 mb-2" />
                  <span className="text-sm">Nouvelle Annonce</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Calendar className="w-6 h-6 mb-2" />
                  <span className="text-sm">Gérer Congés</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <BarChart3 className="w-6 h-6 mb-2" />
                  <span className="text-sm">Rapports</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Gestion des Employés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Gérez vos employés, leurs profils et leurs permissions.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-16 flex-col">
                  <UserPlus className="w-5 h-5 mb-1" />
                  <span className="text-sm">Ajouter un employé</span>
                </Button>
                <Button variant="outline" className="h-16 flex-col">
                  <UserEdit className="w-5 h-5 mb-1" />
                  <span className="text-sm">Modifier les profils</span>
                </Button>
                <Button variant="outline" className="h-16 flex-col">
                  <UserSettings className="w-5 h-5 mb-1" />
                  <span className="text-sm">Gérer les rôles</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuration Système
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Configurez les paramètres système et surveillez les performances.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-16 flex-col">
                  <Shield className="w-5 h-5 mb-1" />
                  <span className="text-sm">Sécurité</span>
                </Button>
                <Button variant="outline" className="h-16 flex-col">
                  <Database className="w-5 h-5 mb-1" />
                  <span className="text-sm">Base de données</span>
                </Button>
                <Button variant="outline" className="h-16 flex-col">
                  <Activity className="w-5 h-5 mb-1" />
                  <span className="text-sm">Monitoring</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connection" className="space-y-6">
          <SupabaseConnectionTest />
        </TabsContent>
      </Tabs>
    </div>
  );
}
