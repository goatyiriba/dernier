import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, MessageCircle, Send, Loader } from "lucide-react";
import { motion } from "framer-motion";
import AvatarGenerator from "../ui/AvatarGenerator";

export default function NewMessageModal({ 
  isOpen, 
  onClose, 
  employees, 
  onSelectEmployee,
  isCreating,
  getConnectionStatus
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [message, setMessage] = useState("");

  const filteredEmployees = employees.filter(emp =>
    `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEmployeeSelect = (employee) => {
    console.log('👤 Employee selected:', employee.first_name, employee.last_name);
    setSelectedEmployee(employee);
  };

  const handleSendMessage = () => {
    if (selectedEmployee && message.trim() && !isCreating) {
      console.log('📤 Sending initial message to:', selectedEmployee.first_name);
      onSelectEmployee(selectedEmployee, message.trim());
      setSelectedEmployee(null);
      setMessage("");
      setSearchTerm("");
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setSelectedEmployee(null);
      setMessage("");
      setSearchTerm("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            Nouvelle conversation
          </DialogTitle>
        </DialogHeader>
        
        {!selectedEmployee ? (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher un employé..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                disabled={isCreating}
              />
            </div>

            {/* Employee list */}
            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => {
                  const connectionStatus = getConnectionStatus(employee);
                  
                  return (
                    <motion.div
                      key={employee.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleEmployeeSelect(employee)}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
                        isCreating 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="relative">
                        <AvatarGenerator
                          firstName={employee.first_name}
                          lastName={employee.last_name}
                          email={employee.email}
                          department={employee.department}
                          profilePicture={employee.profile_picture}
                          size="default"
                          style={employee.avatar_style || 'auto'}
                          className="w-10 h-10"
                        />
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                          connectionStatus?.isOnline ? 'bg-green-500' : 'bg-gray-400'
                        }`}></div>
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {employee.first_name} {employee.last_name}
                        </h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {employee.department}
                          </Badge>
                          <span className={`text-xs ${connectionStatus?.color}`}>
                            {connectionStatus?.status}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {employee.position}
                        </span>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Aucun employé trouvé</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Selected employee */}
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <AvatarGenerator
                firstName={selectedEmployee.first_name}
                lastName={selectedEmployee.last_name}
                email={selectedEmployee.email}
                department={selectedEmployee.department}
                profilePicture={selectedEmployee.profile_picture}
                size="default"
                style={selectedEmployee.avatar_style || 'auto'}
                className="w-10 h-10"
              />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">
                  {selectedEmployee.first_name} {selectedEmployee.last_name}
                </h4>
                <p className="text-sm text-gray-600">{selectedEmployee.department}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedEmployee(null)}
                disabled={isCreating}
              >
                Changer
              </Button>
            </div>

            {/* Message input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Votre message
              </label>
              <Textarea
                placeholder="Écrivez votre message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[100px]"
                disabled={isCreating}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setSelectedEmployee(null)}
                disabled={isCreating}
              >
                Retour
              </Button>
              <Button 
                onClick={handleSendMessage}
                disabled={!message.trim() || isCreating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isCreating ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Envoi...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {isCreating && (
          <div className="text-center text-sm text-gray-500 py-2">
            Création de la conversation en cours...
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}