import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Video, Send } from "lucide-react";

export default function RequestMeetingModal({ isOpen, onClose, onSubmit, targetEmployee }) {
  const [meetingLink, setMeetingLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!meetingLink) return;
    setIsSubmitting(true);
    try {
      await onSubmit(meetingLink);
      setMeetingLink('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="responsive-modal mx-4 sm:mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Video className="w-5 h-5 text-blue-600" />
            Demander un meeting
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Invitez <strong>{targetEmployee?.first_name} {targetEmployee?.last_name}</strong> à une réunion.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meeting-link" className="text-sm sm:text-base">Lien de la réunion (Google Meet, Zoom, etc.)</Label>
            <Input
              id="meeting-link"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="https://meet.google.com/xyz-abc-def"
              autoComplete="off"
              className="h-12"
            />
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto touch-target">
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !meetingLink}
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto touch-target"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Envoi...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Envoyer l'invitation
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}