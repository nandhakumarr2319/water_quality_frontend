import React, { useState } from "react";

/**
 * DataChart Component (Ultra Enhanced)
 * - Matches ChatBox new UI
 * - Circle download button option
 * - Smooth zoom animations
 * - Clean modal with glow shadow
 * - Dark mode support (auto)
 */
export default function DataChart({ imageSrc, title }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!imageSrc) return null;

  const imgSrc = `data:image/png;base64,${imageSrc}`;
  const safeTitle = (title || "chart").replace(/\s+/g, "_").toLowerCase();

  const handleDownload = (e) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = imgSrc;
    link.download = `${safeTitle}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {/* CHART CARD */}
      <div
        className="
          bg-white dark:bg-[#0e1726] 
          rounded-xl p-4 mb-4 shadow-md 
          border border-gray-200 dark:border-gray-700
          transition-all duration-300 hover:shadow-xl
        "
      >
        {/* HEADER */}
        <div className="flex justify-between items-center mb-2">
          <span
            className="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate"
            title={title}
          >
            {title || "Analysis Chart"}
          </span>

          {/* Circle Download Button */}
          <button
            onClick={handleDownload}
            className="
              w-9 h-9 flex items-center justify-center
              rounded-full border border-blue-300 
              bg-blue-50 dark:bg-blue-900
              text-blue-700 dark:text-blue-200
              hover:bg-blue-100 dark:hover:bg-blue-800
              active:scale-90 transition
            "
            title="Download chart"
          >
            ⬇
          </button>
        </div>

        {/* Chart Image Preview */}
        <div
          onClick={() => setIsExpanded(true)}
          className="
            cursor-zoom-in rounded-lg overflow-hidden 
            bg-gray-50 dark:bg-gray-800
            border border-gray-100 dark:border-gray-700
            flex justify-center items-center
            transition-all duration-300
          "
          style={{ minHeight: "220px" }}
        >
          <img
            src={imgSrc}
            alt={title}
            className="
              w-full h-auto max-h-[360px] object-contain
              transition-transform duration-300 
              hover:scale-105
            "
          />
        </div>
      </div>

      {/* ==================== MODAL ==================== */}
      {isExpanded && (
        <div
          className="
            fixed inset-0 z-50 flex items-center justify-center 
            bg-black bg-opacity-80 backdrop-blur-md
            p-4 animate-fadeIn
          "
          onClick={() => setIsExpanded(false)}
        >
          <div
            className="
              relative max-w-6xl w-full rounded-xl
              bg-white dark:bg-[#0f172a]
              shadow-[0_0_40px_rgba(0,0,0,0.5)]
              p-4 animate-zoomIn border border-gray-300 dark:border-gray-700
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                {title || "Chart View"}
              </h3>

              <div className="flex gap-2">
                {/* DOWNLOAD BUTTON */}
                <button
                  onClick={handleDownload}
                  className="
                    px-3 py-1.5 rounded-lg
                    bg-blue-600 text-white 
                    hover:bg-blue-700 active:scale-95
                    text-sm shadow-sm
                  "
                >
                  Download PNG
                </button>

                {/* CLOSE BUTTON */}
                <button
                  onClick={() => setIsExpanded(false)}
                  className="
                    w-9 h-9 rounded-full
                    bg-gray-200 dark:bg-gray-700 
                    text-gray-900 dark:text-gray-200 
                    hover:bg-gray-300 dark:hover:bg-gray-600
                    active:scale-95 transition flex items-center justify-center
                  "
                >
                  ✕
                </button>
              </div>
            </div>

            {/* MODAL IMAGE */}
            <div className="flex justify-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg mt-2">
              <img
                src={imgSrc}
                className="
                  max-w-full max-h-[80vh] object-contain 
                  rounded-lg shadow-inner
                "
                alt="Full chart"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
