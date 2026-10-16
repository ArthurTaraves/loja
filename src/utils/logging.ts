/**
 * Loga a falha de uma consulta pública e, se o erro parecer ser de índice
 * composto faltando no Firestore, deixa a dica de como resolver — é a causa
 * mais comum da loja aparecer vazia logo após configurar o projeto.
 */
export function logQueryError(context: string, error: unknown): void {
  console.error(`Falha ao carregar ${context}:`, error);
  console.warn(
    `Se o erro acima mencionar "requires an index" ou "FAILED_PRECONDITION": crie os índices compostos do Firestore clicando no link que o próprio erro traz, ou publique os já prontos deste projeto com "firebase deploy --only firestore:rules,firestore:indexes" (veja o README).`,
  );
}
