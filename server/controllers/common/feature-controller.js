const Feature = require("../../models/Feature");
const User = require("../../models/User");

const checkAdminRole = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user && user.role === "admin";
  } catch (error) {
    console.log("Role check error:", error);
    return false;
  }
};

const addFeatureImage = async (req, res) => {
  try {
    console.log("📨 Add Feature Image Request Received");
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);

    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Check admin role
    const isAdmin = await checkAdminRole(userId);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    const { image } = req.body;

    console.log("🖼️ Image URL received:", image);

    if (!image) {
      return res.status(400).json({
        success: false,
        message: "Image URL is required",
      });
    }

    const featureImage = new Feature({
      image,
    });

    await featureImage.save();

    console.log("✅ Feature image saved successfully");

    res.status(201).json({
      success: true,
      data: featureImage,
      message: "Feature image added successfully",
    });
  } catch (error) {
    console.log("❌ Error in addFeatureImage:", error);
    res.status(500).json({
      success: false,
      message: "Error adding feature image",
      error: error.message,
    });
  }
};

const getFeatureImages = async (req, res) => {
  try {
    const images = await Feature.find({}).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: images,
    });
  } catch (error) {
    console.log("Error in getFeatureImages:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching feature images",
    });
  }
};

const deleteFeatureImage = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Check admin role
    const isAdmin = await checkAdminRole(userId);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    const { id } = req.params;

    const deletedImage = await Feature.findByIdAndDelete(id);

    if (!deletedImage) {
      return res.status(404).json({
        success: false,
        message: "Image not found!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Image deleted successfully!",
      data: deletedImage,
    });
  } catch (error) {
    console.log("Error in deleteFeatureImage:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting feature image",
    });
  }
};

module.exports = { addFeatureImage, getFeatureImages, deleteFeatureImage };
