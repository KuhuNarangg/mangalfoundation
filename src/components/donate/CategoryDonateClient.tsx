"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DonateModal } from "./DonateModal";

export function CategoryDonateClient({ category }: { category: any }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);

  const openDonate = (pkg: any) => {
    setSelectedPackage(pkg);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {category.packages.map((pkg: any) => (
          <div key={pkg.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-sand hover:shadow-md transition-shadow flex flex-col h-full">
            <div className="p-6 md:p-8 flex-grow flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-heading text-charcoal font-semibold">{pkg.title}</h3>
                <span className="bg-primary/10 text-primary font-bold px-3 py-1 rounded-full text-sm shrink-0">
                  ₹{pkg.amount}
                </span>
              </div>
              
              <p className="text-charcoal-light mb-6 text-sm flex-grow">
                {pkg.description}
              </p>
              
              {pkg.impactStatement && (
                <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-6">
                  <p className="text-sm font-medium text-green-800 flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✦</span> 
                    {pkg.impactStatement}
                  </p>
                </div>
              )}

              <div className="mt-auto block">
                <Button 
                  onClick={() => openDonate(pkg)}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-medium h-12 rounded-full"
                >
                  Donate ₹{pkg.amount}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <DonateModal 
          category={category}
          pkg={selectedPackage}
          isCustom={false}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
