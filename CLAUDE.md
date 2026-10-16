# Regras deste projeto para o Claude

## NUNCA toque no arquivo `.env`

O `.env` guarda as credenciais reais do Firebase e do Cloudinary deste
projeto. Ele é intencionalmente ignorado pelo git (`.gitignore`), então
**não existe histórico pra recuperar o conteúdo se ele for apagado ou
sobrescrito**.

Isso já aconteceu: em várias sessões de teste anteriores, para simular
"Firebase não configurado" ou testar com um projeto fake, rodei
`cat > .env <<'EOF' ... EOF` com credenciais falsas por cima do arquivo
real, e a limpeza seguinte (`rm -f .env`) apagou o arquivo inteiro sem
backup. O usuário precisou recolar as chaves manualmente mais de uma vez.

Regra, sem exceção, para qualquer sessão futura:

- **Nunca** `rm`, `mv`, sobrescrever (`cat >`, `Set-Content`, `echo >`,
  `Write`/`Edit` tools, etc.) ou renomear `.env`.
- **Nunca** rodar `git clean -x`/`-f`/`-d` (remove arquivos ignorados/não
  rastreados do working tree) nem `git stash -u`/`-a` (podem arrastar e
  depois "perder" arquivos ignorados como esse).
- Restaurações amplas (`git checkout -- .`, `git restore .`, resets, etc.)
  devem ser evitadas ou, se necessárias, feitas com cuidado pra não afetar
  arquivos não rastreados como `.env`.
- Antes de qualquer comando que mexa amplamente no working tree, rode
  `git status` e confirme que `.env` não será afetado.

## Como testar sem o Firebase/Cloudinary reais configurados

Use um arquivo de env **separado**, nunca o `.env`:

```bash
cat > .env.test <<'EOF'
VITE_FIREBASE_API_KEY=AIzaSyFAKE1234567890FAKE1234567890FAKE
VITE_FIREBASE_AUTH_DOMAIN=fake-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=fake-project
VITE_FIREBASE_STORAGE_BUCKET=fake-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:fake1234567890
VITE_CLOUDINARY_CLOUD_NAME=fake-cloud
VITE_CLOUDINARY_UPLOAD_PRESET=fake-preset
EOF

npm run dev -- --mode test
# ou: npx vite build --mode test   /   npx vite preview --mode test
```

O Vite carrega `.env` primeiro e depois sobrepõe com `.env.test` (maior
prioridade) quando `--mode test` é passado. Como `.env.test` define todas
as 8 chaves, o conteúdo do `.env` real nunca chega a ser usado — e o
arquivo em si nunca precisa ser lido, escrito, movido ou apagado.
`.env.test` já cai no padrão `.env.*` do `.gitignore`, então nunca é
commitado. Pode apagar `.env.test` ao final do teste (ele nunca contém
segredo real, foi sempre inventado pra teste).

Se o teste precisar simular "nenhum `.env` configurado" (tela de
`FirebaseNotConfigured`), rode sem passar nenhum `.env.test` e sem mexer
no `.env` real — simplesmente não defina as variáveis nesse modo, ex:
`cat > .env.test <<'EOF'\nEOF` (arquivo vazio) e rode com `--mode test`
do mesmo jeito.

**Cuidado com a porta**: se já houver um `vite` rodando na 5173, o próximo
sobe na 5174 (ou seguinte) e o log do próprio `npm run dev` mostra qual.
Sempre confira a porta real no log antes de testar — bater numa instância
errada pode fazer parecer que `--mode test` não funcionou quando na
verdade era só outro servidor respondendo.

**Confirmado funcionando** (verificado nesta sessão): com `.env` real
intacto, `npm run dev -- --mode test` + um `.env.test` completo faz
`import.meta.env` carregar só os valores fake — o `.env` real nunca é
lido para essas variáveis, e seu conteúdo no disco não muda (hash
confirmado antes/depois).
