import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addFeatureImage, getFeatureImages, deleteFeatureImage } from "@/store/common-slice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, UploadCloud, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import ProductImageUpload from "@/components/admin-view/image-upload";

function AdminFeatures() {
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const dispatch = useDispatch();
  const { featureImageList, isLoading } = useSelector((state) => state.commonFeature);
  const { toast } = useToast();

  useEffect(() => {
    dispatch(getFeatureImages());
  }, [dispatch]);

  const handleUploadFeatureImage = () => {
    if (!uploadedImageUrl) return;

    dispatch(addFeatureImage(uploadedImageUrl)).then((data) => {
      if (data?.payload?.success) {
        dispatch(getFeatureImages());
        setImageFile(null);
        setUploadedImageUrl("");
        toast({ title: "Feature image uploaded successfully!" });
      }
    });
  };

  const handleDeleteFeatureImage = (id) => {
    dispatch(deleteFeatureImage(id)).then((data) => {
       if (data?.payload?.success) {
         dispatch(getFeatureImages());
         toast({ title: "Feature image deleted successfully!" });
       }
    });
  };

  if (isLoading) return <div className="p-8"><Skeleton className="h-[600px] w-full" /></div>;

  return (
    <div className="p-8 space-y-12 bg-white min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-black">Aesthetic Curation</h1>
          <p className="text-zinc-400 font-medium tracking-widest uppercase text-xs mt-1">Management of featured brand assets</p>
        </div>
        <div className="flex gap-2">
            <Badge className="bg-zinc-100 text-black border-none rounded-none px-3 py-1 font-bold text-[10px] uppercase">Active Banners</Badge>
            <Badge className="bg-black text-white border-none rounded-none px-3 py-1 font-bold text-[10px] uppercase">{featureImageList?.length || 0} Assets</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Upload Section */}
        <div className="lg:col-span-1 space-y-8">
          <div className="border-4 border-black p-8 bg-zinc-50 space-y-8">
            <div className="space-y-2">
                <h3 className="text-xl font-black uppercase tracking-tight text-black">Asset Ingestion</h3>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Architectural quality banners only (Recommended 1920x600)</p>
            </div>
            
            <div className="space-y-6">
                <ProductImageUpload 
                  imageFile={imageFile}
                  setImageFile={setImageFile}
                  uploadedImageUrl={uploadedImageUrl}
                  setUploadedImageUrl={setUploadedImageUrl}
                  setImageLoadingState={setImageLoadingState}
                  imageLoadingState={imageLoadingState}
                  isEditMode={false}
                  isCustomStyling={true}
                />

                <Button 
                  onClick={handleUploadFeatureImage}
                  disabled={!uploadedImageUrl || imageLoadingState}
                  className="w-full bg-black hover:bg-zinc-800 text-white rounded-none h-16 text-xs font-black tracking-[0.3em] uppercase transition-all duration-500 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.1)]"
                >
                  <UploadCloud className="mr-4 w-5 h-5 stroke-[2.5]" /> Deploy Asset
                </Button>
            </div>
          </div>

          <div className="bg-zinc-900 p-8 text-white space-y-4">
             <div className="flex items-center gap-2 text-zinc-500">
                <ImageIcon className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Guidelines</span>
             </div>
             <ul className="space-y-3">
                <li className="flex items-start gap-3 text-[11px] font-medium text-zinc-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-zinc-600 shrink-0 mt-0.5" />
                    High-contrast architectural visuals preferred
                </li>
                <li className="flex items-start gap-3 text-[11px] font-medium text-zinc-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-zinc-600 shrink-0 mt-0.5" />
                    Maintain minimalist brand consistency
                </li>
             </ul>
          </div>
        </div>

        {/* Gallery Section */}
        <div className="lg:col-span-2 space-y-8">
            <div className="border-b-4 border-black pb-4">
                <h3 className="text-2xl font-black uppercase tracking-tight text-black flex items-center gap-3">
                    <ImageIcon className="w-6 h-6" /> Live Feature Grid
                </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[800px] overflow-y-auto pr-4 custom-scrollbar">
                {featureImageList && featureImageList.length > 0 ? (
                    featureImageList.map((featureItem) => (
                        <div key={featureItem._id} className="group relative border border-zinc-100 bg-white p-4 transition-all duration-500 hover:border-black hover:shadow-[16px_16px_0px_0px_rgba(0,0,0,0.02)]">
                            <div className="aspect-[21/9] overflow-hidden bg-zinc-100">
                                <img 
                                  src={featureItem.image} 
                                  alt="Feature" 
                                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                                />
                            </div>
                            <div className="mt-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Deployed {new Date(featureItem.createdAt).toLocaleDateString()}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteFeatureImage(featureItem._id)}
                                  className="h-10 w-10 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-none transition-colors"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full h-96 flex flex-col items-center justify-center border-4 border-dashed border-zinc-50">
                        <ImageIcon className="w-16 h-16 text-zinc-100 mb-6" />
                        <p className="text-sm font-black uppercase tracking-[0.4em] text-zinc-200">No active assets found</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}

export default AdminFeatures;
