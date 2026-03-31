import { AlignJustify, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/store/auth-slice";

function AdminHeader({ setOpen }) {
  const dispatch = useDispatch();

  function handleLogout() {
    dispatch(logoutUser());
  }

  return (
    <header className="flex items-center justify-between px-8 h-20 bg-white border-b border-zinc-100">
      <Button 
        onClick={() => setOpen(true)} 
        variant="ghost" 
        size="icon" 
        className="lg:hidden text-black hover:bg-zinc-100 rounded-none"
      >
        <AlignJustify className="w-6 h-6" />
        <span className="sr-only">Toggle Menu</span>
      </Button>
      <div className="flex flex-1 justify-end items-center gap-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 group transition-all duration-300"
        >
          <div className="text-right">
             <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 leading-none">Session</p>
             <p className="text-sm font-bold text-black uppercase tracking-tight group-hover:text-red-600 transition-colors">Logout</p>
          </div>
          <div className="w-10 h-10 flex items-center justify-center border-2 border-black group-hover:bg-black group-hover:text-white transition-all duration-300">
            <LogOut className="w-4 h-4" />
          </div>
        </button>
      </div>
    </header>
  );
}

export default AdminHeader;
