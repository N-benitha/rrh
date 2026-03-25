export type Page = "landing" | "login" | "register" | "forgot" | "verify" | "help" | "about" | "dashboard" | "alerts" | "map";

export interface PageProps {
  page?: Page;
  setPage: (page: Page) => void;
}