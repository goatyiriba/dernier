import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const EMOJI_CATEGORIES = {
  "Visages": ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳"],
  "Émotions": ["😥", "😢", "😭", "😱", "😨", "😰", "😡", "🤬", "😠", "🤯", "😳", "🥵", "🥶", "😴", "😵", "🤤", "😪", "😮", "😯", "😲", "🥱", "😤", "😖", "😣", "😞", "😔", "😟", "😕", "🙁", "☹️", "😬"],
  "Gestes": ["👍", "👎", "👌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👋", "🤚", "🖐️", "✋", "🖖", "👏", "🙌", "👐", "🤲", "🤝", "🙏", "✊", "👊", "🤛", "🤜"],
  "Objets": ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "☮️", "✝️", "☪️", "🕉️", "☸️", "✡️", "🔯", "🕎", "☯️", "☦️", "🛐"]
};

export default function EmojiPicker({ onEmojiSelect }) {
  return (
    <Card className="w-80 shadow-lg">
      <CardContent className="p-4">
        <div className="space-y-4 max-h-64 overflow-y-auto">
          {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">{category}</h4>
              <div className="grid grid-cols-8 gap-1">
                {emojis.map((emoji) => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-gray-100 text-lg"
                    onClick={() => onEmojiSelect(emoji)}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}