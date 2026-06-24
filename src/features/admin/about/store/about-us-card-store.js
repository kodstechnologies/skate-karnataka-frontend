import { create } from "zustand";
import { aboutUsCardApi } from "@/api/about-us-card-api";
import toast from "react-hot-toast";

export const useAboutUsCardStore = create((set, get) => ({
  cards: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 9,
    totalPages: 0
  },
  currentCard: null,
  members: [],
  membersPagination: {
    total: 0,
    page: 1,
    limit: 9,
    totalPages: 0
  },
  isLoading: false,
  membersLoading: false,

  fetchCards: async (page = 1, limit = 9) => {
    set({ isLoading: true });
    try {
      const { data: cards, pagination } = await aboutUsCardApi.getAll(page, limit);
      set({ cards, pagination, isLoading: false });
      return cards;
    } catch (err) {
      set({ isLoading: false });
      toast.error(err.response?.data?.message || "Failed to fetch about us cards");
      return [];
    }
  },

  fetchCardById: async (id) => {
    set({ isLoading: true });
    try {
      const card = await aboutUsCardApi.getById(id);
      set({ currentCard: card, isLoading: false });
      return card;
    } catch (err) {
      set({ isLoading: false });
      toast.error(err.response?.data?.message || "Failed to fetch card");
      return null;
    }
  },

  fetchMembers: async (cardId, page = 1, limit = 9) => {
    set({ membersLoading: true });
    try {
      const { data: members, pagination: membersPagination } = await aboutUsCardApi.getMembers(
        cardId,
        page,
        limit
      );
      set({ members, membersPagination, membersLoading: false });
      return members;
    } catch (err) {
      set({ membersLoading: false });
      toast.error(err.response?.data?.message || "Failed to fetch card members");
      return [];
    }
  },

  createCard: async (payload) => {
    try {
      await aboutUsCardApi.create(payload);
      const { pagination } = get();
      await get().fetchCards(1, pagination.limit);
      toast.success("Card created successfully");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create card");
      return false;
    }
  },

  updateCard: async (id, payload) => {
    try {
      await aboutUsCardApi.update(id, payload);
      const { pagination } = get();
      await get().fetchCards(pagination.page, pagination.limit);
      toast.success("Card updated successfully");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update card");
      return false;
    }
  },

  deleteCard: async (id) => {
    try {
      await aboutUsCardApi.delete(id);
      const { pagination, cards } = get();
      const nextPage =
        cards.length === 1 && pagination.page > 1 ? pagination.page - 1 : pagination.page;
      await get().fetchCards(nextPage, pagination.limit);
      toast.success("Card deleted successfully");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete card");
      return false;
    }
  },

  createMember: async (cardId, payload) => {
    try {
      await aboutUsCardApi.createMember(cardId, payload);
      const { membersPagination } = get();
      await get().fetchMembers(cardId, 1, membersPagination.limit);
      toast.success("Member added successfully");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add member");
      return false;
    }
  },

  updateMember: async (cardId, memberId, payload) => {
    try {
      await aboutUsCardApi.updateMember(cardId, memberId, payload);
      const { membersPagination } = get();
      await get().fetchMembers(cardId, membersPagination.page, membersPagination.limit);
      toast.success("Member updated successfully");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update member");
      return false;
    }
  },

  deleteMember: async (cardId, memberId) => {
    try {
      await aboutUsCardApi.deleteMember(cardId, memberId);
      const { members, membersPagination } = get();
      const nextPage =
        members.length === 1 && membersPagination.page > 1
          ? membersPagination.page - 1
          : membersPagination.page;
      await get().fetchMembers(cardId, nextPage, membersPagination.limit);
      toast.success("Member deleted successfully");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete member");
      return false;
    }
  },

  clearCurrent: () =>
    set({
      currentCard: null,
      members: [],
      membersPagination: { total: 0, page: 1, limit: 9, totalPages: 0 }
    })
}));
