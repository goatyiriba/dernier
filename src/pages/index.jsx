import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Employees from "./Employees";

import LeaveManagement from "./LeaveManagement";

import Performance from "./Performance";

import Onboarding from "./Onboarding";

import AdminDashboard from "./AdminDashboard";

import TimeTracking from "./TimeTracking";

import Announcements from "./Announcements";

import Documents from "./Documents";

import AdminManagement from "./AdminManagement";

import EmployeeDashboard from "./EmployeeDashboard";

import TimeClock from "./TimeClock";

import MyLeave from "./MyLeave";

import EmployeeDocuments from "./EmployeeDocuments";

import EmployeeAnnouncements from "./EmployeeAnnouncements";

import MyProfile from "./MyProfile";

import MyTeam from "./MyTeam";

import DataAdmin from "./DataAdmin";

import PendingApproval from "./PendingApproval";

import EmployeePerformance from "./EmployeePerformance";

import BrandingSettings from "./BrandingSettings";

import SystemMonitoring from "./SystemMonitoring";

import Finance from "./Finance";

import AdminHelp from "./AdminHelp";

import EmployeeHelp from "./EmployeeHelp";

import DeveloperDocs from "./DeveloperDocs";

import Surveys from "./Surveys";

import PublicSurvey from "./PublicSurvey";

import EmployeeSurveys from "./EmployeeSurveys";

import InternalSurvey from "./InternalSurvey";

import ProjectManagement from "./ProjectManagement";

import PlatformCustomizer from "./PlatformCustomizer";

import Messages from "./Messages";

import AdminMessages from "./AdminMessages";

import Events from "./Events";

import CollaborativeCalendar from "./CollaborativeCalendar";

import AdminCalendarTracking from "./AdminCalendarTracking";

import NotificationSettings from "./NotificationSettings";

import home from "./home";

import GamificationAdmin from "./GamificationAdmin";

import Leaderboard from "./Leaderboard";

import EmployeeOfTheWeekManager from "./EmployeeOfTheWeekManager";

// Import des pages d'authentification locale
import LocalLogin from "./LocalLogin";
import LocalUserManagement from "./LocalUserManagement";
import AuthCallback from "@/components/auth/AuthCallback";
import PublicHome from "./PublicHome";

import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { useLocalAuth } from '@/hooks/useLocalAuth';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Employees: Employees,
    
    LeaveManagement: LeaveManagement,
    
    Performance: Performance,
    
    Onboarding: Onboarding,
    
    AdminDashboard: AdminDashboard,
    
    TimeTracking: TimeTracking,
    
    Announcements: Announcements,
    
    Documents: Documents,
    
    AdminManagement: AdminManagement,
    
    EmployeeDashboard: EmployeeDashboard,
    
    TimeClock: TimeClock,
    
    MyLeave: MyLeave,
    
    EmployeeDocuments: EmployeeDocuments,
    
    EmployeeAnnouncements: EmployeeAnnouncements,
    
    MyProfile: MyProfile,
    
    MyTeam: MyTeam,
    
    DataAdmin: DataAdmin,
    
    PendingApproval: PendingApproval,
    
    EmployeePerformance: EmployeePerformance,
    
    BrandingSettings: BrandingSettings,
    
    SystemMonitoring: SystemMonitoring,
    
    Finance: Finance,
    
    AdminHelp: AdminHelp,
    
    EmployeeHelp: EmployeeHelp,
    
    DeveloperDocs: DeveloperDocs,
    
    Surveys: Surveys,
    
    PublicSurvey: PublicSurvey,
    
    EmployeeSurveys: EmployeeSurveys,
    
    InternalSurvey: InternalSurvey,
    
    ProjectManagement: ProjectManagement,
    
    PlatformCustomizer: PlatformCustomizer,
    
    Messages: Messages,
    
    AdminMessages: AdminMessages,
    
    Events: Events,
    
    CollaborativeCalendar: CollaborativeCalendar,
    
    AdminCalendarTracking: AdminCalendarTracking,
    
    NotificationSettings: NotificationSettings,
    
    home: home,
    
    GamificationAdmin: GamificationAdmin,
    
    Leaderboard: Leaderboard,
    
    EmployeeOfTheWeekManager: EmployeeOfTheWeekManager,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Composant de protection des routes
function ProtectedRoute({ children, requiredRole = null }) {
    const { isAuthenticated, hasRole, isLoading } = useLocalAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && !hasRole(requiredRole)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
}

