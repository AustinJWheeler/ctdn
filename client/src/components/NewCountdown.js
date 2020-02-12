import React, {useEffect} from 'react';
import {connect} from 'react-redux';
import * as actions from '../actions';
import {Formik, ErrorMessage} from 'formik';
import {dateToString, dateToTimeString, parseInputDate, parseInputDateTime} from "../timer";
import Header from "./Header";

const validate = values => {
  const now = new Date(Date.now() + (1000 * 60 * 2));
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const errors = {};
  if (parseInputDate(values.date) < today)
    errors.date = 'Choose a later date';
  if (parseInputDateTime(values.date, values.time) < now)
    errors.time = 'Choose a later time';
  return errors;
};

const submit = (values, params, props) => {
  fetch('/api/countdowns', {
    method: 'post',
    headers: {'Content-Type': 'application/json',},
    body: JSON.stringify({
      ending: parseInputDateTime(values.date, values.time),
      message: values.message,
      hiddenMessage: values.hidden,
    })
  }).then(() => {
    props.loadCountdowns();
    props.history.push('/countdowns')});
};

const NewCountdown = props => {

  const items = props.dash.items;
  const auth = props.auth;
  const loadCountdowns = props.loadCountdowns;
  const history = props.history;

  useEffect(() => {
    if (auth !== null && !auth)
      history.push('/');
  }, [auth, history]);

  useEffect(() => {
    if (items === null)
      loadCountdowns();
  }, [items, loadCountdowns]);

  const initalDate = new Date(Date.now() + (1000 * 60 * 60 * 3));
  initalDate.setMinutes(0);
  const dateString = dateToString(initalDate);
  const timeString = dateToTimeString(initalDate);
  return (
    <div>
      <Header/>
      <div className="container-xl pt-3">
        <Formik
          initialValues={{date: dateString, message: '', hidden: '', time: timeString}}
          validate={validate}
          onSubmit={(values, params) => submit(values, params, props)}>
          {props => (
            <form onSubmit={props.handleSubmit}>
              <div className="form-row">
                <div className="form-group col-12 col-md-6">
                  <h6 className="m-0 text-dark"><label htmlFor="area1">Title</label></h6>
                  <textarea className="form-control" id="area1" rows="3"
                            onChange={props.handleChange}
                            onBlur={props.handleBlur}
                            name="message"
                            defaultValue={props.values.message}>
                  </textarea>
                  <p className="display-error"><ErrorMessage name="message"/></p>
                </div>
                <div className="form-group col-12 col-md-6">
                  <h6 className="m-0 text-dark"><label htmlFor="area2">Timeout Message</label></h6>
                  <textarea className="form-control" id="area2" rows="3"
                            onChange={props.handleChange}
                            onBlur={props.handleBlur}
                            name="hidden"
                            defaultValue={props.values.hidden}>
                  </textarea>
                  <p className="display-error"><ErrorMessage name="hidden"/></p>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group col-6">
                  <h6 className="m-0 text-dark"><label htmlFor="date">Date</label></h6>
                  <input type="date" className="form-control" id="date" name="date"
                         onChange={props.handleChange}
                         onBlur={props.handleBlur}
                         value={props.values.date}
                         min={dateString}/>
                  <p className="display-error"><ErrorMessage name="date"/></p>
                </div>
                <div className="form-group col-6">
                  <h6 className="m-0 text-dark"><label htmlFor="time">Time</label></h6>
                  <input type="time" className="form-control" id="time" name="time"
                         onChange={props.handleChange}
                         onBlur={props.handleBlur}
                         value={props.values.time}/>
                  <p className="display-error"><ErrorMessage name="time"/></p>
                </div>
              </div>

              <div className="float-right">
                <a href="/countdowns" className="btn btn-secondary mr-2">Cancel</a>
                <button type="submit" className="btn btn-danger" disabled={props.isSubmitting}>
                  Create
                </button>
              </div>
            </form>
          )}
        </Formik>
      </div>

    </div>
  );
};

function mapStateToProps(state) {
  return {auth: state[0].auth, dash: state[0].dash};
}

export default connect(mapStateToProps, actions)(NewCountdown);