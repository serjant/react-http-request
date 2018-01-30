import React from 'react';
import request from 'superagent';
import PropTypes from 'prop-types';

class Request extends React.Component {

  static defaultProps = {
    method: 'get',
  }

  constructor(props) {
    super(props);
    this.request = null;
    this.state = {
      error: null,
      result: null,
      loading: true,
    };
  }

  componentWillMount() {
    this.performRequest(this.props);
  }
  componentWillReceiveProps(nextProps) {
    if (JSON.stringify(this.props) === JSON.stringify(nextProps)) {
      return;
    }

    this.setState({
      error: null,
      result: null,
      loading: true,
    });

    this.request.abort();
    this.performRequest(nextProps);
  }

  componentWillUnmount() {
    this.request.abort();
  }

  performRequest(props) {
    let { method } = props;
    if (method === 'delete') {
      method = 'del';
    }

    this.request = request[method](props.url);

    if (props.headers) {
      this.request.set(props.headers);
    }

    if (props.withCredentials) {
      this.request.withCredentials();
    }

    if (props.buffer) {
      this.request.buffer();
    }

    const { auth } = props;
    if (auth) {
      this.request.auth(auth.user, auth.pass);
    }
    if (props.fields) {
      for (let i = 0; i < props.fields.length; i++) {
        if (props.fields[i]) {
          this.request.field(props.fields[i].name, props.fields[i].value);
        }
      }
    }
    if (props.attach) {
      for (let i = 0; i < props.attach.length; i++) {
        if (props.attach[i]) {
          this.request.attach(
            props.attach[i].name,
            props.attach[i].path,
            props.attach[i].filename
          );
        }
      }
    }

    const configs = [
      'type',
      'accept',
      'send',
      'query',
      'timeout',
      'redirects',
    ];
    for (const i of configs) {
      if (props[i]) {
        this.request[i](props[i]);
      }
    }

    if (props.onRequest) {
      this.request = props.onRequest(this.request);
    }

    this.request
      .end((error, result) => {
        if (error || !result.ok) {
          this.printLog(props, error);
        } else {
          this.printLog(props, result);
        }
        this.setState({
          error,
          result,
          loading: false,
        });
      });
  }

  printLog(props, res) {
    if (props.verbose && res) {
      console.log(res); // eslint-disable-line no-console
    }
  }

  render() {
    return this.props.children(this.state);
  }
}

Request.propTypes = {
  children: PropTypes.func,
  method: PropTypes.string.isRequired,
  type: PropTypes.string,
  accept: PropTypes.string,
  url: PropTypes.string.isRequired,
  timeout: PropTypes.number,
  verbose: PropTypes.bool,
  query: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ]),
  send: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ]),
  headers: PropTypes.object,
  auth: PropTypes.object,
  withCredentials: PropTypes.bool,
  buffer: PropTypes.bool,
  attach: PropTypes.array,
  fields: PropTypes.array,
  onRequest: PropTypes.func,
};

export default Request;
