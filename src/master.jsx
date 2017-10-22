import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import './styles.scss'
import 'bootstrap'
import { BrowserRouter as Router, Link, Route } from 'react-router-dom'
import showdown from 'showdown'
import hljs from 'highlight.js'
import App from './sign_in.jsx'

let container = document.createElement("div")
let body = document.getElementsByTagName("body")[0]
body.appendChild(container)

ReactDOM.render(
  <Router basename="/">
    <App name="Quelab Sign-in form" author="Troy Ross" email="kak.bo.che@gmail.com" />
  </Router>
  , container)


