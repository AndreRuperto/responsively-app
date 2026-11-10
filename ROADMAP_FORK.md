# Responsively App — Plano de ação do fork

> Repositório: `AndreRuperto/responsively-app` · base: Responsively App 2.0 Beta  
> Branch de desenvolvimento inicial: `feat/navegacao-dispositivos`  
> Revisão inicial: 09/11/2026  
> Objetivo: transformar o fork em uma ferramenta estável, intuitiva e visualmente consistente para comparar, navegar e auditar sites em vários dispositivos, com foco inicial no Windows.

## 0. Situação atual (evidências)

- [x] Fork criado e clonado no Windows.
- [x] Ambiente transferido para unidade NTFS (`C:\Projetos\responsively-app`); instalação do Electron concluída.
- [x] Navegador Electron abriu, com prévias, navegador de dispositivos e controles `Fit all` / `Auto`.
- [x] Implementação inicial de navegador de prévias, cálculo de ajuste e testes adicionada à branch.
- [x] `yarn typecheck` passou no Windows antes da última atualização.
- [x] 284/286 testes unitários passaram antes da correção dos dois testes de inicialização macOS executados no Windows.
- [ ] Reexecutar testes completos após o ajuste dos testes de macOS; não considerar 286/286 aprovados sem confirmação.
- [ ] Executar Playwright E2E e validar visualmente prévias com 1, 3, 5 e 8 dispositivos.
- [ ] Revisar licenças antes de qualquer distribuição pública (licença da raiz AGPL-3.0 e declaração MIT em subpacotes).

### Observações da captura em Windows

- Existem **3 prévias ativas**, indicadas por `Default 3` e `3 devices · Default`. O teste original de cinco dispositivos ainda precisa ser repetido nessa nova versão.
- No iPhone 12 Pro (390×844), a barra interna de ferramentas quebra em duas linhas, consumindo área vertical e comprometendo a consistência.
- O botão `Scheme` da barra superior está ativo, enquanto a interface principal permanece clara. **São funções distintas**:
  - `Scheme`: altera `nativeTheme.themeSource` do Electron; visa simular o `prefers-color-scheme` dos sites abertos. Um site pode não alterar a aparência.
  - Ícone de sol/lua no canto inferior direito: despacha `setDarkMode`, alterando `data-theme` no documento da interface.
- A captura, sozinha, **não prova** que o botão inferior de tema esteja quebrado. Ambos os caminhos precisam ser testados separadamente.

## P0 — Etapa 1: confiabilidade e temas (primeira prioridade)

### P0.1 Diagnosticar e tornar inteligível o tema da interface

- [ ] Reproduzir clique no ícone inferior em tema claro e escuro, com DevTools abertos.
- [ ] Confirmar a cadeia **clique → `setDarkMode` → Redux → `ThemeProvider` → `html[data-theme]` → estilos computados**.
- [ ] Auditar a ordem dos imports CSS, especificidade, herança e tokens `--bg`, `--panel`, `--fg` e `--line` antes de alterar cores ou classes.
- [ ] Verificar a inconsistência entre `ui.darkMode = true` no reducer e `Boolean(store.get('ui.darkMode'))` no bootstrap, que produz `false` para preferência ausente.
- [ ] Incluir opções explícitas **Claro / Escuro / Sistema** em Configurações, com indicação visual do tema efetivo.
- [ ] Garantir que a escolha persista entre reinicializações e não altere sites abertos inadvertidamente.

**Pronto quando:** alternar o tema muda o fundo, menus, barras e botões na mesma interação, sem recarregar webviews; a opção reaparece correta após reiniciar. Testar também uma instalação sem preferências anteriores.

### P0.2 Separar e validar o esquema de cores dos sites

- [ ] Renomear `Scheme` para `Tema do site` / `Site scheme` e adicionar descrição: **não altera a interface do Responsively**.
- [ ] Oferecer `Light / Dark / System` para emulação da mídia `prefers-color-scheme`.
- [ ] Aguardar e tratar a resposta de `SET_NATIVE_THEME`; não indicar sucesso visual antes da confirmação do IPC.
- [ ] Testar em uma página-fixture local que muda fundo e texto via `@media (prefers-color-scheme: dark)` e exibe `matchMedia(...).matches`.
- [ ] Verificar efeito nas webviews já abertas e nas novas; testar retorno ao modo `System`.
- [ ] Documentar que sites como o Google podem adotar lógica própria de aparência, e que a opção não obriga todos os sites a trocar o visual.

**Pronto quando:** o site-fixture alterna sem recarga indevida, o estado do botão corresponde ao resultado real e a ajuda diferencia nitidamente os dois temas.

### P0.3 Corrigir a barra de ferramentas individual em telas estreitas

