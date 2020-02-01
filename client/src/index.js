import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import reduxThunk from 'redux-thunk';
import { install } from 'redux-loop';

import App from './components/App';
import reducers from './reducers';

const enhancer = compose(
  applyMiddleware(reduxThunk),
  install()
);

const store = createStore(reducers, {}, enhancer);

ReactDOM.render(
    <Provider store={store}><App /></Provider>,
    document.querySelector('#root')
);


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
