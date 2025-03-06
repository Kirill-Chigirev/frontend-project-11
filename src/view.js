/* eslint-disable no-param-reassign */
const handleError = (elements, initialState, i18next) => {
  if (initialState.error !== '') {
    elements.feedback.classList.add('text-danger');
    elements.feedback.classList.remove('text-success');
    elements.feedback.textContent = i18next.t(initialState.error);
  }
};

const handleProcessState = (elements, processState, i18next) => {
  switch (processState) {
    case 'filling':
      break;
    case 'success':
      elements.input.classList.remove('is-invalid');
      elements.feedback.classList.remove('text-danger');
      elements.feedback.classList.add('text-success');
      elements.feedback.textContent = i18next.t('success');
      elements.input.value = '';
      elements.input.focus();
      elements.button.removeAttribute('disabled', '');
      break;
    case 'error':
      elements.input.classList.add('is-invalid');
      elements.button.removeAttribute('disabled', '');
      break;
    case 'request':
      elements.button.setAttribute('disabled', '');
      break;
    default:
      break;
  }
};

const renderFeeds = (elements, initialState, i18next) => {
  elements.feeds.textContent = '';
  const card = document.createElement('div');
  const cardBody = document.createElement('div');
  const cardTitle = document.createElement('h2');
  const ul = document.createElement('ul');
  card.classList.add('card', 'border-0');
  cardBody.classList.add('card-body');
  cardTitle.classList.add('card-title', 'h4');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  cardTitle.textContent = i18next.t('feedsTitle');
  initialState.feeds.forEach((feed) => {
    const li = document.createElement('li');
    const h3 = document.createElement('h3');
    const p = document.createElement('p');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    h3.classList.add('h6', 'm-0');
    p.classList.add('m-0', 'small', 'text-black-50');
    h3.textContent = feed.title;
    p.textContent = feed.description;
    li.append(h3, p);
    ul.append(li);
  });
  cardBody.append(cardTitle);
  card.append(cardBody, ul);
  elements.feeds.append(card);
};

const renderPosts = (elements, initialState, i18next) => {
  elements.posts.textContent = '';
  const card = document.createElement('div');
  const cardBody = document.createElement('div');
  const cardTitle = document.createElement('h2');
  const ul = document.createElement('ul');
  card.classList.add('card', 'border-0');
  cardBody.classList.add('card-body');
  cardTitle.classList.add('card-title', 'h4');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  cardTitle.textContent = i18next.t('postsTitle');
  initialState.posts.forEach((post) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    const button = document.createElement('button');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    a.classList.add('fw-bold');
    if (initialState.viewedPosts.includes(post.id)) {
      const postId = initialState.viewedPosts.at(-1);
      const currentPost = initialState.posts.find(({ id }) => id === postId);
      elements.modalTitle.textContent = currentPost.title;
      elements.modalBody.textContent = currentPost.description;
      elements.modalButton.setAttribute('href', currentPost.link);
      a.classList.remove('fw-bold');
      a.classList.add('fw-normal');
      a.classList.add('link-secondary');
    }
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    a.setAttribute('href', post.link);
    a.setAttribute('data-id', post.id);
    button.setAttribute('data-id', post.id);
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.setAttribute('type', 'button');
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    a.textContent = post.title;
    button.textContent = i18next.t('viewButton');
    li.append(a, button);
    ul.append(li);
  });
  cardBody.append(cardTitle);
  card.append(cardBody, ul);
  elements.posts.append(card);
};

export default (elements, initialState, i18next) => (path, value) => {
  switch (path) {
    case 'process':
      handleProcessState(elements, value, i18next);
      break;
    case 'error':
      handleError(elements, initialState, i18next);
      break;
    case 'feeds':
      renderFeeds(elements, initialState, i18next);
      break;
    case 'posts':
      renderPosts(elements, initialState, i18next);
      break;
    case 'viewedPosts':
      renderPosts(elements, initialState, i18next);
      break;
    default:
      break;
  }
};
