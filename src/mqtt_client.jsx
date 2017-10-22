import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import mqtt from 'mqtt'
import rfid_img from './icons/rfid.svg'
import form_img from './icons/form.svg'
import mqtt_online from './icons/server_online.svg'
import mqtt_offline from './icons/server_offline.svg'
import wa_online from './icons/cloud_online.svg'
import wa_offline from './icons/cloud_offline.svg'
import locked from './icons/locked.svg'
import unlocked from './icons/unlocked.svg'
import arduino_on from './icons/arduino_online.svg'
import arduino_off from './icons/arduino_offline.svg'
import moment from 'moment'
// import { Client, Message } from 'react-native-paho-mqtt';

class MqttLoginListener extends Component {
    constructor(){
        super()
    }
}
class Contacts extends Component {
  constructor(props){
    super(props);
    this.state = {
                    recentLogins: [],
                    conection_established: false,
                    waApi:false,
                    doorOpen:false,
                    doorLocked:false,
                    arduinoConnected:false,
                    lastMessage: new Date()
                  }
    this.handleClick = this.handleClick.bind(this);
    this.handleContactReceived = this.handleContactReceived.bind(this);
    this.handleStatusReceived = this.handleStatusReceived.bind(this);
    this.handleConnected = this.handleConnected.bind(this);
    this.handleDisconnected = this.handleDisconnected.bind(this);

  }
  componentDidMount() {
    this.client  = mqtt.connect('ws://localhost:1884')
    this.client.on('connect', () => {
      this.client.subscribe('quelab/door/entry');
      this.client.subscribe('quelab/door/status');
      this.handleConnected();
    })

    this.client.on('offline', () => {
      this.handleDisconnected();
    })

    this.client.on('message', (topic, message) => {
      // message is Buffer
      // console.log(message.toString());
      if (topic == 'quelab/door/entry'){
        let json_message = JSON.parse(message.toString());
        this.handleContactReceived(json_message);
      }
      if (topic == 'quelab/door/status'){
        let json_message = JSON.parse(message.toString());
        this.handleStatusReceived(json_message);
      }

    })
  }

  componentWillUnmount() {
    this.client.end();
  }

  handleConnected(){
    this.setState(prevState => ({
      connection_established: true
    }))
    console.log("connected");
  }

  handleDisconnected(){
    this.setState(prevState => ({
      connection_established: false,
      arduinoConnected: false
    }))
    console.log("disconnected");
  }

  handleClick(){
    this.setState(prevState => ({
      recentLogins: prevState.recentLogins.concat(const_contact)
    }));
  }

  handleStatusReceived(status){
    this.setState(prevState => (
      {
        waApi: status['connected'],
        doorLocked: status['locked'],
        arduinoConnected: status['arduino_connected'],
        lastMessage: status['timestamp']
      }
      ))
  }

  handleContactReceived(contact){
    let contacts = this.state.recentLogins.filter(old_contact => {
      return old_contact['Id'] != contact['Id'];
    })
      this.setState(prevState => (
        {
        recentLogins: [contact].concat(contacts.slice(0, 9))
      }));

  }

  render(){
    return (
      <div>
      <div className="row mx-2">
        <div className="col d-flex">
          <h3 className="mb-0 mr-auto p-2">Recent Member Sign-ins</h3>
          <LastStatus arduinoOn={this.state.arduinoConnected} lastMessage={this.state.lastMessage} />
          <ArduinoState arduinoOn={this.state.arduinoConnected} />
          <LockState locked={this.state.doorLocked} />
          <WildApricotConnectionState connection_status={this.state.waApi} />
          <ConnectionState connection_status={this.state.connection_established} />
        </div>
      </div>

      <div className="row mx-2">
        {this.state.recentLogins.map((contact, index ) => {
          {/* contact.Id is the correct key to use here */}
          return <Contact key={contact.Id} contact={contact} />
          }
        )}
      </div>
      </div>
    )
  }
}

class ConnectionState extends Component {
  render(){
    let connected = null;
    if (this.props.connection_status == true){
      connected = <img src={mqtt_online} title="Connected to MQTT Server" />
    } else {
      connected = <img style={{"width": "30px", "height":"30px"}} src={mqtt_offline} title="Not connected to MQTT Server" />
    }
    return( <div style={{"width": "30px", "height":"30px"}}>{connected}</div> )
  }
}

class WildApricotConnectionState extends Component {
  render(){
    let connected = null;
    if (this.props.connection_status == true){
      connected = <img src={wa_online} title="Connected to WildApricot" />
    } else {
      connected = <img src={wa_offline} style={{"width": "30px", "height":"30px"}}
                       title="Not connected to WildApricot" />
    }
    return( <div style={{"width": "30px", "height":"30px"}}>{connected}</div> )
  }
}

class LockState extends Component {
  render(){
    let doorLocked = null;
    if (this.props.locked == true){
      doorLocked = <img src={locked} title="Door is locked" />
    } else {
      doorLocked = <img src={unlocked} title="Door is unlocked" />
    }
    return( <div style={{"width": "30px", "height":"30px"}}>{doorLocked}</div> )
  }
}
class ArduinoState extends Component {
  render(){
    let arduinoOnline = null;
    if (this.props.arduinoOn == true){
      arduinoOnline = <img src={arduino_on} title="Arduino is online" />
    } else {
      arduinoOnline = <img src={arduino_off} title="Arduino is offline" />
    }
    return( <div style={{"width": "30px", "height":"30px"}}>{arduinoOnline}</div> )
  }
}
class LastStatus extends Component {
  render(){
    if (this.props.arduinoOn == true){
      return null;
    }
    return(
      <div className="mx-2 text-danger">Last Message: {moment(this.props.lastMessage).fromNow()}</div>
    )
  }
}

class Avatar extends Component {
  render(){
    const avatar = this.props.avatar;
    const id = this.props.id;
    var avatar_url = null;
    if (avatar === null){
      avatar_url = 'https://robohash.org/' + id + '.png?size=110x110&set=set1&bgset=any'
    } else {
      const file_name = Object.keys(avatar)[0];
      {/* check filename to mime here */}
      avatar_url = "data:image/png;base64, " + avatar[file_name]
    }
    return(
      <img className={this.props.className} src={avatar_url} />
    )
  }
}

class ContactDetails extends Component {
  render(){
    let contact = this.props.contact;
    let image = null;
    if (contact['source'] == 'rfid'){
      image = rfid_img;
    } else {
      image = form_img;
    }
    return(
      <div>
        <div>
          {moment(contact['signin_time']).fromNow()}
        </div>
        <div>
          <img src={image} style={{"width": "40px"}}/>
        </div>
      </div>
    )
  }
}

class Contact extends Component {
  render(){
      const contact = this.props.contact;
        return(
            <div className="card col-2 p-1 m-1 border-dark border-rounded">
                <div className="card-img-top bg-dark w-100 d-flex align-items-center" >
                 < Avatar className="w-100" id={contact.Id} avatar={contact.avatar} />
                </div>
                <div className="card-body bg-light text-center p-0 d-flex align-items-end justify-content-center">
                  <ContactDetails contact={contact} />
                </div>
                <div className="card-footer text-light bg-dark text-center p-0">
                  <h5 className="m-1">{contact.FirstName} {contact.LastName}</h5>
                </div>

            </div>
        )
    }
}
export default Contacts;