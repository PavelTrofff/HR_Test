'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileSearch, MessageSquare, Users, GraduationCap, BarChart3 } from 'lucide-react';

const navigation = [
  { name: 'Скрининг резюме', href: '/resume-screening', icon: FileSearch },
  { name: 'Собеседования', href: '/interview-bot', icon: MessageSquare },
  { name: 'Вакансии', href: '/vacancy-bot', icon: Users },
  { name: 'Онбординг', href: '/onboarding-bot', icon: GraduationCap },
  { name: 'Аналитика', href: '/analytics', icon: BarChart3 },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                HR Platform
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                      isActive
                        ? 'border-b-2 border-primary text-gray-900'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}