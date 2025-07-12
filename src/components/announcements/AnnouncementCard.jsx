import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Megaphone, 
  User, 
  Calendar, 
  Eye,
  EyeOff,
  AlertTriangle,
  Info,
  Clock,
  Users as UsersIcon,
  MoreVertical,
  Edit3,
  Trash2
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const priorityColors = {
  low: "bg-slate-100 text-slate-800",
  normal: "bg-blue-100 text-blue-800",
  high: "bg-amber-100 text-amber-800",
  urgent: "bg-red-100 text-red-800"
};

const priorityIcons = {
  low: Info,
  normal: Megaphone,
  high: AlertTriangle,
  urgent: AlertTriangle
};

export default function AnnouncementCard({ announcement, authorName, onTogglePublish, onDelete, readers }) {
  const PriorityIcon = priorityIcons[announcement.priority];
  const isExpired = announcement.expiry_date && new Date(announcement.expiry_date) < new Date();
  const isExpiringSoon = announcement.expiry_date && 
    new Date(announcement.expiry_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const handleDelete = () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.")) {
      onDelete(announcement.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
        announcement.is_published ? '' : 'opacity-70'
      } ${isExpired ? 'opacity-60' : ''}`}>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  announcement.priority === 'urgent' ? 'bg-red-50' : 'bg-blue-50'
                }`}>
                  <PriorityIcon className={`w-5 h-5 ${
                    announcement.priority === 'urgent' ? 'text-red-600' : 'text-blue-600'
                  }`} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg">{announcement.title}</h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge className={priorityColors[announcement.priority]}>
                      {announcement.priority}
                    </Badge>
                    <Badge variant={announcement.is_published ? "default" : "secondary"}>
                      {announcement.is_published ? "Published" : "Draft"}
                    </Badge>
                    {isExpired && (
                      <Badge variant="destructive">Expired</Badge>
                    )}
                    {isExpiringSoon && !isExpired && (
                      <Badge className="bg-amber-100 text-amber-800">Expiring Soon</Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem 
                    onClick={() => onTogglePublish(announcement.id, announcement.is_published)}
                    className={announcement.is_published ? "text-amber-600 focus:text-amber-600 focus:bg-amber-50" : "text-green-600 focus:text-green-600 focus:bg-green-50"}
                  >
                    {announcement.is_published ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-2" />
                        Unpublish
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Publish
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Announcement
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleDelete}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Announcement
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Content */}
            <div className="space-y-3">
              <p className="text-slate-700 leading-relaxed">{announcement.content}</p>
              
              {/* Metadata */}
              <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>By {authorName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Created {format(new Date(announcement.created_date), "MMM d, yyyy")}</span>
                </div>
                {announcement.expiry_date && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Expires {format(new Date(announcement.expiry_date), "MMM d, yyyy")}</span>
                  </div>
                )}
              </div>
              
              {/* Target Audience */}
              {announcement.target_audience !== "all" && (
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Target:</span> {
                      announcement.target_audience === "department_specific" 
                        ? `${announcement.department_filter} Department`
                        : "Role Specific"
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Readers List */}
            {readers && readers.length > 0 && (
              <div className="pt-4 mt-4 border-t">
                 <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <UsersIcon className="w-4 h-4" />
                        <span>Read by {readers.length} employee(s)</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                        {readers.map(reader => (
                          <div key={reader.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={reader.profile_picture} />
                                <AvatarFallback>{reader.first_name?.[0]}{reader.last_name?.[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium text-slate-800">{reader.first_name} {reader.last_name}</p>
                                <p className="text-xs text-slate-500">{reader.position}</p>
                              </div>
                            </div>
                            <p className="text-xs text-slate-500">
                              {format(new Date(reader.read_at), "MMM d, h:mm a")}
                            </p>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}

          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}