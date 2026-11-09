import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, Ruler, HelpCircle, Check, Info } from "lucide-react";

const TOPS_SIZING_DATA = {
  men: {
    title: "Men's Tops & Upper Wear Standard Sizing",
    inches: [
      { size: "XS", chest: '34" - 36"', shoulder: '16.5"', length: '27.0"', sleeve: '8.0"', waist: '28" - 30"' },
      { size: "S", chest: '36" - 38"', shoulder: '17.5"', length: '28.0"', sleeve: '8.5"', waist: '30" - 32"' },
      { size: "M", chest: '38" - 40"', shoulder: '18.5"', length: '29.0"', sleeve: '9.0"', waist: '32" - 34"' },
      { size: "L", chest: '40" - 42"', shoulder: '19.5"', length: '30.0"', sleeve: '9.5"', waist: '34" - 36"' },
      { size: "XL", chest: '42" - 44"', shoulder: '20.5"', length: '31.0"', sleeve: '10.0"', waist: '36" - 38"' },
      { size: "XXL", chest: '44" - 46"', shoulder: '21.5"', length: '32.0"', sleeve: '10.5"', waist: '38" - 40"' },
    ],
    cm: [
      { size: "XS", chest: "86 - 91 cm", shoulder: "42.0 cm", length: "68.5 cm", sleeve: "20.5 cm", waist: "71 - 76 cm" },
      { size: "S", chest: "91 - 96 cm", shoulder: "44.5 cm", length: "71.0 cm", sleeve: "21.5 cm", waist: "76 - 81 cm" },
      { size: "M", chest: "96 - 101 cm", shoulder: "47.0 cm", length: "73.5 cm", sleeve: "23.0 cm", waist: "81 - 86 cm" },
      { size: "L", chest: "101 - 106 cm", shoulder: "49.5 cm", length: "76.0 cm", sleeve: "24.0 cm", waist: "86 - 91 cm" },
      { size: "XL", chest: "106 - 111 cm", shoulder: "52.0 cm", length: "78.5 cm", sleeve: "25.5 cm", waist: "91 - 96 cm" },
      { size: "XXL", chest: "111 - 116 cm", shoulder: "54.5 cm", length: "81.0 cm", sleeve: "26.5 cm", waist: "96 - 101 cm" },
    ],
  },
  women: {
    title: "Women's Tops & Upper Wear Standard Sizing",
    inches: [
      { size: "XS", chest: '31" - 33"', shoulder: '14.5"', length: '24.5"', sleeve: '7.0"', waist: '24" - 26"' },
      { size: "S", chest: '33" - 35"', shoulder: '15.5"', length: '25.0"', sleeve: '7.5"', waist: '26" - 28"' },
      { size: "M", chest: '35" - 37"', shoulder: '16.5"', length: '25.5"', sleeve: '8.0"', waist: '28" - 30"' },
      { size: "L", chest: '37" - 40"', shoulder: '17.5"', length: '26.0"', sleeve: '8.5"', waist: '30" - 33"' },
      { size: "XL", chest: '40" - 43"', shoulder: '18.5"', length: '26.5"', sleeve: '9.0"', waist: '33" - 36"' },
      { size: "XXL", chest: '43" - 46"', shoulder: '19.5"', length: '27.0"', sleeve: '9.5"', waist: '36" - 39"' },
    ],
    cm: [
      { size: "XS", chest: "78 - 84 cm", shoulder: "37.0 cm", length: "62.0 cm", sleeve: "18.0 cm", waist: "61 - 66 cm" },
      { size: "S", chest: "84 - 89 cm", shoulder: "39.5 cm", length: "63.5 cm", sleeve: "19.0 cm", waist: "66 - 71 cm" },
      { size: "M", chest: "89 - 94 cm", shoulder: "42.0 cm", length: "65.0 cm", sleeve: "20.5 cm", waist: "71 - 76 cm" },
      { size: "L", chest: "94 - 102 cm", shoulder: "44.5 cm", length: "66.0 cm", sleeve: "21.5 cm", waist: "76 - 84 cm" },
      { size: "XL", chest: "102 - 109 cm", shoulder: "47.0 cm", length: "67.5 cm", sleeve: "23.0 cm", waist: "84 - 91 cm" },
      { size: "XXL", chest: "109 - 117 cm", shoulder: "49.5 cm", length: "68.5 cm", sleeve: "24.0 cm", waist: "91 - 99 cm" },
    ],
  },
  unisex: {
    title: "Unisex & Oversized Tops Standard Sizing",
    inches: [
      { size: "XS", chest: '36" - 38"', shoulder: '18.0"', length: '27.5"', sleeve: '8.5"', waist: '29" - 31"' },
      { size: "S", chest: '38" - 40"', shoulder: '19.0"', length: '28.5"', sleeve: '9.0"', waist: '31" - 33"' },
      { size: "M", chest: '40" - 42"', shoulder: '20.0"', length: '29.5"', sleeve: '9.5"', waist: '33" - 35"' },
      { size: "L", chest: '42" - 44"', shoulder: '21.0"', length: '30.5"', sleeve: '10.0"', waist: '35" - 37"' },
      { size: "XL", chest: '44" - 46"', shoulder: '22.0"', length: '31.5"', sleeve: '10.5"', waist: '37" - 39"' },
      { size: "XXL", chest: '46" - 48"', shoulder: '23.0"', length: '32.5"', sleeve: '11.0"', waist: '39" - 41"' },
    ],
    cm: [
      { size: "XS", chest: "91 - 96 cm", shoulder: "45.5 cm", length: "70.0 cm", sleeve: "21.5 cm", waist: "74 - 79 cm" },
      { size: "S", chest: "96 - 101 cm", shoulder: "48.0 cm", length: "72.5 cm", sleeve: "23.0 cm", waist: "79 - 84 cm" },
      { size: "M", chest: "101 - 106 cm", shoulder: "51.0 cm", length: "75.0 cm", sleeve: "24.0 cm", waist: "84 - 89 cm" },
      { size: "L", chest: "106 - 111 cm", shoulder: "53.5 cm", length: "77.5 cm", sleeve: "25.5 cm", waist: "89 - 94 cm" },
      { size: "XL", chest: "111 - 117 cm", shoulder: "56.0 cm", length: "80.0 cm", sleeve: "26.5 cm", waist: "94 - 99 cm" },
      { size: "XXL", chest: "117 - 122 cm", shoulder: "58.5 cm", length: "82.5 cm", sleeve: "28.0 cm", waist: "99 - 104 cm" },
    ],
  },
};

