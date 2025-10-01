import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

function ReasonFormDialog({
  open,
  onOpenChange,
  onSubmit,
  type,
  isLoading = false,
}) {
  const [reason, setReason] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (reason.trim()) {
      onSubmit(reason);
      setReason("");
    }
  };

  const handleClose = () => {
    setReason("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {type === "cancellation"
              ? "Request Order Cancellation"
              : "Request Order Return"}
          </DialogTitle>
          <DialogDescription>
            {type === "cancellation"
              ? "Please provide a reason for cancelling this order. This request will be sent to the admin for approval."
              : "Please provide a reason for returning this order. This request will be sent to the admin for approval."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">
              Reason for {type === "cancellation" ? "Cancellation" : "Return"} *
            </Label>
            <Textarea
              id="reason"
              placeholder={`Enter your reason for ${
                type === "cancellation" ? "cancelling" : "returning"
              } the order...`}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              minLength={10}
              className="min-h-[100px]"
            />
            <p className="text-sm text-muted-foreground">
              Minimum 10 characters required
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !reason.trim() || reason.trim().length < 10 || isLoading
              }
            >
              {isLoading
                ? "Submitting..."
                : `Submit ${
                    type === "cancellation" ? "Cancellation" : "Return"
                  } Request`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ReasonFormDialog;
