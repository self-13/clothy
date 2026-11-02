import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

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
      <DialogContent className="sm:max-w-[480px] bg-[#FAF9F6] border border-zinc-200/80 p-6 sm:p-7 font-sans">
        <DialogHeader className="text-left space-y-1.5 pb-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
            Official Request
          </span>
          <DialogTitle className="font-serif text-2xl text-[#121212]">
            {type === "cancellation"
              ? "Request Order Cancellation"
              : "Request Order Return"}
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-500 leading-relaxed">
            {type === "cancellation"
              ? "Please state your rationale for cancelling this order. Our concierge team will review and confirm your request."
              : "Please state your rationale for returning this order. Our concierge team will arrange inspection and reverse logistics."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label htmlFor="reason" className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-600 block">
              Rationale Description *
            </label>
            <Textarea
              id="reason"
              placeholder={`Elaborate on why you wish to ${
                type === "cancellation" ? "cancel" : "return"
              } this piece...`}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              minLength={10}
              className="min-h-[110px] bg-white border border-zinc-300 focus:border-black rounded-sm text-xs p-3 text-[#121212] resize-none"
            />
            <p className="text-[10px] text-zinc-400">
              Minimum 10 characters required for processing
            </p>
          </div>

          <div className="flex justify-end items-center gap-3 pt-3 border-t border-zinc-200/70">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-600 hover:text-black rounded-sm transition-colors"
            >
              Dismiss
            </button>
            <button
              type="submit"
              disabled={
                !reason.trim() || reason.trim().length < 10 || isLoading
              }
              className="px-5 py-2.5 bg-[#121212] hover:bg-black disabled:bg-zinc-300 text-white text-xs font-semibold uppercase tracking-[0.14em] rounded-sm transition-all active:scale-[0.98]"
            >
              {isLoading
                ? "Submitting..."
                : `Submit ${
                    type === "cancellation" ? "Cancellation" : "Return"
                  }`}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ReasonFormDialog;
