import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers } from "@/store/admin/user-slice";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Mail, Calendar, ShieldCheck } from "lucide-react";

function AdminUsers() {
  const dispatch = useDispatch();
  const { userList, isLoading } = useSelector((state) => state.adminUser);

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-12 w-[250px]" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-white min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-black">Customer Audit</h1>
          <p className="text-zinc-400 font-medium tracking-widest uppercase text-xs mt-1">Verified user base management</p>
        </div>
        <Badge className="bg-black text-white hover:bg-black rounded-none px-4 py-1.5 font-bold text-xs uppercase tracking-widest">
          {userList?.length || 0} Total Customers
        </Badge>
      </div>

      <div className="border border-zinc-100 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50 border-b-2 border-black">
            <TableRow className="hover:bg-zinc-50 border-none">
              <TableHead className="font-black uppercase tracking-widest text-[10px] text-zinc-400 py-6">Customer Profile</TableHead>
              <TableHead className="font-black uppercase tracking-widest text-[10px] text-zinc-400 py-6">Email Address</TableHead>
              <TableHead className="font-black uppercase tracking-widest text-[10px] text-zinc-400 py-6">Status</TableHead>
              <TableHead className="font-black uppercase tracking-widest text-[10px] text-zinc-400 py-6">Member Since</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userList && userList.length > 0 ? (
              userList.map((userItem) => (
                <TableRow key={userItem._id} className="hover:bg-zinc-50/50 transition-colors border-zinc-50 h-24">
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Avatar className="w-10 h-10 rounded-none border border-zinc-200">
                        <AvatarFallback className="bg-white text-black font-black uppercase text-xs">
                          {userItem.userName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-bold text-black uppercase tracking-tight text-sm">{userItem.userName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Mail className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">{userItem.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {userItem.isVerified ? (
                         <Badge className="bg-emerald-50 text-emerald-700 border-none rounded-none px-2 py-0.5 font-bold text-[9px] uppercase tracking-widest flex items-center gap-1">
                           <ShieldCheck className="w-3 h-3" /> Authenticated
                         </Badge>
                      ) : (
                        <Badge className="bg-zinc-100 text-zinc-400 border-none rounded-none px-2 py-0.5 font-bold text-[9px] uppercase tracking-widest">
                          Pending
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {new Date(userItem.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-64 text-center">
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-200">No customer records detected</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default AdminUsers;
