import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { LoginScreen } from '../../screens/LoginScreen';
import { signInWithGoogle } from '../../config/firebase';

jest.mock('../../config/firebase', () => ({
  signInWithGoogle: jest.fn()
}));

describe('LoginScreen', () => {
  it('mostra il pulsante di login con Google', () => {
    const { getByText } = render(<LoginScreen />);
    expect(getByText('Sign in with Google')).toBeTruthy();
  });

  it('gestisce correttamente il login con Google', async () => {
    (signInWithGoogle as jest.Mock).mockResolvedValueOnce({});
    
    const { getByText } = render(<LoginScreen />);
    const button = getByText('Sign in with Google');
    
    fireEvent.press(button);
    
    await waitFor(() => {
      expect(signInWithGoogle).toHaveBeenCalled();
    });
  });

  it('gestisce gli errori di login', async () => {
    const mockError = new Error('Login fallito');
    (signInWithGoogle as jest.Mock).mockRejectedValueOnce(mockError);
    
    const { getByText } = render(<LoginScreen />);
    const button = getByText('Sign in with Google');
    
    fireEvent.press(button);
    
    await waitFor(() => {
      expect(signInWithGoogle).toHaveBeenCalled();
    });
  });
});