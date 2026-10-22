'use client';

import { useState, type KeyboardEvent } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTodos } from '@/features/todos/hooks/use-todos';

export default function TodoInput() {
  const { add } = useTodos();
  const [value, setValue] = useState('');

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    add(trimmed);
    setValue('');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key !== 'Enter') return;
    event.preventDefault();
    submit();
  };

  return (
    <div className="w-full">
      <Label htmlFor="new-todo">Nueva tarea</Label>
      <Input
        id="new-todo"
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="¿Qué necesitas hacer?"
        className="w-full"
      />
    </div>
  );
}
