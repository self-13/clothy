import ProductImageUpload from "@/components/admin-view/image-upload";
import AdminProductTile from "@/components/admin-view/product-tile";
import CommonForm from "@/components/common/form";
import SizeStockManager from "@/components/admin-view/size-stock-manager";
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

const initialFormData = {
  image: null,
  title: "",
  description: "",
  category: "",
  brand: "",
  price: "",
  salePrice: "",
  totalStock: "",
  averageReview: 0,
  sizes: [],
};

function AdminProducts() {
  const [openCreateProductsDialog, setOpenCreateProductsDialog] =
    useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");

  const { productList, isLoading } = useSelector(
    (state) => state.adminProducts
  );
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { toast } = useToast();

  function onSubmit(event) {
    event.preventDefault();

    const sizes = formData.sizes || [];
    const totalStockFromSizes = sizes.reduce(
      (total, item) => total + (item.stock || 0),
      0
    );

    const productData = {
      ...formData,
      image: uploadedImageUrl,
      totalStock:
        totalStockFromSizes > 0 ? totalStockFromSizes : formData.totalStock,
      sizes,
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
            setFormData(initialFormData);
            setOpenCreateProductsDialog(false);
            setCurrentEditedId(null);
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
            setImageFile(null);
            setFormData(initialFormData);
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

  // FIXED: Delete product function
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
    const basicFieldsValid = Object.keys(formData)
      .filter(
        (currentKey) =>
          currentKey !== "averageReview" &&
          currentKey !== "sizes" &&
          currentKey !== "totalStock"
      )
      .map((key) => formData[key] !== "")
      .every((item) => item);

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
          image: productToEdit.image,
          title: productToEdit.title || "",
          description: productToEdit.description || "",
          category: productToEdit.category || "",
          brand: productToEdit.brand || "",
          price: productToEdit.price || "",
          salePrice: productToEdit.salePrice || "",
          totalStock: productToEdit.totalStock || "",
          averageReview: productToEdit.averageReview || 0,
          sizes: productToEdit.sizes || [],
        });
        setUploadedImageUrl(productToEdit.image || "");
      }
    }
  }, [currentEditedId, openCreateProductsDialog, productList]);

  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

  return (
    <Fragment>
      <div className="mb-5 w-full flex justify-end ">
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
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
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
        onOpenChange={() => {
          setOpenCreateProductsDialog(false);
          setCurrentEditedId(null);
          setFormData(initialFormData);
          setUploadedImageUrl("");
          setImageFile(null);
          setActiveTab("basic");
        }}
      >
        <SheetContent
          side="right"
          className="overflow-auto w-full sm:max-w-2xl"
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="sizes">Sizes & Stock</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <ProductImageUpload
                imageFile={imageFile}
                setImageFile={setImageFile}
                uploadedImageUrl={uploadedImageUrl}
                setUploadedImageUrl={setUploadedImageUrl}
                setImageLoadingState={setImageLoadingState}
                imageLoadingState={imageLoadingState}
                isEditMode={currentEditedId !== null}
              />
              <div className="py-6">
                <CommonForm
                  onSubmit={(e) => e.preventDefault()}
                  formData={formData}
                  setFormData={setFormData}
                  buttonText="Next: Sizes & Stock"
                  formControls={addProductFormElements}
                  isBtnDisabled={!isFormValid()}
                  onButtonClick={() => setActiveTab("sizes")}
                />
              </div>
            </TabsContent>

            <TabsContent value="sizes">
              <SizeStockManager
                sizes={formData.sizes}
                onSizesChange={(newSizes) =>
                  setFormData((prev) => ({ ...prev, sizes: newSizes }))
                }
              />
              <div className="flex gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("basic")}
                  className="flex-1"
                >
                  Back to Basic Info
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
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}

export default AdminProducts;
