import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'outboundly-orchestration-state';

const defaultState = {
  intent: '',
  audience: '',
  urgency: 'Normal',
  channel: 'Auto',
  context: '',
  result: null,
};

const OrchestrationContext = createContext(undefined);

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

export function OrchestrationProvider({ children }) {
  const [state, setState] = useState(() => {
    const cached = safeParse(localStorage.getItem(STORAGE_KEY));
    return cached ? { ...defaultState, ...cached } : defaultState;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo(
    () => ({
      ...state,
      setField: (key, value) => setState((prev) => ({ ...prev, [key]: value })),
      setResult: (result) => setState((prev) => ({ ...prev, result })),
      reset: () => setState(defaultState),
    }),
    [state]
  );

  return (
    <OrchestrationContext.Provider value={value}>
      {children}
    </OrchestrationContext.Provider>
  );
}

export function useOrchestration() {
  const ctx = useContext(OrchestrationContext);
  if (!ctx) {
    throw new Error('useOrchestration must be used within OrchestrationProvider');
  }
  return ctx;
}
