import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Couleurs d'avatar basées sur les départements
const DEPARTMENT_COLORS = {
  Engineering: 'from-blue-500 to-indigo-600',
  Marketing: 'from-pink-500 to-rose-500',
  Sales: 'from-green-500 to-emerald-600',
  HR: 'from-purple-500 to-violet-600',
  Finance: 'from-yellow-500 to-orange-500',
  Operations: 'from-gray-500 to-slate-600',
  Design: 'from-indigo-500 to-purple-600',
  Legal: 'from-slate-600 to-gray-700'
};

// Couleurs alternatives basées sur les initiales
const INITIAL_COLORS = [
  'from-red-500 to-red-600',
  'from-blue-500 to-blue-600',
  'from-green-500 to-green-600',
  'from-yellow-500 to-yellow-600',
  'from-purple-500 to-purple-600',
  'from-pink-500 to-pink-600',
  'from-indigo-500 to-indigo-600',
  'from-teal-500 to-teal-600',
  'from-orange-500 to-orange-600',
  'from-cyan-500 to-cyan-600'
];

// Collections d'avatars de visages réalistes
export const AVATAR_COLLECTIONS = {
  men_professional: {
    name: 'Hommes Professionnels',
    description: 'Avatars masculins en tenue professionnelle',
    avatars: [
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face'
    ]
  },
  women_professional: {
    name: 'Femmes Professionnelles',
    description: 'Avatars féminins en tenue professionnelle',
    avatars: [
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1507101105822-7472b28e22ac?w=400&h=400&fit=crop&crop=face'
    ]
  },
  auto: {
    name: 'Automatique',
    description: 'Sélection automatique basée sur le nom',
    avatars: []
  }
};

// Fonction pour générer une couleur basée sur le nom
const getColorFromName = (firstName, lastName, department) => {
  if (department && DEPARTMENT_COLORS[department]) {
    return DEPARTMENT_COLORS[department];
  }
  
  const name = `${firstName || ''}${lastName || ''}`.toLowerCase();
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % INITIAL_COLORS.length;
  return INITIAL_COLORS[index];
};

// Fonction pour générer des initiales propres
const getInitials = (firstName, lastName, email) => {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
  
  if (firstName) {
    return firstName.slice(0, 2).toUpperCase();
  }
  
  if (lastName) {
    return lastName.slice(0, 2).toUpperCase();
  }
  
  if (email) {
    const emailPart = email.split('@')[0];
    return emailPart.slice(0, 2).toUpperCase();
  }
  
  return 'US';
};

// Fonction pour sélectionner un avatar automatiquement
const getAutoAvatar = (firstName, lastName, email) => {
  const name = `${firstName || ''}${lastName || ''}${email || ''}`.toLowerCase();
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Choisir une collection basée sur le hash
  const collections = [
    ...AVATAR_COLLECTIONS.men_professional.avatars,
    ...AVATAR_COLLECTIONS.women_professional.avatars
  ];
  
  if (collections.length === 0) return null;
  
  const index = Math.abs(hash) % collections.length;
  return collections[index];
};

export default function AvatarGenerator({ 
  firstName, 
  lastName, 
  email, 
  department, 
  profilePicture, 
  size = "default",
  showBorder = true,
  className = "",
  onClick = null,
  style = "auto"
}) {
  const initials = getInitials(firstName, lastName, email);
  const gradientColor = getColorFromName(firstName, lastName, department);
  
  // Tailles d'avatar
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    default: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-lg",
    xl: "w-24 h-24 text-2xl",
    "2xl": "w-32 h-32 text-4xl"
  };
  
  const borderClass = showBorder ? "ring-2 ring-white ring-offset-2" : "";
  const cursorClass = onClick ? "cursor-pointer hover:scale-105 transition-transform" : "";
  
  // Déterminer l'image à afficher
  let avatarSrc = profilePicture;
  
  // Si pas de photo personnalisée et style auto, générer un avatar
  if (!profilePicture && style === 'auto') {
    avatarSrc = getAutoAvatar(firstName, lastName, email);
  }
  
  // Si une collection spécifique est demandée
  if (!profilePicture && style !== 'auto' && AVATAR_COLLECTIONS[style]) {
    const collection = AVATAR_COLLECTIONS[style];
    if (collection.avatars.length > 0) {
      const name = `${firstName || ''}${lastName || ''}${email || ''}`.toLowerCase();
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      const index = Math.abs(hash) % collection.avatars.length;
      avatarSrc = collection.avatars[index];
    }
  }
  
  return (
    <Avatar 
      className={`${sizeClasses[size]} ${borderClass} ${cursorClass} ${className}`}
      onClick={onClick}
    >
      <AvatarImage src={avatarSrc} alt={`${firstName} ${lastName}`} />
      <AvatarFallback 
        className={`bg-gradient-to-br ${gradientColor} text-white font-semibold`}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

// Composant spécial pour les employés avec gestion d'avatar plus avancée
export function EmployeeAvatar({ employee, size = "default", showStatus = false, onClick = null }) {
  return (
    <div className="relative">
      <AvatarGenerator
        firstName={employee?.first_name}
        lastName={employee?.last_name}
        email={employee?.email}
        department={employee?.department}
        profilePicture={employee?.profile_picture}
        size={size}
        style={employee?.avatar_style || 'auto'}
        onClick={onClick}
      />
      {showStatus && (
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>
      )}
    </div>
  );
}