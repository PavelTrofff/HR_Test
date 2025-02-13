'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface Step {
  title: string;
  prompt: string;
  stepIndex: number;
  context: string;
}

const steps: Step[] = [
  {
    title: 'Добро пожаловать в компанию',
    stepIndex: 0,
    context: 'welcome',
    prompt: 'STEP: welcome\nROLE: HR-ассистент проводит первую встречу с новым сотрудником\nTASK: Познакомить с ценностями компании\nPREVIOUS_STEPS: нет\nNEXT_STEP: техника безопасности\n\nINSTRUCTIONS:\n1. Поприветствуй нового сотрудника\n2. Представь три ключевые ценности компании:\n- Взаимоуважение (свобода выражения мнений)\n- Развитие (профессиональный рост)\n- Инновации (поощрение новых идей)\n3. Укажи на портал X для подробной информации\n4. Дай контакт HR-отдела (hr@X)\n5. Задай два вопроса про ценности и ожидания'
  },
  {
    title: 'Техника безопасности',
    stepIndex: 1,
    context: 'safety',
    prompt: 'STEP: safety\nROLE: HR-ассистент проводит инструктаж по безопасности\nTASK: Объяснить правила техники безопасности\nPREVIOUS_STEPS: знакомство с ценностями\nNEXT_STEP: корпоративная почта\n\nINSTRUCTIONS:\n1. Кратко поприветствуй\n2. Объясни три ключевых правила безопасности:\n- Изучение инструкции (портал Y)\n- Использование защитных средств\n- Действия при ЧП (служба Z, номер 123)\n3. Задай вопросы про важность мер и действия при неполадках'
  },
  {
    title: 'Корпоративная почта',
    stepIndex: 2,
    context: 'email',
    prompt: 'STEP: email\nROLE: HR-ассистент объясняет процесс настройки почты\nTASK: Объяснить активацию корпоративной почты\nPREVIOUS_STEPS: техника безопасности\nNEXT_STEP: доступ к системам\n\nINSTRUCTIONS:\n1. Кратко поприветствуй\n2. Объясни процесс активации почты:\n- Запрос на it-support@X с ID\n- Ожидание инструкций\n- Правила безопасности\n3. Задай вопросы про безопасность и использование каналов связи'
  },
  {
    title: 'Доступ к системам',
    stepIndex: 3,
    context: 'systems',
    prompt: 'STEP: systems\nROLE: HR-ассистент объясняет работу с системами\nTASK: Рассказать о доступе к корпоративным системам\nPREVIOUS_STEPS: корпоративная почта\nNEXT_STEP: завершение онбординга\n\nINSTRUCTIONS:\n1. Кратко поприветствуй\n2. Представь три системы:\n- CRM Y (клиенты)\n- Портал Z (документация)\n- Система W (задачи)\n3. Объясни получение доступа через portal-access@X\n4. Напомни про смену временного пароля\n5. Задай вопросы про важность систем и их безопасность'
  }
];

export default function OnboardingBot() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Array<{ content: string; step: number }>>([]);
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: string; content: string }>>([]);
  
  const progress = ((currentStep + 1) / steps.length) * 100;

  const fetchStepContent = async (stepPrompt: string, stepIndex: number) => {
    setLoading(true);
    try {
      // Добавляем историю предыдущих сообщений для контекста
      const currentStepContext = steps[stepIndex].context;
      const systemMessage = {
        role: 'system',
        content: `Ты HR-ассистент, проводящий онбординг нового сотрудника. Текущий этап: ${currentStepContext}.

ПРАВИЛА:
1. Строго следуй контексту текущего этапа
2. Не повторяй информацию из предыдущих этапов
3. Используй дружелюбный тон и обращение на "ты"
4. Один-два эмодзи на сообщение
5. Четкая структура: приветствие → информация → вопросы

ЗАПРЕЩЕНО:
- Смешивать темы разных этапов
- Повторять пройденное
- Использовать формальный язык
- Перегружать эмодзи`
      };

      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            systemMessage,
            ...conversationHistory,
            {
              role: 'user',
              content: stepPrompt
            }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.response?.content) {
        throw new Error('Invalid response format');
      }

      // Обновляем историю разговора
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: stepPrompt },
        { role: 'assistant', content: data.response.content }
      ]);

      setMessages(prev => [...prev, { content: data.response.content, step: stepIndex }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        content: 'Извините, произошла ошибка. Пожалуйста, попробуйте обновить страницу.',
        step: stepIndex
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Инициализация первого шага
  useEffect(() => {
    fetchStepContent(steps[0].prompt, 0);
  }, []);

  const handleNextStep = async () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      await fetchStepContent(steps[nextStep].prompt, nextStep);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Онбординг</h1>
      
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm font-medium text-gray-900 mb-2">
          <span>Прогресс</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div 
            className="h-2 bg-indigo-600 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Current step */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {steps[currentStep].title}
        </h2>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : (
          <div className="prose prose-indigo max-w-none">
            {messages.map((msg, index) => (
              msg.step === currentStep && (
                <p key={index} className="text-gray-700 whitespace-pre-wrap">
                  {msg.content}
                </p>
              )
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
          disabled={currentStep === 0}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          Назад
        </button>
        
        <button
          onClick={handleNextStep}
          disabled={currentStep === steps.length - 1 || loading}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {currentStep === steps.length - 1 ? 'Завершить' : 'Следующий шаг'}
        </button>
      </div>
    </div>
  );
}