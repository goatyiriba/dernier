import React from 'react';
import EmployeeOfTheWeekManager from '../components/admin/EmployeeOfTheWeekManager';

export default function EmployeeOfTheWeekManagerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-yellow-50 to-orange-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-600 via-orange-600 to-amber-700 rounded-2xl p-8 text-white shadow-2xl">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                🏆 Gestion Employé de la Semaine
              </h1>
              <p className="text-xl text-yellow-100">
                Récompensez l'excellence et motivez votre équipe
              </p>
              <p className="text-yellow-200 mt-2">
                Système avancé de nomination et reconnaissance
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold">⭐</div>
              <p className="text-yellow-200">Excellence</p>
            </div>
          </div>
        </div>

        {/* Composant principal */}
        <EmployeeOfTheWeekManager />
      </div>
    </div>
  );
}