import { Pencil, Trash2 } from 'lucide-react';
import { useRef, useState, type KeyboardEvent } from 'react';
import { flushSync } from 'react-dom';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTodos } from '@/features/todos/hooks/use-todos';
import { cn } from '@/lib/utils';

import type { Filter, Todo } from '@/features/todos/types';

interface TodoItemProps {
  todo: Todo;
  filter: Filter;
}

export default function TodoItem({ todo, filter }: TodoItemProps) {
  const { toggle, edit, remove } = useTodos();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(todo.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);

  const startEditing = () => {
    setEditValue(todo.title);
    flushSync(() => setIsEditing(true));
    inputRef.current?.focus();
  };

  const commitEdit = () => {
    flushSync(() => {
      setIsEditing(false);
      edit(todo.id, editValue);
    });
    // An empty title removes the todo, so its Edit button no longer exists.
    if (editValue.trim() === '') returnFocusToInput();
    else editButtonRef.current?.focus();
  };

  const cancelEdit = () => {
    flushSync(() => {
      setIsEditing(false);
      setEditValue(todo.title);
    });
    editButtonRef.current?.focus();
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

  const returnFocusToInput = () => {
    const input = document.getElementById('new-todo');
    input?.focus();
  };

  const handleToggle = () => {
    toggle(todo.id);
    const willDisappear =
      (filter === 'active' && !todo.completed) || (filter === 'completed' && todo.completed);
    if (willDisappear) {
      returnFocusToInput();
    }
  };

  const handleRemove = () => {
    remove(todo.id);
    returnFocusToInput();
  };

  const checkboxLabel = `${todo.completed ? 'Desmarcar' : 'Marcar'} ${todo.title}`;

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border p-2">
      <Checkbox
        id={`todo-${todo.id}`}
        checked={todo.completed}
        onCheckedChange={handleToggle}
        aria-label={checkboxLabel}
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
          <span
            className={cn('flex-1', todo.completed && 'text-muted-foreground line-through')}
            onDoubleClick={startEditing}
          >
            {todo.title}
          </span>
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
            onClick={handleRemove}
            aria-label={`Eliminar ${todo.title}`}
          >
            <Trash2 aria-hidden />
          </Button>
        </>
      )}
    </div>
  );
}
