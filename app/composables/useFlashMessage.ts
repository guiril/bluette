export const useFlashMessage = () =>
  useState<string | null>('flash-message', () => null);
