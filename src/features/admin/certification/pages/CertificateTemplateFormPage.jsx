import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Award, UploadCloud, CheckCircle, Loader2, FileText, ArrowLeft } from "lucide-react";
import api from "@/lib/axios";
import toast from "react-hot-toast";

// ── PDF canvas constants ─────────────────────────────────────────────────────
const PDF_W_PT = 595;
const PDF_H_PT = 842;

const FIELD_META = {
  name: { label: "Name", color: "#3B82F6", bg: "#EFF6FF", border: "#BFDBFE" },
  issueDate: { label: "Issue Date", color: "#10B981", bg: "#ECFDF5", border: "#A7F3D0" },
  ageGroup: { label: "Age Group", color: "#F59E0B", bg: "#FFFBEB", border: "#FDE68A" },
  clubName: { label: "Club Name", color: "#8B5CF6", bg: "#F5F3FF", border: "#DDD6FE" },
  signature: { label: "Signature", color: "#EC4899", bg: "#FDF2F8", border: "#FBCFE8" }
};

// Event-table meta (separate from text FIELD_META — no size/color keys)
const TABLE_META = { label: "Event Table", color: "#0EA5E9", bg: "#F0F9FF", border: "#BAE6FD" };
// Column ratios must match backend COL_RATIOS exactly
const TABLE_COL_RATIOS = [0.25, 0.2, 0.35, 0.2];
const TABLE_HEADERS = ["EVENT", "DISCIPLINE", "DISTANCE", "PLACEMENT"];

const TEXT_COLOR_OPTIONS = [
  { value: "dark", label: "Dark" },
  { value: "lightDark", label: "Light Dark" },
  { value: "gray", label: "Gray" },
  { value: "darkGray", label: "Dark Gray" }
];

const DEFAULT_LAYOUT = {
  name: { x: 298, y: 590, size: 12, color: "dark" },
  issueDate: { x: 298, y: 140, size: 12, color: "dark" },
  ageGroup: { x: 298, y: 530, size: 12, color: "dark" },
  clubName: { x: 298, y: 480, size: 12, color: "dark" },
  signature: { x: 350, y: 210, size: 12, color: "dark", text: "Authorized Signatory" },
  eventTable: { x: 72, y: 463, width: 450 }
};

const getDisplayColor = (v, fallback) =>
  ({ white: "#ffffff", darkBlue: "#1e3a8a", darkYellow: "#ca8a04" })[v] || fallback;

