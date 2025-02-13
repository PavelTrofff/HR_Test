'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';

interface FormData {
  jobTitle: string;
  jobType: 'Full-time' | 'Part-time' | 'Remote';
  positionLevel: 'Junior' | 'Middle' | 'Senior' | 'Lead';
  shortDescription: string;
  technicalSkills: string;
  softSkills: string;
  languageSkills: string;
  desiredSkills: string;
  location: string;
  salaryRange: string;
}

const jobTypes = ['Full-time', 'Part-time', 'Remote'] as const;
const positionLevels = ['Junior', 'Middle', 'Senior', 'Lead'] as const;

export default function VacancyBot() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VacancyResponse | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
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
              content: `Ты — опытный HR-специалист, формирующий описание вакансии на основе предоставленных данных из формы. 
У тебя могут быть следующие поля:
- Название должности
- Тип занятости (полная, частичная, удалённая)
- Уровень позиции (Junior, Middle, Senior, Lead)
- Категории навыков (технические, софт, языки) с возможным указанием уровня владения
- Желаемые (необязательные) навыки
- Краткое описание вакансии (2–3 предложения)
- Информация о зарплате
- Локация и любая дополнительная информация

ПРИ ФОРМИРОВАНИИ ТЕКСТА:
1. Сохраняй строгую структуру ответа:
   1) Краткое описание вакансии (1–2 абзаца)
   2) Список требуемых навыков (каждый с новой строки, начиная с "- ")
   3) Информация о зарплате (1 строка)
   4) Рекомендуемые вопросы для собеседования (3–4 вопроса, каждый с новой строки, начиная с "- ")
2. Если какая-то информация не указана (например, уровень позиции или желаемые навыки), просто не упоминай её в тексте.
3. При наличии данных о типе занятости и уровне позиции, отрази это в описании вакансии.
4. Если есть уровень владения навыками, можешь подчеркнуть эту деталь, но не меняй структуру ответа.
5. Главное — не ломай существующую интеграцию: четыре пункта ответа должны оставаться в том же формате, где разделы начинаются с цифр "1)", "2)", "3)", "4)".

В итоге твой ответ должен выглядеть как:

1) <Краткое описание: 1–2 абзаца>

2) <Список навыков, по одному на строке, с префиксом "- ">

3) <Одной строкой информация о зарплате>

4) <3–4 вопроса, по одному на строке с префиксом "- ">

Если что-то не предоставлено — просто опусти упоминание.`
            },
            {
              role: 'user',
              content: `Должность: ${data.jobTitle}
Тип работы: ${data.jobType}
Уровень позиции: ${data.positionLevel}
Краткое описание: ${data.shortDescription}
Локация: ${data.location}
Зарплатная вилка: ${data.salaryRange}

Требуемые навыки:
- Технические: ${data.technicalSkills}
- Soft skills: ${data.softSkills}
- Языки: ${data.languageSkills}

Желательные навыки: ${data.desiredSkills}`
            }
          ]
        }),
      });

      const json = await response.json();
      setResult(parseAIResponse(json.response.content));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Создать вакансию</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Job Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Название должности
            </label>
            <input
              {...register('jobTitle', { required: 'Это поле обязательно' })}
              type="text"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.jobTitle && (
              <p className="mt-1 text-sm text-red-600">{errors.jobTitle.message}</p>
            )}
          </div>

          {/* Job Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Тип работы
            </label>
            <select
              {...register('jobType', { required: 'Выберите тип работы' })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Выберите тип</option>
              {jobTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.jobType && (
              <p className="mt-1 text-sm text-red-600">{errors.jobType.message}</p>
            )}
          </div>

          {/* Position Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Уровень позиции
            </label>
            <select
              {...register('positionLevel', { required: 'Выберите уровень позиции' })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Выберите уровень</option>
              {positionLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
            {errors.positionLevel && (
              <p className="mt-1 text-sm text-red-600">{errors.positionLevel.message}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Локация
            </label>
            <input
              {...register('location', { required: 'Это поле обязательно' })}
              type="text"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
            )}
          </div>
        </div>

        {/* Short Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Краткое описание позиции
          </label>
          <textarea
            {...register('shortDescription', { 
              required: 'Добавьте краткое описание',
              minLength: { value: 50, message: 'Описание должно содержать минимум 50 символов' }
            })}
            rows={3}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Опишите основные обязанности и ожидания от кандидата..."
          />
          {errors.shortDescription && (
            <p className="mt-1 text-sm text-red-600">{errors.shortDescription.message}</p>
          )}
        </div>

        {/* Skills Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Требуемые навыки</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Технические навыки
              </label>
              <textarea
                {...register('technicalSkills', { required: 'Укажите технические навыки' })}
                rows={3}
                placeholder="JavaScript, React, Node.js..."
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.technicalSkills && (
                <p className="mt-1 text-sm text-red-600">{errors.technicalSkills.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Soft skills
              </label>
              <textarea
                {...register('softSkills', { required: 'Укажите soft skills' })}
                rows={3}
                placeholder="Коммуникабельность, работа в команде..."
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.softSkills && (
                <p className="mt-1 text-sm text-red-600">{errors.softSkills.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Знание языков
              </label>
              <textarea
                {...register('languageSkills', { required: 'Укажите требования к знанию языков' })}
                rows={3}
                placeholder="Английский (B2), Немецкий (базовый)..."
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.languageSkills && (
                <p className="mt-1 text-sm text-red-600">{errors.languageSkills.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Желательные навыки
              </label>
              <textarea
                {...register('desiredSkills')}
                rows={3}
                placeholder="Дополнительные навыки, которые будут преимуществом..."
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Salary Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Зарплатная вилка
          </label>
          <input
            {...register('salaryRange', { required: 'Укажите зарплатную вилку' })}
            type="text"
            placeholder="например: 150 000 - 200 000 руб."
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.salaryRange && (
            <p className="mt-1 text-sm text-red-600">{errors.salaryRange.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
              Генерация...
            </>
          ) : (
            'Создать вакансию'
          )}
        </button>
      </form>

      {/* Results */}
      {result && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Описание вакансии</h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {result.description}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Требуемые навыки</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              {result.skills.map((skill, index) => (
                <li key={index}>{skill.replace(/^-\s*/, '')}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Зарплата</h2>
            <p className="text-gray-700">{result.salary}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Рекомендуемые вопросы для собеседования
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              {result.questions.map((question, index) => (
                <li key={index}>{question.replace(/^-\s*/, '')}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

interface VacancyResponse {
  description: string;
  skills: string[];
  salary: string;
  questions: string[];
}

function parseAIResponse(response: string): VacancyResponse {
  const result: VacancyResponse = {
    description: '',
    skills: [],
    salary: '',
    questions: []
  };

  // Разбиваем по строкам
  const lines = response.split('\n');

  // Текущая секция (0, пока не найдём 1), 2), ...)
  let currentSection = 0;
  let sectionLines: string[] = [];

  // Хэлпер для сохранения накопленных строк
  const saveSection = (sectionNumber: number, linesArr: string[]) => {
    const textBlock = linesArr.join('\n').trim();
    switch (sectionNumber) {
      case 1:
        result.description = textBlock;
        break;
      case 2:
        // Берём только строки, начинающиеся на "-"
        result.skills = linesArr.filter(l => l.match(/^-([\s]|$)/));
        break;
      case 3:
        // Зарплата (одна строка)
        result.salary = textBlock;
        break;
      case 4:
        // Вопросы
        result.questions = linesArr.filter(l => l.match(/^-([\s]|$)/));
        break;
    }
  };

  // Основной цикл
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    // Если строка совпадает с шаблоном "1)" или "2)" и т.д. (учитываем пробелы)
    const matchSection = line.match(/^\s*([1-4])\)\s*(.*)$/);
    if (matchSection) {
      // Сохраняем предыдущие накопленные строки
      if (currentSection > 0 && sectionLines.length > 0) {
        saveSection(currentSection, sectionLines);
      }
      // Переходим к новой секции
      currentSection = parseInt(matchSection[1]);
      sectionLines = [];

      // Если после "1)" на этой же строке есть контент (matchSection[2]), кладём его
      const rest = matchSection[2].trim();
      if (rest) {
        sectionLines.push(rest);
      }
    } else {
      // Просто добавляем строку в текущую секцию
      if (currentSection > 0 && line) {
        sectionLines.push(line);
      }
    }
  }

  // Сохраняем последнюю секцию, если она есть
  if (currentSection > 0 && sectionLines.length > 0) {
    saveSection(currentSection, sectionLines);
  }

  return result;
}
