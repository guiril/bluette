const IME_PROCESS_KEY_CODE = 229;

export const preventImeEscape = (event: KeyboardEvent) => {
  if (event.key !== 'Escape') return;

  // Safari ends composition before this keydown, so isComposing is false; keyCode 229 is the only IME signal left.
  const isImeEvent =
    event.isComposing || event.keyCode === IME_PROCESS_KEY_CODE;

  if (isImeEvent) event.preventDefault();
};
