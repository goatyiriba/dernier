
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Shield,
  User as UserIcon,
  Mail,
  Calendar,
  Crown,
  Trash2
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

export default function AdminCard({ admin, employee, onRevoke }) {
  const isMainAdmin = admin.email === 'syllacloud@gmail.com';
  const displayName = employee ? `${employee.first_name} ${employee.last_name}` : (admin.full_name || admin.email);

  const handleRevoke = () => {
    if (isMainAdmin) {
      alert("Cannot revoke admin privileges from the main administrator account.");
      return;
    }

    if (window.confirm(`Are you sure you want to revoke admin privileges from ${displayName}?`)) {
      onRevoke(admin.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="w-16 h-16 border-4 border-white shadow-lg">
                <AvatarImage src={employee?.profile_picture} />
                <AvatarFallback className={`text-xl font-bold ${
                  isMainAdmin ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white' : 'bg-gradient-to-br from-red-500 to-red-600 text-white'
                }`}>
                  {displayName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              {isMainAdmin && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center">
                  <Crown className="w-3 h-3 text-white" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="space-y-2">
              <h3 className="font-semibold text-slate-900 text-lg">{displayName}</h3>
              <div className="flex items-center justify-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-600">{admin.email}</span>
              </div>

              <div className="flex items-center justify-center gap-2 flex-wrap">
                <Badge className={isMainAdmin ? "bg-purple-100 text-purple-800" : "bg-red-100 text-red-800"}>
                  {isMainAdmin ? (
                    <>
                      <Crown className="w-3 h-3 mr-1" />
                      Main Admin
                    </>
                  ) : (
                    <>
                      <Shield className="w-3 h-3 mr-1" />
                      Administrator
                    </>
                  )}
                </Badge>

                {employee && (
                  <Badge variant="outline" className="text-xs">
                    {employee.department}
                  </Badge>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="w-full space-y-2 text-sm text-slate-600">
              {employee && (
                <div className="flex items-center justify-between">
                  <span>Position:</span>
                  <span className="font-medium">{employee.position}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span>Member since:</span>
                <span className="font-medium">
                  {format(new Date(admin.created_date), 'MMM dd, yyyy')}
                </span>
              </div>

              {admin.last_login && (
                <div className="flex items-center justify-between">
                  <span>Last login:</span>
                  <span className="font-medium">
                    {formatDistanceToNow(new Date(admin.last_login), { addSuffix: true })}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="w-full pt-4 border-t border-slate-100">
              {!isMainAdmin ? (
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRevoke}
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Révoquer Admin
                  </Button>

                  {/* Informations supplémentaires */}
                  <div className="text-xs text-slate-500 italic text-center pt-2">
                    Promu le {format(new Date(admin.created_date), 'dd/MM/yyyy')}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-xs text-slate-500 italic text-center">
                    Administrateur principal du système
                  </div>
                  <div className="text-xs text-slate-500 italic text-center">
                    Privilèges permanents et inaliénables
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
