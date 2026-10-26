"use client";

import { useState } from "react";
import {
  X,
  ShieldCheck,
  MapPin,
  Camera,
  ArrowRight,
  Info,
} from "lucide-react";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReportModal({ isOpen, onClose }: ReportModalProps) {
  const [category, setCategory] = useState("Hostels");
  const [location, setLocation] = useState("");
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("High");
  const [demoNotice, setDemoNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDemoNotice(
      "Frontend Demo: Issue submission will connect to the Spring Boot REST API upon backend integration. Form remains in preview mode."
    );
  };

  const handleClose = () => {
    setDemoNotice(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-card border border-line shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200 text-ink">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-mute hover:text-ink hover:bg-soft transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-soft text-indigo-500 border border-line flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">
              Campus Issue Form (Preview)
            </span>
          </div>

          <h3 className="text-xl font-bold text-ink">
            Report a Campus Grievance
          </h3>
          <p className="text-xs text-mute mt-0.5">
            Clear descriptions help maintenance staff diagnose issues and allocate resources efficiently.
          </p>

          {/* Inline demo notice when form is submitted */}
          {demoNotice && (
            <div className="mt-4 p-3 rounded-xl bg-soft border border-line text-xs text-ink flex items-start gap-2 animate-in fade-in duration-150">
              <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <span>{demoNotice}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                Campus Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-line bg-soft px-3 py-2 text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-[#818cf8] focus:border-[#818cf8]"
              >
                <option value="Hostels" className="bg-card text-ink">Hostels (Aryabhatta, Gargi, CV Raman)</option>
                <option value="Academic Labs" className="bg-card text-ink">Academic Labs & Smart Classrooms</option>
                <option value="Wi-Fi & IT" className="bg-card text-ink">Campus Wi-Fi & IT Infrastructure</option>
                <option value="Estate & Maintenance" className="bg-card text-ink">
                  Estate & Civil Works (Water, Electrical, Furniture)
                </option>
                <option value="Sports & Cafeteria" className="bg-card text-ink">Sports Grounds & Cafeteria</option>
              </select>
            </div>

            {/* Exact Location */}
            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                Location / Block & Room
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-mute absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g., Aryabhatta Block B, 2nd Floor, Room 214"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-xl border border-line bg-soft pl-9 pr-3 py-2 text-xs font-medium text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-[#818cf8] focus:border-[#818cf8]"
                />
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                Issue Summary
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Water purifier filter pressure drop or Wi-Fi AP offline"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-line bg-soft px-3 py-2 text-xs font-medium text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-[#818cf8] focus:border-[#818cf8]"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                Priority Indicator
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["Normal", "High", "Urgent"].map((p) => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      priority === p
                        ? "bg-brand-gradient text-white border-transparent shadow-xs"
                        : "bg-soft text-mute border-line hover:text-ink hover:border-[#818cf8]"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Upload Proof Mockup */}
            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                Attach Photo (Optional)
              </label>
              <div className="rounded-xl border border-dashed border-line p-3 text-center bg-soft/50 hover:bg-soft transition-colors cursor-pointer">
                <Camera className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
                <span className="text-xs font-medium text-ink block">
                  Click to browse or drag & drop photo
                </span>
                <span className="text-[10px] text-mute">
                  PNG, JPG, or HEIC up to 10MB
                </span>
              </div>
            </div>

            {/* Accountability note */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-soft border border-line text-xs text-mute">
              <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>
                Issues are submitted using your verified institutional account to maintain accountability and prevent spam.
              </span>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              className="w-full py-3 rounded-xl text-sm font-bold text-white bg-brand-gradient hover:opacity-95 shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
            >
              <span>Submit Issue to Department Queue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
