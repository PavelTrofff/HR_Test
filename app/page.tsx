'use client';

import { GraduationCap, Users, FileSearch, MessageSquare, BarChart3 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const features = [
  {
    icon: <FileSearch className="h-8 w-8" />,
    title: "Скрининг резюме",
    description: "Автоматический анализ и отбор резюме кандидатов",
    href: "/resume-screening"
  },
  {
    icon: <MessageSquare className="h-8 w-8" />,
    title: "Чат-бот для собеседований",
    description: "Интеллектуальный помощник для проведения первичных интервью",
    href: "/interview-bot"
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: "Бот для вакансий",
    description: "Автоматическое размещение и управление вакансиями",
    href: "/vacancy-bot"
  },
  {
    icon: <GraduationCap className="h-8 w-8" />,
    title: "Онбординг",
    description: "Автоматизированное введение новых сотрудников в должность",
    href: "/onboarding-bot"
  },
  {
    icon: <BarChart3 className="h-8 w-8" />,
    title: "Аналитика",
    description: "Подробная статистика и аналитика HR-процессов",
    href: "/analytics"
  }
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            HR Автоматизация
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Комплексное решение для автоматизации HR-процессов вашей компании
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard
              key={feature.href}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              href={feature.href}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description, 
  href 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  href: string;
}) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(href)}
      className="relative p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 cursor-pointer transform hover:-translate-y-1"
    >
      <div className="text-primary mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500">{description}</p>
    </div>
  );
}