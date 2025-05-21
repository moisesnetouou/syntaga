'use client';

import dynamic from 'next/dynamic';
import React, { useState } from 'react';

import * as Babel from '@babel/standalone';
import { Toaster, toast } from 'sonner';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
});

/*
 * - [ ] Conquistas devem ser salvas nos cookies
 * - [ ] Exibir conquistas ocultas
 * - [ ] Exibir dicas de conquistas
 * - [ ] Estilizar editor
 * - [ ] Criar página que lista conquistas
 */

const DEFAULT_CODE = `
function run() {
  // Inserir código aqui
}

console.log(run())
`;

type Achievement = {
  id: string;
  label: string;
  description: string;
  check: (code: string, output: string[]) => boolean;
  hidden?: boolean;
  showDescriptionHint?: boolean;
};

type Challenge = {
  id: string;
  title: string;
  description: string;
  check: (output: string[]) => boolean;
  achievements: Achievement[];
};

const CHALLENGES: Challenge[] = [
  {
    id: 'sum',
    title: '🧮 Desafio da Soma',
    description: 'Retorne a soma do número 2 + 10',
    check: (output) => output.includes('12'),
    achievements: [
      {
        id: 'sum-correct',
        label: '🧮 Somando Corretamente',
        description: 'Você retornou corretamente o valor 12 ao somar 2 + 10.',
        check: (_, output) => output.includes('12'),
        showDescriptionHint: true,
      },
      {
        id: 'sum-wrong-string',
        label: '🤔 Acho que tem algo de errado...',
        description:
          'Você somou "2" + "10", o que resulta em uma string "210".',
        check: (code) =>
          code.includes("'2' + '10") || code.includes('"2" + "10"'),
        hidden: true,
        showDescriptionHint: true,
      },
    ],
  },
  {
    id: 'array',
    title: '📦 Desafio de Listagem',
    description: 'Retorne o array [1, 2, 10, 5, 30]',
    check: (output) =>
      output.some((line) =>
        /\[?\s*1\s*,\s*2\s*,\s*10\s*,\s*5\s*,\s*30\s*\]?/.test(line),
      ),
    achievements: [
      {
        id: 'array-correct',
        label: '📦 Lista Montada',
        description: 'Você retornou corretamente o array [1, 2, 10, 5, 30].',
        check: (_, output) =>
          output.some((line) => line.replace(/\s/g, '') === '1,2,10,5,30'),
      },
      {
        id: 'array-sorted',
        label: '🔢 Ordem é tudo!',
        description: 'Você usou .sort() ou .toSorted() para ordenar o array.',
        check: (code) => code.includes('.sort(') || code.includes('.toSorted('),
        hidden: true,
        showDescriptionHint: true,
      },
      {
        id: 'array-sorted-asc',
        label: '📈 Ordem Crescente',
        description:
          'Você retornou o array em ordem crescente: [1, 2, 5, 10, 30].',
        check: (code, output) => {
          const usedSort =
            code.includes('.sort((a, b) => a - b') ||
            code.includes('.toSorted((a, b) => a - b');
          const resultCorrect = output.some(
            (line) => line.replace(/\s/g, '') === '1,2,5,10,30',
          );
          return usedSort && resultCorrect;
        },
        hidden: true,
        showDescriptionHint: true,
      },
      {
        id: 'array-sorted-desc',
        label: '📉 Ordem Decrescente',
        description:
          'Você retornou o array em ordem decrescente: [30, 10, 5, 2, 1].',
        check: (code, output) => {
          const usedSort =
            code.includes('.sort((a, b) => b - a') ||
            code.includes('.toSorted((a, b) => b - a');
          const resultCorrect = output.some(
            (line) => line.replace(/\s/g, '') === '30,10,5,2,1',
          );
          return usedSort && resultCorrect;
        },
        hidden: true,
        showDescriptionHint: true,
      },
    ],
  },
];

