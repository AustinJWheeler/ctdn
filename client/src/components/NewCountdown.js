import React, {useEffect} from 'react';
import {connect} from 'react-redux';
import * as actions from '../actions';
import {Formik} from 'formik';
import {dateToString, dateToTimeString, parseInputDate, parseInputDateTime} from "../timer";
import Header from "./Header";

const validate = values => {
  const now = new Date(Date.now() + (60 * 1000 * 0));
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const errors = {};
  if (parseInputDate(values.date) < today)
    errors.date = 'choose a later date';
  if (parseInputDateTime(values.date, values.time) < now)
    errors.time = 'choose a later time';
  return errors;
};

const submit = (values, params, props) => {
  // alert(JSON.stringify(values, null, 2));
  fetch('/api/countdowns', {
    method: 'post',
    headers: {'Content-Type': 'application/json',},
    body: JSON.stringify({
      ending: parseInputDateTime(values.date, values.time),
      message: values.message,
      hiddenMessage: values.hidden,
    })
  }).then(() => props.history.push('/countdowns'));
};

const NewCountdown = props => {
  useEffect(() => {
    if (props.dash.items === null)
      props.loadCountdowns();
  });

  const initalDate = new Date(Date.now() + (1000 * 60 * 60 * 3));
  initalDate.setMinutes(0);
  const dateString = dateToString(initalDate);
  const timeString = dateToTimeString(initalDate);
  return (
    <div>
      <Header/>
      <h1>New</h1>
      <Formik
        initialValues={{date: dateString, message: '', hidden: '', time: timeString}}
        validate={validate}
        onSubmit={(values, params) => submit(values, params, props)}>
        {props => (
          <form onSubmit={props.handleSubmit}>
            <input
              type='text'
              name='message'
              onChange={props.handleChange}
              onBlur={props.handleBlur}
              value={props.values.message}/>
            {props.errors.message && props.touched.message && props.errors.message}
            <input
              type='text'
              name='hidden'
              onChange={props.handleChange}
              onBlur={props.handleBlur}
              value={props.values.hidden}/>
            <input
              type="date"
              name="date"
              onChange={props.handleChange}
              onBlur={props.handleBlur}
              value={props.values.date}
              min={dateString}/>
            <input
              type="time"
              name="time"
              onChange={props.handleChange}
              onBlur={props.handleBlur}
              value={props.values.time}/>
            <button type="submit" disabled={props.isSubmitting}>
              Create
            </button>
            <a href="/countdowns" className="btn btn-light">Cancel</a>
            <pre>{JSON.stringify(props, null, 2)}</pre>
          </form>
        )}
      </Formik>
    </div>
  );
};

function mapStateToProps({auth, dash}) {
  return {auth, dash};
}

export default connect(mapStateToProps, actions)(NewCountdown);