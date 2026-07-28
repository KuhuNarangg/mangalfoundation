"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DonateModal } from "./DonateModal";

export function CategoryDonateClient({ category }: { category: any }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [isCustom, setIsCustom] = useState(false);

  const openDonate = (pkg: any, custom: boolean = false) => {
    setSelectedPackage(pkg);
    setIsCustom(custom);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {category.packages.map((pkg: any) => (
          <div key={pkg.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-sand hover:shadow-xl transition-all flex flex-col h-full group">
            <div className="p-6 md:p-8 flex-grow flex flex-col">
              <div className="flex justify-between items-start mb-4 gap-4">
                <h3 className="text-xl font-heading text-charcoal font-semibold">{pkg.title}</h3>
                <span className="bg-rose-50 text-rose-600 font-bold px-3 py-1 rounded-full text-sm shrink-0 whitespace-nowrap">
                  ₹{pkg.amount}
                </span>
              </div>
              
              <p className="text-charcoal-light mb-6 text-sm flex-grow">
                {pkg.description}
              </p>
              
              {pkg.impactStatement && (
                <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-6 text-sm font-medium text-green-800 flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✦</span> 
                  {pkg.impactStatement}
                </div>
              )}

              <div className="mt-auto block">
                <Button 
                  onClick={() => openDonate(pkg)}
                  className="w-full bg-charcoal hover:bg-black text-white font-medium h-12 rounded-xl group-hover:shadow-md transition-all duration-300"
                >
                  Select & Donate
                </Button>
              </div>
            </div>
          </div>
        ))}

        {/* Custom Amount Card */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-sand hover:shadow-xl transition-all flex flex-col h-full group">
          <div className="p-6 md:p-8 flex-grow flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-heading text-charcoal font-semibold">Custom Amount</h3>
              <span className="bg-gray-100 text-gray-600 font-bold px-3 py-1 rounded-full text-sm shrink-0 whitespace-nowrap">
                ₹ Any
              </span>
            </div>
            
            <p className="text-charcoal-light mb-6 text-sm flex-grow">
              Every contribution matters. Choose an amount that you are comfortable with to support this cause.
            </p>
            
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 mb-6 text-sm font-medium text-rose-800 flex items-start gap-2">
              <span className="text-rose-600 mt-0.5">♥</span> 
              Your generosity brings hope.
            </div>

            <div className="mt-auto block">
              <Button 
                onClick={() => openDonate(null, true)}
                className="w-full bg-white border-2 border-charcoal text-charcoal hover:bg-charcoal hover:text-white font-medium h-12 rounded-xl transition-all duration-300"
              >
                Enter Custom Amount
              </Button>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <DonateModal 
          category={category}
          pkg={selectedPackage}
          isCustom={isCustom}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
