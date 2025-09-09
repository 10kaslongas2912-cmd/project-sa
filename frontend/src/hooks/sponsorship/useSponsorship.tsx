import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";

export type PlanType = "one-time" | "subscription";
export type Frequency = "monthly" | "quarterly" | "yearly";

export interface SponsorshipState {
  dogId: number | null;
  dogName?: string;
  planType: PlanType;
  frequency: Frequency | null;
  amount: number | null;
  paymentMethodId: number | null;
}

export interface SponsorshipActions {
  setDog(dogId: number, dogName?: string): void;
  setPlan(planType: PlanType): void;
  setFrequency(freq: Frequency | null): void;
  setAmount(amount: number | null): void;
  setPaymentMethod(methodId: number | null): void;
  reset(): void;

  validateForForm(): string | null;
  validateForPayment(): string | null;
  validateForFormDraft(draft?: Partial<SponsorshipState>): string | null;
}

type Action =
  | { type: "SET_DOG"; dogId: number; dogName?: string }
  | { type: "SET_PLAN"; planType: PlanType }
  | { type: "SET_FREQ"; frequency: Frequency | null }
  | { type: "SET_AMOUNT"; amount: number | null }
  | { type: "SET_PAYMENT"; paymentMethodId: number | null }
  | { type: "RESET" };

const defaultState: SponsorshipState = {
  dogId: null,
  dogName: undefined,
  planType: "one-time",
  frequency: null,
  amount: null,
  paymentMethodId: null,
};

function reducer(state: SponsorshipState, action: Action): SponsorshipState {
  switch (action.type) {
    case "SET_DOG":
      return { ...state, dogId: action.dogId, dogName: action.dogName };

    case "SET_PLAN":
      return {
        ...state,
        planType: action.planType,
        frequency:
          action.planType === "one-time" ? null : state.frequency ?? "monthly",
      };

    case "SET_FREQ":
      return { ...state, frequency: action.frequency };

    case "SET_AMOUNT":
      return { ...state, amount: action.amount };

    case "SET_PAYMENT":
      return { ...state, paymentMethodId: action.paymentMethodId };

    case "RESET":
      return { ...defaultState };

    default:
      return state;
  }
}

// ---------------- Context ----------------
const StateCtx = createContext<SponsorshipState | undefined>(undefined);
const ActionCtx = createContext<SponsorshipActions | undefined>(undefined);

// ---------------- Persist helpers ----------------
const KEY = (dogId?: number | null) => `sponsorship:${dogId ?? "unknown"}`;

function loadPersisted(dogId: number | null): Partial<SponsorshipState> {
  try {
    const raw = sessionStorage.getItem(KEY(dogId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function savePersisted(state: SponsorshipState) {
  try {
    sessionStorage.setItem(KEY(state.dogId), JSON.stringify(state));
  } catch {}
}

export function clearSponsorshipPersisted(dogId: number | null) {
  try {
    sessionStorage.removeItem(KEY(dogId));
  } catch {}
}

// ---------------- Provider ----------------
export const SponsorshipProvider: React.FC<{
  children: React.ReactNode;
  dogId?: number | null;
}> = ({ children, dogId }) => {
  const [state, dispatch] = useReducer(reducer, {
    ...defaultState,
    ...loadPersisted(dogId ?? null),
    dogId: dogId ?? null,
  });

  // persist ทุกครั้งที่ state เปลี่ยน
  useEffect(() => {
    savePersisted(state);
  }, [state]);

  // ป้องกัน reset ตอน mount แรก และเวลาออกนอก flow (:id = null)
  const didMountRef = useRef(false);
  const prevDogIdRef = useRef<number | null>(state.dogId ?? null);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      prevDogIdRef.current = state.dogId ?? null;
      return;
    }

    if (dogId == null) return; // ออกนอก flow ไม่ต้อง reset

    if (dogId !== prevDogIdRef.current) {
      dispatch({ type: "RESET" });
      dispatch({ type: "SET_DOG", dogId });
      prevDogIdRef.current = dogId;
    }
  }, [dogId, state.dogId]);

  // Actions
  const setDog = useCallback((id: number, name?: string) => {
    dispatch({ type: "SET_DOG", dogId: id, dogName: name });
  }, []);

  const setPlan = useCallback((p: PlanType) => {
    dispatch({ type: "SET_PLAN", planType: p });
  }, []);

  const setFrequency = useCallback((f: Frequency | null) => {
    dispatch({ type: "SET_FREQ", frequency: f });
  }, []);

  const setAmount = useCallback((a: number | null) => {
    dispatch({ type: "SET_AMOUNT", amount: a });
  }, []);

  const setPaymentMethod = useCallback((methodId: number | null) => {
    dispatch({ type: "SET_PAYMENT", paymentMethodId: methodId });
  }, []);

  const reset = useCallback(() => {
    clearSponsorshipPersisted(state.dogId);
    dispatch({ type: "RESET" });
  }, [state.dogId]);

  // -------- Validation helpers --------
  function validateCore(st: SponsorshipState): string | null {
    if (!st.dogId) return "ไม่พบรหัสสุนัข";
    if (st.planType === "subscription" && !st.frequency)
      return "กรุณาเลือกความถี่ของการชำระเงิน";
    if (!st.amount || st.amount <= 0) return "กรุณาใส่จำนวนเงินที่ถูกต้อง";
    return null;
  }

  const validateForForm = useCallback(() => validateCore(state), [state]);

  const validateForPayment = useCallback(() => {
    const base = validateCore(state);
    if (base) return base;
    if (!state.paymentMethodId) return "กรุณาเลือกวิธีชำระเงิน";
    return null;
  }, [state]);

  const validateForFormDraft = useCallback(
    (draft?: Partial<SponsorshipState>) =>
      validateCore({ ...state, ...draft }),
    [state]
  );

  const actions = useMemo<SponsorshipActions>(
    () => ({
      setDog,
      setPlan,
      setFrequency,
      setAmount,
      setPaymentMethod,
      reset,
      validateForForm,
      validateForPayment,
      validateForFormDraft,
    }),
    [
      setDog,
      setPlan,
      setFrequency,
      setAmount,
      setPaymentMethod,
      reset,
      validateForForm,
      validateForPayment,
      validateForFormDraft,
    ]
  );

  return (
    <StateCtx.Provider value={state}>
      <ActionCtx.Provider value={actions}>{children}</ActionCtx.Provider>
    </StateCtx.Provider>
  );
};

// ---------------- Hooks ----------------
export function useSponsorship() {
  const ctx = useContext(StateCtx);
  if (!ctx)
    throw new Error("useSponsorship must be used within SponsorshipProvider");
  return ctx;
}

export function useSponsorshipActions() {
  const ctx = useContext(ActionCtx);
  if (!ctx)
    throw new Error(
      "useSponsorshipActions must be used within SponsorshipProvider"
    );
  return ctx;
}
