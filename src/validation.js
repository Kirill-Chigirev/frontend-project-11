import * as yup from 'yup';
import onChange from 'on-change';

const schema = yup.object({
  website: yup.string().required().url(),
});

const state = {
  currentUrlValidation: true,
  feeds: [],
  posts: [],
};

const form = document.querySelector('form');
const input = document.querySelector('#url-input');

const watchedState = onChange(state, (path, value, previousValue) => {
  switch (path) {
    case 'currentUrlValidation':
      if (value !== previousValue) {
        input.classList.toggle('is-invalid');
      }
      break;
    default:
      break;
  }
});

const validate = (url) => schema.validate({ website: url })
  .then(() => ({ valid: true }))
  .catch(() => ({ valid: false }));

export default () => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url').trim();
    const isExists = (currentUrl) => watchedState.feeds.includes(currentUrl);
    validate(url)
      .then((result) => {
        watchedState.currentUrlValidation = result.valid;
        if (result.valid && !isExists) {
          watchedState.feeds.push(url);
        }
      });
  });
};
