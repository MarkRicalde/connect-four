/**
 * Name: Mark Danez Ricalde
 * UCID: 10171889
 * Tutorial section: B02
 */

import React from "react";
import {
    Link
} from "react-router-dom";
import "./Home.css"
import {Container, Row, Col, Button,FormControl, InputGroup } from "react-bootstrap";
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';

function getRandomInt() {
    return Math.floor(Math.random() * Math.floor(1000000));
}

function randomUsername() {
    let parts = [];
    parts.push(["Small", "Big", "Medium", "Miniscule", "Long", "Short"]);
    parts.push(["Red", "Blue", "Green", "Yellow", "Pink", "Rainbow"]);
    parts.push(["Bear", "Dog", "Zebra", "Orangutan", "Tiger", "Lion"]);

    let username = "";
    for (let part of parts) {
        username += part[Math.floor(Math.random() * part.length)];
    }
    return username;
}

const roomId = getRandomInt();

class Home extends React.Component {
    static propTypes = {
        cookies: instanceOf(Cookies).isRequired
    };

    constructor(props) {
        super(props);
        const { cookies } = props;
        this.nameInput = React.createRef();
        this.roomInput = React.createRef();
        this.socket = props.socket;
        this.state = {playerId: cookies.get('playerId') || randomUsername(), roomId: roomId};
    }

    joinExistingGame() {
       this.socket.emit('join existing room', this.state)
    }

    joinRandomGame() {
        this.socket.emit('join random room', this.state);
    }

    nameChange() {
        this.setState({playerId: this.nameInput.current.value})
        const {cookies} = this.props;
        cookies.set('playerId', this.nameInput.current.value, {path: '/', maxAge: 31536000 })
    }

    roomChange() {
        const room = this.roomInput.current.value;
        if (!room) {
            // If no message is written
            return;
        }
        this.setState({roomId: room})
    }

    render() {
        return (
            <div className="center">
                <h2>Connect 4 Deluxe</h2>
            <p> If this is your first time here, we created a name for you: </p>
            <InputGroup className="smaller">
                <FormControl ref={this.nameInput} defaultValue={this.state.playerId} onChange={this.nameChange.bind(this)}/>
            </InputGroup>
                <Container className="home">
                    <Row>
                        <Col xs={{number: 4, offset: 1}}>
                    <p> We created a random code for you: </p>
                    {roomId}
                    <p> Send this code to your friend and press Join/Existing Game to create the room. If you've received
                    a code from your friend, input it on the right and press Join/Create Existing Room. Alternatively,
                    you can join a random game where you will be matched against the next available player.</p>
                        </Col>
                        <Col xs={{number: 4, offset: 1}}>
                            <p>Enter a Random Code Here</p>
                            <InputGroup>
                                <FormControl
                                    ref={this.roomInput} onChange={this.roomChange.bind(this)}/>
                            </InputGroup>
                            <Link to="/game"><Button className="button" onClick={this.joinExistingGame.bind(this)}>Join/Create Existing Game</Button></Link>
                            <Link to="/game"><Button className="button" onClick={this.joinRandomGame.bind(this)}>Join Random Game</Button></Link>
                        </Col>
                    </Row>
                </Container>
    </div>
        )
    }
}

export default withCookies(Home);
