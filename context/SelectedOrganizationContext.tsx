"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface SelectedOrganizationContextProps {
  selectedOrgId: string | null;
  setSelectedOrgId: (id: string) => void;
}

const SelectedOrganizationContext = createContext<
  SelectedOrganizationContextProps | undefined
>(undefined);

export const SelectedOrganizationProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("selectedOrgId");
    }
    return null;
  });

  const setSelectedOrgIdWithStorage = (id: string) => {
    setSelectedOrgId(id);
    localStorage.setItem("selectedOrgId", id);
  };

  return (
    <SelectedOrganizationContext.Provider
      value={{ selectedOrgId, setSelectedOrgId: setSelectedOrgIdWithStorage }}
    >
      {children}
    </SelectedOrganizationContext.Provider>
  );
};

export const useSelectedOrganization = () => {
  const context = useContext(SelectedOrganizationContext);
  if (!context) {
    throw new Error(
      "useSelectedOrganization must be used within a SelectedOrganizationProvider"
    );
  }
  return context;
};
