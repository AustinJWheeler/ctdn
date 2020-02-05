import {SET_DASHBOARD, UPDATE_TIMERS, UPDATE_HIDDEN} from '../actions/types';
import {loop, Cmd} from 'redux-loop';
import {calculateDisplay} from "../timer";

export default function (state = {items: null, token: null}, action) {
  switch (action.type) {
    case SET_DASHBOARD: // TODO: merge incoming data
      return {items: action.payload.sort((a, b) => {
          const now = new Date(Date.now());
          return (a.ending > now && b.ending > now ? 1 : -1)
            * (a.ending - b.ending);
        }), token: null};
    case UPDATE_TIMERS:
      if (!state.items || !state.items.length) return state;
      if (action.payload !== state.token && action.payload !== null) return state;
      if (action.payload === null) state.token = Math.random();

      const now = Date.now() - state.items[0].delay;

      const list = state.items.map(x => {
          const calc = calculateDisplay(x, now);
          x.displayTime = calc.display;
          return calc.delay;
        }
      ).filter(x => x);
      const delay = list.reduce((x, y) => Math.min(x, y));
      return loop(
        {...state},
        Cmd.run(() => {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve(state.token);
            }, delay);
          });
        }, {
          successActionCreator: (token) => ({type: UPDATE_TIMERS, payload: token})
        })
      );
    case UPDATE_HIDDEN:
      const item = state.items.find(x => x.key === action.payload.key);
      item.hiddenMessage = action.payload.hidden;
      item.animate = true;
      return {...state};
    default:
      return state;
  }
}