const playAchievementSound = () => {
  const audio = new Audio('/sounds/sound-achievement.mp3');
  audio.volume = 0.5;
  audio.play().catch((e) => console.warn('Falha ao reproduzir som:', e));
};

const showToastsInSequence = (labels: string[], delay = 1200) => {
  labels.forEach((label, index) => {
    setTimeout(() => {
      toast.success(label, { position: 'bottom-right' });
      playAchievementSound();
    }, index * delay);
  });
};

export default function Playground() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState<string[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [challengeIndex, setChallengeIndex] = useState(0);

  const currentChallenge = CHALLENGES[challengeIndex];

  const executeCode = () => {
    const logs: string[] = [];
    const originalLog = console.log;
    console.log = (...args) => {
      logs.push(args.map(String).join(' '));
      originalLog(...args);
    };

    try {
      const transpiled = Babel.transform(code, {
        presets: ['env'],
        filename: 'file.js',
      }).code;

      setOutput([]);
      new Function(transpiled!)();

      const logsToDisplay =
        logs.length > 0 ? logs : ['ℹ️ Nenhum log foi gerado'];
      setOutput(logsToDisplay);

      const achieved = currentChallenge.achievements.filter((a) =>
        a.check(code, logsToDisplay),
      );
      setAchievements(achieved.map((a) => a.id));

      showToastsInSequence(achieved.map((a) => a.label));

      if (!currentChallenge.check(logsToDisplay)) {
        const incorrectLogs = logsToDisplay.filter(
          (line) => !currentChallenge.check([line]),
        );
        const errorMessage = `❌ Resultado incorreto: ${incorrectLogs.join(', ')}`;
        toast.error(errorMessage, { position: 'bottom-right' });
      }
    } catch (err: any) {
      const errorMsg = `❌ Erro: ${err.message}`;
      setOutput([errorMsg]);
      setAchievements([]);
      toast.error(errorMsg, { position: 'bottom-right' });
    } finally {
      console.log = originalLog;
    }
  };

  return (
    <div className="relative">
      <Toaster richColors position="top-right" closeButton />
      <div className="p-4">
        <div className="mb-4 flex gap-2">
          {CHALLENGES.map((ch, i) => (
            <button
              key={ch.id}
              onClick={() => setChallengeIndex(i)}
              className={`rounded border px-4 py-2 ${challengeIndex === i ? 'bg-blue-600 text-white' : 'bg-white text-black'}`}
            >
              {ch.title}
            </button>
          ))}
        </div>

        <p className="mb-4 text-lg font-semibold">
          {currentChallenge.description}
        </p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="h-[500px] md:col-span-1">
            <MonacoEditor
              language="javascript"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{ minimap: { enabled: false }, fontSize: 14 }}
              height="100%"
            />
          </div>

          <div className="h-[500px] md:col-span-1">
            <button
              onClick={executeCode}
              className="mb-4 rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
            >
              Executar
            </button>
            <div className="h-[450px] overflow-auto rounded border bg-black p-4 font-mono whitespace-pre-wrap text-green-400">
              {output.map((line, index) => (
                <div key={index}>{line}</div>
              ))}
            </div>
          </div>

          <div className="h-[500px] overflow-auto md:col-span-1">
            <h2 className="mb-2 text-xl font-bold">Conquistas</h2>
            <ul className="space-y-4">
              {currentChallenge.achievements.map(
                ({ id, label, description, hidden, showDescriptionHint }) => {
                  const unlocked = achievements.includes(id);
                  if (hidden && !unlocked) return null;

                  const showDescription = unlocked || showDescriptionHint;

                  return (
                    <li
                      key={id}
                      className={`flex flex-col gap-1 ${unlocked ? 'text-green-600' : 'text-gray-400'}`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{unlocked ? '✅' : '⬜️'}</span> {label}
                      </div>
                      {showDescription && (
                        <p className="ml-6 text-sm text-gray-500">
                          {description}
                        </p>
                      )}
                    </li>
                  );
                },
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
