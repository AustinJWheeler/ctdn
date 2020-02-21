import {SET_DASHBOARD} from '../actions/types';

export default function (state = {items: null, token: null}, action) {
  switch (action.type) {
    case SET_DASHBOARD: // TODO: move to react hooks
      return {items: action.payload.sort((a, b) => {
          const now = new Date(Date.now());
          return (a.ending > now && b.ending > now ? 1 : -1)
            * (a.ending - b.ending);
        }), token: null};
    default:
      return state;
  }
}