- [ ] Impedir a quebra em duas linhas dos controles internos dos celulares pequenos.
- [ ] Preservar funções essenciais (Atualizar, Capturar, DevTools, Rotacionar), agrupando ações secundárias sob `…` quando faltar largura.
- [ ] Não deixar ferramentas encobrirem o conteúdo do site nem diminuírem desnecessariamente a área útil.
- [ ] Assegurar alvos clicáveis, foco por teclado, `aria-label` e tooltips.
- [ ] Testar 320, 360, 390, 430 e 768 px, e zooms 25%, 50%, 75% e 100%.

**Pronto quando:** não há segunda linha inesperada, truncamento crítico ou ação inacessível no dispositivo mais estreito.

## P1 — Etapa 2: navegar, ajustar e comparar muitos dispositivos

### P1.1 Consolidar a navegação horizontal já iniciada

- [x] Barra com anterior/próximo, contador e seleção por dispositivo criada.
- [ ] Testar 5 e 8 dispositivos reais com o mesmo site carregado.
- [ ] Confirmar que cada botão leva à prévia correta em `Grid`, `Column` e `Masonry`.
- [ ] Impedir deslocamento acidental da janela inteira ou de conteúdos embutidos ao selecionar uma prévia.
- [ ] Tornar a prévia selecionada identificável também no espaço visual, não só no chip.
- [ ] Tratar adição, remoção, rotação e troca de suíte enquanto há dispositivo selecionado.
- [ ] Preservar estado das páginas e sessões ao navegar ou trocar de layout.

**Pronto quando:** qualquer um dos 8 dispositivos pode ser alcançado em até dois cliques e a navegação não recarrega webviews.

### P1.2 Fazer `Fit all` realmente caber no espaço disponível

- [x] Cálculo inicial de zoom e botão criados.
- [ ] Medir os tamanhos reais dos cartões (nome, toolbar, moldura e margens), não apenas os viewports nominais.
- [ ] Considerar altura e largura do espaço após barras e DevTools acopladas.
- [ ] Definir fallback explícito para quando nem o zoom mínimo permitir visualizar tudo: quebra em linhas ou navegação com indicação clara.
- [ ] Preservar o funcionamento dos botões de zoom e a persistência da escala selecionada.
- [ ] Garantir repetibilidade sem saltos ou clipping depois de rotação/redimensionamento.

**Pronto quando:** com 3 e 5 dispositivos, o ajuste coloca todas as prévias na área visível quando geometricamente possível; em cenários impossíveis, informa e mantém tudo alcançável.

### P1.3 Estabilizar o modo `Auto`

- [x] Observação de redimensionamento via `ResizeObserver` adicionada.
- [ ] Evitar oscilações de layout perto do limiar entre coluna única e linhas múltiplas (histerese).
- [ ] Evitar ciclos de atualização do Redux e recálculo em cascata.
- [ ] Guardar preferência `Auto` por sessão ou suíte, sem surpreender usuários que escolheram layout manual.
- [ ] Verificar interação com `Canvas`, `Focus` e `Present` (não interferir).

**Pronto quando:** redimensionar continuamente a janela não causa flicker, perda de seleção, loops nem atualização desnecessária das páginas.

## P1 — Etapa 3: identidade visual e experiência de uso

- [ ] Revisar hierarquia visual dos controles de topo, navegação de dispositivos, área de prévias e barra de status.
- [ ] Unificar a nomenclatura: `Grid`, `Column`, `Focus`, `Canvas`, `Fit all`, `Auto`, `Theme`, `Site scheme`.
- [ ] Reduzir duplicidade entre comandos globais e comandos específicos de cada dispositivo.
- [ ] Tornar a seleção de um dispositivo visualmente clara e acessível, com foco e contraste verificados nos dois temas.
- [ ] Ajustar barras, popovers, tooltips e controles para resoluções de 1366×768 e 1920×1080.
- [ ] Testar fontes, escalonamento de 100%, 125% e 150% no Windows e suporte a navegação exclusivamente por teclado.
- [ ] Definir e documentar os tokens semânticos de interface; proibir cores hardcoded divergentes sem justificativa.

**Pronto quando:** não houver sobreposição, truncamento relevante ou controles ambíguos em ambas as modalidades de tema.

## P1 — Etapa 4: testes, builds e integração contínua

- [ ] Padronizar Node.js 24.x (a configuração `.tool-versions` do upstream indica 24.19.0); usar Yarn Classic 1.x de modo consistente.
- [ ] Decidir e documentar o gerenciador de pacotes; evitar arquivos lock conflitantes em alterações futuras, sem apagar cegamente o `package-lock.json`.
- [ ] Corrigir e reexecutar todos os testes unitários; repetir `yarn typecheck`, `yarn lint`, `yarn build`.
- [ ] Criar testes E2E Playwright para clique nos temas, `Fit all`, `Auto`, navegação com 5 e 8 dispositivos e estabilidade das webviews.
- [ ] Adicionar captura de evidências visuais e comparação de regressões de layout.
- [ ] Ampliar o workflow existente, atualmente configurado principalmente para macOS, com matriz Windows + macOS, políticas de tempo e cache.
- [ ] Executar validações em `pull_request` e em branches de desenvolvimento definidas, sem exigir merge na `main` para descobrir regressões.

