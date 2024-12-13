// Mock per @react-native-google-signin/google-signin
export const statusCodes = {
  SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
  IN_PROGRESS: 'IN_PROGRESS',
  PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
};

class GoogleSigninMock {
  async signIn() {
    throw new Error('Google Sign-In is not supported in web version');
  }

  async signOut() {
    // Mock implementation
  }

  async revokeAccess() {
    // Mock implementation
  }

  async hasPlayServices() {
    return true;
  }

  async getTokens() {
    throw new Error('getTokens is not supported in web version');
  }

  configure() {
    // Mock implementation
  }
}

export const GoogleSignin = new GoogleSigninMock();

// Mock del componente pulsante
export const GoogleSigninButton = () => null;
