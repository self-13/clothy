import ProductImageUpload from "@/components/admin-view/image-upload";
import { Button } from "@/components/ui/button";
import {
  addFeatureImage,
  getFeatureImages,
  deleteFeatureImage,
} from "@/store/common-slice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

function AdminDashboard() {
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  const dispatch = useDispatch();
  const { featureImageList, isLoading } = useSelector((state) => state.commonFeature);
  const { user } = useSelector((state) => state.auth);

  console.log("🖼️ Uploaded Image URL:", uploadedImageUrl);

  const handleUploadFeatureImage = async () => {
    if (!uploadedImageUrl) {
      setUploadStatus("Please upload an image first");
      return;
    }

    if (!user?.id) {
      setUploadStatus("User not authenticated");
      return;
    }

    setUploadStatus("Uploading...");

    try {
      const result = await dispatch(addFeatureImage(uploadedImageUrl)).unwrap();

      if (result.success) {
        setUploadStatus("✅ Image uploaded successfully!");
        dispatch(getFeatureImages());
        setImageFile(null);
        setUploadedImageUrl("");

        // Clear success message after 3 seconds
        setTimeout(() => setUploadStatus(""), 3000);
      } else {
        setUploadStatus(
          "❌ Upload failed: " + (result.message || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus(
        "❌ Upload failed: " + (error.message || "Unknown error")
      );
    }
  };

  const handleDeleteFeatureImage = async (id) => {
    if (window.confirm("Are you sure you want to delete this image?")) {
      try {
        const result = await dispatch(deleteFeatureImage(id)).unwrap();
        if (result.success) {
          console.log("✅ Image deleted successfully");
          dispatch(getFeatureImages());
        }
      } catch (error) {
        console.error("Delete error:", error);
        alert("Delete failed: " + (error.message || "Unknown error"));
      }
    }
  };

  useEffect(() => {
    dispatch(getFeatureImages());
  }, [dispatch]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Admin Dashboard - Feature Images
      </h1>

      {/* Image Upload Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-4">Upload Feature Image</h2>

        <ProductImageUpload
          imageFile={imageFile}
          setImageFile={setImageFile}
          uploadedImageUrl={uploadedImageUrl}
          setUploadedImageUrl={setUploadedImageUrl}
          setImageLoadingState={setImageLoadingState}
          imageLoadingState={imageLoadingState}
          isCustomStyling={true}
        />

        <Button
          onClick={handleUploadFeatureImage}
          className="mt-5 w-full"
          disabled={!uploadedImageUrl || isLoading}
        >
          {isLoading ? "Uploading..." : "Upload Feature Image"}
        </Button>

        {uploadStatus && (
          <div
            className={`mt-3 p-3 rounded ${
              uploadStatus.includes("✅")
                ? "bg-green-100 text-green-800"
                : uploadStatus.includes("❌")
                ? "bg-red-100 text-red-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {uploadStatus}
          </div>
        )}
      </div>

      {/* Feature Images List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">
          Feature Images ({featureImageList?.length || 0})
        </h2>

        {isLoading ? (
          <div className="text-center py-4">Loading images...</div>
        ) : featureImageList && featureImageList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featureImageList.map((featureImgItem) => (
              <div
                className="relative border rounded-lg overflow-hidden"
                key={featureImgItem._id}
              >
                <img
                  src={featureImgItem.image}
                  alt="Feature"
                  className="w-full h-48 object-cover"
                />
                <Button
                  onClick={() => handleDeleteFeatureImage(featureImgItem._id)}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700"
                  size="sm"
                >
                  Delete
                </Button>
                <div className="p-3 bg-gray-50">
                  <p className="text-sm text-gray-600 truncate">
                    {featureImgItem.image}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No feature images uploaded yet.
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