**Pronto quando:** typecheck, lint, testes unitários, E2E essenciais e build passam em ambientes suportados; as evidências ficam anexadas ao CI.

## P2 — Etapa 5: diferenciais do fork

- [ ] Modo **Comparação**: selecionar dois dispositivos e destacar diferenças de layout.
- [ ] Capturas organizadas: screenshot conjunto, por dispositivo, identificação de nome/resolução/data, sem alterar os sites.
- [ ] Relatório de auditoria responsiva (HTML/PDF em etapa posterior): capturas, largura testada, problemas observados, severidade e links.
- [ ] Suites de dispositivos por projeto e presets comuns (mobile, tablet, desktop).
- [ ] Ações rápidas para testar larguras personalizadas, orientações e densidade de pixels.
- [ ] Perfil de performance para 3/5/8/12 webviews: CPU, RAM e tempo de navegação.
- [ ] Avaliar integração MCP existente e manter dados de navegação e execução sob controle do usuário.

**Pronto quando:** ao menos um diferencial fornece ganho medido em um fluxo real de auditoria, sem degradar a experiência existente.

## P2 — Etapa 6: distribuição e manutenção

- [ ] Fazer revisão de segurança, permissões Electron e risco de scripts/URLs externos.
- [ ] Resolver/documentar as declarações de licença da raiz e dos subpacotes antes de redistribuir.
- [ ] Atualizar README com objetivos, screenshots autorizados, funcionalidades, instalação e limitações.
- [ ] Gerar instalador Windows e executar smoke test em uma instalação limpa.
- [ ] Definir versionamento do fork, changelog e política de atualizações do upstream.
- [ ] Planejar assinatura digital e atualização segura antes de qualquer lançamento público amplo.

**Pronto quando:** uma pessoa consegue instalar, abrir, testar e desinstalar o fork sem conhecimento de desenvolvimento, e a distribuição é juridicamente e tecnicamente revisada.

## Ordem recomendada dos próximos ciclos

| Ciclo | Escopo | Entregável e critério |
|---|---|---|
| 01 | Temas da interface e dos sites | Alternância visível e persistente; `Scheme` sem ambiguidade; teste-fixture |
| 02 | Toolbar por dispositivo | Uma linha compacta em celulares, ações acessíveis |
| 03 | Navegação de 5–8 telas | Todas as prévias alcançáveis sem reload |
| 04 | `Fit all` e `Auto` | Ajuste previsível e sem flicker/clipping |
| 05 | Auditoria visual e acessibilidade | Dois temas, escalas Windows, teclado, contraste |
| 06 | CI Windows/macOS + E2E | Build, lint, typecheck e regressões automatizadas |
| 07 | Comparação e relatório | Primeiro diferencial útil do fork |
| 08 | README, instalador e release | Versão de demonstração validada |

### Política para marcar tarefas concluídas

Uma tarefa só passa a `[x]` com:
1. Código publicado na branch e commit identificado.
2. Testes relevantes executados (não apenas escritos).
3. Confirmação visual quando houver mudança de interface.
4. Sem regressões conhecidas de navegação, webview ou persistência.
5. Registro no histórico do plano do resultado e das limitações.

### Arquivos-chave do código

| Área | Arquivo |
|---|---|
| Tema da interface | `desktop-app/src/renderer/context/ThemeProvider/index.tsx` |
| Tema CSS | `desktop-app/src/renderer/App.css` |
| Estado e persistência do tema | `desktop-app/src/renderer/store/features/ui/index.ts`, `store/preloadedState.ts`, `store/persistence.ts` |
| Botão inferior do tema | `desktop-app/src/renderer/components/StatusBar/index.tsx` |
| Emulação de tema dos sites | `desktop-app/src/renderer/components/ToolBar/ColorSchemeToggle/index.tsx` |
| IPC Electron de tema | `desktop-app/src/main/native-functions/index.ts` |
| Layout e navegação das prévias | `desktop-app/src/renderer/components/Previewer/index.tsx`, `Previewer/DeviceNavigator.tsx` |
| Ajuste de escala | `desktop-app/src/renderer/components/Previewer/layoutSizing.ts` e `navigationLayout.ts` |
| Ferramentas por dispositivo | `desktop-app/src/renderer/components/Previewer/Device/Toolbar.tsx` |
| Testes de integração UI | `desktop-app/e2e/tests/` |
| CI | `.github/workflows/test.yml` |

---

**Escopo desta revisão:** plano técnico fundamentado na captura do Responsively aberto no Windows, nas saídas de instalação/testes fornecidas e no código da branch do fork. Este documento não declara a correção do modo escuro, nem a aprovação do E2E: essas validações permanecem pendentes.
