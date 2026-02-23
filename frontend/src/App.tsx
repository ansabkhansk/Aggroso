import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { CompetitorPage } from './pages/CompetitorPage';
import { StatusPage } from './pages/StatusPage';
import { cn } from './lib/utils';
import { Activity, Home } from 'lucide-react';

function NavLink({ to, children, icon: Icon }: { to: string; children: React.ReactNode; icon: React.ComponentType<{ className?: string }> }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      )}
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link to="/" className="flex items-center space-x-5">
              <img src="/logo.jpg" alt="Aggroso" className="h-12 w-12 rounded" />
              <span className="font-bold text-xl">Aggroso</span>
            </Link>
          </div>
          <nav className="flex items-center space-x-2 ml-6">
            <NavLink to="/" icon={Home}>Home</NavLink>
            <NavLink to="/status" icon={Activity}>Status</NavLink>
          </nav>
        </div>
      </header>
      <main className="container py-6">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/competitor/:id" element={<CompetitorPage />} />
          <Route path="/status" element={<StatusPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
