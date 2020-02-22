import React, {useEffect} from 'react';
import {BrowserRouter, Route} from 'react-router-dom';
import {connect} from 'react-redux';
import * as actions from '../actions';
import 'bootstrap/dist/css/bootstrap.min.css';
import Landing from './Landing';
import Dashboard from './Dashboard';
import NewCountdown from "./NewCountdown";
import Countdown from "./Countdown";

const App = props => {

  useEffect(() => {
    if (props.auth === null)
      props.loadUser();
  });

  return (
    <div className="app h-100 d-flex align-items-stretch flex-column">
      <BrowserRouter>
        <Route exact path="/" component={Landing}/>
        <Route exact path="/countdowns" component={Dashboard}/>
        <Route exact path="/new" component={NewCountdown}/>
        <Route exact path="/:key" component={Countdown}/>
      </BrowserRouter>
    </div>
  );
};

export default connect(({auth}) => ({auth}), actions)(App);
