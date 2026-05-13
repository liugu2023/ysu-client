import { create } from "zustand";

interface MFAModalState {
  open: boolean;
  username: string;
  mobileHint: string;
  methodCode: string;
  mfaMethod: "sms" | "cpdaily";
  resolve: ((value: string) => void) | null;
  reject: (() => void) | null;
  showMFA: (opts: {
    username: string;
    methodCode: string;
    mobileHint: string;
  }) => Promise<string>;
  submitMFA: (code: string) => void;
  cancelMFA: () => void;
}

export const useMFAModalStore = create<MFAModalState>((set, get) => ({
  open: false,
  username: "",
  mobileHint: "",
  methodCode: "",
  mfaMethod: "cpdaily",
  resolve: null,
  reject: null,

  showMFA: (opts) =>
    new Promise((resolve, reject) => {
      set({
        open: true,
        username: opts.username,
        methodCode: opts.methodCode,
        mobileHint: opts.mobileHint,
        mfaMethod: "cpdaily",
        resolve,
        reject,
      });
    }),

  submitMFA: (code) => {
    const { resolve } = get();
    if (resolve) resolve(code);
    set({ open: false, resolve: null, reject: null });
  },

  cancelMFA: () => {
    const { reject } = get();
    if (reject) reject();
    set({ open: false, resolve: null, reject: null });
  },
}));
