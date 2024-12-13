export const SETUP_COMPLETED_EVENT = 'SETUP_COMPLETED';

export const emitSetupCompleted = () => {
  const event = new CustomEvent(SETUP_COMPLETED_EVENT);
  window.dispatchEvent(event);
};
