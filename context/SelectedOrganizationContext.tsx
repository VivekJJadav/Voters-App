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
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  return (
    <SelectedOrganizationContext.Provider
      value={{ selectedOrgId, setSelectedOrgId }}
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