// Composant de redirection basé sur le rôle
function RoleBasedRedirect() {
    const { isAuthenticated, isAdmin } = useLocalAuth();

    if (!isAuthenticated()) {
        return <Navigate to="/home" replace />;
    }

    if (isAdmin()) {
        return <Navigate to="/AdminDashboard" replace />;
    } else {
        return <Navigate to="/Dashboard" replace />;
    }
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                {/* Route racine avec redirection basée sur le rôle */}
                <Route path="/" element={<RoleBasedRedirect />} />
                
                {/* Page d'accueil publique */}
                <Route path="/home" element={<PublicHome />} />
                
                {/* Routes d'authentification locale */}
                <Route path="/login" element={<LocalLogin />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/local-user-management" element={
                    <ProtectedRoute requiredRole="admin">
                        <LocalUserManagement />
                    </ProtectedRoute>
                } />
                
                {/* Routes protégées - Dashboard */}
                <Route path="/Dashboard" element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                } />
                
                <Route path="/AdminDashboard" element={
                    <ProtectedRoute requiredRole="admin">
                        <AdminDashboard />
                    </ProtectedRoute>
                } />
                
                <Route path="/EmployeeDashboard" element={
                    <ProtectedRoute>
                        <EmployeeDashboard />
                    </ProtectedRoute>
                } />
                
                {/* Routes protégées - Gestion des employés */}
                <Route path="/Employees" element={
                    <ProtectedRoute requiredRole="admin">
                        <Employees />
                    </ProtectedRoute>
                } />
                
                <Route path="/Onboarding" element={
                    <ProtectedRoute requiredRole="admin">
                        <Onboarding />
                    </ProtectedRoute>
                } />
                
                <Route path="/MyTeam" element={
                    <ProtectedRoute>
                        <MyTeam />
                    </ProtectedRoute>
                } />
                
                {/* Routes protégées - Gestion des congés */}
                <Route path="/LeaveManagement" element={
                    <ProtectedRoute requiredRole="admin">
                        <LeaveManagement />
                    </ProtectedRoute>
                } />
                
                <Route path="/MyLeave" element={
                    <ProtectedRoute>
                        <MyLeave />
                    </ProtectedRoute>
                } />
                
                <Route path="/PendingApproval" element={
                    <ProtectedRoute requiredRole="admin">
                        <PendingApproval />
                    </ProtectedRoute>
                } />
                
                {/* Routes protégées - Performance */}
                <Route path="/Performance" element={
                    <ProtectedRoute requiredRole="admin">
                        <Performance />
                    </ProtectedRoute>
                } />
                
                <Route path="/EmployeePerformance" element={
                    <ProtectedRoute>
                        <EmployeePerformance />
                    </ProtectedRoute>
                } />
                
                {/* Routes protégées - Suivi du temps */}
                <Route path="/TimeTracking" element={
                    <ProtectedRoute requiredRole="admin">
                        <TimeTracking />
                    </ProtectedRoute>
                } />
                
                <Route path="/TimeClock" element={
                    <ProtectedRoute>
                        <TimeClock />
                    </ProtectedRoute>
                } />
                
                <Route path="/AdminCalendarTracking" element={
                    <ProtectedRoute requiredRole="admin">
                        <AdminCalendarTracking />
                    </ProtectedRoute>
                } />
                
                {/* Routes protégées - Annonces */}
                <Route path="/Announcements" element={
                    <ProtectedRoute requiredRole="admin">
                        <Announcements />
                    </ProtectedRoute>
                } />
                
                <Route path="/EmployeeAnnouncements" element={
                    <ProtectedRoute>
                        <EmployeeAnnouncements />
                    </ProtectedRoute>
                } />
                
                {/* Routes protégées - Documents */}
                <Route path="/Documents" element={
                    <ProtectedRoute requiredRole="admin">
                        <Documents />
                    </ProtectedRoute>
                } />
                
                <Route path="/EmployeeDocuments" element={
                    <ProtectedRoute>
                        <EmployeeDocuments />
                    </ProtectedRoute>
                } />
                
                {/* Routes protégées - Profil */}
                <Route path="/MyProfile" element={
                    <ProtectedRoute>
                        <MyProfile />
                    </ProtectedRoute>
                } />
                
                {/* Routes protégées - Administration */}
                <Route path="/AdminManagement" element={
                    <ProtectedRoute requiredRole="admin">
                        <AdminManagement />
                    </ProtectedRoute>
                } />
                
                <Route path="/DataAdmin" element={
                    <ProtectedRoute requiredRole="admin">
                        <DataAdmin />
                    </ProtectedRoute>
                } />
                
                <Route path="/BrandingSettings" element={
                    <ProtectedRoute requiredRole="admin">
                        <BrandingSettings />
                    </ProtectedRoute>
                } />
                
                <Route path="/SystemMonitoring" element={
                    <ProtectedRoute requiredRole="admin">
                        <SystemMonitoring />
                    </ProtectedRoute>
                } />
                
                {/* Routes protégées - Finance */}
                <Route path="/Finance" element={
                    <ProtectedRoute requiredRole="admin">
                        <Finance />
                    </ProtectedRoute>
                } />
                
                {/* Routes protégées - Aide */}
                <Route path="/AdminHelp" element={
                    <ProtectedRoute requiredRole="admin">
                        <AdminHelp />
                    </ProtectedRoute>
                } />
                
                <Route path="/EmployeeHelp" element={
                    <ProtectedRoute>
                        <EmployeeHelp />
                    </ProtectedRoute>
                } />
                
                <Route path="/DeveloperDocs" element={
                    <ProtectedRoute requiredRole="admin">
                        <DeveloperDocs />
                    </ProtectedRoute>
                } />
                
                {/* Routes protégées - Sondages */}
                <Route path="/Surveys" element={
                    <ProtectedRoute requiredRole="admin">
                        <Surveys />
                    </ProtectedRoute>
                } />
                
                <Route path="/PublicSurvey" element={<PublicSurvey />} />
                
                <Route path="/EmployeeSurveys" element={
                    <ProtectedRoute>
                        <EmployeeSurveys />
                    </ProtectedRoute>
                } />
                
                <Route path="/InternalSurvey" element={
                    <ProtectedRoute requiredRole="admin">
                        <InternalSurvey />
                    </ProtectedRoute>
                } />
                
                {/* Routes protégées - Projets */}
                <Route path="/ProjectManagement" element={
                    <ProtectedRoute requiredRole="admin">
                        <ProjectManagement />
                    </ProtectedRoute>
                } />
                
                {/* Routes protégées - Personnalisation */}
                <Route path="/PlatformCustomizer" element={
                    <ProtectedRoute requiredRole="admin">
                        <PlatformCustomizer />
                    </ProtectedRoute>
                } />
                
                {/* Routes protégées - Messages */}
                <Route path="/Messages" element={
                    <ProtectedRoute>
                        <Messages />
                    </ProtectedRoute>
                } />
                
                <Route path="/AdminMessages" element={
                    <ProtectedRoute requiredRole="admin">
                        <AdminMessages />
                    </ProtectedRoute>
                } />
                
                {/* Routes protégées - Événements */}
                <Route path="/Events" element={
                    <ProtectedRoute requiredRole="admin">
                        <Events />
                    </ProtectedRoute>
                } />
                
                <Route path="/CollaborativeCalendar" element={
                    <ProtectedRoute>
                        <CollaborativeCalendar />
                    </ProtectedRoute>
                } />
                
                {/* Routes protégées - Notifications */}
                <Route path="/NotificationSettings" element={
                    <ProtectedRoute>
                        <NotificationSettings />
                    </ProtectedRoute>
                } />
                
                {/* Routes protégées - Gamification */}
                <Route path="/GamificationAdmin" element={
                    <ProtectedRoute requiredRole="admin">
                        <GamificationAdmin />
                    </ProtectedRoute>
                } />
                
                <Route path="/Leaderboard" element={
                    <ProtectedRoute>
                        <Leaderboard />
                    </ProtectedRoute>
                } />
                
                <Route path="/EmployeeOfTheWeekManager" element={
                    <ProtectedRoute requiredRole="admin">
                        <EmployeeOfTheWeekManager />
                    </ProtectedRoute>
                } />
                
                {/* Route pour les pages non autorisées */}
                <Route path="/unauthorized" element={
                    <div className="min-h-screen flex items-center justify-center">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold mb-4">Accès refusé</h2>
                            <p className="text-gray-600 mb-4">
                                Vous n'avez pas les permissions nécessaires pour accéder à cette page.
                            </p>
                            <button
                                onClick={() => window.history.back()}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                Retour
                            </button>
                        </div>
                    </div>
                } />
                
                {/* Route 404 */}
                <Route path="*" element={
                    <div className="min-h-screen flex items-center justify-center">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold mb-4">Page non trouvée</h2>
                            <p className="text-gray-600 mb-4">
                                La page que vous recherchez n'existe pas.
                            </p>
                            <button
                                onClick={() => window.location.href = '/home'}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                Retour à l'accueil
                            </button>
                        </div>
                    </div>
                } />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}