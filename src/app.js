import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import ru from './text.js';
import render from './view.js';

const schema = yup.object({
  url: yup.string().required().url(),
});

const validate = (url) => schema.validate({ url })
  .then(() => ({ valid: true }))
  .catch(() => ({ valid: false }));

export default () => i18next.init({
  lng: 'ru',
  debug: true,
  resources: {
    ru,
  },
})
  .then(() => {
    const initialState = {
      process: 'filling', // error, success
      error: '', // invalid, exists, noRss
      feeds: [],
      posts: [],
    };

    const elements = {
      form: document.querySelector('form'),
      input: document.querySelector('#url-input'),
      feedback: document.querySelector('.feedback'),
    };

    const state = onChange(initialState, render(elements, initialState, i18next));

    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const url = formData.get('url');
      const isExists = (currentUrl) => state.feeds.includes(currentUrl);
      validate(url)
        .then((result) => {
          if (!result.valid) {
            state.error = 'invalid';
            state.process = 'error';
          } else if (isExists(url)) {
            state.error = 'exists';
            state.process = 'error';
          } else {
            state.error = '';
            state.process = 'success';
            state.feeds.push(url);
          }
        })
        .catch((error) => {
          console.log('Unknown validation error:', error);
        });
    });
  })
  .catch((error) => {
    console.log('initialization error:', error);
  });
