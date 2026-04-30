export interface LoginFormValues {
  email: string;
  password: string;
  remember: boolean;
}

export type StatusBanner = {
  tone: "info" | "warning" | "error" | "success";
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
} | null;