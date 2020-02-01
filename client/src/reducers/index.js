import { combineReducers } from 'redux-loop';
import authReducer from './authReducer';
import dash from './dash';

export default combineReducers({
  auth: authReducer,
  dash: dash,
});
