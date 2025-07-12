import React from 'react';
import LocalUserManagement from '@/components/admin/LocalUserManagement';
import { useRequireAuth } from '@/hooks/useLocalAuth';

export default function LocalUserManagementPage() {
  // Require admin role
  useRequireAuth('admin');

  return (
    <div className="container mx-auto p-6">
      <LocalUserManagement />
    </div>
  );
} 