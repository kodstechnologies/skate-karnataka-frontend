import { normalizeAllowedModules } from "@/lib/navigation-modules";

const norm = (value) => String(value || "").trim();

const KRSA_PLATFORM = "KRSA Web Portal";

/** Avatar URL for header/sidebar — supports admin, state, club, and district profile shapes. */
export const getUserAvatarSrc = (user) =>
  norm(
    user?.currentMember?.photo ||
      user?.currentMember?.profile ||
      user?.memberDetails?.photo ||
      user?.memberDetails?.profile ||
      user?.memberDetails?.img ||
      user?.img ||
      user?.profile ||
      user?.photo
  );

export const getUserDisplayName = (user) =>
  norm(
    user?.currentMember?.fullName ||
      user?.memberDetails?.fullName ||
      user?.fullName
  );

export const getUserInitials = (user, fallback = "A") => {
  const name = getUserDisplayName(user);
  if (!name) return fallback;
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const isSubAdminProfile = (role, data = {}) => {
  if (String(role || data?.role || "").toLowerCase() !== "state") {
    return false;
  }
  return normalizeAllowedModules(data?.allowedModules || data?.allowedModule).length > 0;
};

export const normalizeProfileResponse = (data, role) => {
  const normalizedRole = String(role || data?.role || "").toLowerCase();

  if (normalizedRole === "district") {
    const member = data?.currentMember || data?.memberDetails || {};
    return {
      fullName: norm(member.fullName),
      phone: norm(member.phone),
      address: norm(member.address),
      email: norm(member.email),
      krsaId: norm(member.krsaId),
      img: norm(member.photo || member.profile),
      gender: norm(member.gender),
      role: norm(member.role) || "District",
      memberId: norm(member.userId || member._id),
      districtName: norm(data?.districtName),
      districtKrsaId: norm(data?.districtKrsaId),
      districtId: norm(data?.districtId),
      orgAddress: norm(data?.officeAddress),
      orgAbout: norm(data?.about),
    };
  }

  if (normalizedRole === "club") {
    const member = data?.currentMember || {};
    return {
      fullName: norm(member.fullName),
      phone: norm(member.phone),
      address: norm(member.address),
      email: norm(member.email),
      krsaId: norm(member.krsaId),
      img: norm(member.photo || member.profile),
      gender: norm(member.gender),
      role: norm(member.role) || "Club",
      memberId: norm(member._id || member.userId),
      clubName: norm(data?.name),
      clubId: norm(data?.clubId),
      districtName: norm(data?.districtName),
      orgAddress: norm(data?.address),
      orgAbout: norm(data?.about),
    };
  }

  if (normalizedRole === "state") {
    const member = data?.memberDetails || data?.stateDetails || data || {};
    const allowedModules = normalizeAllowedModules(data?.allowedModule || data?.allowedModules);
    return {
      fullName: norm(member.fullName || data?.fullName),
      phone: norm(member.phone || data?.phone),
      address: norm(member.address || data?.address),
      email: norm(member.email || data?.email),
      krsaId: norm(member.krsaId || data?.krsaId),
      img: norm(member.photo || member.profile || member.img || data?.img),
      gender: norm(member.gender || data?.gender),
      role: norm(member.role || data?.role) || "State",
      memberId: norm(member.userId || member._id || data?._id),
      stateName: norm(data?.name || data?.stateDetails?.stateName || data?.stateName || "Skate Karnataka"),
      allowedModules,
      orgAbout: norm(data?.about),
    };
  }

  return {
    fullName: norm(data?.fullName),
    phone: norm(data?.phone),
    address: norm(data?.address),
    email: norm(data?.email),
    krsaId: norm(data?.krsaId),
    img: norm(data?.img || data?.profile || data?.photo),
    gender: norm(data?.gender),
    role: norm(data?.role) || "Admin",
    memberId: norm(data?._id || data?.userId),
    orgName: "Skate Karnataka",
    orgSubtitle: "KRSA Administration",
  };
};

export const getProfileRoleLabel = (role, user) => {
  const normalized = String(role || user?.role || "").toLowerCase();
  if (normalized === "admin") return "Admin";
  if (normalized === "state") {
    return isSubAdminProfile(normalized, user) ? "Sub Admin" : "State Official";
  }
  if (normalized === "district") return "District Member";
  if (normalized === "club") return "Club Member";
  return role || "";
};

export const getProfileOrgCard = (role, formData = {}, user = {}) => {
  const normalizedRole = String(role || formData.role || user?.role || "").toLowerCase();
  const withValues = (items) =>
    items.filter((item) => item && norm(item.value));

  if (normalizedRole === "district") {
    return {
      title: "District organization",
      items: withValues([
        { label: "Name", value: formData.districtName || user?.districtName },
        { label: "District KRSA ID", value: formData.districtKrsaId || user?.districtKrsaId },
        { label: "Office address", value: formData.orgAddress || user?.officeAddress },
        { label: "Platform", value: KRSA_PLATFORM },
      ]),
    };
  }

  if (normalizedRole === "club") {
    return {
      title: "Club organization",
      items: withValues([
        { label: "Name", value: formData.clubName || user?.name },
        { label: "Club ID", value: formData.clubId || user?.clubId },
        { label: "District", value: formData.districtName || user?.districtName },
        { label: "Office address", value: formData.orgAddress || user?.address },
        { label: "Platform", value: KRSA_PLATFORM },
      ]),
    };
  }

  if (normalizedRole === "state") {
    const modules = formData.allowedModules?.length
      ? formData.allowedModules
      : normalizeAllowedModules(user?.allowedModule);
    const isSubAdmin = modules.length > 0;

    return {
      title: isSubAdmin ? "Sub-admin account" : "State organization",
      items: withValues([
        { label: "Name", value: formData.stateName || user?.name || "Skate Karnataka" },
        {
          label: "Account type",
          value: isSubAdmin ? "Sub Administrator" : "State Official",
        },
        isSubAdmin ? { label: "Assigned modules", value: modules.join(", ") } : null,
        { label: "About", value: formData.orgAbout || user?.about },
        { label: "Platform", value: KRSA_PLATFORM },
      ]),
    };
  }

  return {
    title: "Organization",
    items: withValues([
      { label: "Name", value: formData.orgName || "Skate Karnataka" },
      { label: "Account type", value: formData.orgSubtitle || "Administrator" },
      { label: "Platform", value: KRSA_PLATFORM },
    ]),
  };
};

export const getProfileOrgDisplayName = (role, formData = {}, user = {}) => {
  const normalizedRole = String(role || "").toLowerCase();
  if (normalizedRole === "district") {
    return formData.districtName || user?.districtName || "";
  }
  if (normalizedRole === "club") {
    return formData.clubName || user?.name || "";
  }
  if (normalizedRole === "state") {
    return formData.stateName || user?.name || "Skate Karnataka";
  }
  return formData.orgName || "Skate Karnataka";
};

export const buildProfileUpdateFormData = (formData, selectedFile, role) => {
  const payload = new FormData();
  payload.append("fullName", formData.fullName);
  payload.append("phone", formData.phone);
  payload.append("address", formData.address);

  const normalizedRole = String(role || "").toLowerCase();
  if (selectedFile) {
    if (normalizedRole === "district" || normalizedRole === "club") {
      payload.append("profile", selectedFile);
    } else {
      payload.append("img", selectedFile);
    }
  }

  return payload;
};
