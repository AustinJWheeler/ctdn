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
    <div className="h-100 d-flex align-items-stretch flex-column">
      <Header page="dash"/>
      <div className="w-100 d-flex justify-content-center d-sm-none">
        <a href="/new" className="btn btn-danger mt-3 w-auto">New Countdown</a>
      </div>
      <div className="container-xl mb-auto">
        <div className="row row-cols-md-2 row-cols-1 mx-3 mt-3">
          {
            props.dash.items ?
              props.dash.items.map(x =>
                <div className="col p-2" key={x.key}>
                  <div className="card">
                    <div className="card-header d-flex justify-content-start align-items-center">
                      <a href={"/" + x.key} target="_blank" rel="noopener noreferrer" className="mr-auto">
                        <h5 className="font-weight-light text-info m-auto">
                          ctdn.io/{x.key}
                        </h5>
                      </a>
                      {/*<button type="button" className="btn btn-info">*/}
                      {/*  Copy*/}
                      {/*</button>*/}
                    </div>
                    <div className="card-body py-3">
                      <h5 className="m-0 mr-auto text-dark pb-2">Title</h5>
                      <p className="m-0 font-weight-light">{x.message}</p>
                      <h5 className="m-0 mr-auto text-dark pb-2 pt-3">Expiration</h5>
                      {/*<p className="m-0 font-weight-light">{x.ending}</p>*/}
                      <p className="m-0 font-weight-light">{x.ending.toLocaleTimeString('en-US',
                        { hour: 'numeric', minute: '2-digit', timeZoneName:'short'})}</p>
                      <p className="m-0 font-weight-light">{x.ending.toLocaleDateString("en-US",
                        {year: 'numeric', month: 'long', day: 'numeric'})}</p>
                      <h5 className="m-0 mr-auto text-dark pb-2 pt-3">Timeout Message</h5>
                      <p className="m-0 font-weight-light">{x.hiddenMessage}</p>
                      {/*<a href="#" className="btn btn-danger float-right mt-2">Edit</a>*/}
                    </div>
                  </div>
                </div>
            ) : ''
          }
        </div>
      </div>

      <div className="w-100 d-flex justify-content-end">
        <a href="/new" className="btn btn-danger m-4 d-none d-sm-block">New Countdown</a>
      </div>
    </div>
  );
};

function mapStateToProps({auth, dash}) {
  return {auth, dash};
}

export default connect(mapStateToProps, actions)(Dashboard);