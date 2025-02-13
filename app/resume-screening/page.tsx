'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Loader2, Plus, Trash2 } from 'lucide-react';

interface WorkExperience {
  companyName: string;
  position: string;
  duties: string;
  duration: string;
}

interface FormData {
  name: string;
  email: string;
  keywords: string;
  education: {
    university: string;
    specialization: string;
    graduationYear: string;
  };
  workExperience: WorkExperience[];
  technicalSkills: string;
  softSkills: string;
  managementSkills: string;
  languages: {
    english: string;
    other: string;
  };
  coverLetter: string;
  resumeFile: FileList;
  readyToTravel: boolean;
  hasDriverLicense: boolean;
  remoteWork: boolean;
  expectedSalary: string;
  additionalComments?: string;
}

const languageLevels = [
  'Beginner',
  'Elementary',
  'Intermediate',
  'Upper Intermediate',
  'Advanced',
  'Native'
];

export default function ResumeScreening() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ response: string; recommended: boolean } | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string>('');
  
  const { register, control, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      workExperience: [{ companyName: '', position: '', duties: '', duration: '' }],
      readyToTravel: false,
      hasDriverLicense: false,
      remoteWork: false
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "workExperience"
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Prepare a comprehensive prompt with all the candidate information
      const prompt = `
Candidate Profile:
Name: ${data.name}
Email: ${data.email}
Keywords: ${data.keywords}

Education:
- University: ${data.education.university}
- Specialization: ${data.education.specialization}
- Graduation Year: ${data.education.graduationYear}

Work Experience:
${data.workExperience.map((exp, index) => `
${index + 1}. ${exp.companyName}
   Position: ${exp.position}
   Duration: ${exp.duration}
   Duties: ${exp.duties}
`).join('\n')}

Skills:
- Technical: ${data.technicalSkills}
- Soft Skills: ${data.softSkills}
- Management: ${data.managementSkills}

Languages:
- English: ${data.languages.english}
- Other Languages: ${data.languages.other}

Additional Information:
- Ready to Travel: ${data.readyToTravel ? 'Yes' : 'No'}
- Has Driver's License: ${data.hasDriverLicense ? 'Yes' : 'No'}
- Open to Remote Work: ${data.remoteWork ? 'Yes' : 'No'}
- Expected Salary: ${data.expectedSalary}

Cover Letter:
${data.coverLetter}

Additional Comments:
${data.additionalComments || 'None provided'}`;

      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'Ты — опытный HR-специалист, который занимается первичным скринингом кандидатов на вакансию. На входе у тебя есть развернутая анкета резюме, включающая: 1. Ключевые слова, связанные с вакансией. 2. Образование (учебное заведение, специальность, год окончания). 3. Подробный опыт работы (компании, должности, обязанности, продолжительность). 4. Навыки (технические, коммуникативные, управленческие и т.д.). 5. Уровень владения языками. 6. Сопроводительное письмо (при наличии). 7. Дополнительные требования: готовность к командировкам, наличие водительских прав и т.д. 8. Ожидаемая зарплата. 9. Загрузка PDF/Word резюме (файл). 10. Комментарии/заметки рекрутера. Твоя задача: 1) В первой строке ответа чётко укажи: "РЕКОМЕНДОВАН" или "НЕ РЕКОМЕНДОВАН", опираясь на соответствие кандидата вакантной позиции. 2) Сразу после этого дай подробное обоснование своего решения. Раскрой ключевые сильные стороны и возможные проблемные моменты, учитывая все перечисленные пункты анкеты. 3) При необходимости упомяни, какие моменты стоит уточнить на следующем этапе собеседования. Говори на русском языке. Форматируй ответ в нескольких абзацах, чтобы он был легко читаем и полезен для рекрутера.'
            },
            {
              role: 'user',
              content: prompt
            }
          ]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process request');
      }

      const responseData = await response.json();
      if (responseData.error) {
        throw new Error(responseData.error);
      }

      if (!responseData.response?.content) {
        throw new Error('Invalid response format');
      }

      const aiResponse = responseData.response.content;
      const recommended = aiResponse.toLowerCase().includes('рекомендован') && !aiResponse.toLowerCase().includes('не рекомендован');

      setResult({
        response: aiResponse,
        recommended
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Произошла ошибка при обработке запроса.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setResumeFileName(file.name);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Расширенный скрининг резюме</h1>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-8 rounded-lg shadow-sm">
        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ФИО
            </label>
            <input
              {...register('name', { 
                required: 'Это поле обязательно',
                minLength: { value: 2, message: 'ФИО должно содержать минимум 2 символа' }
              })}
              type="text"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              {...register('email', { 
                required: 'Email обязателен',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Некорректный email адрес'
                }
              })}
              type="email"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
        </div>

        {/* Keywords */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ключевые слова (через запятую)
          </label>
          <input
            {...register('keywords', { required: 'Укажите хотя бы несколько ключевых слов' })}
            type="text"
            placeholder="Python, JavaScript, Agile, Team Lead"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.keywords && (
            <p className="mt-1 text-sm text-red-600">{errors.keywords.message}</p>
          )}
        </div>

        {/* Education */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Образование</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Университет/Колледж
              </label>
              <input
                {...register('education.university', { required: 'Укажите учебное заведение' })}
                type="text"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.education?.university && (
                <p className="mt-1 text-sm text-red-600">{errors.education.university.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Специализация
              </label>
              <input
                {...register('education.specialization', { required: 'Укажите специализацию' })}
                type="text"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.education?.specialization && (
                <p className="mt-1 text-sm text-red-600">{errors.education.specialization.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Год окончания
              </label>
              <input
                {...register('education.graduationYear', {
                  required: 'Укажите год окончания',
                  pattern: {
                    value: /^(19|20)\d{2}$/,
                    message: 'Укажите корректный год'
                  }
                })}
                type="text"
                placeholder="YYYY"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.education?.graduationYear && (
                <p className="mt-1 text-sm text-red-600">{errors.education.graduationYear.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Work Experience */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Опыт работы</h2>
          {fields.map((field, index) => (
            <div key={field.id} className="mb-6 p-4 bg-white rounded-lg shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Название компании
                  </label>
                  <input
                    {...register(`workExperience.${index}.companyName` as const, {
                      required: 'Укажите название компании'
                    })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Должность
                  </label>
                  <input
                    {...register(`workExperience.${index}.position` as const, {
                      required: 'Укажите должность'
                    })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Длительность работы
                  </label>
                  <input
                    {...register(`workExperience.${index}.duration` as const, {
                      required: 'Укажите длительность работы'
                    })}
                    placeholder="например: 2 года"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Обязанности
                  </label>
                  <textarea
                    {...register(`workExperience.${index}.duties` as const, {
                      required: 'Опишите обязанности'
                    })}
                    rows={3}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {index > 0 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Удалить
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={() => append({ companyName: '', position: '', duties: '', duration: '' })}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-4 w-4 mr-1" />
            Добавить опыт работы
          </button>
        </div>

        {/* Skills */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Навыки</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Технические навыки
              </label>
              <textarea
                {...register('technicalSkills', { required: 'Укажите технические навыки' })}
                rows={3}
                placeholder="JavaScript, Python, SQL..."
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
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
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Управленческие навыки
              </label>
              <textarea
                {...register('managementSkills')}
                rows={3}
                placeholder="Опыт управления командой, проектный менеджмент..."
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Languages */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Языки</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Уровень английского
              </label>
              <select
                {...register('languages.english', { required: 'Укажите уровень английского' })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Выберите уровень</option>
                {languageLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Другие языки
              </label>
              <input
                {...register('languages.other')}
                type="text"
                placeholder="например: French (B2), German (A2)"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Cover Letter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Сопроводительное письмо
          </label>
          <textarea
            {...register('coverLetter', { required: 'Добавьте сопроводительное письмо' })}
            rows={5}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.coverLetter && (
            <p className="mt-1 text-sm text-red-600">{errors.coverLetter.message}</p>
          )}
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Загрузить резюме (PDF или DOC)
          </label>
          <input
            type="file"
            {...register('resumeFile', {
              required: 'Загрузите файл резюме',
              validate: {
                fileType: (value) => {
                  if (value[0]) {
                    const types = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
                    return types.includes(value[0].type) || 'Поддерживаются только PDF и DOC файлы';
                  }
                  return true;
                }
              }
            })}
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx"
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-medium
              file:bg-indigo-50 file:text-indigo-700
              hover:file:bg-indigo-100"
          />
          {resumeFileName && (
            <p className="mt-1 text-sm text-gray-500">Выбран файл: {resumeFileName}</p>
          )}
          {errors.resumeFile && (
            <p className="mt-1 text-sm text-red-600">{errors.resumeFile.message}</p>
          )}
        </div>

        {/* Requirements */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Дополнительные требования</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('readyToTravel')}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Готовность к командировкам
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('hasDriverLicense')}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Наличие водительских прав
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('remoteWork')}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Готовность к удаленной работе
              </label>
            </div>
          </div>
        </div>

        {/* Expected Salary */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ожидаемая зарплата
          </label>
          <input
            {...register('expectedSalary', { required: 'Укажите ожидаемую зарплату' })}
            type="text"
            placeholder="например: 150000 руб."
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.expectedSalary && (
            <p className="mt-1 text-sm text-red-600">{errors.expectedSalary.message}</p>
          )}
        </div>

        {/* Additional Comments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Дополнительные комментарии
          </label>
          <textarea
            {...register('additionalComments')}
            rows={3}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
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
              Обработка...
            </>
          ) : (
            'Отправить'
          )}
        </button>
      </form>

      {/* Results */}
      {result && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center mb-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              result.recommended
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {result.recommended ? 'Рекомендован' : 'Не рекомендован'}
            </span>
          </div>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{result.response}</p>
          </div>
        </div>
      )}
    </div>
  );
}