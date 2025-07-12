import React, { useEffect } from 'react';

// CORRECTION: Suppression complète du tracker automatique
// Ce composant ne fait plus RIEN pour éviter les points automatiques

export default function ActivityTracker() {
  // Plus de gamification automatique - composant inactif
  console.log('🔕 ActivityTracker désactivé - pas de gamification automatique');
  
  return null; // Composant complètement inactif
}