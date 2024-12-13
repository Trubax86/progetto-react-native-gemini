export const setupSteps = [
  { title: 'Termini', description: 'Accetta i termini di servizio' },
  { title: 'Profilo', description: 'Configura il tuo profilo' },
  { title: 'Contatti', description: 'Gestisci i contatti' },
  { title: 'Privacy', description: 'Impostazioni privacy' },
  { title: 'Sicurezza', description: 'Configura la sicurezza' }
];

export const getStepIndex = (routeName: string): number => {
  switch (routeName) {
    case 'Terms':
    case 'AnonymousTerms':
      return 0;
    case 'ProfileSetup':
      return 1;
    case 'ContactSetup':
      return 2;
    case 'PrivacySetup':
      return 3;
    case 'SecuritySetup':
      return 4;
    default:
      return 0;
  }
};
