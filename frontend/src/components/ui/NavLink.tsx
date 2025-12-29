import { NavLink as RNL } from "react-router-dom";
interface P { to: string; label: string; }
const NavLink = ({ to, label }: P) => (
  <RNL to={to} className={({ isActive }) => ['block rounded-md px-3 py-2 text-sm font-medium transition-colors', isActive ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-card hover:text-primary'].join(' ')}>
    {label}
  </RNL>
);
export default NavLink;