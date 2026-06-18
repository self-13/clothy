import { filterOptions } from "@/config";
import { Fragment } from "react";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";

function ProductFilter({ filters, handleFilter }) {
  const filterHeaders = {
    brand: "Brands",
    color: "Colors",
    size: "Sizes",
  };

  return (
    <div className="w-full">
      <div className="pb-6 mb-6 border-b border-zinc-100">
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-black">Filters</h2>
      </div>
      <div className="space-y-6">
        {Object.keys(filterOptions).map((keyItem) => (
          <Fragment key={keyItem}>
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-3">
                {filterHeaders[keyItem] || keyItem}
              </h3>
              <div className="flex flex-col gap-3">
                {filterOptions[keyItem].map((option) => (
                  <Label
                    key={option.id}
                    className="flex font-spaceGrotesk text-xs uppercase tracking-wider font-bold items-center gap-3 cursor-pointer text-zinc-600 hover:text-black transition-colors duration-200"
                  >
                    <Checkbox
                      checked={
                        !!(filters &&
                        filters[keyItem] &&
                        filters[keyItem].includes(option.id))
                      }
                      onCheckedChange={() => handleFilter(keyItem, option.id)}
                      className="border-zinc-300 text-black focus:ring-black data-[state=checked]:bg-black data-[state=checked]:text-white transition-colors"
                    />
                    <span>{option.label}</span>
                  </Label>
                ))}
              </div>
            </div>
            <Separator className="bg-zinc-100" />
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export default ProductFilter;
