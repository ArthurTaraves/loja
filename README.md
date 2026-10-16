# Loja — modelo reutilizável de e-commerce/vitrine

Template de loja em React + Firebase + Cloudinary. Tudo que é visual/textual (nome
da loja, cores, logo, banners, WhatsApp, redes sociais, rodapé, SEO) é configurado
pelo painel `/admin` — não precisa mexer em código para colocar uma loja no ar.

## Stack

- React + Vite + TypeScript + Tailwind CSS
- Firebase Authentication (login do admin) + Firestore (dados da loja)
- Cloudinary (upload de imagens, direto do navegador)
- Deploy na Vercel

## Passo a passo para colocar sua loja no ar

### 1. Instalar dependências

```bash
npm install
```

### 2. Criar o projeto no Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com) e crie um projeto novo.
2. **Authentication** → Sign-in method → ative **E-mail/senha**.
3. **Firestore Database** → criar banco → **modo produção** (as regras de segurança do projeto, em `firestore.rules`, já cuidam do acesso — não use "modo teste").
4. **Configurações do projeto** → role até "Seus apps" → crie um **app Web** → copie o objeto `firebaseConfig`.

### 3. Criar a conta no Cloudinary

1. Acesse [cloudinary.com](https://cloudinary.com) e crie uma conta gratuita.
2. **Settings → Upload → Upload presets → Add upload preset**:
   - **Signing mode: Unsigned** (obrigatório — é o que permite o navegador enviar a foto direto, sem servidor).
   - Opcional, mas recomendado: em "Upload Manipulations", restrinja **Allowed formats** (`jpg,png,webp`), um **Max file size**, e defina uma **Folder** fixa (ex: `loja`) para organizar os uploads.
3. Anote o **Cloud name** (aparece no topo do dashboard) e o **nome do preset** criado.

### 4. Preencher o `.env`

Copie `.env.example` para `.env` e preencha com os valores dos passos 2 e 3:

```bash
cp .env.example .env
```

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

VITE_CLOUDINARY_CLOUD_NAME=...
VITE_CLOUDINARY_UPLOAD_PRESET=...
```

### 5. Publicar as regras e os índices do Firestore

O projeto já vem com `firestore.rules` (regras de segurança) e `firestore.indexes.json`
(índices compostos) prontos, referenciados pelo `firebase.json` na raiz. **Os dois
precisam ser publicados** — sem os índices, a home e a listagem de produtos
carregam vazias, mesmo com produtos cadastrados (ver "Limitações conhecidas" abaixo).

- **CLI (recomendado, publica os dois de uma vez)**:
  ```bash
  npx firebase-tools login
  npx firebase-tools use --add          # escolha o projeto que você criou no passo 2
  npx firebase-tools deploy --only firestore:rules,firestore:indexes
  ```
- **Console** (alternativa só para as regras): Firestore Database → aba **Regras** → cole o conteúdo de `firestore.rules` → **Publicar**. Os índices compostos do `firestore.indexes.json`, nesse caso, você recria manualmente em **Índices → Criar índice** (ou deixa a loja mostrar o erro com o link de criação automática, como descrito abaixo, e clica nele).

A criação dos índices no Firebase não é instantânea — leva de alguns segundos a
poucos minutos (o console mostra o status "Compilando").

### 6. Rodar localmente e fazer o primeiro acesso

```bash
npm run dev
```

Acesse `http://localhost:5173/admin`. Como nenhum admin existe ainda, a tela de
**configuração inicial** aparece automaticamente: preencha nome da loja, WhatsApp,
e crie seu e-mail/senha de admin. Depois disso essa tela nunca mais aparece — os
próximos acessos a `/admin` pedem login normal.

> ⚠️ Entre o deploy e o primeiro acesso, qualquer pessoa que tiver o link do site
> poderia, em teoria, chegar em `/admin` primeiro e virar a admin (a regra do
> Firestore só permite o *primeiro* cadastro, então só uma pessoa consegue — mas
> pode não ser você). Não divulgue a URL do site antes de fazer esse primeiro
> acesso.

### 7. Deploy na Vercel

1. Suba o projeto num repositório Git e importe na [Vercel](https://vercel.com/new).
2. Em **Settings → Environment Variables**, cadastre as mesmas variáveis do seu `.env` (as 6 `VITE_FIREBASE_*` e as 2 `VITE_CLOUDINARY_*`).
3. Deploy. Depois do primeiro deploy, acesse `https://seu-site.vercel.app/admin` e repita o passo 6 (configuração inicial) se ainda não tiver feito localmente — o Firestore é o mesmo banco então, se você já criou o admin localmente, o login normal já funciona em produção.

> O `vercel.json` na raiz já faz o rewrite de qualquer rota pra `/index.html` — sem
> ele, abrir `/admin` ou `/produto/algum-slug` direto (ou dar F5 nessas páginas) dá
> 404, porque o site é uma SPA e só existe fisicamente um `index.html`; o React
> Router é quem decide o resto no navegador.

### 8. (Opcional) Proteger o Firestore com Firebase App Check

Sem isso o site funciona normal — é uma camada extra pra impedir que *scripts*
fora do seu domínio chamem o Firestore diretamente (ex: alguém automatizando a
criação de pedidos falsos, ignorando o site). Recomendado antes de divulgar a
loja de verdade, mas dá pra configurar a qualquer momento.

1. **Criar a chave do reCAPTCHA v3**: acesse o
   [admin do reCAPTCHA](https://www.google.com/recaptcha/admin/create), escolha
   **reCAPTCHA v3**, cadastre o domínio do seu site (e `localhost` se quiser
   testar em dev). Você recebe duas chaves — guarde as duas, mas só a **site
   key** (a pública) vai pro `.env`.
2. **Ativar o App Check no Firebase**: console do Firebase → **App Check** →
   selecione seu app Web → **Registrar** → provedor **reCAPTCHA v3** → cole a
   site key (a secret key o próprio Firebase pede numa tela separada, ligada
   à conta do Google Cloud do reCAPTCHA — siga o fluxo que o console mostra).
3. Adicione `VITE_RECAPTCHA_SITE_KEY=<sua site key>` no `.env` (e nas
   variáveis de ambiente da Vercel) e rode `npm run build` de novo / faça
   redeploy.
4. **Não ative o "Enforcement" ainda.** Depois de alguns pedidos/acessos
   reais, volte em **App Check → Firestore** no console: ele mostra um
   gráfico de requisições "verificadas" vs "não verificadas". Só vire o
   interruptor de **Enforce** quando a maioria das requisições reais
   aparecer como verificada — ativar cedo demais (ou com a site key errada)
   pode bloquear seus próprios clientes de fazer pedidos.

## Limitações conhecidas (pra você não ser pego de surpresa)

- **Excluir foto no admin não apaga do Cloudinary.** O upload é "unsigned" (direto do navegador), e apagar de verdade exige a API secret do Cloudinary, que nunca deve ficar no código do site. "Remover" no admin só tira a referência do Firestore — o arquivo continua armazenado no Cloudinary. De vez em quando, limpe manualmente pelo [Media Library](https://cloudinary.com/documentation/media_library_widget) do Cloudinary, ou ignore se o plano gratuito (25GB) for suficiente pro seu volume de fotos.
- **Preview de link (WhatsApp/Facebook/Twitter) é estático.** O site é uma SPA (uma página HTML só, que vira loja via JavaScript) — bots de preview de link não esperam o JavaScript rodar, então eles leem as tags `og:title`/`og:description`/`og:image` fixas no `index.html`, não os dados dinâmicos de `settings/store`. Se quiser personalizar, edite essas tags direto no `index.html` (inclua uma imagem em `public/og-image.png`, 1200x630px, para a tag `og:image` funcionar). O `<title>` da aba do navegador, esse sim, é dinâmico.
- **Pedido tem limites fixos nas regras do Firestore**: até 50 itens no carrinho, nome do cliente até 100 caracteres, telefone até 20, endereço até 300 — tudo validado tanto no formulário quanto em `firestore.rules`. É deliberado (evita abuso), mas se algum cliente legítimo esbarrar nisso um dia, os limites estão na função `isValidOrder` do `firestore.rules`.
- **Loja aparece vazia (home sem produtos/banners, lista de produtos sem nada) se os índices do Firestore não foram publicados.** As consultas públicas filtram por `active` e ordenam por `createdAt`/`order` (ou filtram por categoria/destaque também), e o Firestore exige um índice composto pra cada combinação dessas — é exatamente o que o passo 5 publica. Se você pulou esse passo (ou ele falhou), a consulta dá erro em vez de voltar vazia de verdade: em **modo de desenvolvimento** (`npm run dev`) aparece um aviso amarelo na própria tela avisando qual consulta falhou; em produção esse aviso não some pro cliente, mas sempre fica logado no **console do navegador** (F12), e o próprio erro do Firebase ali traz um link que cria o índice faltante automaticamente. De qualquer forma, o jeito certo de resolver é rodar `firebase deploy --only firestore:rules,firestore:indexes` (passo 5) — o link do erro é só um atalho pra quando algo ficar pra trás.

## Tour pelo painel `/admin`

| Aba | O que controla |
|---|---|
| Aparência | Nome, slogan, logo, favicon, cores do site, modo do cabeçalho (padrão ou imagem pronta) |
| Banners | Carrossel da home (imagem desktop/mobile, link, ordem, ativo) |
| Produtos | Fotos, preço, promoção, variações (ex: tamanho) com estoque por opção, destaque |
| Categorias | Nome, foto opcional, ordem, ativo |
| Pedidos | Lista de pedidos feitos pelo site (com número sequencial `#0001`, `#0002`...), troca de status (debita/devolve estoque automaticamente ao confirmar/cancelar) |
| Contato e WhatsApp | Número, mensagem padrão do botão flutuante, mensagem modelo do pedido (variáveis `{pedido}`, `{nome}`, `{itens}`, `{total}`, `{endereco}`), redes sociais |
| Rodapé e SEO | Texto do rodapé, endereço, horário, título/descrição da página |

## Estrutura do projeto

```
src/
  types/        tipos (Product, Category, Order, StoreSettings, Banner...)
  services/     Firebase, Cloudinary, e CRUD de cada coleção do Firestore
  contexts/     StoreSettingsContext, AuthContext, CartContext
  hooks/        useStoreSettings, useAuth, useCart, useProducts, useCategories
  components/   componentes de UI (layout, home, product, cart, common)
  pages/        páginas públicas (Home, ProductList, ProductDetail, CartPage...)
  admin/        painel administrativo (login, setup inicial, abas)
  utils/        formatação de moeda, slug, validação de telefone, mensagem do WhatsApp, log de erro de consulta
firebase.json           aponta pro firestore.rules e firestore.indexes.json
firestore.rules         regras de segurança
firestore.indexes.json  índices compostos das consultas públicas (ver passo 5)
```

## Scripts

```bash
npm run dev      # servidor de desenvolvimento
npm run build    # build de produção (roda o type-check antes)
npm run preview  # pré-visualiza o build de produção
```
