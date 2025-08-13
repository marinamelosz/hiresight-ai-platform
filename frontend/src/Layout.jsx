import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Home, Users, Briefcase, Tag, FileText, Menu, LogOut, UserCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import LanguageSelector from './LanguageSelector';
import { useTranslation } from 'react-i18next';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigationItems = [
    { name: t('dashboard'), href: '/dashboard', icon: Home, roles: ['admin', 'manager', 'recruiter'] },
    { name: t('candidates'), href: '/candidates', icon: Users, roles: ['admin', 'manager', 'recruiter'] },
    { name: t('jobs'), href: '/job-postings', icon: Briefcase, roles: ['admin', 'manager', 'recruiter'] },
    { name: t('users'), href: '/users', icon: UserCircle, roles: ['admin', 'manager'] },
    { name: t('tags'), href: '/tags', icon: Tag, roles: ['admin', 'manager', 'recruiter'] },
    // { name: t('reports'), href: '/reports', icon: FileText, roles: ['admin', 'manager'] },
  ];

  const filteredNavigation = navigationItems.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Sidebar para desktop */}
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
              <Briefcase className="h-6 w-6" />
              <span className="">Recruitment SaaS</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {filteredNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-auto p-4 border-t">
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src="" alt="@shadcn" />
                <AvatarFallback>{user?.first_name[0]}{user?.last_name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium">{user?.first_name} {user?.last_name}</span>
                <span className="text-xs text-muted-foreground capitalize">{user?.role}</span>
              </div>
            </div>
            <Button variant="ghost" className="w-full justify-start mt-2" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              {t('logout')}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Conteúdo principal */}
      <div className="flex flex-col">
        {/* Header para mobile e desktop */}
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          {/* Mobile navigation */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  <Briefcase className="h-6 w-6" />
                  <span className="sr-only">Recruitment SaaS</span>
                </Link>
                {filteredNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage src="" alt="@shadcn" />
                    <AvatarFallback>{user?.first_name[0]}{user?.last_name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">{user?.first_name} {user?.last_name}</span>
                    <span className="text-xs text-muted-foreground capitalize">{user?.role}</span>
                  </div>
                </div>
                <Button variant="ghost" className="w-full justify-start mt-2" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('logout')}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            {/* Search bar or other header content */}
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <LanguageSelector />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarImage src="" alt="@shadcn" />
                    <AvatarFallback>{user?.first_name[0]}{user?.last_name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user?.first_name} {user?.last_name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/settings')}>{t('settings')}</DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>{t('logout')}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

