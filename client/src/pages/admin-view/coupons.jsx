import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllCoupons, addNewCoupon, updateCoupon, deleteCoupon } from "@/store/admin/coupon-slice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle, Trash2, Edit2, Ticket } from "lucide-react";

function AdminCoupons() {
  const [formData, setFormData] = useState({
    code: "",
    discountType: "fixed",
    discountAmount: 0,
    minOrderAmount: 0,
    expirationDate: "",
    usageLimit: 0,
    isActive: true,
  });
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const dispatch = useDispatch();
  const { couponList, isLoading } = useSelector((state) => state.adminCoupons);
  const { toast } = useToast();

  useEffect(() => {
    dispatch(fetchAllCoupons());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editId) {
      dispatch(updateCoupon({ id: editId, formData })).then(() => {
        dispatch(fetchAllCoupons());
        setIsOpen(false);
        setEditId(null);
        toast({ title: "Coupon updated" });
      });
    } else {
      dispatch(addNewCoupon(formData)).then(() => {
        dispatch(fetchAllCoupons());
        setIsOpen(false);
        toast({ title: "Coupon added" });
      });
    }
  };

  const handleEdit = (coupon) => {
    setEditId(coupon._id);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountAmount: coupon.discountAmount,
      minOrderAmount: coupon.minOrderAmount,
      expirationDate: coupon.expirationDate?.split("T")[0] || "",
      usageLimit: coupon.usageLimit,
      isActive: coupon.isActive,
    });
    setIsOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure?")) {
      dispatch(deleteCoupon(id)).then(() => {
        dispatch(fetchAllCoupons());
        toast({ title: "Coupon deleted" });
      });
    }
  };

  return (
    <div className="p-8 space-y-8 bg-zinc-50 min-h-screen">
      <div className="flex justify-between items-center bg-white p-6 border-b-4 border-black">
        <h1 className="text-3xl font-black uppercase tracking-tighter text-black flex items-center gap-3">
          <Ticket className="w-8 h-8" /> Coupon Management
        </h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-black hover:bg-zinc-800 text-white rounded-none px-8 py-6 text-sm font-bold tracking-widest uppercase">
              <PlusCircle className="mr-2 w-5 h-5" /> Create Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-none border-4 border-black p-8 sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase tracking-tighter">
                {editId ? "Edit" : "New"} Coupon
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Coupon Code</label>
                <Input
                  className="rounded-none border-2 border-zinc-200 focus:border-black h-12 text-lg font-bold"
                  placeholder="E.G. SUMMER25"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Discount Type</label>
                  <select
                    className="w-full h-12 border-2 border-zinc-200 focus:border-black rounded-none bg-white font-bold px-3 text-lg"
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                  >
                    <option value="fixed">Fixed</option>
                    <option value="percentage">Percentage</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Amount</label>
                  <Input
                    type="number"
                    className="rounded-none border-2 border-zinc-200 focus:border-black h-12 text-lg font-bold"
                    value={formData.discountAmount}
                    onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Expiration</label>
                  <Input
                    type="date"
                    className="rounded-none border-2 border-zinc-200 focus:border-black h-12 font-bold"
                    value={formData.expirationDate}
                    onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Usage Limit</label>
                  <Input
                    type="number"
                    className="rounded-none border-2 border-zinc-200 focus:border-black h-12 text-lg font-bold"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-14 bg-black hover:bg-zinc-800 text-white rounded-none font-black uppercase tracking-widest text-lg transition-all duration-300">
                {editId ? "Update" : "Launch"} Coupon
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-none border-2 border-zinc-200 shadow-none bg-white">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-zinc-50">
              <TableRow className="hover:bg-transparent border-b-2 border-zinc-100">
                <TableHead className="font-black uppercase tracking-widest text-zinc-500 h-16">Code</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-zinc-500 h-16">Type</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-zinc-500 h-16">Value</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-zinc-500 h-16 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {couponList?.map((coupon) => (
                <TableRow key={coupon._id} className="hover:bg-zinc-50/50 transition-colors border-b border-zinc-100 h-20 group">
                  <TableCell className="font-black text-xl tracking-tighter text-black">{coupon.code}</TableCell>
                  <TableCell className="uppercase text-xs font-black tracking-widest text-zinc-400">{coupon.discountType}</TableCell>
                  <TableCell className="font-bold text-lg">{coupon.discountType === "fixed" ? `₹${coupon.discountAmount}` : `${coupon.discountAmount}%`}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" className="rounded-none border-2 border-zinc-200 h-10 w-10 p-0 text-black hover:bg-black hover:text-white hover:border-black transition-all" onClick={() => handleEdit(coupon)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" className="rounded-none border-2 border-zinc-200 h-10 w-10 p-0 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all" onClick={() => handleDelete(coupon._id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {couponList?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-20 text-zinc-400 font-bold uppercase tracking-widest italic text-sm">No coupons established yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminCoupons;
