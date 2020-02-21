import {SET_USER, SET_DASHBOARD} from './types';
import {fetchCountdowns} from "./queries";

export const loadUser = () => dispatch => {
  fetch('/api/current_user').then(x => x.json())
    .then(res => {
      dispatch({type: SET_USER, payload: typeof (res.error) === 'undefined' ? res : false});
    });
};

export const loadCountdowns = (key = null) => dispatch => {
  fetchCountdowns(key)
    .then(res => {
      if (!Array.isArray(res)) return;
      const now = Date.now();
      dispatch({
        type: SET_DASHBOARD, payload: res
          .map(x => ({...x, now: undefined, delay: now - x.now, ending: new Date(x.ending)}))
      });
    });
};