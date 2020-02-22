import { combineReducers } from 'redux';
import authReducer from './authReducer';
import dash from './dash';

export default combineReducers({
  auth: authReducer,
  dash: dash,
});
