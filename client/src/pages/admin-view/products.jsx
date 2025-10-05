import ProductImageUpload from "@/components/admin-view/image-upload";
import AdminProductTile from "@/components/admin-view/product-tile";
import CommonForm from "@/components/common/form";
import SizeStockManager from "@/components/admin-view/size-stock-manager";
import ColorManager from "@/components/admin-view/color-manager";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { addProductFormElements } from "@/config";
import {
  addNewProduct,
  deleteProduct,
  editProduct,
  fetchAllProducts,
} from "@/store/admin/products-slice";
import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X } from "lucide-react";

const initialFormData = {
  images: [],
  title: "",
  description: "",
  category: "",
  subcategory: "",
  brand: "",
  price: "",
  salePrice: "",
  colors: [],
  totalStock: "",
  averageReview: 0,
  sizes: [],
  isFeatured: false,
  isActive: true,
  tags: [],
};

function AdminProducts() {
  const [openCreateProductsDialog, setOpenCreateProductsDialog] =
    useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [imageUploadStates, setImageUploadStates] = useState({});

  const { productList, isLoading } = useSelector(
    (state) => state.adminProducts
  );
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { toast } = useToast();

  // Function to handle image upload from individual upload components
  const handleImageUploaded = (imageUrl, uploadKey) => {
    if (imageUrl && !formData.images.includes(imageUrl)) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, imageUrl],
      }));
      // Clear the upload state for this specific uploader
      setImageUploadStates((prev) => ({
        ...prev,
        [uploadKey]: {
          imageFile: null,
          uploadedImageUrl: null,
          imageLoadingState: false,
        },
      }));
    }
  };

  // Function to remove image from the images array
  const handleRemoveImage = (imageUrl) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img !== imageUrl),
    }));
  };

  // Function to set main image (move to first position)
  const handleSetMainImage = (imageUrl) => {
    const currentImages = [...formData.images];
    const imageIndex = currentImages.indexOf(imageUrl);

    if (imageIndex > 0) {
      const [movedImage] = currentImages.splice(imageIndex, 1);
      currentImages.unshift(movedImage);
      setFormData((prev) => ({
        ...prev,
        images: currentImages,
      }));
    }
  };

  // Function to update individual upload component state
  const updateImageUploadState = (uploadKey, updates) => {
    setImageUploadStates((prev) => ({
      ...prev,
      [uploadKey]: { ...prev[uploadKey], ...updates },
    }));
  };

  // Function to add a new image upload slot
  const addImageUploadSlot = () => {
    const newKey = `upload-${Date.now()}`;
    setImageUploadStates((prev) => ({
      ...prev,
      [newKey]: {
        imageFile: null,
        uploadedImageUrl: null,
        imageLoadingState: false,
      },
    }));
  };

  // Initialize with one upload slot
  useEffect(() => {
    if (
      openCreateProductsDialog &&
      Object.keys(imageUploadStates).length === 0
    ) {
      setImageUploadStates({
        "upload-1": {
          imageFile: null,
          uploadedImageUrl: null,
          imageLoadingState: false,
        },
      });
    }
  }, [openCreateProductsDialog]);

  function onSubmit(event) {
    event.preventDefault();

    const sizes = formData.sizes || [];
    const totalStockFromSizes = sizes.reduce(
      (total, item) => total + (item.stock || 0),
      0
    );

    const productData = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      salePrice: formData.salePrice
        ? parseFloat(formData.salePrice)
        : undefined,
      totalStock:
        totalStockFromSizes > 0
          ? totalStockFromSizes
          : parseInt(formData.totalStock) || 0,
      averageReview: parseFloat(formData.averageReview) || 0,
      sizes,
      colors: formData.colors || [],
      tags: Array.isArray(formData.tags)
        ? formData.tags
        : formData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag),
    };

    console.log("Submitting productData:", productData);

    if (currentEditedId !== null) {
      dispatch(
        editProduct({
          id: currentEditedId,
          formData: productData,
        })
      )
        .then((data) => {
          if (data?.payload?.success) {
            dispatch(fetchAllProducts());
            handleResetForm();
            toast({
              title: "Product updated successfully",
            });
          } else {
            toast({
              title: "Error updating product",
              description: data?.payload?.message,
              variant: "destructive",
            });
          }
        })
        .catch((error) => {
          console.error("Edit product error:", error);
          toast({
            title: "Error updating product",
            description: error.message,
            variant: "destructive",
          });
        });
    } else {
      dispatch(addNewProduct(productData))
        .then((data) => {
          if (data?.payload?.success) {
            dispatch(fetchAllProducts());
            setOpenCreateProductsDialog(false);
            handleResetForm();
            toast({
              title: "Product added successfully",
            });
          } else {
            toast({
              title: "Error adding product",
              description: data?.payload?.message,
              variant: "destructive",
            });
          }
        })
        .catch((error) => {
          console.error("Add product error:", error);
          toast({
            title: "Error adding product",
            description: error.message,
            variant: "destructive",
          });
        });
    }
  }

  function handleDelete(getCurrentProductId) {
    console.log("Deleting product:", getCurrentProductId);

    if (window.confirm("Are you sure you want to delete this product?")) {
      dispatch(deleteProduct(getCurrentProductId))
        .then((data) => {
          if (data?.payload?.success) {
            dispatch(fetchAllProducts());
            toast({
              title: "Product deleted successfully",
            });
          } else {
            toast({
              title: "Error deleting product",
              description: data?.payload?.message,
              variant: "destructive",
            });
          }
        })
        .catch((error) => {
          console.error("Delete product error:", error);
          toast({
            title: "Error deleting product",
            description: error.message,
            variant: "destructive",
          });
        });
    }
  }

  function isFormValid() {
    const basicFieldsValid =
      formData.title.trim() !== "" &&
      formData.description.trim() !== "" &&
      formData.category !== "" &&
      formData.subcategory !== "" &&
      formData.brand.trim() !== "" &&
      formData.price !== "" &&
      formData.images.length > 0 &&
      formData.colors.length > 0;

    const sizesValid =
      formData.sizes.length === 0 ||
      formData.sizes.every((item) => item.size && item.stock !== undefined);

    return basicFieldsValid && sizesValid;
  }

  // Load product data when editing
  useEffect(() => {
    if (currentEditedId && openCreateProductsDialog) {
      const productToEdit = productList.find(
        (item) => item._id === currentEditedId
      );
      if (productToEdit) {
        setFormData({
          images: productToEdit.images || [],
          title: productToEdit.title || "",
          description: productToEdit.description || "",
          category: productToEdit.category || "",
          subcategory: productToEdit.subcategory || "",
          brand: productToEdit.brand || "",
          price: productToEdit.price || "",
          salePrice: productToEdit.salePrice || "",
          colors: productToEdit.colors || [],
          totalStock: productToEdit.totalStock || "",
          averageReview: productToEdit.averageReview || 0,
          sizes: productToEdit.sizes || [],
          isFeatured: productToEdit.isFeatured || false,
          isActive:
            productToEdit.isActive !== undefined
              ? productToEdit.isActive
              : true,
          tags: productToEdit.tags || [],
        });
      }
    }
  }, [currentEditedId, openCreateProductsDialog, productList]);

  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

  const handleResetForm = () => {
    setFormData(initialFormData);
    setCurrentEditedId(null);
    setActiveTab("basic");
    setImageUploadStates({});
  };

  return (
    <Fragment>
      <div className="mb-5 w-full flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Products Management</h1>
          <p className="text-gray-600">Manage your product catalog</p>
        </div>
        <Button
          onClick={() => setOpenCreateProductsDialog(true)}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Add New Product"}
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading products...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {productList && productList.length > 0 ? (
            productList.map((productItem) => (
              <AdminProductTile
                setFormData={setFormData}
                setOpenCreateProductsDialog={setOpenCreateProductsDialog}
                setCurrentEditedId={setCurrentEditedId}
                product={productItem}
                handleDelete={handleDelete}
                key={productItem._id}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              No products found. Add your first product!
            </div>
          )}
        </div>
      )}

      <Sheet
        open={openCreateProductsDialog}
        onOpenChange={(open) => {
          setOpenCreateProductsDialog(open);
          if (!open) {
            handleResetForm();
          }
        }}
      >
        <SheetContent
          side="right"
          className="overflow-auto w-full sm:max-w-3xl"
        >
          <SheetHeader>
            <SheetTitle>
              {currentEditedId !== null ? "Edit Product" : "Add New Product"}
            </SheetTitle>
          </SheetHeader>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full mt-6"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="media">Media & Colors</TabsTrigger>
              <TabsTrigger value="sizes">Sizes & Stock</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <div className="space-y-6">
                <CommonForm
                  onSubmit={(e) => e.preventDefault()}
                  formData={formData}
                  setFormData={setFormData}
                  buttonText="Next: Media & Colors"
                  formControls={addProductFormElements}
                  isBtnDisabled={
                    !formData.title ||
                    !formData.category ||
                    !formData.subcategory ||
                    !formData.brand ||
                    !formData.price
                  }
                  onButtonClick={() => setActiveTab("media")}
                />
              </div>
            </TabsContent>

            <TabsContent value="media">
              <div className="space-y-6">
                {/* Product Images Section */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Product Images</h3>
                    {/* <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addImageUploadSlot}
                    >
                      + Add Another Image
                    </Button> */}
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload multiple images for your product. First image will be
                    used as the main product image.
                  </p>

                  {/* Multiple Image Upload Components */}
                  <div className="space-y-4">
                    {Object.keys(imageUploadStates).map((uploadKey) => (
                      <ProductImageUpload
                        key={uploadKey}
                        imageFile={imageUploadStates[uploadKey]?.imageFile}
                        setImageFile={(file) =>
                          updateImageUploadState(uploadKey, { imageFile: file })
                        }
                        uploadedImageUrl={
                          imageUploadStates[uploadKey]?.uploadedImageUrl
                        }
                        setUploadedImageUrl={(url) => {
                          updateImageUploadState(uploadKey, {
                            uploadedImageUrl: url,
                          });
                          if (url) {
                            handleImageUploaded(url, uploadKey);
                          }
                        }}
                        imageLoadingState={
                          imageUploadStates[uploadKey]?.imageLoadingState
                        }
                        setImageLoadingState={(loading) =>
                          updateImageUploadState(uploadKey, {
                            imageLoadingState: loading,
                          })
                        }
                        // isEditMode={currentEditedId !== null}
                      />
                    ))}
                  </div>

                  {/* Uploaded Images Preview */}
                  {formData.images.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium mb-3">
                        Uploaded Images ({formData.images.length})
                        <span className="text-xs text-green-600 ml-2">
                          ✓ {formData.images.length} image(s) ready
                        </span>
                      </h4>
                      <div className="grid grid-cols-3 gap-3">
                        {formData.images.map((imageUrl, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={imageUrl}
                              alt={`Product ${index + 1}`}
                              className="w-full h-24 object-cover rounded border"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center gap-1">
                              {index === 0 && (
                                <span className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1 rounded">
                                  Main
                                </span>
                              )}
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => handleSetMainImage(imageUrl)}
                                className="opacity-0 group-hover:opacity-100 h-6 px-2 text-xs"
                                disabled={index === 0}
                              >
                                Set Main
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRemoveImage(imageUrl)}
                                className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {formData.images.length === 0 && (
                    <div className="text-center py-8 text-gray-500 border rounded-lg">
                      <p className="text-sm">
                        No images uploaded yet. Use the uploaders above to add
                        images.
                      </p>
                    </div>
                  )}
                </div>

                {/* Color Manager */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Product Colors</h3>
                  <ColorManager
                    colors={formData.colors}
                    onColorsChange={(newColors) =>
                      setFormData((prev) => ({ ...prev, colors: newColors }))
                    }
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("basic")}
                    className="flex-1"
                  >
                    Back to Basic Info
                  </Button>
                  <Button
                    onClick={() => setActiveTab("sizes")}
                    disabled={
                      formData.images.length === 0 ||
                      formData.colors.length === 0
                    }
                    className="flex-1"
                  >
                    Next: Sizes & Stock
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sizes">
              <div className="space-y-6">
                <SizeStockManager
                  sizes={formData.sizes}
                  onSizesChange={(newSizes) =>
                    setFormData((prev) => ({ ...prev, sizes: newSizes }))
                  }
                />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Additional Settings</h3>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      checked={formData.isFeatured}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          isFeatured: e.target.checked,
                        }))
                      }
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="isFeatured" className="text-sm font-medium">
                      Feature this product
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          isActive: e.target.checked,
                        }))
                      }
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium">
                      Product is active
                    </label>
                  </div>

                  <div>
                    <label
                      htmlFor="tags"
                      className="text-sm font-medium block mb-2"
                    >
                      Tags (comma separated)
                    </label>
                    <input
                      id="tags"
                      type="text"
                      placeholder="e.g., summer, casual, new-arrival"
                      value={
                        Array.isArray(formData.tags)
                          ? formData.tags.join(", ")
                          : formData.tags
                      }
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          tags: e.target.value,
                        }))
                      }
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("media")}
                    className="flex-1"
                  >
                    Back to Media & Colors
                  </Button>
                  <Button
                    onClick={onSubmit}
                    disabled={!isFormValid() || isLoading}
                    className="flex-1"
                  >
                    {isLoading
                      ? "Processing..."
                      : currentEditedId !== null
                      ? "Update Product"
                      : "Add Product"}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}

export default AdminProducts;
