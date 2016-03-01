import React from 'react';
import request from 'superagent';

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
      console.log(res);
    }
  }

  render() {
    return this.props.children(this.state);
  }
}

Request.propTypes = {
  children: React.PropTypes.func,
  method: React.PropTypes.string.isRequired,
  type: React.PropTypes.string,
  accept: React.PropTypes.string,
  url: React.PropTypes.string.isRequired,
  timeout: React.PropTypes.number,
  verbose: React.PropTypes.bool,
  query: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.object,
  ]),
  send: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.object,
  ]),
  headers: React.PropTypes.object,
  auth: React.PropTypes.object,
  withCredentials: React.PropTypes.bool,
  buffer: React.PropTypes.bool,
  attach: React.PropTypes.array,
  fields: React.PropTypes.array,
  onRequest: React.PropTypes.func,
};

export default Request;
