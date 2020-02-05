import React from 'react';
import Header from "./Header";

const Landing = () => {
  return (
    <div>
      <Header page="home"/>
      <div style={{ textAlign: 'center' }}>
        <h1 className='mt-5'>
          Create a sharable countdown for any event
        </h1>
      </div>
    </div>
  );
};

export default Landing;
