import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDashboardStats } from "@/store/admin/dashboard-slice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Package, 
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  Clock
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area 
} from "recharts";
import { Badge } from "@/components/ui/badge";

function AdminDashboard() {
  const dispatch = useDispatch();
  const { stats, isLoading } = useSelector((state) => state.adminDashboard);

  useEffect(() => {
    dispatch(getDashboardStats());
  }, [dispatch]);

  const statCards = [
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue?.toLocaleString()}`,
      icon: DollarSign,
      color: "text-zinc-900",
      bg: "bg-black/5",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: "text-zinc-900",
      bg: "bg-black/5",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-zinc-900",
      bg: "bg-black/5",
    },
    {
      title: "Products",
      value: stats.totalProducts,
      icon: Package,
      color: "text-zinc-900",
      bg: "bg-black/5",
    },
  ];

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-black">Executive Overview</h1>
          <p className="text-zinc-400 font-medium tracking-widest uppercase text-xs mt-1">Real-time business performance analytics</p>
        </div>
        <div className="flex gap-2">
            <Badge className="bg-zinc-100 text-black border-none rounded-none px-3 py-1 font-bold text-[10px] uppercase">Live Data</Badge>
            <Badge className="bg-emerald-50 text-emerald-700 border-none rounded-none px-3 py-1 font-bold text-[10px] uppercase underline decoration-2">All Channels</Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="rounded-none border-t-4 border-black border-x-0 border-b-0 shadow-sm bg-zinc-50 group hover:bg-white transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-4">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{stat.title}</p>
                   <h2 className="text-3xl font-black text-black tracking-tight">{stat.value}</h2>
                </div>
                <div className={`p-3 ${stat.bg} rounded-none transform group-hover:rotate-12 transition-transform duration-300`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <Card className="lg:col-span-2 rounded-none border-none shadow-none bg-zinc-50 p-6">
          <CardHeader className="px-0 pt-0 pb-6">
            <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-black uppercase tracking-tighter text-black flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" /> Sales Performance
                </CardTitle>
                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Last 7 Days</div>
            </div>
          </CardHeader>
          <CardContent className="px-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.salesData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#000" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#A1A1AA', fontSize: 10, fontWeight: 900}} 
                    interval={0}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#A1A1AA', fontSize: 10, fontWeight: 900}} 
                  />
                  <Tooltip 
                    contentStyle={{backgroundColor: '#000', border: 'none', color: '#fff', borderRadius: '0'}}
                    itemStyle={{color: '#fff'}}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#000" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorSales)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock & Alerts */}
        <div className="space-y-6">
            {/* Stock Warning */}
            <Card className="rounded-none border-l-4 border-amber-500 border-t-0 border-r-0 border-b-0 bg-amber-50/50 shadow-none">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-amber-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Stock Advisory
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-2">
                <div className="space-y-4">
                   {stats.lowStockAlerts?.length > 0 ? (
                       stats.lowStockAlerts.slice(0, 5).map((item, idx) => (
                           <div key={idx} className="flex justify-between items-center bg-white p-3 border-b border-amber-100">
                               <div>
                                   <p className="text-xs font-black text-black uppercase tracking-tight">{item.title}</p>
                                   <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Only {item.stock} units left</p>
                               </div>
                               <ArrowUpRight className="w-4 h-4 text-amber-400" />
                           </div>
                       ))
                   ) : (
                       <p className="text-xs font-medium text-amber-800">Inventory levels are healthy across all modules.</p>
                   )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Velocity */}
            <Card className="rounded-none border-none shadow-none bg-zinc-900 p-6 text-white overflow-hidden relative">
                <div className="relative z-10 space-y-6">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Live Velocity</p>
                             <h3 className="text-xl font-bold uppercase tracking-tighter">Recent Orders</h3>
                        </div>
                        <Clock className="w-5 h-5 text-zinc-500" />
                    </div>
                    <div className="space-y-3">
                        {stats.recentOrders?.slice(0, 3).map((order, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs border-b border-zinc-800 pb-2">
                                <span className="font-bold text-zinc-400">#{order._id?.slice(-6).toUpperCase()}</span>
                                <span className="font-black">₹{order.totalAmount}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <ShoppingBag className="w-32 h-32" />
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

