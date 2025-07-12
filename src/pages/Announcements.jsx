
import React, { useState, useEffect } from "react";
import { Announcement, Employee } from "@/api/supabaseEntities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Megaphone, 
  Plus,
  Eye,
  EyeOff,
  AlertTriangle,
  Info,
  CheckCircle,
  RefreshCw, // Added for retry button
  Activity // Added for new design hero section
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast"; // Added for notifications

import AnnouncementCard from "../components/announcements/AnnouncementCard";
import CreateAnnouncementModal from "../components/announcements/CreateAnnouncementModal";

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [readStatuses, setReadStatuses] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null); // Added for error handling
  const { toast } = useToast(); // Added for notifications

  useEffect(() => {
    loadData();
    const intervalId = setInterval(loadData, 15000);
    return () => clearInterval(intervalId);
  }, []);

  const loadData = async () => {
    // For initial load, isLoading is true. For subsequent fetches, it is false.
    // We only want to set isLoading to true on the first run.
    setError(null);
    try {
      const [announcementData, employeeData, readStatusData] = await Promise.all([
        Announcement.list("-created_date"),
        Employee.list(),
        AnnouncementReadStatus.list()
      ]);
      
      setAnnouncements(announcementData);
      setEmployees(employeeData);
      setReadStatuses(readStatusData);
    } catch (err) { // Changed 'error' to 'err' to avoid conflict with state variable
      console.error("Error loading announcements:", err);
      const errorMessage = "A network error occurred. Please check your connection and try again.";
      setError(errorMessage);
      toast({
        title: "Error Loading Data",
        description: "Could not fetch announcements from the server.",
        variant: "destructive",
      });
    } finally {
      // This will run on first load and subsequent loads.
      setIsLoading(false);
    }
  };

  const getAuthorName = (authorId) => {
    const employee = employees.find(e => e.id === authorId);
    return employee ? `${employee.first_name} ${employee.last_name}` : "Admin";
  };

  const getReadersForAnnouncement = (announcementId) => {
    const statuses = readStatuses.filter(rs => rs.announcement_id === announcementId);
    return statuses.map(status => {
      const employee = employees.find(e => e.id === status.employee_id);
      return employee ? { ...employee, read_at: status.read_at } : null;
    }).filter(Boolean);
  };

  const stats = {
    total: announcements.length,
    published: announcements.filter(a => a.is_published).length,
    urgent: announcements.filter(a => a.priority === "urgent" && a.is_published).length,
    expiring: announcements.filter(a => 
      a.expiry_date && new Date(a.expiry_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    ).length
  };

  const handleCreateAnnouncement = async (announcementData) => {
    try {
      await Announcement.create(announcementData);
      setShowCreateModal(false);
      loadData();
      toast({
        title: "Announcement Created!",
        description: "Your new announcement has been successfully published.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error creating announcement:", error);
      toast({
        title: "Failed to Create Announcement",
        description: "There was an error creating the announcement. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTogglePublish = async (announcementId, currentStatus) => {
    try {
      await Announcement.update(announcementId, { is_published: !currentStatus });
      loadData();
      toast({
        title: "Announcement Updated!",
        description: `Announcement has been ${!currentStatus ? 'published' : 'unpublished'}.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating announcement:", error);
      toast({
        title: "Failed to Update Announcement",
        description: "There was an error updating the announcement status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    try {
      await Announcement.delete(announcementId);
      loadData();
      toast({
        title: "Announcement Deleted!",
        description: "The announcement has been successfully deleted.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast({
        title: "Failed to Delete Announcement",
        description: "There was an error deleting the announcement. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* En-tête Hero moderne */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-red-600 to-pink-700 rounded-3xl p-10 text-white shadow-2xl"
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-48 translate-x-48"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">
                Centre d'Annonces
              </h1>
              <p className="text-xl text-orange-100 font-medium mb-4">
                Communication globale et ciblée pour votre organisation
              </p>
              <div className="flex items-center gap-6 text-sm text-orange-100">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4" />
                  <span>{stats.total} annonces totales</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{stats.published} publiées</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{stats.urgent} urgentes</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm px-6 py-3 rounded-xl shadow-lg transition-all duration-300"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nouvelle Annonce
              </Button>
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 justify-center">
                <Activity className="w-4 h-4 mr-2" />
                Système Actif
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Métriques avec design moderne */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Megaphone className="w-8 h-8 text-white" />
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                    Total
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">Total</h3>
                  <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                  <p className="text-xs text-gray-500">Toutes annonces</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Eye className="w-8 h-8 text-white" />
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    Actives
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">Publiées</h3>
                  <p className="text-3xl font-bold text-green-600">{stats.published}</p>
                  <p className="text-xs text-gray-500">Visibles par l'équipe</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-red-50 to-rose-100 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <AlertTriangle className="w-8 h-8 text-white" />
                  </div>
                  <Badge className="bg-red-100 text-red-700 border-red-200 animate-pulse">
                    Urgent
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">Urgentes</h3>
                  <p className="text-3xl font-bold text-red-600">{stats.urgent}</p>
                  <p className="text-xs text-gray-500">Haute priorité</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-100 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Info className="w-8 h-8 text-white" />
                  </div>
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                    Expiration
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">Expirent Bientôt</h3>
                  <p className="text-3xl font-bold text-amber-600">{stats.expiring}</p>
                  <p className="text-xs text-gray-500">Dans 7 jours</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Error Display */}
        {error && !isLoading && (
          <Card className="bg-red-50 border-red-200 shadow-md">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-4">
              <AlertTriangle className="w-10 h-10 text-red-600" />
              <div className="space-y-1">
                <p className="text-lg font-semibold text-red-900">Failed to load announcements</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <Button onClick={() => { setIsLoading(true); loadData(); }} variant="destructive" className="mt-2">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Announcements List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">
            Toutes les Annonces ({announcements.length})
          </h2>
          
          <div className="grid gap-4">
            <AnimatePresence mode="wait">
              {isLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <Card key={i} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-4">
                        <div className="flex justify-between">
                          <div className="space-y-2">
                            <div className="h-4 bg-slate-200 rounded w-48" />
                            <div className="h-3 bg-slate-200 rounded w-32" />
                          </div>
                          <div className="h-6 bg-slate-200 rounded w-20" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : !error ? (
                announcements.map((announcement) => (
                  <AnnouncementCard
                    key={announcement.id}
                    announcement={announcement}
                    authorName={getAuthorName(announcement.author_id)}
                    onTogglePublish={handleTogglePublish}
                    onDelete={handleDeleteAnnouncement}
                    readers={getReadersForAnnouncement(announcement.id)}
                  />
                ))
              ) : null}
            </AnimatePresence>
          </div>
        </div>

        {/* Create Announcement Modal */}
        <CreateAnnouncementModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateAnnouncement}
        />
      </div>
    </div>
  );
}
