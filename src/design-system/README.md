# Design System

Esta pasta contém o design system do atomicTrack — tokens, tema e componentes base.

## Componentes disponíveis

- `Button` — botão estilizado (veja `src/design-system/components/Button.tsx`)
- `Input` — campo de texto estilizado
- `Card` — cartão com estilos padrão
- `Modal` — modal com overlay e conteúdo centralizado

## Como usar

Importe os componentes diretamente do design-system:

```tsx
import { Button, Input, Card, Modal } from '@/design-system';
```

### Exemplo rápido

```tsx
<Button variant="primary" size="lg">Salvar</Button>
<Input label="Nome" placeholder="Digite seu nome" />
<Card>Conteúdo</Card>
<Modal open={open} onClose={() => setOpen(false)} title="Confirmar">...</Modal>
```

## Próximos passos

- Criar componentes adicionais (Select, Toggle, Switch, Tooltip)
- Documentar variantes e tokens
- Substituir componentes legacy da app por estes componentes
