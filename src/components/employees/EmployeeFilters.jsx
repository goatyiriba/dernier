import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "../utils/i18n";

export default function EmployeeFilters({
  selectedDepartment,
  selectedStatus,
  onDepartmentChange,
  onStatusChange
}) {
  const { t } = useTranslation();

  const departments = [
    { value: "all", label: "Tous Départements" },
    { value: "Engineering", label: "Engineering" },
    { value: "Marketing", label: "Marketing" },
    { value: "Sales", label: "Sales" },
    { value: "HR", label: "HR" },
    { value: "Finance", label: "Finance" },
    { value: "Operations", label: "Operations" },
    { value: "Design", label: "Design" },
    { value: "Legal", label: "Legal" }
  ];

  const statuses = [
    { value: "all", label: "Tous Statuts" },
    { value: "Active", label: "Actif" },
    { value: "Inactive", label: "Inactif" },
    { value: "On Leave", label: "En Congé" },
    { value: "Terminated", label: "Terminé" }
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Select value={selectedDepartment} onValueChange={onDepartmentChange}>
        <SelectTrigger className="w-full sm:w-48 h-12 rounded-xl border-0 bg-gray-50/80 focus:bg-white hover:bg-white transition-colors duration-200">
          <SelectValue placeholder="Département" />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {departments.map((dept) => (
            <SelectItem 
              key={dept.value} 
              value={dept.value}
              className="cursor-pointer hover:bg-blue-50 transition-colors"
            >
              {dept.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedStatus} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full sm:w-40 h-12 rounded-xl border-0 bg-gray-50/80 focus:bg-white hover:bg-white transition-colors duration-200">
          <SelectValue placeholder="Statut" />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {statuses.map((status) => (
            <SelectItem 
              key={status.value} 
              value={status.value}
              className="cursor-pointer hover:bg-blue-50 transition-colors"
            >
              {status.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}