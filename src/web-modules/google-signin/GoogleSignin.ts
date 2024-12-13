export const statusCodes = {
  SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
  IN_PROGRESS: 'IN_PROGRESS',
  PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
};

class GoogleSigninWeb {
  private webClientId: string | null = null;

  configure(options: { webClientId: string; offlineAccess?: boolean }) {
    this.webClientId = options.webClientId;
  }

  async signIn() {
    throw new Error('Google Sign-In is not supported in web version');
  }

  async signOut() {
    // Implementazione per il web se necessaria
  }

  async revokeAccess() {
    // Implementazione per il web se necessaria
  }

  async hasPlayServices() {
    return true; // Always true for web
  }

  async getTokens() {
    throw new Error('getTokens is not supported in web version');
  }
}

export const GoogleSignin = new GoogleSigninWeb();
