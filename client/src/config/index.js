export const registerFormControls = [
  {
    name: "userName",
    label: "User Name",
    placeholder: "Enter your user name",
    componentType: "input",
    type: "text",
  },
  {
    name: "email",
    label: "Email",
    placeholder: "Enter your email",
    componentType: "input",
    type: "email",
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
    componentType: "input",
    type: "password",
  },
];

export const loginFormControls = [
  {
    name: "email",
    label: "Email",
    placeholder: "Enter your email",
    componentType: "input",
    type: "email",
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
    componentType: "input",
    type: "password",
  },
];

export const otpFormControls = [
  {
    name: "email",
    label: "Email",
    placeholder: "Enter your email",
    componentType: "input",
    type: "email",
  },
  {
    name: "otp",
    label: "OTP Code",
    placeholder: "Enter OTP code",
    componentType: "input",
    type: "text",
  },
];

export const forgotPasswordFormControls = [
  {
    name: "email",
    label: "Email",
    placeholder: "Enter your email",
    componentType: "input",
    type: "email",
  },
];

export const resetPasswordFormControls = [
  {
    name: "newPassword",
    label: "New Password",
    placeholder: "Enter new password",
    componentType: "input",
    type: "password",
  },
  {
    name: "confirmPassword",
    label: "Confirm Password",
    placeholder: "Confirm new password",
    componentType: "input",
    type: "password",
  },
];

// config/form-elements.js
export const addProductFormElements = [
  {
    type: "text",
    name: "title",
    label: "Product Title",
    placeholder: "Enter product title",
    required: true,
  },
  {
    type: "textarea",
    name: "description",
    label: "Description",
    placeholder: "Enter product description",
    required: true,
  },
  {
    type: "select",
    name: "category",
    label: "Category",
    placeholder: "Select category",
    required: true,
    options: [
      { value: "man", label: "Man" },
      { value: "woman", label: "Woman" },
      { value: "unisex", label: "Unisex" },
    ],
  },
  {
    type: "select",
    name: "subcategory",
    label: "Subcategory",
    placeholder: "Select subcategory",
    required: true,
    options: [
      { value: "t-shirt", label: "T-Shirt" },
      { value: "lower", label: "Lower" },
      { value: "oversized", label: "Oversized" },
      { value: "shoes", label: "Shoes" },
      { value: "others", label: "Others" },
    ],
  },
  {
    type: "text",
    name: "brand",
    label: "Brand",
    placeholder: "Enter brand name",
    required: true,
  },
  {
    type: "number",
    name: "price",
    label: "Price",
    placeholder: "Enter price",
    required: true,
    min: 0,
  },
  {
    type: "number",
    name: "salePrice",
    label: "Sale Price (Optional)",
    placeholder: "Enter sale price",
    min: 0,
  },
  {
    type: "number",
    name: "averageReview",
    label: "Average Review",
    placeholder: "Enter average review (0-5)",
    min: 0,
    max: 5,
    step: 0.1,
  },
];

export const shoppingViewHeaderMenuItems = [
  {
    id: "home",
    label: "Home",
    path: "/shop/home",
  },
  {
    id: "products",
    label: "Products",
    path: "/shop/listing",
  },
  {
    id: "men",
    label: "Men",
    path: "/shop/listing",
  },
  {
    id: "women",
    label: "Women",
    path: "/shop/listing",
  },
  {
    id: "kids",
    label: "Kids",
    path: "/shop/listing",
  },
  {
    id: "search",
    label: "Search",
    path: "/shop/search",
  },
];

export const categoryOptionsMap = {
  men: "Men",
  women: "Women",
  kids: "Kids",
};

export const brandOptionsMap = {
  nike: "Nike",
  adidas: "Adidas",
  puma: "Puma",
  levi: "Levi",
  zara: "Zara",
  "h&m": "H&M",
};

export const filterOptions = {
  category: [
    { id: "men", label: "Men" },
    { id: "women", label: "Women" },
    { id: "kids", label: "Kids" },
  ],
};

export const sortOptions = [
  { id: "price-lowtohigh", label: "Price: Low to High" },
  { id: "price-hightolow", label: "Price: High to Low" },
  { id: "title-atoz", label: "Title: A to Z" },
  { id: "title-ztoa", label: "Title: Z to A" },
];

export const addressFormControls = [
  {
    label: "Address",
    name: "address",
    componentType: "input",
    type: "text",
    placeholder: "Enter your address",
  },
  {
    label: "City",
    name: "city",
    componentType: "input",
    type: "text",
    placeholder: "Enter your city",
  },
  {
    label: "Pincode",
    name: "pincode",
    componentType: "input",
    type: "text",
    placeholder: "Enter your pincode",
  },
  {
    label: "Phone",
    name: "phone",
    componentType: "input",
    type: "text",
    placeholder: "Enter your phone number",
  },
  {
    label: "Notes",
    name: "notes",
    componentType: "textarea",
    placeholder: "Enter any additional notes",
  },
];
