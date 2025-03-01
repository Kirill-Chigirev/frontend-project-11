/* eslint-disable no-param-reassign */
const handleError = (elements, error, i18next) => {
  elements.feedback.classList.add('text-danger');
  elements.feedback.classList.remove('text-success');
  switch (error) {
    case 'invalid':
      elements.feedback.textContent = i18next.t('invalid');
      break;
    case 'exists':
      elements.feedback.textContent = i18next.t('exists');
      break;
    case 'noRss':
      elements.feedback.textContent = i18next.t('noRss');
      break;
    default:
      break;
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
      break;
    case 'error':
      elements.input.classList.add('is-invalid');
      break;
    default:
      break;
  }
};

export default (elements, initialState, i18next) => (path, value) => {
  switch (path) {
    case 'process':
      handleProcessState(elements, value, i18next);
      break;
    case 'error':
      handleError(elements, value, i18next);
      break;
    default:
      console.log(initialState);
      break;
  }
};
