import { useState, useEffect, useCallback, useRef, Fragment, useMemo } from "react";
import { Award, UploadCloud, CheckCircle, Loader2, FileText, Settings } from "lucide-react";
import axios from "axios";
import api from "@/lib/axios";
import toast from "react-hot-toast";

// ---------------------------------------------------------------------------
// PDF coordinate constants — A4 Landscape in PDF points (1 pt = 1/72 inch)
// ---------------------------------------------------------------------------
const PDF_W_PT = 842;
const PDF_H_PT = 595;

const FIELD_META = {
  name: {
    label: "Name",
    color: "#3B82F6",
    bg: "#EFF6FF",
    border: "#BFDBFE"
  },
  issueDate: {
    label: "Issue Date",
    color: "#10B981",
    bg: "#ECFDF5",
    border: "#A7F3D0"
  },
  field: {
    label: "Field/Event",
    color: "#F59E0B",
    bg: "#FFFBEB",
    border: "#FDE68A"
  },
  clubName: {
    label: "Club Name",
    color: "#8B5CF6",
    bg: "#F5F3FF",
    border: "#DDD6FE"
  },
  Rank: {
    label: "Rank",
    color: "#EF4444",
    bg: "#FEF2F2",
    border: "#FECACA"
  },
  signature: {
    label: "Signature",
    color: "#EC4899",
    bg: "#FDF2F8",
    border: "#FBCFE8"
  }
};

const TEXT_COLOR_OPTIONS = [
  { value: "white", label: "White" },
  { value: "darkBlue", label: "Dark Blue" },
  { value: "darkYellow", label: "Dark Yellow" }
];

const DEFAULT_TEMPLATE_LAYOUT = {
  name: { x: 300, y: 420, size: 12, color: "darkBlue" },
  issueDate: { x: 300, y: 100, size: 12, color: "darkBlue" },
  field: { x: 300, y: 380, size: 12, color: "darkBlue" },
  clubName: { x: 300, y: 340, size: 12, color: "darkBlue" },
  Rank: { x: 300, y: 300, size: 14, color: "darkBlue" },
  signature: { x: 500, y: 150, size: 20, color: "darkBlue", text: "Authorized Signatory" }
};

const getDisplayColor = (colorValue, defaultColor) => {
  switch (colorValue) {
    case "white":
      return "#ffffff";
    case "darkBlue":
      return "#1e3a8a";
    case "darkYellow":
      return "#ca8a04";
    default:
      return defaultColor;
  }
};

