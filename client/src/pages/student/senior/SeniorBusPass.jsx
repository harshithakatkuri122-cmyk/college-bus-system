import React from "react";
// Import based on your file tree: src/images/cbitlogo.png
import cbitLogo from "../../../images/cbitlogo.png";

export default function SeniorBusPass({ student }) {
  if (!student || student.paymentStatus !== "Active") return null;

  const { name, rollNo, busNo, seatNo } = student;

  // External Verification QR (Displayed outside the ID Card only)
  const qrData = encodeURIComponent(`VALID_PASS:${rollNo}`);
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}`;

  return (
    <div className="mt-10 flex flex-col items-center font-sans pb-20 bg-gray-50 min-h-screen">
      
      {/* 1. THE BUS PASS - Optimized for Cleanliness */}
      <div 
        className="printable relative bg-white shadow-xl border border-gray-200 overflow-hidden flex flex-col" 
        style={{ width: "140mm", height: "90mm", borderRadius: "20px" }}
      >
        {/* Header Section */}
        <div className="bg-[#00a884] h-24 p-6 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-5">
            {/* College Logo */}
            <div className="w-14 h-14 bg-white rounded-xl p-1.5 flex items-center justify-center shadow-md">
              <img 
                src={cbitLogo} 
                alt="CBIT Logo" 
                className="max-w-full max-h-full object-contain" 
              />
            </div>
            <div>
              <h1 className="text-xl font-bold uppercase tracking-tight leading-none">CBIT HYDERABAD</h1>
              <p className="text-[9px] opacity-90 mt-1.5 uppercase tracking-[0.3em] font-medium">Transport Department</p>
            </div>
          </div>
          
          {/* Validity - Fixed to One Line */}
          <div className="bg-black/10 px-4 py-2 rounded-lg backdrop-blur-md border border-white/10 whitespace-nowrap">
             <span className="text-[10px] uppercase font-bold opacity-70 mr-2">Validity:</span>
             <span className="text-sm font-bold tracking-widest">2025 - 2026</span>
          </div>
        </div>

        {/* Main Body Section */}
        <div className="px-12 flex-grow flex items-center gap-12">
          {/* Student Photo Placeholder */}
          <div className="shrink-0">
            <div className="w-36 h-44 bg-gray-50 border-2 border-[#00a884] rounded-2xl flex items-center justify-center overflow-hidden shadow-inner relative">
              <svg className="w-24 h-24 text-gray-200" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
              <div className="absolute bottom-0 w-full bg-[#00a884] py-1.5">
                <p className="text-[10px] font-bold text-white text-center uppercase tracking-[0.2em]">STUDENT</p>
              </div>
            </div>
          </div>

          {/* Details Section - Reduced Font Sizes for "Clean" look */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="border-b border-gray-100 pb-4">
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-[0.15em] mb-1">Full Name</p>
              <h2 className="text-xl font-semibold text-[#1a365d] uppercase truncate">
                {name}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1 tracking-wider">Roll Number</p>
                <p className="text-base font-medium text-gray-800 font-mono">{rollNo}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1 tracking-wider">Bus / Seat No</p>
                <p className="text-base font-medium text-gray-800">{busNo} / {seatNo}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Area */}
        <div className="px-12 pb-8 flex justify-end">
          <div className="text-center">
            <div className="w-40 border-b border-gray-300 h-8"></div>
            <p className="text-[9px] text-gray-400 uppercase font-bold mt-2 tracking-widest leading-none">Authorized Signatory</p>
          </div>
        </div>

        {/* Bottom Color Accent */}
        <div className="h-2 w-full flex shrink-0">
          <div className="w-1/3 bg-yellow-400"></div>
          <div className="w-2/3 bg-[#00a884]"></div>
        </div>
      </div>

      {/* 2. EXTERNAL VERIFICATION (FOR SCREEN ONLY) */}
      <div className="no-print mt-12 flex flex-col items-center bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-[10px] font-bold text-gray-400 mb-4 uppercase tracking-[0.2em]">Verification Scan</h3>
        <div className="p-3 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <img src={qrCodeUrl} alt="QR Verification" className="w-28 h-28" />
        </div>
      </div>

      {/* Action Button */}
      <button 
        onClick={() => window.print()} 
        className="mt-10 no-print bg-[#00a884] text-white px-12 py-3.5 rounded-xl font-bold shadow-lg hover:bg-[#008f6f] transition-all flex items-center gap-3 active:scale-95"
      >
        <span>🖨️</span> PRINT BUS PASS
      </button>

      <style>{`
        @media print {
          body { background: white; }
          .printable { 
            position: fixed; 
            left: 50%; 
            top: 15%; 
            transform: translateX(-50%); 
            box-shadow: none !important;
            border: 1px solid #eee !important;
          }
          .no-print { display: none !important; }
          @page { size: A4; margin: 0; }
        }
      `}</style>
    </div>
  );
}