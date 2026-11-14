# Enum em entidades enterprise

Em `packages/domain/*/src/enterprise/entities/`, campos categóricos (status, papel, motor de conexão, etc.) usam `enum` com valores string em maiúsculas, não `type` union de literais.

```typescript
export enum TaskStatus {
  CREATED = 'created',
  ACTIVE = 'active',
  FINISHED = 'finished',
}

export interface TaskProps {
  status: TaskStatus
}
```

Factories de teste escolhem valores com `some.valueBetween(...Object.values(TaskStatus))`.

Quando um enum pertence semanticamente a uma entidade e só ela o usa (ex.: motor de banco na conexão), declare-o no mesmo arquivo da entidade, não em arquivo separado só para o enum.

Unions fora de `enterprise/entities` (opções de API, ordenação, modos de geração) não entram nesta regra.
