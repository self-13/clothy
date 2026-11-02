import { filterOptions } from "@/config";
import { Fragment } from "react";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";

function ProductFilter({ filters, handleFilter }) {
  const filterHeaders = {
    brand: "Designers & Brands",
    color: "Color Palette",
    size: "Sizing",
  };

  return (
    <div className="w-full font-sans">
      <div className="pb-5 mb-6 border-b border-zinc-200/80 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#121212]">
          Refine Results
        </h2>
      </div>

      <div className="space-y-7">
        {Object.keys(filterOptions).map((keyItem) => (
          <Fragment key={keyItem}>
            <div>
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400 mb-3.5">
                {filterHeaders[keyItem] || keyItem}
              </h3>
              <div className="flex flex-col gap-2.5">
                {filterOptions[keyItem].map((option) => {
                  const isChecked = !!(
                    filters &&
                    filters[keyItem] &&
                    filters[keyItem].includes(option.id)
                  );

                  return (
                    <Label
                      key={option.id}
                      className="flex text-xs tracking-wide font-normal items-center gap-2.5 cursor-pointer text-zinc-600 hover:text-black transition-colors duration-150 select-none py-0.5"
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => handleFilter(keyItem, option.id)}
                        className="rounded-sm border-zinc-300 data-[state=checked]:bg-[#121212] data-[state=checked]:border-[#121212] transition-colors"
                      />
                      <span className={isChecked ? "font-medium text-[#121212]" : ""}>
                        {option.label}
                      </span>
                    </Label>
                  );
                })}
              </div>
            </div>
            <Separator className="bg-zinc-200/60" />
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export default ProductFilter;
