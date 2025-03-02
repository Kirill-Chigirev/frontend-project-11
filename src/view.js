/* eslint-disable no-param-reassign */
const handleError = (elements, initialState, i18next) => {
  elements.feedback.classList.add('text-danger');
  elements.feedback.classList.remove('text-success');
  elements.feedback.textContent = i18next.t(initialState.error);
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
      handleError(elements, initialState, i18next);
      break;
    default:
      break;
  }
};
