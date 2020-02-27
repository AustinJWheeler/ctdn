import React, {useEffect, useState} from 'react';
import {connect} from 'react-redux';
import * as actions from '../actions';
import {fetchCountdown} from "../actions/queries";
import {calculateDisplay} from "../timer";

const Countdown = connect(({auth, dash}) => ({auth, dash}), actions)
(props => {
  const key = props.match.params.key;
  const [timer, setTimer] = useState();
  const [displayTime, setDisplayTime] = useState();
  const [displayExpired, setDisplayExpired] = useState(true);
  const [notification, setNotification] = useState(false);
  const timerOut = timer && displayTime === '00:00';
  const endApproaching = timer && displayTime && !timerOut &&
    displayTime.substring(0, 2) === '00' && Number.parseInt(displayTime.substring(3, 5)) < 30; // this needs to be safe

  useEffect(() => {
    if (notification && window.Notification && Notification.permission !== "denied")
      Notification.requestPermission(() =>
        timer.animate ? new Notification('Times Up!', {
          body: 'The countdown you were watching has expired'
        }) : null);
  }, [notification, timer]);

  useEffect(() => {
    if (!timer || !displayExpired) return;
    const calc = calculateDisplay(timer, Date.now());
    setDisplayTime(calc.display);
    setDisplayExpired(false);
    if (calc.delay && calc.display !== '00:00')
      setTimeout(() => setDisplayExpired(true), calc.delay);
  }, [timer, displayExpired, displayTime]);

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
      const ws = new WebSocket(window.location.hostname === 'localhost'
        ? 'ws://localhost:5000/api/socket'
        : `wss://${window.location.host}/api/socket`);

      ws.onopen = () => {
        ws.send(key);
      };
      ws.onmessage = (e) => {
        const code = e.data.split(':')[0];
        const data = e.data.slice(code.length+1);
        switch (code) {
          case 'H':
            setTimer(p => ({...p, hiddenMessage: data, animate: true}));
            ws.close();
            break;
          case 'E':
            throw new Error(data);
          default:
            throw new Error("invalid message code");
        }
      };
      setTimeout(() => ws.close(), 1000 * 60); // page refresh here?
    }
  }, [key, endApproaching]);

  return !timer ? null : (
    <div className="timerContent">
      <div className="timerUpper">
        <div className="title">
          <p>{timer.message}</p>
        </div>
        <div className="timer">
          <p>{displayTime}</p>
        </div>
      </div>
      <div className={"hidden" + (timer.animate ? " fadein" : "")}>
        <p>{timer.hiddenMessage}</p>
      </div>
      <div className="settings">
        <form>
          <label htmlFor="notification">Notify me when this timer ends</label>
          <input type="checkbox" id="notification" name="notification"
                 onChange={e => setNotification(e.target.checked)}/>
        </form>
      </div>
    </div>
  );
});

export default props => ['countdowns', 'new'].includes(props.match.params.key) ? null :
  <Countdown {...props}/>;