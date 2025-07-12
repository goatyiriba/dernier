import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Circle, Wifi, WifiOff, Clock, Moon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const statusConfig = {
  online: {
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    label: 'En ligne',
    icon: Circle,
    animate: 'animate-pulse'
  },
  active: {
    color: 'bg-green-400',
    textColor: 'text-green-600',
    bgColor: 'bg-green-50',
    label: 'Actif',
    icon: Circle,
    animate: ''
  },
  idle: {
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    label: 'Inactif',
    icon: Clock,
    animate: ''
  },
  away: {
    color: 'bg-orange-500',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50',
    label: 'Absent',
    icon: Moon,
    animate: ''
  },
  offline: {
    color: 'bg-gray-400',
    textColor: 'text-gray-600',
    bgColor: 'bg-gray-50',
    label: 'Hors ligne',
    icon: WifiOff,
    animate: ''
  }
};

export default function UserStatusIndicator({ 
  status = 'offline', 
  lastActivity, 
  showLabel = false, 
  showTooltip = true,
  size = 'sm',
  employee = null,
  detailed = false
}) {
  const config = statusConfig[status] || statusConfig.offline;
  const Icon = config.icon;
  
  const sizeClasses = {
    xs: 'w-2 h-2',
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const getLastSeenText = () => {
    if (!lastActivity) return 'Jamais vu';
    
    const lastActivityDate = new Date(lastActivity);
    const now = new Date();
    const diffMinutes = Math.floor((now - lastActivityDate) / (1000 * 60));
    
    if (status === 'online') return 'Maintenant';
    if (diffMinutes < 1) return 'Il y a moins d\'une minute';
    if (diffMinutes < 60) return `Il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    
    return `Vu ${formatDistanceToNow(lastActivityDate, { locale: fr, addSuffix: true })}`;
  };

  const getTooltipContent = () => {
    const content = [
      `Statut: ${config.label}`,
      `Dernière activité: ${getLastSeenText()}`
    ];
    
    if (employee && detailed) {
      content.push(`Employé: ${employee.first_name} ${employee.last_name}`);
      content.push(`Département: ${employee.department}`);
    }
    
    return content.join('\n');
  };

  const StatusComponent = () => (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div 
          className={`${sizeClasses[size]} rounded-full ${config.color} ${config.animate}`}
        />
        {status === 'online' && (
          <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full ${config.color} animate-ping opacity-75`} />
        )}
      </div>
      
      {showLabel && (
        <Badge 
          className={`${config.bgColor} ${config.textColor} border-0 text-xs font-medium`}
        >
          <Icon className="w-3 h-3 mr-1" />
          {config.label}
        </Badge>
      )}
    </div>
  );

  if (!showTooltip) {
    return <StatusComponent />;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">
            <StatusComponent />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm whitespace-pre-line">
            {getTooltipContent()}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}