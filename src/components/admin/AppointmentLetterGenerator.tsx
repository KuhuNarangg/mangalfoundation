"use client";
import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileText } from "lucide-react";
import { formatDate } from "@/lib/format";

export function AppointmentLetterGenerator({ member }: { member: any }) {
  const letterRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const generatePDF = async () => {
    if (!letterRef.current) return;
    setGenerating(true);
    try {
      const canvas = await html2canvas(letterRef.current, { scale: 3, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Appointment_${member.memberId}.pdf`);
      toast.success("Appointment Letter generated!");
    } catch (e) {
      toast.error("Failed to generate Appointment Letter");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <Button variant="outline" size="sm" onClick={generatePDF} disabled={generating} className="w-full justify-start">
        <FileText className="h-4 w-4 mr-2" />
        {generating ? "Generating..." : "Appointment Letter"}
      </Button>

      {/* Hidden Letter Template A4 Size (210x297mm) -> ~ 794x1123px */}
      <div className="fixed left-[200vw] top-0 pointer-events-none">
        <div 
          ref={letterRef} 
          className="bg-white text-black p-12 relative flex flex-col font-serif"
          style={{ width: "794px", minHeight: "1123px", boxSizing: "border-box" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-red-700 pb-6 mb-8">
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo.png" className="w-20 h-20 object-cover" crossOrigin="anonymous" alt="Logo" />
              <div>
                <h1 className="text-3xl font-bold text-red-700">MANGAL GURUJI FOUNDATION</h1>
                <p className="text-sm text-gray-600 tracking-wider">EMPOWERING COMMUNITIES, INSPIRING LIVES</p>
              </div>
            </div>
            <div className="text-right text-sm text-gray-600">
              <p>Date: {formatDate(new Date())}</p>
              <p>Ref: MGF/APP/{new Date().getFullYear()}/{member.memberId?.split('-')[2] || '001'}</p>
            </div>
          </div>
          
          {/* Body */}
          <div className="text-[17px] leading-loose flex-1 space-y-6 text-justify">
            <h2 className="text-2xl font-bold text-center underline mb-10 tracking-widest uppercase">Appointment Letter</h2>
            
            <p>Dear <strong>{member.name}</strong>,</p>
            
            <p>
              We are exceptionally pleased to officially appoint you as a <strong>{member.designation}</strong> at the Mangal Guruji Foundation. 
              Your recorded joining date is <strong>{formatDate(member.joiningDate || new Date())}</strong>, and your assigned Member Identification Number is <strong>{member.memberId}</strong>.
            </p>

            <p>
              As a core {member.designation}, you will play an instrumental role in advancing our foundational mission of community empowerment, self-reliance, education, and compassion. We trust and expect you to uphold the highest standards of integrity, dedication, and selfless service that our foundation so proudly stands for.
            </p>

            <p>
              Your continued association with us is subject to the rules, regulations, and moral codes of the foundation, which may be amended from time to time. We believe that your dedicated contribution will bring significant value to our ongoing community initiatives.
            </p>

            <p>
              We warmly welcome you to the Mangal Guruji family and wish you a profoundly successful and rewarding journey with us.
            </p>

            <p className="pt-8">
              Sincerely,
            </p>
          </div>
          
          {/* Footer Signature */}
          <div className="mt-16 pt-8">
            <div className="mb-2 w-48 border-b border-gray-400 pb-2">
               <span className="text-3xl text-blue-900 font-bold" style={{ fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive", opacity: 0.8 }}>
                 Aditya Vikram
               </span>
            </div>
            <p className="font-bold text-lg">Aditya Vikram Singh</p>
            <p className="text-gray-600">Founder & President</p>
            <p className="text-sm text-red-700 mt-1 font-bold uppercase tracking-wide">Mangal Guruji Foundation</p>
          </div>
        </div>
      </div>
    </div>
  );
}
