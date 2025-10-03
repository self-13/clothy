// components/admin-view/color-manager.jsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

function ColorManager({ colors, onColorsChange }) {
  const [newColor, setNewColor] = useState("");

  const addColor = () => {
    if (newColor.trim()) {
      const updatedColors = [...colors, newColor.trim()];
      onColorsChange(updatedColors);
      setNewColor("");
    }
  };

  const removeColor = (index) => {
    const updatedColors = colors.filter((_, i) => i !== index);
    onColorsChange(updatedColors);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addColor();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Color Selection</Label>
        <p className="text-sm text-muted-foreground mb-3">
          Add available colors for this product
        </p>
      </div>

      {/* Add new color form */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor="color" className="text-xs">
            Color Name
          </Label>
          <Input
            id="color"
            placeholder="e.g., Red, Blue, Black, White, etc."
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            onKeyPress={handleKeyPress}
            className="h-9"
          />
        </div>
        <div className="flex items-end">
          <Button
            type="button"
            onClick={addColor}
            disabled={!newColor.trim()}
            className="h-9"
            size="sm"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Color list */}
      {colors.length > 0 && (
        <div className="border rounded-lg p-3">
          <div className="grid grid-cols-2 gap-2 mb-2 pb-2 border-b">
            <span className="text-sm font-medium">Color</span>
            <span className="text-sm font-medium">Action</span>
          </div>
          {colors.map((color, index) => (
            <div
              key={index}
              className="grid grid-cols-2 gap-2 items-center mb-2"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded border"
                  style={{
                    backgroundColor: color.toLowerCase(),
                    borderColor: "#e5e7eb",
                  }}
                />
                <span className="text-sm">{color}</span>
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeColor(index)}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {colors.length === 0 && (
        <div className="text-center py-4 text-gray-500 text-sm">
          No colors added yet. Add at least one color.
        </div>
      )}
    </div>
  );
}

export default ColorManager;
