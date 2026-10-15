import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6">
      <h1 className="text-xl font-semibold text-primary">Página não encontrada</h1>
      <Link to="/" className="mt-4 inline-block text-primary underline">
        Voltar para a loja
      </Link>
    </div>
  );
}
