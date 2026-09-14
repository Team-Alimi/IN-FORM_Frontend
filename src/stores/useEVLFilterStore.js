import { create } from "zustand";

const useEVLFilterStore = create((set) => ({
  currentPage: 1,
  pageSize: 20,
  searchText: "",
  activeFilters: {
    startDate: "",
    endDate: "",
    selectedStatuses: ["ALL"],
    categoryIds: [],
    vendorIds: [],
  },

  setCurrentPage: (page) => set({ currentPage: page }),
  setPageSize: (size) => set({ pageSize: size }),
  setSearchText: (text) => set({ searchText: text }),
  setActiveFilters: (filters) => set({ activeFilters: filters }),
}));

export default useEVLFilterStore;
