import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Link, Route } from 'react-router-dom'
import 'bootstrap'
import Contacts from './mqtt_client.jsx'
import showdown from 'showdown'
showdown.setFlavor('github')
const mdConv = new showdown.Converter({ ghCompatibleHeaderId: true, strikethrough: true, ghCodeBlocks: true, tasklists: true })

class SignInForm extends Component {
    constructor() {
        super()
        this.state = { firstName: '', lastName: '', isMember:false, formError:null, loginMessage:null}
        this.url_prefix = "/api"
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.formSuccess = this.formSuccess.bind(this);
        this.formResponseBody = this.formResponseBody.bind(this);
        this.focusTextInput = this.focusTextInput.bind(this);
        this.closeMessage = this.closeMessage.bind(this)
      }

    focusTextInput(){
      this.textInput.focus();
    }
    handleChange(event){
      const target = event.target;
      const value = target.type === 'checkbox' ? target.checked : target.value;
      const name = target.name;

      this.setState({
        [name]: value
      });
    }

    formSuccess(resp){
      this.timer = setTimeout(this.closeMessage, 5000);
      if (resp.status !== 200) {
        this.setState({formError: true });
      } else {
        this.setState({formError: false });
        this.setState({firstName: '', lastName: '', isMember: false});
      }
      return resp.text()
    }

    closeMessage(){
      this.setState({loginMessage: null, formError: null});
    }

    formResponseBody(body){
      if (this.state.formError) {
        this.setState({loginMessage: body || "unexpected error occured"})
      } else {
        this.setState({ loginMessage: body })
      }
    }
    formError(body){
      console.log(body);
    }

    handleSubmit(event){
      event.preventDefault();
      this.setState({loginMessage: "Thank you for signing in"})
      let data = new FormData()
      const formFields = ['firstName', 'lastName', 'isMember'];
      formFields.map( name => {
        data.append(name, this.state[name]);
      })
      this.setState({firstName: '', lastName: '', isMember: false})
      this.focusTextInput();
      fetch('/api/signin', { method: 'POST', body: data })
      .then(this.formSuccess)
      .catch(this.formError)
      .then(this.formResponseBody)
      .catch(this.formError)
    }

    render(){
        return(
        <form className="mx-4" id="signin" onChange={this.handleChange} onSubmit={this.handleSubmit}>
              <LoginMessage message={this.state.loginMessage} error={this.state.formError} />
              <div className="form-row align-items-center">
                <label className="sr-only">First Name</label>
                <input type="text" id="first_name" className="col-3 mr-3 form-control"
                         name="firstName" value={this.state.firstName} placeholder="First Name"
                        autoFocus={true} ref={(input) => { this.textInput = input; }}/>
                <label className="sr-only">Last Name</label>
                <input type="text" id="last_name" className="col-3 mr-3 form-control"
                         name="lastName" value={this.state.lastName} placeholder="Last Name" />
                <div className="col-auto">
                <input type="submit" value="Sign in" role="button" className="btn btn-primary" />
              </div>
            </div>

                <blockquote className="my-3">I hereby acknowledge that I have <b>carefully</b> read the provisions of
                the <i>Release of Liability</i>, fully understand the terms and conditions
                expressed there, and do freely choose acceptance of the provisions of the
                sections relating to assumption of risk, release of liability, covenant
                not to sue, and third party indemnification.
                </blockquote>
        </form>
        )
    }
}

class LoginMessage extends Component{
  render(){
    let messageClass='alert-info';
    if (this.props.message === undefined || this.props.message === null){ return null;}
    if (this.props.error === true){
      messageClass='alert-danger';
    } else if (this.props.error === false){
      messageClass='alert-success';
    }
    return(
      <div className={"alert " + messageClass} role="alert" id="signin_notification">{this.props.message}</div>
    )
  }
}
class Welcome extends Component{
  render(){
    return(
      <div className="col bg-light border border-bottom-2 border-left-0 border-right-0 mb-2">
        <h1 className="display-3 m-0">Welcome to Quelab</h1>
      </div>
    )
  }
}
class Footer extends Component {
  render(){
    return(
      <footer className="footer">
        <div className='container'>
            <span> Visitors and members who don't have (or forgot to bring, or have not yet
            activated) <span className="font-weight-bold">RFID keys</span>, please manually sign in.
          </span>
        </div>
      </footer>

    )
  }
}

class Info extends Component {

  componentDidMount() {
    const codes = this.domEl.querySelectorAll('pre')
    for (let c of codes) {
      hljs.highlightBlock(c)
    }
  }


  render() {

    let docs
    if (this.props.docs) {
      docs = <div ref={(div) => { this.domEl = div }} className="markdown-body" dangerouslySetInnerHTML={{ __html: this.props.docs }} />
    } else {
      docs = <div ref={(div) => { this.domEl = div }} className='jumbotron'>
        <div className='container'>
          <h1 className='display3'>{this.props.name}</h1>
          <p>The docs could not be retrieved.</p>
        </div>
      </div>
    }

    return (
      docs
    )
  }
}


class App extends Component {
  constructor() {
    super()
    this.state = { docs: undefined, version: undefined }
  }


  componentWillMount() {

    fetch("/static/README.md")
      .then((resp) => {
        if (resp.status == 200) {
          return resp.text().then((docs) => {
            this.setState({ docs: mdConv.makeHtml(docs) })
          })
        }
      })
  }

  render() {
    return (
      <div>
        <Welcome />
        <SignInForm />
        <Contacts />
        <Footer />

      </div>

    )
  }
}

export default App;