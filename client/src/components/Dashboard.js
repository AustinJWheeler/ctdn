import React, {useEffect} from 'react';
import {connect} from 'react-redux';
import * as actions from '../actions';
import Header from "./Header";

const renderCards = props => {
  return props.dash.items ?
    props.dash.items.map(x =>
      <div key={x.key}>
        <a target="_blank" rel="noopener noreferrer" href={'/' + x.key}>{x.key}</a>
        <p>{x.message}</p>
        <p>{x.hiddenMessage}</p>
        <p>{x.displayTime}</p>
      </div>) :
    '';
};

const Dashboard = props => {

  useEffect(() => {
    if (props.dash.items === null)
      props.loadCountdowns();
  });

  return (
    <div>
      <Header/>
      <h1>Dashboard</h1>
      <a href="/new" className="btn btn-light">New Countdown</a>
      <div>
        {renderCards(props)}
      </div>
    </div>
  );
};

function mapStateToProps({auth, dash}) {
  return {auth, dash};
}

export default connect(mapStateToProps, actions)(Dashboard);
///Intl.DateTimeFormat().resolvedOptions().timeZone