const BOTTOMS_SIZING_DATA = {
  men: {
    title: "Men's Bottoms, Jeans & Trousers Sizing",
    inches: [
      { size: "28 (XS)", waist: '28" - 29"', hip: '36" - 37"', inseam: '30" - 32"', length: '39.5"', thigh: '21.0"', rise: '10.0"', cuff: '13.5"' },
      { size: "30 (S)", waist: '30" - 31"', hip: '38" - 39"', inseam: '30" - 32"', length: '40.0"', thigh: '22.0"', rise: '10.5"', cuff: '14.0"' },
      { size: "32 (M)", waist: '32" - 33"', hip: '40" - 41"', inseam: '32" - 34"', length: '41.0"', thigh: '23.0"', rise: '11.0"', cuff: '14.5"' },
      { size: "34 (L)", waist: '34" - 35"', hip: '42" - 43"', inseam: '32" - 34"', length: '41.5"', thigh: '24.0"', rise: '11.5"', cuff: '15.0"' },
      { size: "36 (XL)", waist: '36" - 37"', hip: '44" - 45"', inseam: '32" - 34"', length: '42.0"', thigh: '25.0"', rise: '12.0"', cuff: '15.5"' },
      { size: "38 (XXL)", waist: '38" - 40"', hip: '46" - 48"', inseam: '32" - 34"', length: '42.5"', thigh: '26.0"', rise: '12.5"', cuff: '16.0"' },
    ],
    cm: [
      { size: "28 (XS)", waist: "71 - 74 cm", hip: "91 - 94 cm", inseam: "76 - 81 cm", length: "100.5 cm", thigh: "53.5 cm", rise: "25.5 cm", cuff: "34.0 cm" },
      { size: "30 (S)", waist: "76 - 79 cm", hip: "96 - 99 cm", inseam: "76 - 81 cm", length: "101.5 cm", thigh: "56.0 cm", rise: "26.5 cm", cuff: "35.5 cm" },
      { size: "32 (M)", waist: "81 - 84 cm", hip: "101 - 104 cm", inseam: "81 - 86 cm", length: "104.0 cm", thigh: "58.5 cm", rise: "28.0 cm", cuff: "37.0 cm" },
      { size: "34 (L)", waist: "86 - 89 cm", hip: "106 - 109 cm", inseam: "81 - 86 cm", length: "105.5 cm", thigh: "61.0 cm", rise: "29.0 cm", cuff: "38.0 cm" },
      { size: "36 (XL)", waist: "91 - 94 cm", hip: "111 - 114 cm", inseam: "81 - 86 cm", length: "106.5 cm", thigh: "63.5 cm", rise: "30.5 cm", cuff: "39.5 cm" },
      { size: "38 (XXL)", waist: "96 - 101 cm", hip: "116 - 122 cm", inseam: "81 - 86 cm", length: "108.0 cm", thigh: "66.0 cm", rise: "32.0 cm", cuff: "40.5 cm" },
    ],
  },
  women: {
    title: "Women's Bottoms, Jeans & Trousers Sizing",
    inches: [
      { size: "24-25 (XS)", waist: '24" - 25"', hip: '34" - 35"', inseam: '29" - 31"', length: '38.0"', thigh: '19.5"', rise: '9.5"', cuff: '12.5"' },
      { size: "26-27 (S)", waist: '26" - 27"', hip: '36" - 37"', inseam: '29" - 31"', length: '38.5"', thigh: '20.5"', rise: '10.0"', cuff: '13.0"' },
      { size: "28-29 (M)", waist: '28" - 29"', hip: '38" - 39"', inseam: '30" - 32"', length: '39.5"', thigh: '21.5"', rise: '10.5"', cuff: '13.5"' },
      { size: "30-31 (L)", waist: '30" - 32"', hip: '40" - 42"', inseam: '30" - 32"', length: '40.0"', thigh: '22.5"', rise: '11.0"', cuff: '14.0"' },
      { size: "32-34 (XL)", waist: '32" - 34"', hip: '42" - 45"', inseam: '30" - 32"', length: '40.5"', thigh: '24.0"', rise: '11.5"', cuff: '14.5"' },
      { size: "35-37 (XXL)", waist: '35" - 37"', hip: '45" - 48"', inseam: '30" - 32"', length: '41.0"', thigh: '25.5"', rise: '12.0"', cuff: '15.0"' },
    ],
    cm: [
      { size: "24-25 (XS)", waist: "61 - 64 cm", hip: "86 - 89 cm", inseam: "74 - 79 cm", length: "96.5 cm", thigh: "49.5 cm", rise: "24.0 cm", cuff: "32.0 cm" },
      { size: "26-27 (S)", waist: "66 - 69 cm", hip: "91 - 94 cm", inseam: "74 - 79 cm", length: "98.0 cm", thigh: "52.0 cm", rise: "25.5 cm", cuff: "33.0 cm" },
      { size: "28-29 (M)", waist: "71 - 74 cm", hip: "96 - 99 cm", inseam: "76 - 81 cm", length: "100.5 cm", thigh: "54.5 cm", rise: "26.5 cm", cuff: "34.5 cm" },
      { size: "30-31 (L)", waist: "76 - 81 cm", hip: "101 - 106 cm", inseam: "76 - 81 cm", length: "101.5 cm", thigh: "57.0 cm", rise: "28.0 cm", cuff: "35.5 cm" },
      { size: "32-34 (XL)", waist: "81 - 86 cm", hip: "106 - 114 cm", inseam: "76 - 81 cm", length: "103.0 cm", thigh: "61.0 cm", rise: "29.0 cm", cuff: "37.0 cm" },
      { size: "35-37 (XXL)", waist: "89 - 94 cm", hip: "114 - 122 cm", inseam: "76 - 81 cm", length: "104.0 cm", thigh: "65.0 cm", rise: "30.5 cm", cuff: "38.0 cm" },
    ],
  },
  unisex: {
    title: "Unisex Pants, Shorts & Relaxed Trousers",
    inches: [
      { size: "XS", waist: '28" - 30"', hip: '36" - 38"', inseam: '30" - 32"', length: '39.0"', thigh: '21.5"', rise: '10.5"', cuff: '13.5"' },
      { size: "S", waist: '30" - 32"', hip: '38" - 40"', inseam: '30" - 32"', length: '40.0"', thigh: '22.5"', rise: '11.0"', cuff: '14.0"' },
      { size: "M", waist: '32" - 34"', hip: '40" - 42"', inseam: '32" - 34"', length: '41.0"', thigh: '23.5"', rise: '11.5"', cuff: '14.5"' },
      { size: "L", waist: '34" - 36"', hip: '42" - 44"', inseam: '32" - 34"', length: '41.5"', thigh: '24.5"', rise: '12.0"', cuff: '15.0"' },
      { size: "XL", waist: '36" - 38"', hip: '44" - 46"', inseam: '32" - 34"', length: '42.0"', thigh: '25.5"', rise: '12.5"', cuff: '15.5"' },
      { size: "XXL", waist: '38" - 41"', hip: '46" - 49"', inseam: '32" - 34"', length: '42.5"', thigh: '26.5"', rise: '13.0"', cuff: '16.0"' },
    ],
    cm: [
      { size: "XS", waist: "71 - 76 cm", hip: "91 - 96 cm", inseam: "76 - 81 cm", length: "99.0 cm", thigh: "54.5 cm", rise: "26.5 cm", cuff: "34.0 cm" },
      { size: "S", waist: "76 - 81 cm", hip: "96 - 101 cm", inseam: "76 - 81 cm", length: "101.5 cm", thigh: "57.0 cm", rise: "28.0 cm", cuff: "35.5 cm" },
      { size: "M", waist: "81 - 86 cm", hip: "101 - 106 cm", inseam: "81 - 86 cm", length: "104.0 cm", thigh: "59.5 cm", rise: "29.0 cm", cuff: "37.0 cm" },
      { size: "L", waist: "86 - 91 cm", hip: "106 - 111 cm", inseam: "81 - 86 cm", length: "105.5 cm", thigh: "62.0 cm", rise: "30.5 cm", cuff: "38.0 cm" },
      { size: "XL", waist: "91 - 96 cm", hip: "111 - 117 cm", inseam: "81 - 86 cm", length: "106.5 cm", thigh: "64.5 cm", rise: "32.0 cm", cuff: "39.5 cm" },
      { size: "XXL", waist: "96 - 104 cm", hip: "117 - 124 cm", inseam: "81 - 86 cm", length: "108.0 cm", thigh: "67.0 cm", rise: "33.0 cm", cuff: "40.5 cm" },
    ],
  },
};

