import { createNewChat, sendMessage } from '../../services/chatService';
import { db, auth } from '../../config/firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';

jest.mock('../../config/firebase', () => ({
  db: {},
  auth: {
    currentUser: {
      uid: 'test-uid',
      displayName: 'Test User',
      photoURL: 'test-photo-url'
    }
  }
}));

jest.mock('firebase/firestore');

describe('chatService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('crea una nuova chat', async () => {
    (addDoc as jest.Mock).mockResolvedValueOnce({ id: 'test-chat-id' });

    const chatId = await createNewChat('other-user-id');
    
    expect(chatId).toBe('test-chat-id');
    expect(addDoc).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({
        participants: ['test-uid', 'other-user-id']
      })
    );
  });

  it('invia un messaggio', async () => {
    (addDoc as jest.Mock).mockResolvedValueOnce({ id: 'test-message-id' });
    (updateDoc as jest.Mock).mockResolvedValueOnce(undefined);

    await sendMessage('test-chat-id', 'Test message');

    expect(addDoc).toHaveBeenCalled();
    expect(updateDoc).toHaveBeenCalled();
  });
});