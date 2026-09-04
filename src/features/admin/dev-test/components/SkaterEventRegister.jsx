import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import { ArrowLeft, Check, CreditCard, Trophy } from "lucide-react";
import toast from "react-hot-toast";
import { eventsApi } from "@/api/events-api";

const BRAND = "#f6765e";

const unwrap = (response) => response?.data ?? response ?? {};

const unwrapError = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const lapName = (item) => {
  if (!item) return "";
  if (typeof item === "string") return item.trim();
  return String(item.name || "").trim();
};

const loadRazorpay = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Could not load Razorpay"));
    document.body.appendChild(script);
  });

export const SkaterEventRegister = ({ event, token, onBack, onRegistered }) => {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [typeId, setTypeId] = useState("");
  const [ageLabel, setAgeLabel] = useState("");
  const [selectedLaps, setSelectedLaps] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setLoadError("");
      setTypeId("");
      setAgeLabel("");
      setSelectedLaps([]);
      try {
        const response = await eventsApi.getSkaterEventFormDetails(event._id || event.id, token);
        if (!cancelled) setForm(unwrap(response));
      } catch (error) {
        if (!cancelled) setLoadError(unwrapError(error, "Could not load registration form"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [event, token]);

  const types = useMemo(
    () => (Array.isArray(form?.skatingEventCategories) ? form.skatingEventCategories : []),
    [form]
  );

  const selectedType = useMemo(
    () => types.find((item) => String(item._id) === String(typeId)) || null,
    [types, typeId]
  );

  const ageGroups = useMemo(() => {
    const groups = Array.isArray(selectedType?.ageGroups) ? selectedType.ageGroups : [];
    return groups.filter((group) => Array.isArray(group.categories) && group.categories.length > 0);
  }, [selectedType]);

  const selectedAge = useMemo(
    () => ageGroups.find((group) => group.label === ageLabel) || null,
    [ageGroups, ageLabel]
  );

  const laps = useMemo(
    () => (Array.isArray(selectedAge?.categories) ? selectedAge.categories : []),
    [selectedAge]
  );

  const handleSelectType = (id) => {
    setTypeId(id);
    setAgeLabel("");
    setSelectedLaps([]);
  };

  const handleSelectAge = (label) => {
    setAgeLabel(label);
    setSelectedLaps([]);
  };

  const toggleLap = (name) => {
    setSelectedLaps((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  const openRazorpay = async (payment) => {
    await loadRazorpay();
    return new Promise((resolve, reject) => {
      const checkout = new window.Razorpay({
        key: payment.keyId || payment.key,
        amount: payment.amount || payment.amountPaise,
        currency: payment.currency || "INR",
        name: payment.name || "KRSA",
        description: payment.description || form?.eventName || "Event registration",
        order_id: payment.orderId || payment.order_id || payment.razorpayOrderId,
        prefill: payment.prefill || {},
        handler: async (response) => {
          try {
            await eventsApi.verifySkaterPayment(
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              },
              token
            );
            resolve(true);
          } catch (error) {
            reject(error);
          }
        },
        modal: {
          ondismiss: () => reject(new Error("Payment cancelled"))
        }
      });
      checkout.open();
    });
  };

  const handleRegister = async () => {
    if (!typeId) {
      toast.error("Select a skating event category");
      return;
    }
    if (!ageLabel) {
      toast.error("Select an age group");
      return;
    }
    if (!selectedLaps.length) {
      toast.error("Select at least one category");
      return;
    }

    setBusy(true);
    try {
      const response = await eventsApi.registerSkaterEvent(
        {
          eventId: String(event._id || event.id),
          name: form?.skaterName || "",
          ageGroup: ageLabel,
          categoriesId: typeId,
          categories: selectedLaps.map((name) => ({ name }))
        },
        token
      );
      const result = unwrap(response);

      if (
        result?.registrationComplete ||
        result?.registration ||
        result?.payment?.isDevBypass ||
        result?.payment?.registrationComplete
      ) {
        toast.success(result?.message || "Registered successfully");
        onRegistered();
        return;
      }

      if (result?.payment && !result.payment.isFreeEvent) {
        await openRazorpay(result.payment);
        toast.success("Registered successfully");
        onRegistered();
        return;
      }

      toast.success(result?.message || response?.message || "Registered successfully");
      onRegistered();
    } catch (error) {
      toast.error(unwrapError(error, "Registration failed"));
    } finally {
      setBusy(false);
    }
  };

  const alreadyRegistered = Boolean(event?.isRegister);

  return (
    <Paper
      elevation={0}
      sx={{ borderRadius: "28px", border: "1px solid rgba(255,255,255,0.7)", overflow: "hidden" }}
    >
      <Box sx={{ p: 3 }}>
        <Button
          startIcon={<ArrowLeft size={16} />}
          onClick={onBack}
          sx={{ textTransform: "none", color: "#8d7f7b", mb: 1.5 }}
        >
          Back to events
        </Button>
        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: "-0.03em" }}>
          {event.header || form?.eventName || "Register"}
        </Typography>
        <Typography sx={{ color: "#8d7f7b", fontSize: 14, mt: 0.5 }}>
          Select skating type, then age, then category — same as the skater app.
        </Typography>
        {form?.entryFee ? (
          <Chip
            sx={{ mt: 1.5 }}
            label={`Entry fee ₹${form.entryFee}`}
            icon={<CreditCard size={14} />}
          />
        ) : null}
      </Box>
      <Divider />

      {loading ? (
        <Box sx={{ p: 6, display: "grid", placeItems: "center" }}>
          <CircularProgress sx={{ color: BRAND }} />
        </Box>
      ) : loadError ? (
        <Box sx={{ p: 5, textAlign: "center" }}>
          <Typography color="error">{loadError}</Typography>
          <Button sx={{ mt: 2 }} onClick={onBack}>
            Back
          </Button>
        </Box>
      ) : alreadyRegistered ? (
        <Box sx={{ p: 5, textAlign: "center" }}>
          <Trophy size={28} color={BRAND} />
          <Typography sx={{ mt: 1.5, fontWeight: 700 }}>Already registered</Typography>
          <Typography sx={{ color: "#8d7f7b", mt: 0.5 }}>
            This skater is already registered for this event.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={3} sx={{ p: 3 }}>
          <Box>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>1. Skating event category</Typography>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
              {types.map((item) => {
                const id = String(item._id);
                const selected = id === String(typeId);
                return (
                  <Chip
                    key={id}
                    clickable
                    label={item.typeName || "Category"}
                    onClick={() => handleSelectType(id)}
                    icon={selected ? <Check size={14} /> : undefined}
                    sx={{
                      fontWeight: 700,
                      color: selected ? "white" : "#2f2829",
                      backgroundColor: selected ? BRAND : "rgba(246,118,94,0.12)"
                    }}
                  />
                );
              })}
              {!types.length ? (
                <Typography sx={{ color: "#8d7f7b" }}>No skating categories on this event.</Typography>
              ) : null}
            </Stack>
          </Box>

          <Box>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>2. Age group</Typography>
            {!typeId ? (
              <Typography sx={{ color: "#8d7f7b" }}>Select a skating category first.</Typography>
            ) : (
              <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
                {ageGroups.map((group) => {
                  const selected = group.label === ageLabel;
                  return (
                    <Chip
                      key={group.label}
                      clickable
                      label={group.label}
                      onClick={() => handleSelectAge(group.label)}
                      icon={selected ? <Check size={14} /> : undefined}
                      sx={{
                        fontWeight: 700,
                        color: selected ? "white" : "#2f2829",
                        backgroundColor: selected ? BRAND : "rgba(246,118,94,0.12)"
                      }}
                    />
                  );
                })}
                {!ageGroups.length ? (
                  <Typography sx={{ color: "#8d7f7b" }}>No age groups for this category.</Typography>
                ) : null}
              </Stack>
            )}
          </Box>

          <Box>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>3. Category</Typography>
            {!ageLabel ? (
              <Typography sx={{ color: "#8d7f7b" }}>Select an age group first.</Typography>
            ) : (
              <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
                {laps.map((item, index) => {
                  const name = lapName(item);
                  if (!name) return null;
                  const selected = selectedLaps.includes(name);
                  return (
                    <Chip
                      key={`${name}-${index}`}
                      clickable
                      label={name}
                      onClick={() => toggleLap(name)}
                      icon={selected ? <Check size={14} /> : undefined}
                      sx={{
                        fontWeight: 700,
                        color: selected ? "white" : "#2f2829",
                        backgroundColor: selected ? BRAND : "rgba(246,118,94,0.12)"
                      }}
                    />
                  );
                })}
                {!laps.length ? (
                  <Typography sx={{ color: "#8d7f7b" }}>No categories for this age group.</Typography>
                ) : null}
              </Stack>
            )}
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button
              variant="contained"
              disabled={busy || !selectedLaps.length}
              onClick={handleRegister}
              startIcon={busy ? <CircularProgress size={16} color="inherit" /> : <Check size={16} />}
              sx={{ backgroundColor: BRAND, "&:hover": { backgroundColor: "#ea6b54" } }}
            >
              Register
            </Button>
            <Button variant="outlined" disabled={busy} onClick={onBack}>
              Cancel
            </Button>
          </Stack>
        </Stack>
      )}
    </Paper>
  );
};
