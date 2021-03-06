import React from 'react';
import Header from "./Header";
import {connect} from "react-redux";
import * as actions from "../actions";

const Landing = props => {
  return (
    <div>
      <Header page="home"/>
      <div style={{ textAlign: 'center' }}>
        <h2 className='mt-5'>
          Create a sharable countdown page for any event
        </h2>
        <h2 className='m-5'>
          Sign in with google to get started
        </h2>
        {props.auth === null ?
          null :
          (props.auth ? (
            <a href="/new" className="btn btn-danger">
              New Countdown
            </a>
          ) : (
            <a href="/auth/google" className="btn btn-danger">
              Sign in
            </a>
          ))}
      </div>
    </div>
  );
};

export default connect(({auth}) => ({auth}), actions)(Landing);
