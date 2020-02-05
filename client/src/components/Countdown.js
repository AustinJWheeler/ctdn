import React, {useEffect} from 'react';
import {connect} from 'react-redux';
import * as actions from '../actions';

const Countdown = connect(({auth, dash}) => ({auth, dash}), actions)
(props => {
  const key = props.match.params.key;
  const timer = props.dash.items && props.dash.items.find(item => item.key === key);
  const endApproaching = timer && timer.displayTime &&
    parseInt(timer.displayTime.split('').reverse().slice(3, 5).reverse().join(''), 10) < 2;

  useEffect(() => {
    props.loadCountdowns(key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (timer)
      document.title = timer.displayTime;
  });

  useEffect(() => {
    if (endApproaching) {
      const ws = new WebSocket('ws://localhost:5000/api/socket');

      ws.onopen = () => {
        ws.send(key);
      };
      ws.onmessage = (e) => {
        timer.hiddenMessage = e.data;
        timer.animate = true;
        ws.close();
      };
      return () => {
        ws.close();
      };
    }
  }, [timer, key, endApproaching]);

  return !timer ? null : (
      <div className="timerContent">
        <div className="title">
          <p>{timer.message}</p>
        </div>
        <div className="timer">
          <p>{timer.displayTime}</p>
        </div>
        <div className={"hidden " + (timer.animate ? "fadein" : "")}>
          <p>{timer.hiddenMessage}</p>
        </div>
      </div>
  );
});

export default props => ['countdowns', 'new'].includes(props.match.params.key) ? null :
  <Countdown {...props}/>;