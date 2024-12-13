import { renderHook, act } from '@testing-library/react-native';
import { useAuth } from '../../hooks/useAuth';
import { auth } from '../../config/firebase';

jest.mock('../../config/firebase', () => ({
  auth: {
    onAuthStateChanged: jest.fn(),
    currentUser: null
  }
}));

describe('useAuth', () => {
  it('inizialmente mostra loading', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.loading).toBe(true);
  });

  it('aggiorna lo stato utente quando auth cambia', () => {
    const mockUser = { uid: '123', email: 'test@example.com' };
    (auth.onAuthStateChanged as jest.Mock).mockImplementation((callback) => {
      callback(mockUser);
      return () => {};
    });

    const { result } = renderHook(() => useAuth());
    
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.loading).toBe(false);
  });
});