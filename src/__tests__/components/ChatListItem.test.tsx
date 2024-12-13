import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ChatListItem } from '../../components/ChatListItem';

const mockChat = {
  id: '1',
  participants: ['user1', 'user2'],
  lastMessage: {
    id: 'msg1',
    text: 'Ciao!',
    createdAt: new Date('2023-12-25T10:00:00'),
    user: {
      _id: 'user1',
      name: 'Mario Rossi',
      avatar: 'https://example.com/avatar.jpg'
    }
  },
  updatedAt: new Date(),
  createdAt: new Date()
};

describe('ChatListItem', () => {
  it('renderizza correttamente i dettagli della chat', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <ChatListItem chat={mockChat} onPress={onPress} />
    );

    expect(getByText('Mario Rossi')).toBeTruthy();
    expect(getByText('Ciao!')).toBeTruthy();
  });

  it('chiama onPress quando viene premuto', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <ChatListItem chat={mockChat} onPress={onPress} />
    );

    fireEvent.press(getByTestId('chat-item'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});