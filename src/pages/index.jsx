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

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

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

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Employees" element={<Employees />} />
                
                <Route path="/LeaveManagement" element={<LeaveManagement />} />
                
                <Route path="/Performance" element={<Performance />} />
                
                <Route path="/Onboarding" element={<Onboarding />} />
                
                <Route path="/AdminDashboard" element={<AdminDashboard />} />
                
                <Route path="/TimeTracking" element={<TimeTracking />} />
                
                <Route path="/Announcements" element={<Announcements />} />
                
                <Route path="/Documents" element={<Documents />} />
                
                <Route path="/AdminManagement" element={<AdminManagement />} />
                
                <Route path="/EmployeeDashboard" element={<EmployeeDashboard />} />
                
                <Route path="/TimeClock" element={<TimeClock />} />
                
                <Route path="/MyLeave" element={<MyLeave />} />
                
                <Route path="/EmployeeDocuments" element={<EmployeeDocuments />} />
                
                <Route path="/EmployeeAnnouncements" element={<EmployeeAnnouncements />} />
                
                <Route path="/MyProfile" element={<MyProfile />} />
                
                <Route path="/MyTeam" element={<MyTeam />} />
                
                <Route path="/DataAdmin" element={<DataAdmin />} />
                
                <Route path="/PendingApproval" element={<PendingApproval />} />
                
                <Route path="/EmployeePerformance" element={<EmployeePerformance />} />
                
                <Route path="/BrandingSettings" element={<BrandingSettings />} />
                
                <Route path="/SystemMonitoring" element={<SystemMonitoring />} />
                
                <Route path="/Finance" element={<Finance />} />
                
                <Route path="/AdminHelp" element={<AdminHelp />} />
                
                <Route path="/EmployeeHelp" element={<EmployeeHelp />} />
                
                <Route path="/DeveloperDocs" element={<DeveloperDocs />} />
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/Surveys" element={<Surveys />} />
                
                <Route path="/PublicSurvey" element={<PublicSurvey />} />
                
                <Route path="/EmployeeSurveys" element={<EmployeeSurveys />} />
                
                <Route path="/InternalSurvey" element={<InternalSurvey />} />
                
                <Route path="/ProjectManagement" element={<ProjectManagement />} />
                
                <Route path="/PlatformCustomizer" element={<PlatformCustomizer />} />
                
                <Route path="/Messages" element={<Messages />} />
                
                <Route path="/AdminMessages" element={<AdminMessages />} />
                
                <Route path="/Events" element={<Events />} />
                
                <Route path="/CollaborativeCalendar" element={<CollaborativeCalendar />} />
                
                <Route path="/AdminCalendarTracking" element={<AdminCalendarTracking />} />
                
                <Route path="/NotificationSettings" element={<NotificationSettings />} />
                
                <Route path="/home" element={<home />} />
                
                <Route path="/GamificationAdmin" element={<GamificationAdmin />} />
                
                <Route path="/Leaderboard" element={<Leaderboard />} />
                
                <Route path="/EmployeeOfTheWeekManager" element={<EmployeeOfTheWeekManager />} />
                
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