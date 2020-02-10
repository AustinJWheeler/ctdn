import React from 'react';
import Header from "./Header";

const Landing = () => {
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
        <a href="/auth/google" className="btn btn-danger">
          Sign in
        </a>
      </div>
    </div>
  );
};

export default Landing;
