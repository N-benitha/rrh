import { Outlet } from "react-router";
import { Navbar } from "./shared";

export default function PublicLayout() {
  return (
    <div>
      <Navbar />
      <Outlet />
    </div>
  );
}
