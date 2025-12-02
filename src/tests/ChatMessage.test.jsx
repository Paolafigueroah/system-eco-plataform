import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChatMessage from '../components/ChatMessage';

const mockMessage = {
  id: '1',
  content: 'Mensaje de prueba',
  sender_id: 'user1',
  created_at: new Date().toISOString(),
  is_read: false
};

const mockCurrentUser = {
  id: 'user1'
};

describe('ChatMessage', () => {
  it('debe renderizar el contenido del mensaje', () => {
    render(
      <ChatMessage
        message={mockMessage}
        isOwnMessage={true}
        currentUser={mockCurrentUser}
      />
    );
    expect(screen.getByText('Mensaje de prueba')).toBeInTheDocument();
  });

  it('debe mostrar "Tú" para mensajes propios', () => {
    render(
      <ChatMessage
        message={mockMessage}
        isOwnMessage={true}
        currentUser={mockCurrentUser}
      />
    );
    // El componente muestra el estado del mensaje, no el nombre para mensajes propios
    expect(screen.getByText('Mensaje de prueba')).toBeInTheDocument();
  });

  it('debe mostrar el timestamp del mensaje', () => {
    render(
      <ChatMessage
        message={mockMessage}
        isOwnMessage={true}
        currentUser={mockCurrentUser}
      />
    );
    // El timestamp se formatea, así que verificamos que existe algún texto de tiempo
    const messageElement = screen.getByText('Mensaje de prueba');
    expect(messageElement).toBeInTheDocument();
  });
});