// ── TemplateCoordsEditor ─────────────────────────────────────────────────────
function TemplateCoordsEditor({ previewUrl, layout, onLayoutChange, onUpdateLayout }) {
  const [failedUrl, setFailedUrl] = useState("");
  const [dragging, setDragging] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const [overlaySize, setOverlaySize] = useState({ width: 0, height: 0 });
  const [isSmall, setIsSmall] = useState(() => window.innerWidth < 640);
  const [smallW, setSmallW] = useState(() => Math.max(560, Math.round(window.innerWidth * 1.35)));
  const overlayRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    const fn = () => {
      setIsSmall(window.innerWidth < 640);
      setSmallW(Math.max(560, Math.round(window.innerWidth * 1.35)));
    };
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;
    const sync = () => {
      const r = el.getBoundingClientRect();
      setOverlaySize({ width: Math.round(r.width), height: Math.round(r.height) });
    };
    sync();
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(sync);
      ro.observe(el);
      return () => ro.disconnect();
    }
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [previewUrl, isSmall]);

  const ptToPx = useCallback(
    (ptX, ptY) => {
      const { width, height } = overlaySize;
      if (!width || !height) return null;
      return {
        px: Math.round((ptX / PDF_W_PT) * width),
        py: Math.round(((PDF_H_PT - ptY) / PDF_H_PT) * height)
      };
    },
    [overlaySize]
  );

  const handlePointerDown = useCallback(
    (e, field) => {
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      setDragging(field);
      setTooltip(field);
      startRef.current = {
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
      if (!dragging || !startRef.current || !overlayRef.current) return;
      const el = overlayRef.current;
      const { width, height } = el.getBoundingClientRect();

      // ── Capture ALL ref values into local consts BEFORE the state updater ──
      // The functional updater runs asynchronously. If handlePointerUp fires
      // between now and when the updater executes, startRef.current will be null.
      // Local consts are captured in the closure immediately — safe from that race.
      const { clientX: startX, clientY: startY, origX, origY } = startRef.current;

      const dPtX = ((e.clientX - startX) / width) * PDF_W_PT;
      const dPtY = ((startY - e.clientY) / height) * PDF_H_PT; // inverted: PDF Y is bottom-up

      const fieldSize = Number(layout?.[dragging]?.size) || 0;
      const capturedField = dragging; // also capture string key in case state clears

      onLayoutChange((prev) => ({
        ...prev,
        [capturedField]: {
          ...prev[capturedField],
          x: Math.round(Math.max(0, Math.min(PDF_W_PT, origX + dPtX))),
          y: Math.round(Math.max(0, Math.min(PDF_H_PT, origY + dPtY)))
        }
      }));
    },
    [dragging, layout, onLayoutChange]
  );

  const handlePointerUp = useCallback(() => {
    setDragging(null);
    startRef.current = null;
  }, []);

  const normalUrl = String(previewUrl || "").trim();
  const hasTpl = Boolean(previewUrl);
  const loadFailed = Boolean(normalUrl) && failedUrl === normalUrl;
  const isPdf = normalUrl.includes("cloudinary") && /\.pdf(\?|#|$)/i.test(normalUrl);
  const imgUrl = isPdf ? normalUrl.replace(/\.pdf(\?|#|$)/i, ".jpg$1") : "";

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-bold text-stone-700">Text Field Coordinates</label>
        <p className="text-[11px] text-stone-400 mt-0.5">
          Drag each marker to position text on the certificate.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {Object.entries(FIELD_META).map(([f, m]) => (
            <span
              key={f}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border"
              style={{ color: m.color, background: m.bg, borderColor: m.border }}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: m.color }} />
              {m.label}
            </span>
          ))}
        </div>

        <div className="overflow-x-auto pb-1">
          <div
            className="relative rounded-xl overflow-hidden border-2 border-stone-200 bg-stone-100 shadow-inner min-w-[560px] sm:min-w-0"
            style={{
              aspectRatio: `${PDF_W_PT} / ${PDF_H_PT}`,
              width: isSmall ? `${smallW}px` : "100%"
            }}
          >
            {hasTpl &&
              !loadFailed &&
              (isPdf ? (
                <img
                  src={imgUrl}
                  alt="Template Preview"
                  className="absolute inset-0 w-full h-full border-0 pointer-events-none"
                  style={{ objectFit: "fill" }}
                  onError={() => setFailedUrl(normalUrl)}
                />
              ) : (
                <iframe
                  src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0&view=Fit`}
                  title="Template Preview"
                  className="absolute inset-0 w-full h-full border-0 pointer-events-none"
                  onError={() => setFailedUrl(normalUrl)}
                />
              ))}

            <div
              ref={overlayRef}
              className={`absolute inset-0 ${dragging ? "cursor-grabbing" : "cursor-default"}`}
              style={{ touchAction: "none" }}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              {Object.entries(layout).map(([field, pos]) => {
                const meta = FIELD_META[field];
                if (!meta) return null;
                const pxResult = ptToPx(pos.x, pos.y);
                if (!pxResult) return null;
                const { px, py } = pxResult;
                const isDragging = dragging === field;
                const isActive = tooltip === field;
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
                      zIndex: isDragging ? 30 : 20
                    }}
                  >
                    {/* Crosshair indicator showing exact anchor point */}
                    {(isDragging || isActive) && (
                      <div
                        className="absolute pointer-events-none"
                        style={{ left: 0, top: 0, zIndex: 10 }}
                      >
                        {/* Vertical line going down */}
                        <div
                          style={{
                            position: "absolute",
                            left: "-1px",
                            top: "0",
                            width: "2px",
                            height: "20px",
                            background: liveColor,
                            opacity: 0.8
                          }}
                        />
                        {/* Horizontal line for baseline matching */}
                        <div
                          style={{
                            position: "absolute",
                            left: "-15px",
                            top: "-1px",
                            width: "30px",
                            height: "2px",
                            background: liveColor,
                            opacity: 0.8
                          }}
                        />
                        {/* Center dot */}
                        <div
                          style={{
                            position: "absolute",
                            left: "-3px",
                            top: "-3px",
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background: "white",
                            border: `2px solid ${liveColor}`
                          }}
                        />
                      </div>
                    )}
                    <div
                      onPointerDown={(e) => handlePointerDown(e, field)}
                      onMouseEnter={() => setTooltip(field)}
                      onMouseLeave={() => !dragging && setTooltip(null)}
                      style={{
                        padding: 0,
                        color: liveColor,
                        textShadow: liveColor === "#ffffff" ? "0 1px 2px rgba(0,0,0,0.8)" : "none",
                        fontWeight: field === "signature" ? "normal" : "bold",
                        fontStyle: "italic",
                        fontFamily: '"Times New Roman", Times, serif',
                        fontSize: `${pos.size * ((overlaySize?.width || PDF_W_PT) / PDF_W_PT)}px`,
                        lineHeight: 1,
                        transform: ["signature", "clubName", "ageGroup", "issueDate"].includes(
                          field
                        )
                          ? "translate(0, -100%)"
                          : "translate(-50%, -100%)",
                        cursor: isDragging ? "grabbing" : "grab",
                        whiteSpace: "nowrap",
                        userSelect: "none",
                        borderBottom: `2px dashed ${liveColor}`
                      }}
                    >
                      <span
                        style={{
                          pointerEvents: "none",
                          userSelect: "none"
                        }}
                      >
                        {displayText}
                      </span>
                    </div>
                    {(isActive || isDragging) && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: isSmall ? 24 : 28,
                          left: "50%",
                          transform: "translateX(-50%)",
                          background: "white",
                          border: `1.5px solid ${meta.border}`,
                          borderRadius: 8,
                          padding: "6px 10px",
                          minWidth: isSmall ? 140 : 160,
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
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
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
              {/* ── Event Table Marker ───────────────────────────────────────── */}
              {(() => {
                const tPos = layout.eventTable;
                if (!tPos) return null;
                const tPx = ptToPx(tPos.x, tPos.y);
                if (!tPx) return null;
                const scaleRatio = (overlaySize?.width || PDF_W_PT) / PDF_W_PT;
                const tW = Math.round((tPos.width || 500) * scaleRatio);
                // row height mirrors backend: 8pt * 2.4, scaled
                const rowH = Math.round(8 * 2.4 * scaleRatio);
                const colWs = TABLE_COL_RATIOS.map((r) => Math.round(r * tW));
                const isTableDragging = dragging === "eventTable";
                return (
                  <div
                    key="eventTable"
                    style={{
                      position: "absolute",
                      left: tPx.px,
                      top: tPx.py,
                      zIndex: isTableDragging ? 30 : 20
                    }}
                    onPointerDown={(e) => handlePointerDown(e, "eventTable")}
                    onMouseEnter={() => setTooltip("eventTable")}
                    onMouseLeave={() => !dragging && setTooltip(null)}
                  >
                    {/* Mini table grid */}
                    <div
                      style={{
                        width: tW,
                        border: `2px dashed ${TABLE_META.color}`,
                        cursor: isTableDragging ? "grabbing" : "grab",
                        userSelect: "none",
                        background: `${TABLE_META.color}10`,
                        pointerEvents: "auto"
                      }}
                    >
                      {/* Header row */}
                      <div
                        style={{ display: "flex", borderBottom: `1px solid ${TABLE_META.color}` }}
                      >
                        {TABLE_HEADERS.map((h, i) => (
                          <div
                            key={h}
                            style={{
                              width: colWs[i],
                              borderRight: i < 3 ? `1px solid ${TABLE_META.color}` : "none",
                              fontSize: Math.max(7, 10 * scaleRatio),
                              fontWeight: 800,
                              color: TABLE_META.color,
                              textAlign: "center",
                              padding: "2px 1px",
                              overflow: "hidden",
                              whiteSpace: "nowrap"
                            }}
                          >
                            {h}
                          </div>
                        ))}
                      </div>
                      {/* 2 sample data rows */}
                      {["RINK - I", "RINK - II"].map((r) => (
                        <div
                          key={r}
                          style={{
                            display: "flex",
                            borderBottom: `1px solid ${TABLE_META.color}40`
                          }}
                        >
                          {TABLE_HEADERS.map((_, i) => (
                            <div
                              key={i}
                              style={{
                                width: colWs[i],
                                borderRight: i < 3 ? `1px solid ${TABLE_META.color}40` : "none",
                                fontSize: Math.max(6, 9 * scaleRatio),
                                color: `${TABLE_META.color}cc`,
                                textAlign: "center",
                                padding: "2px 1px",
                                overflow: "hidden",
                                whiteSpace: "nowrap"
                              }}
                            >
                              {i === 0 ? r : ""}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                    {/* Tooltip */}
                    {(tooltip === "eventTable" || isTableDragging) && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          marginTop: 4,
                          background: "white",
                          border: `1.5px solid ${TABLE_META.border}`,
                          borderRadius: 8,
                          padding: "6px 10px",
                          minWidth: 160,
                          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                          pointerEvents: "none",
                          zIndex: 40
                        }}
                      >
                        <p
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            color: TABLE_META.color,
                            marginBottom: 4,
                            textTransform: "uppercase"
                          }}
                        >
                          Event Table
                        </p>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                          <div style={{ fontSize: 10, color: "#78716c" }}>
                            X: <b style={{ color: "#1c1917" }}>{tPos.x}pt</b>
                          </div>
                          <div style={{ fontSize: 10, color: "#78716c" }}>
                            Y: <b style={{ color: "#1c1917" }}>{tPos.y}pt</b>
                          </div>
                          <div style={{ fontSize: 10, color: "#78716c" }}>
                            W: <b style={{ color: "#1c1917" }}>{tPos.width}pt</b>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Text field controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {Object.entries(layout).map(([field, pos]) => {
            const meta = FIELD_META[field];
            if (!meta) return null;
            return (
              <div
                key={`ctrl-${field}`}
                className="flex flex-col gap-1 p-2.5 rounded-xl border"
                style={{ borderColor: meta.border, background: meta.bg }}
              >
                <label
                  className="text-[9px] font-bold uppercase tracking-widest"
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
                  className="text-[9px] font-bold uppercase tracking-widest mt-2"
                  style={{ color: meta.color }}
                >
                  {meta.label} — Text Color
                </label>
                <select
                  value={pos.color || "white"}
                  onChange={(e) => onUpdateLayout(field, "color", e.target.value)}
                  className="w-full px-2 py-1 bg-white border border-stone-200 rounded text-xs focus:ring-2 focus:ring-amber-500/20 outline-none font-semibold"
                >
                  {TEXT_COLOR_OPTIONS.map((o) => (
                    <option key={`${field}-${o.value}`} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                {field === "signature" && (
                  <>
                    <label
                      className="text-[9px] font-bold uppercase tracking-widest mt-2"
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

        {/* Event table width control */}
        {layout.eventTable && (
          <div
            className="flex flex-col gap-1 p-2.5 rounded-xl border"
            style={{ borderColor: TABLE_META.border, background: TABLE_META.bg }}
          >
            <label
              className="text-[9px] font-bold uppercase tracking-widest"
              style={{ color: TABLE_META.color }}
            >
              Event Table — Width (pt)
            </label>
            <input
              type="number"
              min={100}
              max={842}
              value={layout.eventTable.width || 500}
              onChange={(e) => onUpdateLayout("eventTable", "width", e.target.value)}
              className="w-40 px-2 py-1 bg-white border border-stone-200 rounded text-xs focus:ring-2 focus:ring-sky-400/20 outline-none font-semibold"
            />
            <label
              className="text-[9px] font-bold uppercase tracking-widest mt-2"
              style={{ color: TABLE_META.color }}
            >
              Event Table — Text Size (pt)
            </label>
            <input
              type="number"
              min={4}
              max={24}
              value={layout.eventTable.size || 8}
              onChange={(e) => onUpdateLayout("eventTable", "size", e.target.value)}
              className="w-40 px-2 py-1 bg-white border border-stone-200 rounded text-xs focus:ring-2 focus:ring-sky-400/20 outline-none font-semibold"
            />
            <label
              className="text-[9px] font-bold uppercase tracking-widest mt-2"
              style={{ color: TABLE_META.color }}
            >
              Event Table — Color
            </label>
            <select
              value={layout.eventTable.color || "dark"}
              onChange={(e) => onUpdateLayout("eventTable", "color", e.target.value)}
              className="w-40 px-2 py-1 bg-white border border-stone-200 rounded text-xs focus:ring-2 focus:ring-sky-400/20 outline-none font-semibold"
            >
              {TEXT_COLOR_OPTIONS.map((o) => (
                <option key={`et-${o.value}`} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <p className="text-[9px] text-stone-400 mt-1">
              Drag the table box on the preview to set X/Y position.
            </p>
          </div>
        )}

        <p className="text-[10px] text-stone-400 italic">
          ⚠ If the preview appears blank, your browser may be blocking the PDF embed.
        </p>
      </div>
    </div>
  );
}

// ── CertificateTemplateFormPage ──────────────────────────────────────────────
export default function CertificateTemplateFormPage() {
  const { templateId } = useParams(); // undefined → create, string → edit
  const navigate = useNavigate();
  const isEditMode = Boolean(templateId);

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [activating, setActivating] = useState(false);
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [layout, setLayout] = useState(DEFAULT_LAYOUT);
  const [template, setTemplate] = useState(null); // raw DB record (edit mode)

  const previewObjectUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(
    () => () => {
      if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
    },
    [previewObjectUrl]
  );

  // Fetch existing template in edit mode
  useEffect(() => {
    if (!isEditMode) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get(`/certificate/v1/template/${templateId}`);
        if (cancelled || !res?.data) return;
        const d = res.data;
        setTemplate(d);
        if (d.name) setName(d.name);
        if (d.textLayout && Object.keys(d.textLayout).length > 0) {
          const il = d.textLayout;
          setLayout({
            name: { ...DEFAULT_LAYOUT.name, ...(il.name || {}) },
            issueDate: { ...DEFAULT_LAYOUT.issueDate, ...(il.issueDate || {}) },
            ageGroup: { ...DEFAULT_LAYOUT.ageGroup, ...(il.ageGroup || il.field || {}) },
            clubName: { ...DEFAULT_LAYOUT.clubName, ...(il.clubName || {}) },
            signature: { ...DEFAULT_LAYOUT.signature, ...(il.signature || {}) },
            eventTable: { ...DEFAULT_LAYOUT.eventTable, ...(il.eventTable || {}) }
          });
        }
      } catch (err) {
        console.error("Failed to fetch template:", err);
        toast.error("Failed to load template data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isEditMode, templateId]);

  const handleUpdateLayout = (field, key, val) => {
    const next = key === "color" || key === "text" ? String(val || "") : parseInt(val, 10) || 0;
    setLayout((prev) => ({ ...prev, [field]: { ...prev[field], [key]: next } }));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please enter a template name.");
      return;
    }
    if (!isEditMode && !file) {
      toast.error("Please upload a PDF template file.");
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("layout", JSON.stringify(layout));
      if (file) fd.append("pdf", file);

      if (isEditMode) {
        await api.put(`/certificate/v1/template/${templateId}`, fd, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        toast.success("Template updated successfully!");
      } else {
        await api.post("/certificate/v1/template", fd, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        toast.success("Template created successfully!");
      }
      navigate("/certification");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  const handleSetActive = async () => {
    setActivating(true);
    try {
      await api.patch(`/certificate/v1/template/${templateId}/activate`);
      toast.success("Template set as active!");
      navigate("/certification");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to set active template");
    } finally {
      setActivating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-amber-500" size={36} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/certification")}
          className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 font-semibold transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-3">
          <Award className="text-amber-500" size={22} />
          <h1 className="text-xl font-bold text-stone-900">
            {isEditMode ? `Edit Template: ${name || "…"}` : "New Certificate Template"}
          </h1>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 sm:p-7 space-y-6">
        {/* Name */}
        <div className="space-y-1.5">
          <label className="block text-sm font-bold text-stone-700">
            Template Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. State Championship 2025"
            className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/30 outline-none font-medium bg-white shadow-sm"
          />
        </div>

        {/* PDF Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-stone-700">
            Background PDF{!isEditMode && <span className="text-red-500"> *</span>}
          </label>
          <div className="relative group">
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div
              className={`p-6 border-2 border-dashed rounded-2xl text-center transition-all ${
                file
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-stone-200 group-hover:border-amber-400 group-hover:bg-amber-50/30"
              }`}
            >
              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle className="text-emerald-500" size={28} />
                  <span className="text-emerald-700 font-bold text-sm">{file.name}</span>
                  <span className="text-emerald-600/70 text-[10px] uppercase font-bold">
                    New file ready — save to apply
                  </span>
                </div>
              ) : template ? (
                <div className="flex flex-col items-center gap-2">
                  <FileText className="text-amber-500" size={28} />
                  <span className="text-stone-700 font-bold text-sm">Current PDF Active</span>
                  <span className="text-stone-400 text-[10px]">CLICK TO REPLACE (OPTIONAL)</span>
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

        {/* Coordinate editor */}
        <TemplateCoordsEditor
          previewUrl={previewObjectUrl ?? template?.pdfTemplateUrl ?? null}
          layout={layout}
          onLayoutChange={setLayout}
          onUpdateLayout={handleUpdateLayout}
        />

        {/* Actions */}
        <div className="pt-2 flex items-center justify-between gap-3 flex-wrap border-t border-stone-100">
          {isEditMode && (
            <button
              onClick={handleSetActive}
              disabled={activating || template?.isActive}
              className="flex items-center gap-2 px-5 py-2.5 border-2 border-emerald-500 text-emerald-700 text-sm font-bold rounded-lg hover:bg-emerald-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {activating ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <CheckCircle size={16} />
              )}
              {template?.isActive ? "Currently Active" : "Set as Active"}
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-stone-900 text-white text-sm font-bold rounded-lg hover:bg-stone-800 transition-all shadow-md disabled:opacity-50 ml-auto"
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Award size={16} />}
            {isEditMode ? "Update Template" : "Save Template"}
          </button>
        </div>
      </div>
    </div>
  );
}
