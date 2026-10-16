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
  usePagination: () => useRequestsStore((state) => state.schoolPagination),
  fetchRequests: (params) => {
    const { search = "", ...rest } = params || {};
    const trimmed = (search || "").trim();
    const query = { ...rest };
    if (trimmed) {
      query.search = trimmed;
    }
    return useRequestsStore.getState().fetchSchoolRequests(query);
  },
  onSearch: (value) => {
    return schoolRequestConfig.fetchRequests({ search: value, page: 1, limit: 10 });
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
  usePagination: () => useRequestsStore((state) => state.officialPagination),
  fetchRequests: (params) => {
    const { search = "", ...rest } = params || {};
    const trimmed = (search || "").trim();
    const query = { ...rest };
    if (trimmed) {
      query.search = trimmed;
    }
    return useRequestsStore.getState().fetchOfficialRequests(query);
  },
  onSearch: (value) => {
    return officialRequestConfig.fetchRequests({ search: value, page: 1, limit: 10 });
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
  usePagination: () => useRequestsStore((state) => state.parentPagination),
  fetchRequests: (params) => {
    const { search = "", ...rest } = params || {};
    const trimmed = (search || "").trim();
    const query = { ...rest };
    if (trimmed) {
      query.search = trimmed;
    }
    return useRequestsStore.getState().fetchParentRequests(query);
  },
  onSearch: (value) => {
    return parentRequestConfig.fetchRequests({ search: value, page: 1, limit: 10 });
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
  usePagination: () => useRequestsStore((state) => state.guestPagination),
  fetchRequests: (params) => {
    const { search = "", ...rest } = params || {};
    const trimmed = (search || "").trim();
    const query = { ...rest };
    if (trimmed) {
      query.search = trimmed;
    }
    return useRequestsStore.getState().fetchGuestRequests(query);
  },
  onSearch: (value) => {
    return guestRequestConfig.fetchRequests({ search: value, page: 1, limit: 10 });
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
  usePagination: () => useRequestsStore((state) => state.academyPagination),
  fetchRequests: (params) => {
    const { search = "", ...rest } = params || {};
    const trimmed = (search || "").trim();
    const query = { ...rest };
    if (trimmed) {
      query.search = trimmed;
    }
    return useRequestsStore.getState().fetchAcademyRequests(query);
  },
  onSearch: (value) => {
    return academyRequestConfig.fetchRequests({ search: value, page: 1, limit: 10 });
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
