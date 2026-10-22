'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTodos } from '@/features/todos/hooks/use-todos';
import { cn } from '@/lib/utils';

import type { Todo } from '@/features/todos/types';

interface TodoItemProps {
  todo: Todo;
}

export default function TodoItem({ todo }: TodoItemProps) {
  const { toggle, edit, remove } = useTodos();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(todo.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    } else {
      editButtonRef.current?.focus();
    }
  }, [isEditing]);

  const startEditing = () => {
    setEditValue(todo.title);
    setIsEditing(true);
  };

  const commitEdit = () => {
    setIsEditing(false);
    edit(todo.id, editValue);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditValue(todo.title);
  };

  const handleEditKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === 'Enter') {
      event.preventDefault();
      commitEdit();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      cancelEdit();
    }
  };

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border p-2">
      <Checkbox
        id={`todo-${todo.id}`}
        checked={todo.completed}
        onCheckedChange={() => toggle(todo.id)}
        aria-label={`${todo.completed ? 'Desmarcar' : 'Marcar'} ${todo.title}`}
      />
      {isEditing ? (
        <div className="flex flex-1 items-center gap-2">
          <Label htmlFor={`edit-${todo.id}`} className="sr-only">
            Editar tarea
          </Label>
          <Input
            id={`edit-${todo.id}`}
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(event) => setEditValue(event.target.value)}
            onKeyDown={handleEditKeyDown}
            onBlur={commitEdit}
            className="flex-1"
          />
        </div>
      ) : (
        <>
          <Label htmlFor={`todo-${todo.id}`} className="flex-1" onDoubleClick={startEditing}>
            <span className={cn(todo.completed && 'text-muted-foreground line-through')}>
              {todo.title}
            </span>
          </Label>
          <Button
            ref={editButtonRef}
            type="button"
            variant="ghost"
            size="icon"
            onClick={startEditing}
            aria-label={`Editar ${todo.title}`}
          >
            <Pencil aria-hidden />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => remove(todo.id)}
            aria-label={`Eliminar ${todo.title}`}
          >
            <Trash2 aria-hidden />
          </Button>
        </>
      )}
    </div>
  );
}
