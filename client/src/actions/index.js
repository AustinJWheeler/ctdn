import {SET_USER, SET_DASHBOARD, UPDATE_TIMERS, UPDATE_HIDDEN} from './types';

export const loadUser = () => dispatch => {
  fetch('/api/current_user').then(x => x.json())
    .then(res => {
      dispatch({type: SET_USER, payload: typeof (res.error) === 'undefined' ? res : false});
    });
};

export const loadCountdowns = (key = null) => dispatch => {
  fetch('/api/countdowns' + (key ? '/' + key : ''))
    .then(x => x.json())
    .then(x => (key ? [x] : x))
    .then(res => {
      const now = Date.now();
      dispatch({
        type: SET_DASHBOARD, payload: res
          .map(x => ({...x, now: undefined, delay: now - x.now, ending: new Date(x.ending)}))
      });
      dispatch({type: UPDATE_TIMERS, payload: null});
    });
};

export const setHidden = (key, hidden) => {
  return {type: UPDATE_HIDDEN, payload: {key, hidden}};
};