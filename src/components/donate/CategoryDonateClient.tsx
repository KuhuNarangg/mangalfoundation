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
        {category.packages.map((pkg: any, idx: number) => (
          <div key={pkg.id} className="bg-gradient-to-br from-white to-gray-50/80 rounded-2xl overflow-hidden shadow-sm border border-rose-100/50 hover:shadow-xl hover:border-rose-200 transition-all flex flex-col h-full group transform hover:-translate-y-1">
            <div className="p-6 md:p-8 flex-grow flex flex-col">
              <div className="flex justify-between items-start mb-4 gap-4">
                <h3 className="text-xl font-sans text-charcoal font-bold leading-tight">{pkg.title}</h3>
                <span className="bg-gradient-to-r from-rose-100 to-orange-100 text-rose-700 font-extrabold px-4 py-1.5 rounded-full text-sm shrink-0 whitespace-nowrap shadow-sm">
                  ₹{pkg.amount}
                </span>
              </div>
              
              <p className="text-gray-600 mb-6 text-sm flex-grow font-medium">
                {pkg.description}
              </p>
              
              {pkg.impactStatement && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100/50 rounded-xl p-4 mb-6 text-sm font-semibold text-emerald-800 flex items-start gap-2 shadow-sm">
                  <span className="text-emerald-500 mt-0.5 text-base">✦</span> 
                  {pkg.impactStatement}
                </div>
              )}

              <div className="mt-auto block">
                <Button 
                  onClick={() => openDonate(pkg)}
                  className="w-full bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold tracking-wide h-12 rounded-xl group-hover:shadow-lg transition-all duration-300 text-base border-0"
                >
                  Select & Donate
                </Button>
              </div>
            </div>
          </div>
        ))}

        {/* Custom Amount Card */}
        <div className="bg-gradient-to-br from-white to-gray-50/80 rounded-2xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-xl hover:border-gray-300 transition-all flex flex-col h-full group transform hover:-translate-y-1">
          <div className="p-6 md:p-8 flex-grow flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-sans text-charcoal font-bold leading-tight">Custom Amount</h3>
              <span className="bg-gray-100 text-gray-700 font-extrabold px-4 py-1.5 rounded-full text-sm shrink-0 whitespace-nowrap shadow-sm">
                ₹ Any
              </span>
            </div>
            
            <p className="text-gray-600 mb-6 text-sm flex-grow font-medium">
              Every contribution matters. Choose an amount that you are comfortable with to support this cause.
            </p>
            
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100/50 rounded-xl p-4 mb-6 text-sm font-semibold text-rose-800 flex items-start gap-2 shadow-sm">
              <span className="text-rose-500 mt-0.5 text-base">♥</span> 
              Your generosity brings hope.
            </div>

            <div className="mt-auto block">
              <Button 
                onClick={() => openDonate(null, true)}
                className="w-full bg-white border-2 border-charcoal text-charcoal hover:bg-charcoal hover:text-white font-bold tracking-wide h-12 rounded-xl transition-all duration-300 text-base"
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
