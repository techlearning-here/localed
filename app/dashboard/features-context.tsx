"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type FeatureFlags = Record<string, boolean>;

const FeaturesContext = createContext<FeatureFlags>({});

export function useDashboardFeatures(): FeatureFlags {
  return useContext(FeaturesContext);
}

export function DashboardFeaturesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [flags, setFlags] = useState<FeatureFlags>({});

  useEffect(() => {
    fetch("/api/features")
      .then((res) => (res.ok ? res.json() : {}))
      .then(setFlags)
      .catch(() => setFlags({}));
  }, []);

  return (
    <FeaturesContext.Provider value={flags}>
      {children}
    </FeaturesContext.Provider>
  );
}
