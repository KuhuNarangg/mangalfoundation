"use client";

import { Printer } from "lucide-react";

export function ReceiptActions() {
  return (
    <div className="print:hidden bg-gray-50 border-t px-8 py-5 flex justify-center">
      <button
        onClick={() => window.print()}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform"
      >
        <Printer className="h-4 w-4" /> Download / Print Receipt
      </button>
    </div>
  );
}
