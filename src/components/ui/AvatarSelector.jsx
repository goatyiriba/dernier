import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { 
  Upload, 
  Users, 
  Download, 
  UserCheck,
  Camera,
  Sparkles,
  CheckCircle,
  RefreshCw,
  Shuffle
} from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { AVATAR_COLLECTIONS } from './AvatarGenerator';
import { UploadFile } from '@/api/integrations';

export default function AvatarSelector({ 
  isOpen, 
  onClose, 
  onSave,
  currentAvatar = "",
  firstName = "",
  lastName = "",
  email = "",
  department = "",
  currentStyle = "auto",
  title = "Choisir un Avatar"
}) {
  const [selectedTab, setSelectedTab] = useState('gallery');
  const [selectedCollection, setSelectedCollection] = useState('men_professional');
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedPreview, setUploadedPreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedOption, setSelectedOption] = useState(currentAvatar ? 'current' : 'gallery');
  const { toast } = useToast();

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Erreur",
          description: "Veuillez sélectionner un fichier image valide",
          variant: "destructive"
        });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Erreur", 
          description: "Le fichier est trop volumineux (max 5MB)",
          variant: "destructive"
        });
        return;
      }
      
      setUploadedFile(file);
      setUploadedPreview(URL.createObjectURL(file));
      setSelectedOption('upload');
      setSelectedTab('upload');
    }
  };

  const handleRandomSelection = () => {
    const currentCollection = AVATAR_COLLECTIONS[selectedCollection];
    if (currentCollection && currentCollection.avatars.length > 0) {
      const randomIndex = Math.floor(Math.random() * currentCollection.avatars.length);
      const randomAvatar = currentCollection.avatars[randomIndex];
      setSelectedAvatar(randomAvatar);
      setSelectedOption('gallery');
      
      toast({
        title: "Avatar aléatoire sélectionné",
        description: "Un nouveau visage a été choisi pour vous !",
      });
    }
  };

  const handleSave = async () => {
    setIsUploading(true);
    
    try {
      let finalAvatarUrl = "";
      let finalStyle = selectedCollection;
      
      if (selectedOption === 'upload' && uploadedFile) {
        // Upload du fichier
        const { file_url } = await UploadFile({ file: uploadedFile });
        finalAvatarUrl = file_url;
        finalStyle = "custom";
      } else if (selectedOption === 'gallery' && selectedAvatar) {
        // Avatar sélectionné de la galerie
        finalAvatarUrl = selectedAvatar;
        finalStyle = selectedCollection;
      } else if (selectedOption === 'current') {
        // Garder l'avatar actuel
        finalAvatarUrl = currentAvatar;
        finalStyle = currentStyle;
      }
      
      await onSave({
        profile_picture: finalAvatarUrl,
        avatar_style: finalStyle
      });
      
      toast({
        title: "Avatar mis à jour",
        description: "Votre avatar a été mis à jour avec succès",
      });
      
      onClose();
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder l'avatar",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
            <Users className="w-6 h-6" />
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setSelectedTab('gallery')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                selectedTab === 'gallery' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-4 h-4 mr-2 inline" />
              Galerie d'Avatars
            </button>
            <button
              onClick={() => setSelectedTab('upload')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                selectedTab === 'upload' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Upload className="w-4 h-4 mr-2 inline" />
              Photo Personnelle
            </button>
          </div>

          <AnimatePresence mode="wait">
            {selectedTab === 'gallery' && (
              <motion.div
                key="gallery"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Avatar actuel */}
                {currentAvatar && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      Avatar Actuel
                    </h3>
                    <div className="flex items-center gap-4">
                      <img 
                        src={currentAvatar} 
                        alt="Avatar actuel" 
                        className="w-16 h-16 rounded-full ring-2 ring-blue-200 object-cover"
                      />
                      <div>
                        <p className="font-medium">Votre avatar actuel</p>
                        <p className="text-sm text-gray-600">
                          Collection: {AVATAR_COLLECTIONS[currentStyle]?.name || 'Personnalisé'}
                        </p>
                      </div>
                      <Button
                        variant={selectedOption === 'current' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedOption('current')}
                      >
                        {selectedOption === 'current' ? 'Sélectionné' : 'Conserver'}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Sélecteur de collection */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      Collections d'Avatars
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRandomSelection}
                      className="flex items-center gap-2"
                    >
                      <Shuffle className="w-4 h-4" />
                      Aléatoire
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                    {Object.entries(AVATAR_COLLECTIONS).map(([collectionKey, collection]) => (
                      <Card 
                        key={collectionKey}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                          selectedCollection === collectionKey ? 'ring-2 ring-blue-500 shadow-md' : ''
                        }`}
                        onClick={() => setSelectedCollection(collectionKey)}
                      >
                        <CardContent className="p-3 text-center">
                          <div className="flex justify-center mb-2 -space-x-2">
                            {collection.avatars.slice(0, 3).map((avatar, index) => (
                              <img 
                                key={index}
                                src={avatar} 
                                alt={`${collection.name} ${index + 1}`}
                                className="w-8 h-8 rounded-full border-2 border-white object-cover"
                              />
                            ))}
                          </div>
                          <h4 className="font-semibold text-sm">{collection.name}</h4>
                          <p className="text-xs text-gray-600 mt-1">{collection.description}</p>
                          <Badge 
                            variant="outline" 
                            className="mt-2 text-xs"
                          >
                            {collection.avatars.length} avatars
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Galerie d'avatars de la collection sélectionnée */}
                <div>
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-green-600" />
                    {AVATAR_COLLECTIONS[selectedCollection]?.name} ({AVATAR_COLLECTIONS[selectedCollection]?.avatars.length} choix)
                  </h4>
                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                    {AVATAR_COLLECTIONS[selectedCollection]?.avatars.map((avatar, index) => {
                      const isSelected = selectedAvatar === avatar && selectedOption === 'gallery';
                      
                      return (
                        <div
                          key={index}
                          className={`relative cursor-pointer transition-all duration-200 hover:scale-105 ${
                            isSelected ? 'ring-2 ring-blue-500 rounded-full' : ''
                          }`}
                          onClick={() => {
                            setSelectedAvatar(avatar);
                            setSelectedOption('gallery');
                          }}
                        >
                          <img 
                            src={avatar} 
                            alt={`Avatar ${index + 1}`}
                            className="w-16 h-16 rounded-full object-cover shadow-md hover:shadow-lg transition-shadow"
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-blue-500 bg-opacity-20 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-6 h-6 text-blue-600" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {selectedTab === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-400 transition-colors">
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Upload votre photo</h3>
                    <p className="text-gray-600 mb-4">
                      Formats acceptés: JPG, PNG, GIF (max 5MB)
                    </p>
                    
                    <Label htmlFor="avatar-upload">
                      <Button variant="outline" className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        Choisir un fichier
                      </Button>
                    </Label>
                    <Input
                      id="avatar-upload"
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      accept="image/*"
                    />
                  </div>
                  
                  {uploadedPreview && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-6 p-4 bg-green-50 rounded-lg"
                    >
                      <h4 className="font-semibold mb-3 text-green-800">Aperçu</h4>
                      <div className="flex items-center justify-center gap-4">
                        <img 
                          src={uploadedPreview} 
                          alt="Aperçu" 
                          className="w-24 h-24 rounded-full object-cover ring-2 ring-green-200"
                        />
                        <div className="text-left">
                          <p className="font-medium text-green-800">Photo sélectionnée</p>
                          <p className="text-sm text-green-600">Prête à être sauvegardée</p>
                          <Badge className="mt-1 bg-green-100 text-green-800">
                            Personnalisée
                          </Badge>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isUploading}>
              Annuler
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isUploading || (selectedOption === 'gallery' && !selectedAvatar)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Sauvegarder
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}