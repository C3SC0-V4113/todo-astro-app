import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

// The tests run in order and share one document: the second checks what the
// global cleanup in tests/setup.ts left behind after the first.
describe('global Testing Library cleanup', () => {
  it('renders into document.body', () => {
    render(<p>Contenido de prueba</p>);
    expect(screen.getByText('Contenido de prueba')).toBeInTheDocument();
  });

  it('leaves no rendered tree or empty container behind', () => {
    expect(document.body).toBeEmptyDOMElement();
  });
});
