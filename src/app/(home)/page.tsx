'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState } from 'react';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
});

const DEFAULT_CODE = `
function run() {
  // Inserir código aqui
}

console.log(run())
`;

export default function Home() {
  const [code, setCode] = useState(DEFAULT_CODE);

  return (
    <div className="flex h-svh flex-col items-center justify-center bg-gray-800">
      <div>
        <h1 className="mb-2 text-2xl font-bold text-white">
          Projeto em desenvolvimento:{' '}
          <Link href="/mvp" className="text-blue-500 underline">
            Acompanhe o mvp aqui{' '}
          </Link>
        </h1>
      </div>

      <main className="flex w-full max-w-[1420px] justify-between gap-6">
        <div className="min-w-[700px] overflow-auto rounded-xl border border-gray-700 bg-gray-800">
          <header className="flex items-center justify-between border-b border-gray-600 bg-gray-700 p-4">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="size-3 min-w-3 rounded-full bg-red-500" />
                <div className="size-3 min-w-3 rounded-full bg-yellow-500" />
                <div className="size-3 min-w-3 rounded-full bg-green-500" />
              </div>

              <h1 className="text-white">Editor de Código</h1>
            </div>
          </header>

          <div className="p-4">
            <h2 className="text-lg font-medium text-white">Desafio</h2>

            <p className="text-sm text-gray-300">Retorne a soma do número</p>
          </div>

          <div className="h-[500px]">
            <MonacoEditor
              language="javascript"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
              }}
              theme="vs-dark"
            />
          </div>

          <footer className="border-t border-gray-600 p-4">
            <button className="bg-linear-65 from-purple-500 to-pink-500 text-white">
              Executar
            </button>
          </footer>
        </div>

        <div className="w-full overflow-auto rounded-xl border border-gray-700 bg-gray-800">
          <header className="flex items-center justify-between border-b border-gray-600 bg-gray-700 p-4">
            <div className="flex items-center gap-2">
              <h1 className="text-white">Resultados</h1>
            </div>
          </header>
        </div>

        <div className="w-full overflow-auto rounded-xl border border-gray-700 bg-gray-800">
          <header className="flex items-center justify-between border-b border-gray-600 bg-gray-700 p-4">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="size-3 min-w-3 rounded-full bg-red-500" />
                <div className="size-3 min-w-3 rounded-full bg-yellow-500" />
                <div className="size-3 min-w-3 rounded-full bg-green-500" />
              </div>

              <h1 className="text-white">Editor de Código</h1>
            </div>
          </header>
        </div>
      </main>
    </div>
  );
}
