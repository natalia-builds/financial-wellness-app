// Marks a library Input as invalid and shows the message below it.
export function setFieldError(input: HTMLInputElement, message: string) {
  input.setAttribute('aria-invalid', String(message !== ''));
  document.querySelector(`#${input.id}-validation .message`)!.textContent = message;
}
