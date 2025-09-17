import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

function SizeStockManager({ sizes, onSizesChange }) {
  const [newSize, setNewSize] = useState("");
  const [newStock, setNewStock] = useState("");

  const addSize = () => {
    if (newSize && newStock !== "") {
      const updatedSizes = [
        ...sizes,
        { size: newSize, stock: parseInt(newStock) || 0 },
      ];
      onSizesChange(updatedSizes);
      setNewSize("");
      setNewStock("");
    }
  };

  const removeSize = (index) => {
    const updatedSizes = sizes.filter((_, i) => i !== index);
    onSizesChange(updatedSizes);
  };

  const updateStock = (index, stock) => {
    const updatedSizes = sizes.map((item, i) =>
      i === index ? { ...item, stock: parseInt(stock) || 0 } : item
    );
    onSizesChange(updatedSizes);
  };

  const updateSize = (index, size) => {
    const updatedSizes = sizes.map((item, i) =>
      i === index ? { ...item, size } : item
    );
    onSizesChange(updatedSizes);
  };

  const calculateTotalStock = () => {
    return sizes.reduce((total, item) => total + (item.stock || 0), 0);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Size & Stock Management</Label>
        <p className="text-sm text-muted-foreground mb-3">
          Add sizes and their available stock quantities
        </p>
      </div>

      {/* Add new size form */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor="size" className="text-xs">
            Size
          </Label>
          <Input
            id="size"
            placeholder="e.g., S, M, L, 38, etc."
            value={newSize}
            onChange={(e) => setNewSize(e.target.value)}
            className="h-9"
          />
        </div>
        <div className="flex-1">
          <Label htmlFor="stock" className="text-xs">
            Stock
          </Label>
          <Input
            id="stock"
            type="number"
            min="0"
            placeholder="Quantity"
            value={newStock}
            onChange={(e) => setNewStock(e.target.value)}
            className="h-9"
          />
        </div>
        <div className="flex items-end">
          <Button
            type="button"
            onClick={addSize}
            disabled={!newSize || newStock === ""}
            className="h-9"
            size="sm"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Size list */}
      {sizes.length > 0 && (
        <div className="border rounded-lg p-3">
          <div className="grid grid-cols-3 gap-2 mb-2 pb-2 border-b">
            <span className="text-sm font-medium">Size</span>
            <span className="text-sm font-medium">Stock</span>
            <span className="text-sm font-medium">Action</span>
          </div>
          {sizes.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-3 gap-2 items-center mb-2"
            >
              <Input
                value={item.size}
                onChange={(e) => updateSize(index, e.target.value)}
                className="h-8 text-sm"
              />
              <Input
                type="number"
                min="0"
                value={item.stock}
                onChange={(e) => updateStock(index, e.target.value)}
                className="h-8 text-sm"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeSize(index)}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}

          {/* Total stock */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t">
            <span className="text-sm font-medium">Total Stock:</span>
            <span className="text-sm font-medium">{calculateTotalStock()}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default SizeStockManager;
