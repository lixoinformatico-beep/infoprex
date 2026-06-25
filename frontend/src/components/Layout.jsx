import { NavLink } from "react-router-dom";
import { BarChart3, Settings, Pill } from "lucide-react";

export const Layout = ({ children }) => {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
      isActive ? "bg-secondary text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
    }`;

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <Pill className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <p className="font-heading font-semibold text-foreground">Rentab. Farmácia</p>
              <p className="text-xs text-muted-foreground">Análise por Laboratório</p>
            </div>
          </div>
          <nav className="flex items-center gap-2">
            <NavLink to="/" end className={linkClass} data-testid="nav-dashboard">
              <BarChart3 className="h-4 w-4" /> Dashboard
            </NavLink>
            <NavLink to="/definicoes" className={linkClass} data-testid="nav-settings">
              <Settings className="h-4 w-4" /> Definições
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="max-w-[1400px] mx-auto py-8 px-4 md:px-8">{children}</main>
    </div>
  );
};
