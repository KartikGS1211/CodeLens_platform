import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BarChart3, FileSearch, User, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Code Quality',
    href: '/code-quality',
    icon: BarChart3,
  },
  {
    title: 'AI Review',
    href: '/code-review',
    icon: FileSearch,
  },
  {
    title: 'Skills Profile',
    href: '/developer-skills',
    icon: User,
  },
  {
    title: 'Best Practices',
    href: '/best-practices',
    icon: BookOpen,
  },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-16 z-40 hidden h-[calc(100vh-4rem)] w-64 border-r border-white/10 bg-background/50 backdrop-blur-lg md:block">
      <nav className="flex flex-col gap-2 p-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-4 py-3 font-paragraph text-sm transition-all',
                isActive
                  ? 'bg-neon-teal/10 text-neon-teal border border-neon-teal/20'
                  : 'text-foreground/70 hover:bg-white/5 hover:text-neon-teal'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.title}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
