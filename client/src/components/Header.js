import React from 'react';
import {connect} from "react-redux";
import * as actions from "../actions";

const userIcon = () => (
  <svg width="1.5em" height="1.5em" fill="currentColor">
    <path fillRule="evenodd"
          d="M15 16s1 0 1-1-1-4-6-4-6 3-6 4 1 1 1 1h10zm-9.995-.944v-.002zM5.022 15h9.956a.274.274 0 00.014-.002l.008-.002c-.001-.246-.154-.986-.832-1.664C13.516 12.68 12.289 12 10 12c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664a1.05 1.05 0 00.022.004zm9.974.056v-.002zM10 9a2 2 0 100-4 2 2 0 000 4zm3-2a3 3 0 11-6 0 3 3 0 016 0z"
          clipRule="evenodd"/>
  </svg>
);

const Header = props => {
  return (
    <nav className="navbar navbar-expand navbar-dark bg-dark w-100">
      <a className="navbar-brand" href="/">ctdn.io</a>

      <ul className="navbar-nav mr-auto">
        <li className={"nav-item d-none d-sm-block " + (props.page === "home" ? "active" : "")}>
          <a className="nav-link" href="/">Home</a>
        </li>
        {props.auth ? (
          <li className={"nav-item " + (props.page === "dash" ? "active" : "")}>
            <a className="nav-link" href="/countdowns">My Countdowns</a>
          </li>
        ) : null}
        {props.auth ? (
          <li className="nav-item d-none d-sm-block">
            <a className="btn btn-danger" href="/new">New Countdown</a>
          </li>
        ) : null}
      </ul>
      {props.auth === null ?
        null :
        (props.auth ? (

          <ul className="navbar-nav navbar-right">
            <li className="nav-item d-none d-sm-block">
              <a href="/api/logout" className="nav-link">
                {userIcon()}
                Logout
              </a>
            </li>
            <li className="nav-item d-block d-sm-none">
              <a href="/api/logout" className="nav-link">
                {userIcon()}
              </a>
            </li>
          </ul>
        ) : (
          <ul className="navbar-nav navbar-right">
            <li className="nav-item active">
              <a href="/auth/google" className="btn btn-danger pl-2 pr-3">
                {userIcon()}
                Login
              </a>
            </li>
          </ul>
        ))}
    </nav>
  );
};

function mapStateToProps({auth}) {
  return {auth};
}

export default connect(mapStateToProps, actions)(Header);
