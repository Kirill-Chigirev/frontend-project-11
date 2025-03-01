import onChange from 'on-change';
import validation from './validation.js';

validation();

const watchedState = onChange(state, (path, value) => {
  
});
