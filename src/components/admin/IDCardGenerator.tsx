"use client";
import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileBadge } from "lucide-react";

export function IDCardGenerator({ member }: { member: any }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const generatePDF = async () => {
    if (!cardRef.current) return;
    setGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 4, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [54, 86]
      });
      pdf.addImage(imgData, "PNG", 0, 0, 54, 86);
      pdf.save(`ID_Card_${member.memberId}.pdf`);
      toast.success("ID Card generated!");
    } catch (e) {
      toast.error("Failed to generate ID Card");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <Button variant="outline" size="sm" onClick={generatePDF} disabled={generating} className="w-full justify-start">
        <FileBadge className="h-4 w-4 mr-2" />
        {generating ? "Generating..." : "ID Card"}
      </Button>

      {/* Hidden ID Card Template */}
      <div className="fixed left-[200vw] top-0 pointer-events-none">
        <div 
          ref={cardRef} 
          className="w-[204px] h-[325px] bg-white border border-gray-200 relative overflow-hidden flex flex-col font-sans"
          style={{ width: "204px", height: "325px", boxSizing: "border-box" }}
        >
          {/* Header */}
          <div className="bg-red-700 p-2 text-center text-white flex flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" className="w-10 h-10 bg-white rounded-full p-0.5 mb-1 object-cover" alt="Logo" />
            <div className="text-[10px] font-bold leading-tight">MANGAL GURUJI</div>
            <div className="text-[6px] opacity-90 tracking-widest">FOUNDATION</div>
          </div>
          
          {/* Body */}
          <div className="flex-1 flex flex-col items-center px-3 pt-3">
            <div className="w-20 h-24 bg-gray-200 border-2 border-red-700 mb-2 overflow-hidden shadow-sm">
              {member.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={member.photoUrl} className="w-full h-full object-cover" crossOrigin="anonymous" alt="Profile" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-[9px] text-center p-1 bg-gray-100">Photo<br/>Required</div>
              )}
            </div>
            
            <div className="text-center w-full">
              <div className="font-bold text-sm text-gray-900 leading-tight break-words">{member.name}</div>
              <div className="text-[10px] text-red-700 font-semibold mb-2 uppercase tracking-wide">{member.designation}</div>
              
              <div className="text-left w-full space-y-0.5 border-t pt-1.5">
                <div className="text-[8px] text-gray-600"><span className="font-semibold text-gray-900 w-10 inline-block">ID NO:</span> {member.memberId}</div>
                <div className="text-[8px] text-gray-600"><span className="font-semibold text-gray-900 w-10 inline-block">PHONE:</span> {member.phone}</div>
                <div className="text-[8px] text-gray-600"><span className="font-semibold text-gray-900 w-10 inline-block">BLOOD:</span> <span className="text-red-700 font-bold">{member.bloodGroup}</span></div>
              </div>
            </div>
          </div>
          
          {/* Footer QR */}
          <div className="bg-gray-100 p-2 flex justify-between items-center border-t mt-auto">
            <div className="text-[5px] text-gray-500 max-w-[60%] leading-tight">
              If found, please return to:<br/>Mangal Guruji Foundation<br/>contact@mangalguruji.org
            </div>
            <div className="bg-white p-0.5 rounded shadow-sm">
              <QRCodeSVG value={`https://mangalguruji.org/verify/${member.memberId}`} size={30} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
