import {SET_USER} from './types';

export const loadUser = () => dispatch => {
  fetch('/api/current_user').then(x => x.json())
    .then(res => {
      dispatch({type: SET_USER, payload: typeof (res.error) === 'undefined' ? res : false});
    });
};
