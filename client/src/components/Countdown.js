import React, {useEffect, useState} from 'react';
import {connect} from 'react-redux';
import * as actions from '../actions';
import {fetchCountdown} from "../actions/queries";
import {calculateDisplay} from "../timer";

const Countdown = connect(state => ({auth: state[0].auth, dash: state[0].dash}), actions)
(props => {
  const key = props.match.params.key;
  const [timer, setTimer] = useState();
  const [displayTime, setDisplayTime] = useState();
  const timerOut = timer && displayTime === '00:00';
  const endApproaching = timer && displayTime && !timerOut &&
    displayTime.substring(0, 2) === '00';

  useEffect(() => {
    if (!timer) return;
    const calc = calculateDisplay(timer, Date.now());
    if (calc.display === displayTime) return;
    setDisplayTime(p => calc.display);
    if (calc.delay && calc.display !== '00:00')
      setTimeout(() => setDisplayTime(p => null), calc.delay);
  }, [timer, displayTime]);

  useEffect(() => {
    fetchCountdown(key)
      .then(x => {
        const now = Date.now();
        x.delay = now - x.now;
        x.now = undefined;
        x.ending = new Date(x.ending);
        setTimer(prev => x);
      });
  }, [key]);

  useEffect(() => {
    if (timer)
      document.title = displayTime;
  });

  useEffect(() => {
    if (endApproaching) {
      const ws = new WebSocket('ws://localhost:5000/api/socket');

      ws.onopen = () => {
        ws.send(key);
      };
      ws.onmessage = (e) => {
        setTimer(p => ({...p, hiddenMessage: e.data}));
        ws.close();
      };
      setTimeout(() => ws.close(), 1000 * 70);
    }
  }, [timer, key, endApproaching]);

  return !timer ? null : (
    <div className="timerContent">
      <div className="title">
        <p>{timer.message}</p>
      </div>
      <div className="timer">
        <p>{displayTime}</p>
      </div>
      <div className={"hidden " + (timer.animate ? "fadein" : "")}>
        <p>{timer.hiddenMessage}</p>
      </div>
    </div>
  );
});

export default props => ['countdowns', 'new'].includes(props.match.params.key) ? null :
  <Countdown {...props}/>;