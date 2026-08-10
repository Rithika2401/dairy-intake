import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Eye, Sparkles, Layers } from 'lucide-react';

export const BoundingBoxCanvas = ({ documentTitle, documentType, boundingRegions = [], selectedField, onSelectField }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2.0));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.6));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  return (
    <div className="flex flex-col h-full bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
      {/* Canvas Toolbar */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-200">{documentTitle || 'Original Document Viewer'}</span>
          <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded font-mono">
            {documentType}
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={handleZoomOut}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono text-slate-300 w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={handleZoomIn}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-3 bg-slate-800 mx-1" />
          <button
            onClick={handleRotate}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
            title="Rotate Document"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Document Workspace */}
      <div className="flex-1 relative overflow-auto p-6 flex items-center justify-center bg-slate-950/60 min-h-[420px]">
        <div
          className="relative transition-all duration-200 shadow-2xl rounded-lg border border-slate-700/60 bg-slate-900 overflow-hidden text-slate-200 font-mono"
          style={{
            width: `${540 * zoom}px`,
            height: `${680 * zoom}px`,
            transform: `rotate(${rotation}deg)`,
          }}
        >
          {/* Simulated Printed Document Layout Header */}
          <div className="p-6 border-b border-slate-800 bg-slate-900/90 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm font-sans tracking-wide">
                <Sparkles className="w-4 h-4" /> ANAND DAIRY COOPERATIVE FEDERATION
              </div>
              <p className="text-[10px] text-slate-400 font-sans mt-0.5">Official Dairy Intake & Quality Inspection Document</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-cyan-300 font-sans uppercase">{documentType}</span>
              <p className="text-[10px] text-slate-500 font-mono mt-1">Ref: {documentTitle?.split('#')[1] || 'DOC-2026'}</p>
            </div>
          </div>

          {/* Document Content Body simulation */}
          <div className="p-6 space-y-6 text-xs text-slate-300 font-sans leading-relaxed">
            <div className="p-3 bg-slate-950/80 rounded border border-slate-800 flex justify-between">
              <div>
                <span className="text-[10px] text-slate-500 block">COLLECTION CENTRE</span>
                <span className="font-semibold text-slate-200">Anand Main Chilling Hub (CC-01)</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">INSPECTOR</span>
                <span className="font-semibold text-slate-200">Dr. Ananya Roy (QC)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-950/60 rounded border border-slate-800">
                <span className="text-[10px] font-semibold text-slate-400 block mb-1">MEASUREMENT VALUES</span>
                <p className="text-slate-300 font-mono">Fat Content: <span className="text-cyan-300 font-bold">4.2%</span></p>
                <p className="text-slate-300 font-mono">SNF Solids: <span className="text-slate-200">8.8%</span></p>
                <p className="text-slate-300 font-mono">Chilling Temp: <span className="text-emerald-400 font-bold">3.4°C</span></p>
              </div>

              <div className="p-3 bg-slate-950/60 rounded border border-slate-800">
                <span className="text-[10px] font-semibold text-slate-400 block mb-1">BATCH & TANKER</span>
                <p className="text-slate-300 font-mono">Volume: <span className="text-cyan-300 font-bold">1,250.5 L</span></p>
                <p className="text-slate-300 font-mono">Tanker ID: <span className="text-slate-200">GJ-05-TK-8812</span></p>
                <p className="text-slate-300 font-mono">Seal: <span className="text-emerald-400">INTACT</span></p>
              </div>
            </div>

            <div className="p-4 rounded border border-slate-800/80 bg-slate-950/40 text-[11px]">
              <span className="text-slate-400 font-semibold block mb-1">Grounded Evidence Lineage</span>
              <p className="text-slate-400 italic">
                "Verified physical digital log record from driver and flowmeter readings at Bay #3."
              </p>
            </div>
          </div>

          {/* Bounding Box Highlights Overlay */}
          {boundingRegions.map((region, idx) => {
            const [x, y, w, h] = region.box || [10, 10, 30, 10];
            const isSelected = selectedField === region.field;
            let strokeColor = 'border-cyan-400 bg-cyan-400/10 text-cyan-300';
            if (region.confidence < 0.70) strokeColor = 'border-rose-500 bg-rose-500/20 text-rose-300';
            else if (region.confidence < 0.85) strokeColor = 'border-amber-400 bg-amber-400/20 text-amber-300';

            return (
              <div
                key={idx}
                onClick={() => onSelectField && onSelectField(region.field)}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  width: `${w}%`,
                  height: `${h}%`,
                }}
                className={`absolute border-2 cursor-pointer transition-all duration-200 rounded flex items-center justify-between px-1.5 font-sans font-semibold text-[10px] ${strokeColor} ${
                  isSelected ? 'ring-4 ring-cyan-400 scale-105 z-20 shadow-lg' : 'hover:scale-102 hover:z-10'
                }`}
                title={`Field: ${region.field} | Confidence: ${Math.round(region.confidence * 100)}%`}
              >
                <span className="truncate">{region.field}</span>
                <span className="text-[9px] px-1 rounded bg-slate-950/80 font-mono">{Math.round(region.confidence * 100)}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend Footer */}
      <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-cyan-400 border border-cyan-300" /> High Confidence (&gt;85%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-amber-400 border border-amber-300" /> Medium (70-85%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-rose-400 border border-rose-300" /> Low / Exception (&lt;70%)
          </span>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">Gemini 2.5 Vision Bounding BBoxes</span>
      </div>
    </div>
  );
};
