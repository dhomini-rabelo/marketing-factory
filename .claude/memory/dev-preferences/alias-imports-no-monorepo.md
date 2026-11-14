# Alias imports no monorepo

Use sempre alias em imports TypeScript. Caminhos relativos (`./` e `../`) são proibidos no source e nos testes de pacotes workspace e de apps em `packages/infra` (API, web, mobile etc.), exceto o que bundler ou runtime exige em arquivos de config.

**Pacotes workspace:** `package.json` `exports` só `"."`. Intra-pacote usa specifier `@<nome no package.json>/<caminho a partir de src>`, sem o segmento `src/` e sem sufixo `.js`. O `tsconfig` do pacote usa `moduleResolution: Bundler` e `paths`: o próprio nome (`@myapp/domain-auth` → `src/index.ts`, `@myapp/domain-auth/*` → `src/*`). O specifier exato de *outro* pacote (`@myapp/domain-base`) resolve pelo workspace + `exports` `"."`. O glob `@myapp/<outro>/*` também entra no `paths` (apontando ao `src` daquele pacote): o `tsc` segue os reexports do barrel em source e não aplica o tsconfig da dependência.

**API pública entre pacotes:** só o barrel (`from '@myapp/domain-auth'`). Não use subpath de outro pacote para fakes internos. In-memory repository doubles ficam em `application/__tests__/repositories/`; fakes de adapters em `packages/modules/tests` (`@modules/tests`). O que outro módulo precisa no teste sai reexportado no `index.ts` quando for público.

**Proibido arquivo-shim de reexport.** Não crie um arquivo cujo único papel é reexportar outro arquivo do mesmo package. O barrel `index.ts` é o único reexport público. Consumidor intra-pacote importa o arquivo real (`@myapp/domain-base/domain-errors`), não um apelido (`domain-error`). O `examples/domain-base` pode expor um segundo entry `./nosql` (sabor NoSQL); isso é entry público, não shim.

**Barrel público agrupado.** O `index.ts` que reexporta várias pastas (ou vários arquivos na raiz de `src`) agrupa com comentário do specifier: `// @myapp/<pkg>/<pasta>` antes dos exports daquela pasta; arquivo na raiz de `src` ganha o próprio comentário (`// @myapp/domain-base/use-case`). Não comente barrel de um único arquivo.

**Apps web/mobile:** relativos viram o alias local do template (`@/` com `"@/*": ["src/*"]` é o padrão). Não importar source de pacotes sibling; clientes não importam domain nem implementações de infra.

Motivo: o caminho completo no import alinha com paths que ferramentas de leitura e escrita (incluindo IA) usam no repositório; um único `"."` no `exports` evita subpath público; shim de reexport duplica o caminho real e some do grep.

Exemplos:

- `from './ai-client.js'` em `adapters` → `from '@myapp/adapters/ai-client'`
- `from '../../entities/user.js'` em `domain-auth` → `from '@myapp/domain-auth/entities/user'`
- `from '../entity/id'` em `domain-base` → `from '@myapp/domain-base/entity/id'`
- `from '../services/http-client'` em `infra-adapters` → `from '@myapp/infra-adapters/services/http-client'` (ajuste ao `name` do `package.json` do módulo)
- `from '@myapp/domain-workspace/application/__tests__/repositories/member'` em outro pacote → preferir `from '@myapp/domain-workspace'` via barrel
- `from '@myapp/domain-auth'` para símbolo exportado no `index` → manter na raiz
- `from '../components/Header'` no web → `from '@/components/Header'`
- `from '@myapp/domain-base/domain-error'` (shim) → `from '@myapp/domain-base/domain-errors'`
