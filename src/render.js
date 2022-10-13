const spinner = document.createElement('span');
spinner.classList.add('spinner-grow');
spinner.setAttribute('role', 'status');
spinner.setAttribute('aria-hidden', 'true');
spinner.setAttribute('style', 'margin-right: 0.3rem');

const createElement = (tagName, options = {}) => {
  const element = document.createElement(tagName);
  const { style, textContent } = options;
  if (style) {
    if (Array.isArray(style) && style.length > 0) {
      element.classList.add(...style);
    }
    if (typeof style === 'string') {
      element.classList.add(style);
    }
  }

  if (textContent) {
    element.textContent = textContent;
  }

  return element;
};

const makeContainer = (title, listElems) => {
  const cardBorder = createElement(
    'div',
    { style: ['card', 'border-0'] },
  );

  const cardBody = createElement(
    'div',
    { style: 'card-body' },
  );

  const cardTitle = createElement(
    'h2',
    {
      style: ['card-title', 'h4'],
      textContent: title,
    },
  );

  const list = createElement(
    'ul',
    { style: ['list-group', 'list-group-flush'] },
  );

  list.append(...listElems);
  cardBody.append(cardTitle);
  cardBorder.append(cardBody, list);

  return cardBorder;
};

const handleFormState = (elements, formState, i18nInstance) => {
  switch (formState) {
    case 'filling':
      elements.submitButton.disabled = false;
      elements.submitButton.textContent = i18nInstance.t('form.submit');
      elements.urlInput.focus();
      break;

    case 'sending':
      elements.submitButton.disabled = true;
      elements.submitButton.textContent = '';
      elements.submitButton.append(spinner, document.createTextNode(i18nInstance.t('form.loading')));
      break;

    default:
      throw new Error(`Unexpected form state: ${formState}`);
  }
};

const handleErrors = (elements, error, i18nInstance) => {
  elements.feedback.classList.remove('text-success');
  elements.feedback.classList.add('text-danger');

  if (error === '') {
    elements.urlInput.classList.remove('is-invalid');
    elements.feedback.textContent = '';
    return;
  }

  elements.urlInput.classList.add('is-invalid');
  elements.feedback.textContent = i18nInstance.t(`errors.${error}`);
  elements.urlInput.focus();
};

const handleFeeds = (container, feeds, i18nInstance) => {
  const listElems = feeds.map(({ title, description }) => {
    const listElem = createElement(
      'li',
      { style: ['list-group-item', 'border-0', 'border-end-0'] },
    );

    const titleElem = createElement(
      'h3',
      {
        style: ['h6', 'm-0'],
        textContent: title,
      },
    );

    const descriptionElem = createElement(
      'p',
      {
        style: ['m-0', 'small', 'text-black-50'],
        textContent: description,
      },
    );

    listElem.append(titleElem, descriptionElem);
    return listElem;
  });

  const title = i18nInstance.t('feeds');
  const feedsContainer = makeContainer(title, listElems);
  container.replaceChildren(feedsContainer);
};

const handlePosts = (container, posts, readPostIds, i18nInstance) => {
  const listElems = posts
    .map(({
      id,
      title,
      link,
    }) => {
      const listElem = createElement(
        'li',
        {
          style: [
            'list-group-item',
            'd-flex',
            'justify-content-between',
            'align-items-baseline',
            'border-end-g',
          ],
        },
      );

      const linkElem = createElement(
        'a',
        {
          style: readPostIds.has(id) ? 'fw-normal' : 'fw-bold',
          textContent: title,
        },
      );
      linkElem.href = link;
      linkElem.target = '_blank';
      linkElem.rel = 'noopener noreferrer';
      linkElem.setAttribute('data-id', id);

      const button = createElement(
        'button',
        {
          style: ['btn', 'btn-outline-primary', 'btn-sm'],
          textContent: i18nInstance.t('preview'),
        },
      );
      button.type = 'button';
      button.setAttribute('data-bs-toggle', 'modal');
      button.setAttribute('data-bs-target', '#modal');
      button.setAttribute('data-id', id);

      listElem.append(linkElem, button);
      return listElem;
    });

  const title = i18nInstance.t('posts');
  const postsContainer = makeContainer(title, listElems);
  container.replaceChildren(postsContainer);
};

export default (elements, state, i18nInstance) => (path, value) => {
  switch (path) {
    case 'form.state':
      handleFormState(elements, value, i18nInstance);
      break;

    case 'form.fields.url':
      elements.urlInput.value = value;
      break;

    case 'form.error':
      handleErrors(elements, value, i18nInstance);
      break;

    case 'modal':
      elements.modal.title.textContent = value.title;
      elements.modal.body.textContent = value.description;
      elements.modal.fullArticleButton.href = value.link;
      break;

    case 'feeds':
      elements.feedback.classList.remove('text-danger');
      elements.feedback.classList.add('text-success');
      elements.feedback.textContent = i18nInstance.t('rssAdded');
      handleFeeds(elements.feeds, value, i18nInstance);
      break;

    case 'posts':
      handlePosts(elements.posts, value, state.readPostIds, i18nInstance);
      break;

    case 'readPostIds':
      handlePosts(elements.posts, state.posts, state.readPostIds, i18nInstance);
      break;

    default:
      throw new Error(`Unexpected application state: ${path}`);
  }
};
