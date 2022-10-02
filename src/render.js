export default (elements) => (path, value) => {
  elements.urlInput.classList.remove('is-invalid');
  elements.feedback.classList.remove('text-danger', 'text-success');
  elements.feedback.textContent = '';
  switch (path) {
    case 'urls':
      elements.feedback.classList.add('text-success');
      elements.feedback.textContent = 'RSS успешно загружен';
      break;

    case 'form.fields.url':
      elements.urlInput.value = value;
      break;

    case 'form.error':
      elements.urlInput.classList.add('is-invalid');
      elements.feedback.classList.add('text-danger');
      elements.feedback.textContent = value.message;
      break;

    default:
      throw new Error(`Unexpected application state: ${path}: ${value}`);
  }
};