// ---------------------------------------------------------------------------
// TemplateCoordsEditor — purely presentational sub-component
// Only used inside TemplateSettings; no outside dependencies changed.
// ---------------------------------------------------------------------------
function TemplateCoordsEditor({ previewUrl, layout, onLayoutChange, onUpdateLayout }) {
  const [mode, setMode] = useState("visual");
  const [failedPreviewUrl, setFailedPreviewUrl] = useState("");
  const [dragging, setDragging] = useState(null); // null | fieldKey string
  const [activeTooltip, setActiveTooltip] = useState(null); // null | fieldKey
  const overlayRef = useRef(null);
  const [isSmallScreen, setIsSmallScreen] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 640
  );
  const [smallPreviewWidth, setSmallPreviewWidth] = useState(() =>
    typeof window !== "undefined" ? Math.max(560, Math.round(window.innerWidth * 1.35)) : 560
  );
  const [overlaySize, setOverlaySize] = useState({ width: 0, height: 0 });
  const startPosRef = useRef(null); // { clientX, clientY, origX, origY }

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const onResize = () => {
      setIsSmallScreen(window.innerWidth < 640);
      setSmallPreviewWidth(Math.max(560, Math.round(window.innerWidth * 1.35)));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const el = overlayRef.current;
    if (!el || typeof window === "undefined") return undefined;

    const syncOverlaySize = () => {
      const rect = el.getBoundingClientRect();
      setOverlaySize({
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      });
    };

    syncOverlaySize();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(syncOverlaySize);
      observer.observe(el);
      return () => observer.disconnect();
    }

    window.addEventListener("resize", syncOverlaySize);
    return () => window.removeEventListener("resize", syncOverlaySize);
  }, [previewUrl, isSmallScreen, smallPreviewWidth, mode]);

  // Convert PDF-point coordinates → overlay pixel coordinates.
  // Returns null until the overlay has been measured by ResizeObserver
  // so pills never flash to position (0,0) on first render.
  const ptToPx = useCallback(
    (ptX, ptY) => {
      const { width, height } = overlaySize;
      if (!width || !height) return null;
      return {
        px: Math.round((ptX / PDF_W_PT) * width),
        // PDF Y origin is bottom-left; DOM Y origin is top-left → invert
        py: Math.round(((PDF_H_PT - ptY) / PDF_H_PT) * height)
      };
    },
    [overlaySize]
  );

  useCallback((pxX, pxY) => {
    const el = overlayRef.current;
    if (!el) return { ptX: 0, ptY: 0 };
    const { width, height } = el.getBoundingClientRect();
    return {
      ptX: Math.round((pxX / width) * PDF_W_PT),
      ptY: Math.round(PDF_H_PT - (pxY / height) * PDF_H_PT)
    };
  }, []);

  // ---- pointer event handlers (attached to overlay div) ------------------
  const handlePointerDown = useCallback(
    (e, field) => {
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      setDragging(field);
      setActiveTooltip(field);
      startPosRef.current = {
        clientX: e.clientX,
        clientY: e.clientY,
        origX: layout[field].x,
        origY: layout[field].y
      };
    },
    [layout]
  );

  const handlePointerMove = useCallback(
    (e) => {
      if (!dragging || !startPosRef.current || !overlayRef.current) return;
      const deltaPx = e.clientX - startPosRef.current.clientX;
      const deltaPy = e.clientY - startPosRef.current.clientY;

      const el = overlayRef.current;
      const { width, height } = el.getBoundingClientRect();

      // Convert px delta → PDF-point delta
      const deltaPtX = (deltaPx / width) * PDF_W_PT;
      const deltaPtY = -(deltaPy / height) * PDF_H_PT; // negative: DOM Y top-down, PDF Y bottom-up

      const newX = startPosRef.current.origX + deltaPtX;
      const rawNewY = startPosRef.current.origY + deltaPtY;

      // ── Y compensation (identical to firstEdu reference) ─────────────────
      // Shifts the stored Y up by 30% of the font size so that the backend's
      // field-specific formulas (e.g. (pos.y + scaledSize) * scaleY for name)
      // render text exactly at the admin-selected pill position.
      const fieldSize = Number(layout?.[dragging]?.size) || 0;
      const yCompensation = fieldSize * 0.3;
      const newY = rawNewY + yCompensation;
      // ─────────────────────────────────────────────────────────────────────

      // Clamp within PDF bounds and round to integer points
      onLayoutChange((prev) => ({
        ...prev,
        [dragging]: {
          ...prev[dragging],
          x: Math.round(Math.max(0, Math.min(PDF_W_PT, newX))),
          y: Math.round(Math.max(0, Math.min(PDF_H_PT, newY)))
        }
      }));
    },
    [dragging, layout, onLayoutChange]
  );

  const handlePointerUp = useCallback(() => {
    setDragging(null);
    startPosRef.current = null;
  }, []);

  const normalizedPreviewUrl = String(previewUrl || "").trim();
  const hasTemplate = Boolean(previewUrl);
  const previewLoadFailed =
    Boolean(normalizedPreviewUrl) && failedPreviewUrl === normalizedPreviewUrl;
  const effectiveMode = !hasTemplate || previewLoadFailed ? "manual" : mode;
  const isCloudinaryPdf =
    normalizedPreviewUrl.includes("cloudinary") && /\.pdf(\?|#|$)/i.test(normalizedPreviewUrl);
  const cloudinaryImagePreviewUrl = isCloudinaryPdf
    ? normalizedPreviewUrl.replace(/\.pdf(\?|#|$)/i, ".jpg$1")
    : "";

  return (
    <div className="space-y-4">
      {/* Section header + mode switcher */}
      <div className="flex items-start sm:items-center justify-between flex-wrap gap-3">
        <div className="min-w-0">
          <label className="block text-sm font-bold text-stone-700">Text Field Coordinates</label>
          <p className="text-[11px] text-stone-400 mt-0.5">
            {effectiveMode === "visual"
              ? "Drag each marker to position text on the certificate."
              : "Enter PDF point coordinates (origin: bottom-left)."}
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* VISUAL MODE — PDF iframe + drag overlay                            */}
      {/* ------------------------------------------------------------------ */}

      <div className="space-y-3">
        {/* Legend */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(FIELD_META).map(([field, meta]) => (
            <span
              key={field}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border"
              style={{
                color: meta.color,
                background: meta.bg,
                borderColor: meta.border
              }}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
              {meta.label}
            </span>
          ))}
          <span className="inline-flex items-center gap-1 text-[11px] text-stone-400 italic ml-1">
            drag markers to reposition
          </span>
        </div>

        {/* PDF preview container */}
        <div className="overflow-x-auto pb-1">
          <div
            className="relative rounded-xl overflow-hidden border-2 border-stone-200 bg-stone-100 shadow-inner min-w-[560px] sm:min-w-0"
            style={{
              aspectRatio: `${PDF_W_PT} / ${PDF_H_PT}`,
              width: isSmallScreen ? `${smallPreviewWidth}px` : "100%"
            }}
          >
            {/* Show an exact rasterized image if the template is saved to Cloudinary to bypass browser PDF margins */}
            {isCloudinaryPdf ? (
              <img
                src={cloudinaryImagePreviewUrl}
                alt="Certificate Template Preview"
                className="absolute inset-0 w-full h-full border-0 pointer-events-none"
                style={{ objectFit: "fill" }}
                onError={(e) => {
                  e.target.style.display = "none";
                  setFailedPreviewUrl(normalizedPreviewUrl);
                  setMode("manual");
                }}
              />
            ) : (
              <iframe
                src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0&view=Fit`}
                title="Certificate Template Preview"
                className="absolute inset-0 w-full h-full border-0 pointer-events-none"
                onError={() => {
                  setFailedPreviewUrl(normalizedPreviewUrl);
                  setMode("manual");
                }}
              />
            )}

            {/* Transparent drag overlay */}
            <div
              ref={overlayRef}
              className={`absolute inset-0 ${dragging ? "cursor-grabbing" : "cursor-default"}`}
              style={{ touchAction: "none" }}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              {/* Render a draggable marker for each field */}
              {Object.entries(layout).map(([field, pos]) => {
                const meta = FIELD_META[field];
                if (!meta) return null;

                // Skip rendering until overlay has been measured by ResizeObserver.
                // ptToPx returns null when overlaySize is still {0,0} so pills
                // never flash to (0,0) before snapping to the correct position.
                const pxResult = ptToPx(pos.x, pos.y);
                if (!pxResult) return null;
                const { px, py } = pxResult;

                const isDraggingThis = dragging === field;
                const isActive = activeTooltip === field;

                const liveColor = getDisplayColor(pos.color, meta.color);
                const displayText =
                  field === "signature" && pos.text ? `"${pos.text}"` : meta.label;

                return (
                  <div
                    key={field}
                    style={{
                      position: "absolute",
                      left: px,
                      top: py,
                      zIndex: isDraggingThis ? 30 : 20
                    }}
                  >
                    {/* Marker dot */}
                    <div
                      onPointerDown={(e) => handlePointerDown(e, field)}
                      onMouseEnter={() => setActiveTooltip(field)}
                      onMouseLeave={() => !dragging && setActiveTooltip(null)}
                      title={`Drag to reposition: ${meta.label}`}
                      style={{
                        padding: isSmallScreen ? "3px 8px" : "4px 12px",
                        background: `${liveColor}20`,
                        border: `2px dashed ${liveColor}`,
                        borderBottom: `4px solid ${liveColor}`, // Highlights the baseline!
                        color: liveColor,
                        textShadow: liveColor === "#ffffff" ? "0 1px 2px rgba(0,0,0,0.8)" : "none",
                        fontWeight: "bold",
                        fontSize: `${Math.max(isSmallScreen ? 9 : 10, pos.size * (isSmallScreen ? 0.62 : 0.8))}px`, // Visual approximation
                        transform: "translate(-50%, -100%)", // Centre of pill = pos.x → matches backend text-centre at realX
                        boxShadow: isDraggingThis
                          ? `0 8px 24px rgba(0,0,0,0.15)`
                          : `0 4px 12px rgba(0,0,0,0.05)`,
                        cursor: isDraggingThis ? "grabbing" : "grab",
                        whiteSpace: "nowrap",
                        transition: isDraggingThis ? "none" : "box-shadow 0.15s, background 0.15s",
                        userSelect: "none",
                        backdropFilter: "blur(2px)",
                        borderRadius: "6px",
                        maxWidth: isSmallScreen ? "180px" : "none"
                      }}
                    >
                      <span
                        style={{
                          pointerEvents: "none",
                          userSelect: "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: isSmallScreen ? "4px" : "6px"
                        }}
                      >
                        <span style={{ fontSize: "0.8em", opacity: 0.7 }}>✛</span>
                        {displayText} ({pos.size}pt)
                      </span>
                    </div>

                    {/* Tooltip / coordinate panel — shown on hover or active drag */}
                    {(isActive || isDraggingThis) && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: isSmallScreen ? 24 : 28,
                          left: "50%",
                          transform: "translateX(-50%)",
                          background: "white",
                          border: `1.5px solid ${meta.border}`,
                          borderRadius: 8,
                          padding: "6px 10px",
                          minWidth: isSmallScreen ? 140 : 160,
                          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                          pointerEvents: "none",
                          zIndex: 40
                        }}
                      >
                        <p
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            color: liveColor === "#ffffff" ? "#1c1917" : liveColor,
                            marginBottom: 4,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em"
                          }}
                        >
                          {meta.label}
                        </p>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 4
                          }}
                        >
                          <div style={{ fontSize: 10, color: "#78716c" }}>
                            X: <b style={{ color: "#1c1917" }}>{pos.x}pt</b>
                          </div>
                          <div style={{ fontSize: 10, color: "#78716c" }}>
                            Y: <b style={{ color: "#1c1917" }}>{pos.y}pt</b>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Field controls row  — placed below the preview, always readable */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {Object.entries(layout).map(([field, pos]) => {
            const meta = FIELD_META[field];
            if (!meta) return null;
            return (
              <div
                key={`size-${field}`}
                className="flex flex-col gap-1 p-2.5 rounded-xl border"
                style={{ borderColor: meta.border, background: meta.bg }}
              >
                <label
                  className="text-[9px] sm:text-[9px] font-bold uppercase tracking-widest"
                  style={{ color: meta.color }}
                >
                  {meta.label} — Size (pt)
                </label>
                <input
                  type="number"
                  min={6}
                  max={72}
                  value={pos.size}
                  onChange={(e) => onUpdateLayout(field, "size", e.target.value)}
                  className="w-full px-2 py-1 bg-white border border-stone-200 rounded text-xs focus:ring-2 focus:ring-amber-500/20 outline-none font-semibold"
                />
                <label
                  className="text-[9px] sm:text-[9px] font-bold uppercase tracking-widest mt-2"
                  style={{ color: meta.color }}
                >
                  {meta.label} — Text Color
                </label>
                <select
                  value={pos.color || "white"}
                  onChange={(e) => onUpdateLayout(field, "color", e.target.value)}
                  className="w-full px-2 py-1 bg-white border border-stone-200 rounded text-xs focus:ring-2 focus:ring-amber-500/20 outline-none font-semibold"
                >
                  {TEXT_COLOR_OPTIONS.map((option) => (
                    <option key={`${field}-color-${option.value}`} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {field === "signature" && (
                  <>
                    <label
                      className="text-[9px] sm:text-[9px] font-bold uppercase tracking-widest mt-2"
                      style={{ color: meta.color }}
                    >
                      Signature Text
                    </label>
                    <input
                      type="text"
                      value={pos.text || ""}
                      onChange={(e) => onUpdateLayout(field, "text", e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full px-2 py-1 bg-white border border-stone-200 rounded text-xs focus:ring-2 focus:ring-amber-500/20 outline-none font-semibold italic"
                    />
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Notice when iframe might be blocked */}
        <p className="text-[10px] text-stone-400 italic">
          ⚠ If the preview appears blank, your browser may be blocking the PDF embed. Switch to{" "}
          <b>Manual</b> mode above to set coordinates directly.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TemplateSettings modal — unchanged API: { isOpen, onClose }
// handleSave and layout state structure are identical to the original.
// ---------------------------------------------------------------------------
const TemplateSettings = ({ isOpen, onClose }) => {
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState(null);
  const [layout, setLayout] = useState(DEFAULT_TEMPLATE_LAYOUT);

  // Derive the object URL from `file` synchronously — no setState needed.
  // useMemo recomputes whenever `file` changes (file is state, so the
  // component already re-renders on change).
  const previewObjectUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  // Cleanup-only effect: revoke the previous object URL when it changes.
  // No setState call here — satisfies react-hooks/set-state-in-effect.
  useEffect(() => {
    return () => {
      if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
    };
  }, [previewObjectUrl]);

  const fetchTemplate = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/certificate/v1/template");
      if (res?.data) {
        setTemplate(res.data);
        if (res.data.textLayout && Object.keys(res.data.textLayout).length > 0) {
          const incomingLayout = res.data.textLayout;
          setLayout({
            name: {
              ...DEFAULT_TEMPLATE_LAYOUT.name,
              ...(incomingLayout.name || {})
            },
            issueDate: {
              ...DEFAULT_TEMPLATE_LAYOUT.issueDate,
              ...(incomingLayout.issueDate || {})
            },
            field: {
              ...DEFAULT_TEMPLATE_LAYOUT.field,
              ...(incomingLayout.field || {})
            },
            clubName: {
              ...DEFAULT_TEMPLATE_LAYOUT.clubName,
              ...(incomingLayout.clubName || {})
            },
            Rank: {
              ...DEFAULT_TEMPLATE_LAYOUT.Rank,
              ...(incomingLayout.Rank || {})
            },
            signature: {
              ...DEFAULT_TEMPLATE_LAYOUT.signature,
              ...(incomingLayout.signature || {})
            }
          });
        } else {
          setLayout(DEFAULT_TEMPLATE_LAYOUT);
        }
      }
    } catch (err) {
      console.error("Failed to fetch template:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    (async () => {
      if (!cancelled) await fetchTemplate();
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, fetchTemplate]);
  const handleUpdateLayout = (field, key, val) => {
    const nextValue =
      key === "color" || key === "text" ? String(val || "") : parseInt(val, 10) || 0;
    setLayout((prev) => ({
      ...prev,
      [field]: { ...prev[field], [key]: nextValue }
    }));
  };

  const handleSave = async () => {
    if (!file && !template) {
      toast.error("Please select a PDF template file first.");
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      if (file) {
        formData.append("pdf", file);
      }
      const payloadLayout = {
        ...layout
      };
      formData.append("layout", JSON.stringify(payloadLayout));

      await api.post("/certificate/v1/template", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      toast.success("Certificate template updated successfully!");
      fetchTemplate();
      setFile(null);
    } catch (err) {
      console.error("Failed to save template:", err);
      toast.error(err?.response?.data?.message || "Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="space-y-6 p-1">
      <p className="text-sm text-stone-500 -mt-2">
        This template is used for <b>automatic</b> certificates issued upon course completion.
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="animate-spin text-amber-500" size={32} />
        </div>
      ) : (
        <div className="space-y-6">
          {/* File Upload */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-stone-700">
              Background PDF Template
            </label>
            <div className="relative group">
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div
                className={`p-6 border-2 border-dashed rounded-2xl text-center transition-all ${file ? "border-emerald-300 bg-emerald-50" : "border-stone-200 group-hover:border-amber-400 group-hover:bg-amber-50/30"}`}
              >
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle className="text-emerald-500" size={28} />
                    <span className="text-emerald-700 font-bold text-sm">{file.name}</span>
                    <span className="text-emerald-600/70 text-[10px] uppercase font-bold">
                      New file ready — save to activate
                    </span>
                  </div>
                ) : template ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="text-amber-500" size={28} />
                    <span className="text-stone-700 font-bold text-sm">
                      Current Template Active
                    </span>
                    <span className="text-stone-400 text-[10px]">CLICK TO REPLACE</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-stone-400">
                    <UploadCloud size={28} />
                    <p className="font-bold text-sm">Upload background PDF</p>
                    <p className="text-[10px] uppercase">A4 Landscape Recommended</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Coordinate Editor — visual drag or fallback manual inputs */}
          <TemplateCoordsEditor
            previewUrl={previewObjectUrl ?? template?.pdfTemplateUrl ?? null}
            layout={layout}
            onLayoutChange={setLayout}
            onUpdateLayout={handleUpdateLayout}
          />

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-stone-900 text-white text-sm font-bold rounded-lg hover:bg-stone-800 transition-all shadow-md disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : <Award size={16} />}
              {template ? "Update Template" : "Save Template"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const downloadPDF = async () => {
  try {
    const response = await axios.get("http://localhost:8000/certificate/v1/generate", {
      responseType: "blob"
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", "my-file.pdf");
    document.body.appendChild(link);
    link.click();

    link.remove();
  } catch (error) {
    console.error("Download failed", error);
  }
};

function CertificateManagement() {
  const [isTempleteSettingsOpen, setIsTemplateSettingsOpen] = useState(true);
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Certificate Management</h1>
        <button
          onClick={downloadPDF}
          className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white text-sm font-bold rounded-lg hover:bg-stone-800 transition-all shadow-md"
        >
          <Settings className="text-amber-500 hover:text-amber-600 transition-colors" size={24} />
        </button>
      </div>

      {isTempleteSettingsOpen && (
        <TemplateSettings
          isOpen={isTempleteSettingsOpen}
          onClose={() => setIsTemplateSettingsOpen(false)}
        />
      )}
    </div>
  );
}
export default CertificateManagement;
