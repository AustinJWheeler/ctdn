import React from 'react';
import {connect} from "react-redux";
import * as actions from "../actions";

const renderLoginButton = auth => {
  return auth === null ?
    null :
    <a href={auth ? "/api/logout" : "/auth/google"} className="btn btn-light">
      {auth ? "Logout" : "Login"}
    </a>;
};

const Header = props => {
  return (
    <div className="card w-75">
      <div className="card-body">
        <h5 className="card-title">Header</h5>
        <p className="card-text"></p>
        {renderLoginButton(props.auth)}
        <a href="/" className="btn btn-light">Home</a>
        <a href="/countdowns" className="btn btn-light">Countdowns</a>
        <button onClick={
          () => {
            console.log('click');
            fetch('/api/countdowns/fYIqi9')
              .then(x => x.json()).then(x => console.log(x))
          }}
                className="btn btn-light">TEST
        </button>
      </div>
    </div>
  );
};

function mapStateToProps({auth}) {
  return {auth};
}

export default connect(mapStateToProps, actions)(Header);