function isBottomsGarment(subcategory = "", title = "") {
  const text = `${subcategory} ${title}`.toLowerCase();
  return (
    text.includes("jean") ||
    text.includes("pant") ||
    text.includes("trouser") ||
    text.includes("short") ||
    text.includes("bottom") ||
    text.includes("jogger") ||
    text.includes("denim") ||
    text.includes("chino") ||
    text.includes("skirt") ||
    text.includes("cargo") ||
    text.includes("sweatpant")
  );
}

export default function SizeGuideDialog({
  open,
  onOpenChange,
  category = "men",
  subcategory = "",
  productTitle = "",
}) {
  const initialCategory =
    category?.toLowerCase() === "women"
      ? "women"
      : category?.toLowerCase() === "kids"
      ? "unisex"
      : "men";

  const autoDetectBottoms = isBottomsGarment(subcategory, productTitle);

  const [garmentType, setGarmentType] = useState(autoDetectBottoms ? "bottoms" : "tops");
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [unit, setUnit] = useState("inches"); // "inches" | "cm"

  // Update auto-detected type whenever subcategory/title changes
  useEffect(() => {
    if (autoDetectBottoms) {
      setGarmentType("bottoms");
    } else {
      setGarmentType("tops");
    }
  }, [subcategory, productTitle, autoDetectBottoms]);

  const activeDataset =
    garmentType === "bottoms"
      ? BOTTOMS_SIZING_DATA[activeCategory] || BOTTOMS_SIZING_DATA.men
      : TOPS_SIZING_DATA[activeCategory] || TOPS_SIZING_DATA.men;

  const currentMeasurements = activeDataset[unit] || activeDataset.inches;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName="z-[90] bg-black/70 backdrop-blur-sm"
        className="max-w-4xl w-[95vw] max-h-[90vh] p-0 overflow-hidden bg-white border border-zinc-200 rounded-none shadow-2xl flex flex-col z-[100]"
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-white sticky top-0 z-20">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                Precision Fit Architecture
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black flex items-center gap-2">
              <Ruler className="w-5 h-5 text-black" />
              Clothing Size Guide
            </h2>
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-9 h-9 border border-zinc-200 flex items-center justify-center hover:bg-black hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Garment Type Toggle (Tops vs Bottoms) */}
        <div className="px-6 py-3 bg-zinc-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">
              Garment Silhouette:
            </span>
            <div className="inline-flex bg-zinc-800 p-1 border border-zinc-700">
              <button
                type="button"
                onClick={() => setGarmentType("tops")}
                className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  garmentType === "tops"
                    ? "bg-white text-black shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Tops &amp; Upper Wear
              </button>
              <button
                type="button"
                onClick={() => setGarmentType("bottoms")}
                className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  garmentType === "bottoms"
                    ? "bg-white text-black shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Bottoms &amp; Trousers
              </button>
            </div>
          </div>

          <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">
            {garmentType === "bottoms"
              ? "Trousers // Jeans // Pants // Shorts"
              : "T-Shirts // Shirts // Hoodies // Jackets"}
          </span>
        </div>

        {/* Action Controls & Mode Selectors */}
        <div className="px-6 py-4 bg-[#FAF9F6] border-b border-zinc-200/80 flex flex-wrap items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 bg-white border border-zinc-200 p-0.5">
            {[
              { id: "men", label: "Men" },
              { id: "women", label: "Women" },
              { id: "unisex", label: "Unisex / Oversized" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeCategory === tab.id
                    ? "bg-black text-white"
                    : "text-zinc-400 hover:text-black hover:bg-zinc-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Unit Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              Unit:
            </span>
            <div className="flex border border-zinc-200 bg-white p-0.5">
              <button
                type="button"
                onClick={() => setUnit("inches")}
                className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  unit === "inches"
                    ? "bg-black text-white"
                    : "text-zinc-400 hover:text-black"
                }`}
              >
                Inches (IN)
              </button>
              <button
                type="button"
                onClick={() => setUnit("cm")}
                className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  unit === "cm"
                    ? "bg-black text-white"
                    : "text-zinc-400 hover:text-black"
                }`}
              >
                Centimeters (CM)
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 scrollbar-thin">
          
          {/* Section 1: Visual Garment Schematic Image */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">
                  Visual Blueprint // {garmentType === "bottoms" ? "Bottoms & Lower Wear" : "Upper Wear"}
                </p>
                <h3 className="text-sm font-black uppercase tracking-wider text-black">
                  {garmentType === "bottoms"
                    ? "Trousers & Jeans Measurement Schematic"
                    : "Garment Measurement Schematic"}
                </h3>
              </div>
              <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest hidden sm:inline">
                Spec. Standard Flat Lay
              </span>
            </div>

            <div className="w-full bg-[#FAF9F6] border border-zinc-200 p-2 sm:p-4 flex items-center justify-center overflow-hidden">
              <img
                src={garmentType === "bottoms" ? "/bottoms-size-guide.svg" : "/size-guide.svg"}
                alt={
                  garmentType === "bottoms"
                    ? "Trousers & Jeans Measurement Schematic Guide"
                    : "Garment Sizing and Measurement Schematic Guide"
                }
                className="w-full max-h-[380px] object-contain shadow-sm"
                loading="eager"
              />
            </div>
          </div>

          {/* Section 2: Numeric Conversion Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">
                  Precision Matrix
                </p>
                <h3 className="text-sm font-black uppercase tracking-wider text-black">
                  {activeDataset.title}
                </h3>
              </div>
              <span className="text-[10px] font-bold text-black uppercase tracking-wider bg-zinc-100 px-2 py-0.5 border border-zinc-200">
                Displaying in {unit.toUpperCase()}
              </span>
            </div>

            <div className="border border-zinc-200 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-100 border-b border-zinc-200 text-[10px] font-black uppercase tracking-wider text-zinc-600">
                    <th className="py-3 px-4 border-r border-zinc-200">Size</th>
                    {garmentType === "bottoms" ? (
                      <>
                        <th className="py-3 px-4 border-r border-zinc-200">
                          Waistband (A)
                        </th>
                        <th className="py-3 px-4 border-r border-zinc-200">
                          Hip / Seat (B)
                        </th>
                        <th className="py-3 px-4 border-r border-zinc-200">
                          Inseam (C)
                        </th>
                        <th className="py-3 px-4 border-r border-zinc-200">
                          Outseam / Total (D)
                        </th>
                        <th className="py-3 px-4 border-r border-zinc-200">
                          Thigh (E)
                        </th>
                        <th className="py-3 px-4">
                          Front Rise (G)
                        </th>
                      </>
                    ) : (
                      <>
                        <th className="py-3 px-4 border-r border-zinc-200">
                          Chest / Bust (A)
                        </th>
                        <th className="py-3 px-4 border-r border-zinc-200">
                          Shoulder (B)
                        </th>
                        <th className="py-3 px-4 border-r border-zinc-200">
                          Body Length (C)
                        </th>
                        <th className="py-3 px-4 border-r border-zinc-200">
                          Sleeve (D)
                        </th>
                        <th className="py-3 px-4">Waist / Sweep (E)</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {currentMeasurements.map((row, index) => (
                    <tr
                      key={row.size}
                      className={`hover:bg-zinc-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-[#FAF9F6]"
                      }`}
                    >
                      <td className="py-3 px-4 font-black text-black border-r border-zinc-200 whitespace-nowrap">
                        {row.size}
                      </td>
                      {garmentType === "bottoms" ? (
                        <>
                          <td className="py-3 px-4 font-mono text-zinc-700 border-r border-zinc-200 whitespace-nowrap">
                            {row.waist}
                          </td>
                          <td className="py-3 px-4 font-mono text-zinc-700 border-r border-zinc-200 whitespace-nowrap">
                            {row.hip}
                          </td>
                          <td className="py-3 px-4 font-mono text-zinc-700 border-r border-zinc-200 whitespace-nowrap">
                            {row.inseam}
                          </td>
                          <td className="py-3 px-4 font-mono text-zinc-700 border-r border-zinc-200 whitespace-nowrap">
                            {row.length}
                          </td>
                          <td className="py-3 px-4 font-mono text-zinc-700 border-r border-zinc-200 whitespace-nowrap">
                            {row.thigh}
                          </td>
                          <td className="py-3 px-4 font-mono text-zinc-700 whitespace-nowrap">
                            {row.rise}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-3 px-4 font-mono text-zinc-700 border-r border-zinc-200 whitespace-nowrap">
                            {row.chest}
                          </td>
                          <td className="py-3 px-4 font-mono text-zinc-700 border-r border-zinc-200 whitespace-nowrap">
                            {row.shoulder}
                          </td>
                          <td className="py-3 px-4 font-mono text-zinc-700 border-r border-zinc-200 whitespace-nowrap">
                            {row.length}
                          </td>
                          <td className="py-3 px-4 font-mono text-zinc-700 border-r border-zinc-200 whitespace-nowrap">
                            {row.sleeve}
                          </td>
                          <td className="py-3 px-4 font-mono text-zinc-700 whitespace-nowrap">
                            {row.waist}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: How to Measure Guidance */}
          <div className="bg-[#FAF9F6] border border-zinc-200/90 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-black" />
              <h4 className="text-xs font-black uppercase tracking-wider text-black">
                {garmentType === "bottoms"
                  ? "How to Take Accurate Trousers & Bottom Measurements"
                  : "How to Take Accurate Body Measurements"}
              </h4>
            </div>

            {garmentType === "bottoms" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="space-y-1 bg-white p-3 border border-zinc-200">
                  <p className="font-black text-[10px] uppercase tracking-wider text-black flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-black text-white text-[9px] flex items-center justify-center font-bold">
                      A
                    </span>
                    Waistband
                  </p>
                  <p className="text-zinc-500 font-light leading-relaxed text-[11px]">
                    Fasten front button. Measure straight across the top waistband edge and multiply by 2 for total circumference.
                  </p>
                </div>

                <div className="space-y-1 bg-white p-3 border border-zinc-200">
                  <p className="font-black text-[10px] uppercase tracking-wider text-black flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-black text-white text-[9px] flex items-center justify-center font-bold">
                      B
                    </span>
                    Hip / Seat
                  </p>
                  <p className="text-zinc-500 font-light leading-relaxed text-[11px]">
                    Measure straight across the fullest part of the hips, approximately 7 to 8 inches below the waistband.
                  </p>
                </div>

                <div className="space-y-1 bg-white p-3 border border-zinc-200">
                  <p className="font-black text-[10px] uppercase tracking-wider text-black flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-black text-white text-[9px] flex items-center justify-center font-bold">
                      C
                    </span>
                    Inseam Length
                  </p>
                  <p className="text-zinc-500 font-light leading-relaxed text-[11px]">
                    Measure along the inner leg seam starting from the crotch point down to the bottom ankle hemline.
                  </p>
                </div>

                <div className="space-y-1 bg-white p-3 border border-zinc-200">
                  <p className="font-black text-[10px] uppercase tracking-wider text-black flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-black text-white text-[9px] flex items-center justify-center font-bold">
                      G
                    </span>
                    Front Rise
                  </p>
                  <p className="text-zinc-500 font-light leading-relaxed text-[11px]">
                    Measure vertically from the crotch seam intersection straight up to the top of the front waistband.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="space-y-1 bg-white p-3 border border-zinc-200">
                  <p className="font-black text-[10px] uppercase tracking-wider text-black flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-black text-white text-[9px] flex items-center justify-center font-bold">
                      A
                    </span>
                    Chest / Bust
                  </p>
                  <p className="text-zinc-500 font-light leading-relaxed text-[11px]">
                    Measure around the fullest part of the chest, keeping tape comfortably level under armpits.
                  </p>
                </div>

                <div className="space-y-1 bg-white p-3 border border-zinc-200">
                  <p className="font-black text-[10px] uppercase tracking-wider text-black flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-black text-white text-[9px] flex items-center justify-center font-bold">
                      B
                    </span>
                    Shoulder Span
                  </p>
                  <p className="text-zinc-500 font-light leading-relaxed text-[11px]">
                    Measure across the upper back from the tip of one shoulder bone straight to the other.
                  </p>
                </div>

                <div className="space-y-1 bg-white p-3 border border-zinc-200">
                  <p className="font-black text-[10px] uppercase tracking-wider text-black flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-black text-white text-[9px] flex items-center justify-center font-bold">
                      C
                    </span>
                    Body Length
                  </p>
                  <p className="text-zinc-500 font-light leading-relaxed text-[11px]">
                    Measure from the highest point of the neck seam straight down to the lower hemline.
                  </p>
                </div>

                <div className="space-y-1 bg-white p-3 border border-zinc-200">
                  <p className="font-black text-[10px] uppercase tracking-wider text-black flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-black text-white text-[9px] flex items-center justify-center font-bold">
                      D
                    </span>
                    Sleeve Length
                  </p>
                  <p className="text-zinc-500 font-light leading-relaxed text-[11px]">
                    Measure from the shoulder seam joint down the outer arm to the edge of the sleeve cuff.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1 text-[10px] text-zinc-500 font-light">
              <Info className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
              <span>
                {garmentType === "bottoms" ? (
                  <>
                    <strong>Fit Note:</strong> For rigid 100% cotton denim, choose your exact waist measurement. For tailored stretch trousers or relaxed joggers, size according to your preferred rise and thigh drape.
                  </>
                ) : (
                  <>
                    <strong>Fit Note:</strong> For an intentional relaxed or oversized drape, select your standard size. For a tailored, closer-to-body contour, consider sizing down one interval.
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-zinc-100 bg-white flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            Complimentary 10-Day Exchanges On All Sizing Discrepancies
          </p>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-6 py-2.5 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Acknowledge &amp; Return
          </button>
        </div>

      </DialogContent>
    </Dialog>
  );
}