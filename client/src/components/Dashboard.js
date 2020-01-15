import React, {Component} from 'react';
import {BrowserRouter, Route} from 'react-router-dom';
import {connect} from 'react-redux';
import * as actions from '../actions';

class Dashboard extends Component {
  componentDidMount() {
    // this.props.loadDashboard();
  }

  render() {
    return (
      <div>
        <h1>Dashboard</h1>
      </div>
    );
  }
}

function mapStateToProps({auth}) {
  return {auth};
}

export default connect(mapStateToProps, actions)(Dashboard);
