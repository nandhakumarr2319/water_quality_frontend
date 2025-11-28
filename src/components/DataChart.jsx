import React from "react";

/**
 * DataChart Component
 * Displays a base64 PNG chart returned from backend (Matplotlib or Recharts)
 */
export default function DataChart({ imageSrc }) {
  if (!imageSrc) return null;

  return (
    <div style={styles.chartWrapper}>
      <div style={styles.chartContainer}>
        <img
          src={`data:image/png;base64,${imageSrc}`}
          alt="Water Quality Chart"
          style={styles.image}
        />
      </div>
    </div>
  );
}

// Inline modern styles — consistent with chat-glass theme
const styles = {
  chartWrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "15px",
    width: "100%",
  },
  chartContainer: {
    background: "rgba(0, 255, 255, 0.08)",
    borderRadius: "16px",
    boxShadow:
      "0 0 20px rgba(0,255,255,0.15), inset 0 0 10px rgba(255,255,255,0.05)",
    padding: "10px",
    width: "95%",
    backdropFilter: "blur(8px)",
    transition: "transform 0.2s ease, box-shadow 0.3s ease",
  },
  image: {
    width: "100%",
    borderRadius: "10px",
    boxShadow: "0 0 20px rgba(0,0,0,0.3)",
    filter: "brightness(1.1) contrast(1.05)",
  },
};
