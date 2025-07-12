
import React, { useState, useEffect } from "react";
import { Employee, User, TimeEntry, LeaveRequest, Announcement, Document, Badge, Notification } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge as UIBadge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Database,
  Users,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  Settings
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SupabaseManager from '../components/admin/SupabaseManager';

export default function DataAdmin() {
  const [stats, setStats] = useState({
    employees: 0,
    users: 0,
    timeEntries: 0,
    leaveRequests: 0,
    announcements: 0,
    documents: 0,
    badges: 0,
    notifications: 0
  });
  const [selectedEntity, setSelectedEntity] = useState("employees");
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState("entities"); // New state for tabs
  const { toast } = useToast();

  const entities = {
    employees: { name: "Employees", entity: Employee, icon: Users },
    users: { name: "Users", entity: User, icon: Users },
    timeEntries: { name: "Time Entries", entity: TimeEntry, icon: Database },
    leaveRequests: { name: "Leave Requests", entity: LeaveRequest, icon: Database },
    announcements: { name: "Announcements", entity: Announcement, icon: Database },
    documents: { name: "Documents", entity: Document, icon: Database },
    badges: { name: "Badges", entity: Badge, icon: Database },
    notifications: { name: "Notifications", entity: Notification, icon: Database }
  };

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    // Only load entity data if the "entities" tab is active
    if (activeTab === "entities") {
        loadEntityData();
    }
  }, [selectedEntity, activeTab]); // Add activeTab to dependencies

  const loadStats = async () => {
    try {
      const [
        employeesData,
        usersData,
        timeEntriesData,
        leaveRequestsData,
        announcementsData,
        documentsData,
        badgesData,
        notificationsData
      ] = await Promise.all([
        Employee.list(),
        User.list(),
        TimeEntry.list(),
        LeaveRequest.list(),
        Announcement.list(),
        Document.list(),
        Badge.list(),
        Notification.list()
      ]);

      setStats({
        employees: employeesData.length,
        users: usersData.length,
        timeEntries: timeEntriesData.length,
        leaveRequests: leaveRequestsData.length,
        announcements: announcementsData.length,
        documents: documentsData.length,
        badges: badgesData.length,
        notifications: notificationsData.length
      });
    } catch (error) {
      console.error("Error loading stats:", error);
      toast({
        title: "Error",
        description: "Failed to load database statistics.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadEntityData = async () => {
    setIsLoading(true); // Set loading true when starting to load entity data
    try {
      const entityConfig = entities[selectedEntity];
      if (entityConfig) {
        const entityData = await entityConfig.entity.list("-created_date", 100);
        setData(entityData);
      }
    } catch (error) {
      console.error(`Error loading ${selectedEntity} data:`, error);
      toast({
        title: "Error",
        description: `Failed to load ${selectedEntity} data.`,
        variant: "destructive"
      });
    } finally {
        setIsLoading(false); // Set loading false after data is fetched or error occurs
    }
  };

  const exportData = async () => {
    setIsExporting(true);
    try {
      const entityConfig = entities[selectedEntity];
      const allData = await entityConfig.entity.list();
      
      // Convert to CSV
      if (allData.length === 0) {
        toast({
          title: "No Data",
          description: "No data to export for this entity.",
          variant: "default"
        });
        return;
      }

      const headers = Object.keys(allData[0]);
      const csvContent = [
        headers.join(','),
        ...allData.map(row => 
          headers.map(header => {
            const value = row[header];
            // Escape commas and quotes in CSV
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value || '';
          }).join(',')
        )
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${selectedEntity}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      link.click();

      toast({
        title: "Export Successful",
        description: `${selectedEntity} data exported successfully.`
      });
    } catch (error) {
      console.error("Error exporting data:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export data.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const deleteRecord = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record? This action cannot be undone.")) {
      return;
    }

    try {
      const entityConfig = entities[selectedEntity];
      await entityConfig.entity.delete(id);
      loadEntityData();
      loadStats();
      toast({
        title: "Record Deleted",
        description: "The record has been successfully deleted."
      });
    } catch (error) {
      console.error("Error deleting record:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete the record.",
        variant: "destructive"
      });
    }
  };

  const filteredData = data.filter(item => {
    if (!searchTerm) return true;
    return Object.values(item).some(value => 
      value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const renderValue = (value) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'string' && value.includes('T') && value.includes(':')) {
      // Likely a date
      try {
        return format(new Date(value), 'MMM dd, yyyy HH:mm');
      } catch {
        return value;
      }
    }
    return value.toString();
  };

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Database className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                Data Administration
              </h1>
            </div>
            <p className="text-slate-600">
              Manage and export application data
            </p>
          </div>
          <Button onClick={loadStats} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Stats
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="entities">Entités</TabsTrigger>
            <TabsTrigger value="import">Import/Export</TabsTrigger>
            <TabsTrigger value="backup">Sauvegarde</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="supabase">Supabase</TabsTrigger>
          </TabsList>

          <TabsContent value="entities" className="space-y-6">
            {/* Warning Alert */}
            <Card className="bg-red-50 border-red-200 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <div>
                    <h3 className="font-semibold text-red-900">Administrative Access</h3>
                    <p className="text-sm text-red-700 mt-1">
                      This section provides direct access to application data. Use with extreme caution.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {Object.entries(stats).map(([key, value]) => (
                <Card key={key} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-slate-900">{value}</p>
                    <p className="text-xs text-slate-600 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Entity Selection */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(entities).map(([key, config]) => (
                    <Button
                      key={key}
                      variant={selectedEntity === key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedEntity(key)}
                      className="capitalize"
                    >
                      <config.icon className="w-4 h-4 mr-2" />
                      {config.name}
                    </Button>
                  ))}
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Search records..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={exportData} disabled={isExporting}>
                    <Download className="w-4 h-4 mr-2" />
                    {isExporting ? "Exporting..." : "Export CSV"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Data Table */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {React.createElement(entities[selectedEntity].icon, { className: "w-5 h-5" })}
                    {entities[selectedEntity].name}
                  </div>
                  <UIBadge variant="outline">
                    {filteredData.length} records
                  </UIBadge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-slate-600 mt-2">Loading...</p>
                  </div>
                ) : filteredData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          {Object.keys(filteredData[0]).map(key => (
                            <th key={key} className="text-left p-3 font-medium text-slate-700 capitalize">
                              {key.replace(/_/g, ' ')}
                            </th>
                          ))}
                          <th className="text-right p-3 font-medium text-slate-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.map((item, index) => (
                          <tr key={item.id || index} className="border-b border-slate-100 hover:bg-slate-50">
                            {Object.values(item).map((value, i) => (
                              <td key={i} className="p-3 text-sm text-slate-600">
                                <div className="max-w-xs truncate">
                                  {renderValue(value)}
                                </div>
                              </td>
                            ))}
                            <td className="p-3 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteRecord(item.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Database className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-800">No Data Found</h3>
                    <p className="text-slate-600 mt-2">
                      {searchTerm ? "No records match your search criteria." : "No records available for this entity."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Contents for other sections (currently placeholders) */}
          <TabsContent value="import" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg p-6 text-center text-slate-500">
                  <p>Import/Export functionality coming soon.</p>
              </Card>
          </TabsContent>
          <TabsContent value="backup" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg p-6 text-center text-slate-500">
                  <p>Backup functionality coming soon.</p>
              </Card>
          </TabsContent>
          <TabsContent value="analytics" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg p-6 text-center text-slate-500">
                  <p>Analytics functionality coming soon.</p>
              </Card>
          </TabsContent>

          {/* Nouvel onglet Supabase */}
          <TabsContent value="supabase" className="space-y-6">
            <SupabaseManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
