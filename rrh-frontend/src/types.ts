import type { Dispatch, SetStateAction } from "react";

export type Page =
  | "landing"
  | "dashboard"
  | "map"
  | "login"
  | "register"
  | "forgot"
  | "verify"
  | "help"
  | "about";

export interface PageProps {
  setPage: Dispatch<SetStateAction<Page>>;
}