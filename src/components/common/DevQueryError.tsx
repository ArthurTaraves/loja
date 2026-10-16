/**
 * Mensagem amigável visível só em desenvolvimento (import.meta.env.DEV) quando
 * uma consulta pública falha — nunca aparece pra cliente em produção, onde o
 * aviso fica só no console (ver utils/logging.ts).
 */
export function DevQueryError({ context }: { context: string }) {
  if (!import.meta.env.DEV) return null;

  return (
    <div className="mx-auto my-4 max-w-5xl rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <strong>[dev] </strong>
      Falha ao carregar {context}. Veja o console do navegador — se o erro mencionar
      "requires an index", clique no link que ele mostra pra criar o índice composto do
      Firestore, ou publique os já prontos com{' '}
      <code className="rounded bg-amber-100 px-1 py-0.5">
        firebase deploy --only firestore:rules,firestore:indexes
      </code>
      .
    </div>
  );
}
