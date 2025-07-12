import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Upload, RefreshCw, Save } from "lucide-react";

export default function BackupRestore({ settings, onRestore, onBackupCreated }) {
  const handleBackup = () => {
    const backup = {
      timestamp: new Date().toISOString(),
      settings: settings,
      version: '1.0.0'
    };
    
    const dataStr = JSON.stringify(backup, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `platform-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    onBackupCreated?.();
  };

  const handleRestore = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const backup = JSON.parse(e.target.result);
          onRestore(backup.settings);
        } catch (error) {
          console.error('Error restoring backup:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Save className="w-5 h-5 text-blue-500" />
          Sauvegarde & Restauration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleBackup} className="w-full" variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Créer une sauvegarde
        </Button>
        
        <div>
          <input
            type="file"
            accept=".json"
            onChange={handleRestore}
            className="hidden"
            id="restore-backup"
          />
          <Button variant="outline" className="w-full" asChild>
            <label htmlFor="restore-backup" className="cursor-pointer flex items-center justify-center">
              <Upload className="w-4 h-4 mr-2" />
              Restaurer une sauvegarde
            </label>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}