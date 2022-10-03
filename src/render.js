export default (elements, i18nInstance) => (path, value) => {
  switch (path) {
    case 'form.fields.url':
      elements.urlInput.value = value;
      break;

    case 'form.error':
      elements.urlInput.classList.add('is-invalid');

      elements.feedback.classList.remove('text-success');
      elements.feedback.classList.add('text-danger');
      elements.feedback.textContent = i18nInstance.t(value.message);
      break;

    case 'urls':
      elements.urlInput.classList.remove('is-invalid');

      elements.feedback.classList.remove('text-danger');
      elements.feedback.classList.add('text-success');
      elements.feedback.textContent = i18nInstance.t('rssAdded');
      break;

    default:
      throw new Error(`Unexpected application state: ${path}: ${value}`);
  }
};
