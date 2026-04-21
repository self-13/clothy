import {
  BadgeCheck,
  ChartNoAxesCombined,
  LayoutDashboard,
  ShoppingBasket,
  XCircle,
  RefreshCw,
  Ticket,
  Image as ImageIcon,
  Users as UserIcon,
} from "lucide-react";
import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";

const adminSidebarMenuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: <LayoutDashboard />,
  },
  {
    id: "products",
    label: "Products",
    path: "/admin/products",
    icon: <ShoppingBasket />,
  },
  {
    id: "orders",
    label: "Orders",
    path: "/admin/orders",
    icon: <BadgeCheck />,
  },
  {
    id: "cancellations",
    label: "Cancellations",
    path: "/admin/cancellations",
    icon: <XCircle />,
  },
  {
    id: "returns",
    label: "Returns",
    path: "/admin/returns",
    icon: <RefreshCw />,
  },
  {
    id: "coupons",
    label: "Coupons",
    path: "/admin/coupons",
    icon: <Ticket />,
  },
  {
    id: "features",
    label: "Features",
    path: "/admin/features",
    icon: <ImageIcon />,
  },
  {
    id: "users",
    label: "Users",
    path: "/admin/users",
    icon: <UserIcon />,
  },
];

function MenuItems({ setOpen }) {
  const navigate = useNavigate();

  return (
    <nav className="mt-8 flex-col flex gap-2">
      {adminSidebarMenuItems.map((menuItem) => (
        <div
          key={menuItem.id}
          onClick={() => {
            navigate(menuItem.path);
            setOpen ? setOpen(false) : null;
          }}
          className="flex cursor-pointer text-sm font-black uppercase tracking-widest items-center gap-4 px-4 py-4 text-zinc-400 hover:text-black hover:bg-zinc-50 border-l-4 border-transparent hover:border-black transition-all duration-300"
        >
          <div className="w-5 h-5">{menuItem.icon}</div>
          <span>{menuItem.label}</span>
        </div>
      ))}
    </nav>
  );
}

function AdminSideBar({ open, setOpen }) {
  const navigate = useNavigate();

  return (
    <Fragment>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64">
          <div className="flex flex-col h-full">
            <SheetHeader className="border-b">
              <SheetTitle className="flex gap-3 mt-10 mb-10 items-center justify-center">
                 <div className="bg-black text-white px-3 py-1 font-black text-2xl tracking-tighter uppercase leading-none">
                  CL.
                </div>
                <h1 className="text-2xl font-black uppercase tracking-tight">Admin</h1>
              </SheetTitle>
            </SheetHeader>
            <MenuItems setOpen={setOpen} />
          </div>
        </SheetContent>
      </Sheet>
      <aside className="hidden w-72 flex-col border-r border-zinc-100 bg-white lg:flex">
        <div
          onClick={() => navigate("/admin/dashboard")}
          className="flex cursor-pointer items-center gap-3 p-10 border-b border-zinc-100"
        >
          <div className="bg-black text-white px-3 py-1 font-black text-2xl tracking-tighter uppercase leading-none">
            CL.
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Admin</h1>
        </div>
        <MenuItems />
      </aside>
    </Fragment>
  );
}

export default AdminSideBar;
