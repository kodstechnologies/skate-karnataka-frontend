import { useRequestsStore } from "@/features/admin/requests/store/requests-store";
import academyHero from "@/assets/Academy_header.jpg";
import schoolHero from "@/assets/School_header.jpg";
import officialHero from "@/assets/Official_header.jpg";

export const schoolRequestConfig = {
  label: "School",
  basePath: "/reports/school",
  heroImage: schoolHero,
  canDelete: true,
  onDelete: (id) => useRequestsStore.getState().deleteSchool(id),
  useRequests: () => useRequestsStore((state) => state.schoolRequests),
  onSearch: (value) => {
    const params = {};
    const search = value.trim();
    if (!search) {
      return useRequestsStore.getState().fetchSchoolRequests({});
    }
    if (search.includes("@")) {
      params.email = search;
    } else if (/^\+?\d+$/.test(search)) {
      params.phone = search;
    } else if (["male", "female"].includes(search.toLowerCase())) {
      params.gender = search.toLowerCase();
    } else {
      params.fullName = search;
    }
    return useRequestsStore.getState().fetchSchoolRequests(params);
  },
  listFields: [
    { key: "schoolName", label: "School Name" },
    { key: "fullName", label: "Representative" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Contact" },
    { key: "gender", label: "Gender" },
    { key: "address", label: "Address" }
  ],
  detailFields: [
    { key: "schoolName", label: "School Name" },
    { key: "fullName", label: "Representative Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "gender", label: "Gender" },
    { key: "address", label: "Address" },
    { key: "district", label: "District ID" },
    { key: "role", label: "Role" }
  ]
};

export const officialRequestConfig = {
  label: "Official",
  basePath: "/reports/official",
  heroImage: officialHero,
  canDelete: true,
  onDelete: (id) => useRequestsStore.getState().deleteOfficial(id),
  useRequests: () => useRequestsStore((state) => state.officialRequests),
  onSearch: (value) => {
    const params = {};
    const search = value.trim();

    if (!search) {
      return useRequestsStore.getState().fetchOfficialRequests({});
    }

    if (search.includes("@")) {
      params.email = search;
    } else if (/^\+?\d+$/.test(search)) {
      params.phone = search;
    } else if (["male", "female"].includes(search.toLowerCase())) {
      params.gender = search.toLowerCase();
    } else {
      params.fullName = search;
    }

    useRequestsStore.getState().fetchOfficialRequests(params);
  },
  listFields: [
    { key: "fullName", label: "Full Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "gender", label: "Gender" },
    { key: "role", label: "Role" }
  ],
  detailFields: [
    { key: "fullName", label: "Full Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "gender", label: "Gender" },
    { key: "address", label: "Address" },
    { key: "district", label: "District" },
    { key: "role", label: "Role" }
  ]
};

export const parentRequestConfig = {
  label: "Parent",
  basePath: "/reports/parent",
  heroImage: officialHero,
  canDelete: true,
  onDelete: (id) => useRequestsStore.getState().deleteParent(id),
  useRequests: () => useRequestsStore((state) => state.parentRequests),
  onSearch: (value) => {
    const params = {};
    const search = value.trim();

    if (!search) {
      return useRequestsStore.getState().fetchParentRequests({});
    }

    if (search.includes("@")) {
      params.email = search;
    } else if (/^\+?\d+$/.test(search)) {
      params.phone = search;
    } else if (["male", "female"].includes(search.toLowerCase())) {
      params.gender = search.toLowerCase();
    } else {
      params.fullName = search;
    }

    useRequestsStore.getState().fetchParentRequests(params);
  },
  listFields: [
    { key: "fullName", label: "Full Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "gender", label: "Gender" }
  ],
  detailFields: [
    { key: "fullName", label: "Full Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "gender", label: "Gender" },
    { key: "role", label: "Role" }
  ]
};

export const guestRequestConfig = {
  label: "Guest",
  basePath: "/reports/guest",
  heroImage: officialHero,
  canDelete: true,
  onDelete: (id) => useRequestsStore.getState().deleteGuest(id),
  useRequests: () => useRequestsStore((state) => state.guestRequests),
  onSearch: (value) => {
    const params = {};
    const search = value.trim();

    if (!search) {
      return useRequestsStore.getState().fetchGuestRequests({});
    }

    if (search.includes("@")) {
      params.email = search;
    } else if (/^\+?\d+$/.test(search)) {
      params.phone = search;
    } else if (["male", "female"].includes(search.toLowerCase())) {
      params.gender = search.toLowerCase();
    } else {
      params.fullName = search;
    }

    useRequestsStore.getState().fetchGuestRequests(params);
  },
  listFields: [
    { key: "fullName", label: "Full Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "gender", label: "Gender" },
    { key: "interestedIn", label: "Interested In" }
  ],
  detailFields: [
    { key: "fullName", label: "Full Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "gender", label: "Gender" },
    { key: "address", label: "Address" },
    { key: "role", label: "Role" }
  ]
};

export const academyRequestConfig = {
  label: "Academy",
  basePath: "/reports/academy",
  heroImage: academyHero,
  canDelete: true,
  onDelete: (id) => useRequestsStore.getState().deleteAcademy(id),
  useRequests: () => useRequestsStore((state) => state.academyRequests),
  onSearch: (value) => {
    const params = {};
    const search = value.trim();

    if (!search) {
      return useRequestsStore.getState().fetchAcademyRequests({});
    }

    if (search.includes("@")) {
      params.email = search;
    } else if (/^\+?\d+$/.test(search)) {
      params.phone = search;
    } else if (["male", "female"].includes(search.toLowerCase())) {
      params.gender = search.toLowerCase();
    } else {
      params.fullName = search;
    }

    useRequestsStore.getState().fetchAcademyRequests(params);
  },
  listFields: [
    { key: "fullName", label: "Representative" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Contact" },
    { key: "gender", label: "Gender" },
    { key: "address", label: "Address" },
    { key: "districtName", label: "District" }
  ],
  detailFields: [
    { key: "fullName", label: "Representative Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "gender", label: "Gender" },
    { key: "address", label: "Address" },
    { key: "districtName", label: "District" },
    { key: "role", label: "Role" }
  ]
};
