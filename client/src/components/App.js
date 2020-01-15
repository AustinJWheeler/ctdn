import React, {Component} from 'react';
import {BrowserRouter, Route} from 'react-router-dom';
import {connect} from 'react-redux';
import * as actions from '../actions';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Landing from './Landing';
import Dashboard from './Dashboard';

class App extends Component {
  componentDidMount() {
    this.props.loadUser();
  }

  renderLoginButton(auth) {
    return auth === null ?
      null :
      <a href={auth ? "/api/logout" : "/auth/google"} className="btn btn-light">
        {auth ? "Logout" : "Login"}
      </a>;
  }

  render() {
    return (
      <div className="app">
        <BrowserRouter>
          <div className="card w-75">
            <div className="card-body">
              <h5 className="card-title">Header</h5>
              <p className="card-text"></p>
              {this.renderLoginButton(this.props.auth)}
              <a href="/" className="btn btn-light">Home</a>
              <a href="/countdowns" className="btn btn-light">Countdowns</a>
            </div>
          </div>
          <Route exact path="/" component={Landing}/>
          <Route exact path="/countdowns" component={Dashboard}/>
        </BrowserRouter>
      </div>
    );
  }
}

function mapStateToProps({auth}) {
  return {auth};
}

export default connect(mapStateToProps, actions)(App);
