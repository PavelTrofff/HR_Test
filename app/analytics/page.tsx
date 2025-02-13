'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Loader2, X } from 'lucide-react';

interface Employee {
  id: number;
  name: string;
  position: string;
  isActive: boolean;
  trainingHours: number;
  hireDate: string;
  quitDate?: string;
}

// Mock dataset
const employees: Employee[] = [
  { id: 1, name: "Анна Иванова", position: "Frontend Developer", isActive: true, trainingHours: 45, hireDate: "2023-01-15" },
  { id: 2, name: "Петр Смирнов", position: "Backend Developer", isActive: true, trainingHours: 32, hireDate: "2023-03-20" },
  { id: 3, name: "Мария Козлова", position: "UI Designer", isActive: false, trainingHours: 28, hireDate: "2023-02-10", quitDate: "2023-11-15" },
  { id: 4, name: "Сергей Попов", position: "Project Manager", isActive: true, trainingHours: 52, hireDate: "2023-04-05" },
  { id: 5, name: "Елена Соколова", position: "QA Engineer", isActive: false, trainingHours: 35, hireDate: "2023-01-20", quitDate: "2023-10-30" },
  { id: 6, name: "Дмитрий Волков", position: "DevOps Engineer", isActive: true, trainingHours: 40, hireDate: "2023-05-12" },
  { id: 7, name: "Ольга Морозова", position: "Business Analyst", isActive: true, trainingHours: 38, hireDate: "2023-06-01" },
  { id: 8, name: "Александр Лебедев", position: "Frontend Developer", isActive: true, trainingHours: 42, hireDate: "2023-03-15" }
];

export default function Analytics() {
  const [loading, setLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [showTestData, setShowTestData] = useState(false);

  // Calculate metrics
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.isActive).length;
  const avgTrainingHours = Math.round(
    employees.reduce((acc, emp) => acc + emp.trainingHours, 0) / totalEmployees
  );
  const turnoverRate = Math.round(
    (employees.filter(e => !e.isActive).length / totalEmployees) * 100
  );

  // Prepare chart data
  const departmentData = employees.reduce((acc: any[], emp) => {
    const dept = acc.find(d => d.position === emp.position);
    if (dept) {
      dept.count += 1;
    } else {
      acc.push({ position: emp.position, count: 1 });
    }
    return acc;
  }, []);

  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'Ты — профессиональный HR-аналитик, получающий на вход следующие HR-показатели компании: - Общее количество сотрудников  - Количество активных сотрудников - Уровень текучести кадров (в процентах) - Среднее количество часов обучения на сотрудника Тебе нужно: 1) Дать развернутый, но при этом чёткий анализ каждого показателя: почему он может быть таким, на что влияет, какие потенциальные риски или преимущества. 2) Предложить минимум 2–3 конкретных рекомендации, которые помогут улучшить или поддержать текущие показатели.  - Формулируй советы так, чтобы они были применимы на практике (например, опросы сотрудников, пересмотр программы обучения, корректировка рабочих условий, мотивационные программы и т.д.). 3) Пиши на русском языке, структурируя текст в несколько логических блоков или коротких подзаголовков. Можно использовать списки, подчёркнутые важные моменты и т.д. 4) Твой ответ должен быть достаточно подробным, чтобы HR-специалист мог понять, почему показатели такие, и как реально улучшить ситуацию в компании.'
            },
            {
              role: 'user',
              content: `Проанализируй следующие HR-метрики:
                - Всего сотрудников: ${totalEmployees}
                - Активных сотрудников: ${activeEmployees}
                - Текучесть кадров: ${turnoverRate}%
                - Среднее количество часов обучения: ${avgTrainingHours}
                
                Дай краткий анализ ситуации и 2-3 конкретные рекомендации по улучшению показателей.`
            }
          ]
        }),
      });

      const data = await response.json();
      setAiAnalysis(data.response.content);
    } catch (error) {
      console.error('Error:', error);
      setAiAnalysis('Произошла ошибка при генерации отчета.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">HR Аналитика</h1>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Всего сотрудников</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{totalEmployees}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Активных сотрудников</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{activeEmployees}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Текучесть кадров</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{turnoverRate}%</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Среднее обучение</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{avgTrainingHours}ч</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Распределение по должностям</h2>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="position" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="hsl(var(--chart-1))" name="Количество сотрудников" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={generateReport}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
              Генерация отчета...
            </>
          ) : (
            'Сгенерировать отчет'
          )}
        </button>

        <button
          onClick={() => setShowTestData(true)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Показать тестовые данные
        </button>
      </div>

      {/* AI Analysis */}
      {aiAnalysis && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Анализ и рекомендации</h2>
          <div className="prose prose-indigo max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{aiAnalysis}</p>
          </div>
        </div>
      )}

      {/* Test Data Modal */}
      {showTestData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 flex justify-between items-center border-b">
              <h2 className="text-xl font-semibold text-gray-900">Тестовые данные сотрудников</h2>
              <button
                onClick={() => setShowTestData(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Имя</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Должность</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Часы обучения</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата найма</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата увольнения</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {employees.map((employee) => (
                      <tr key={employee.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{employee.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.position}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            employee.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {employee.isActive ? 'Активный' : 'Неактивный'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.trainingHours}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(employee.hireDate)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {employee.quitDate ? formatDate(employee.quitDate) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}