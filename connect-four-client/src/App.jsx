/**
 * Name: Mark Danez Ricalde
 * UCID: 10171889
 * Tutorial section: B02
 */

import React from "react";
import { CookiesProvider } from 'react-cookie';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import socketIO from 'socket.io-client';
import Game from "./Game";
import Home from "./Home";

class App extends React.Component {
    constructor(props) {
        super(props);
        this.socket = socketIO('http://localhost:8000');
    }

    // Creates the different routes for the Home and Game page
    render() {
        return (
            <BrowserRouter>
                    <Switch>
                        <Route path="/game" render={(props) => <CookiesProvider><Game {...props} socket={this.socket}/></CookiesProvider>} />
                        <Route path="/" render={(props) => <CookiesProvider><Home {...props} socket={this.socket}/></CookiesProvider>} />
                    </Switch>
            </BrowserRouter>
        )
    }
}

export default App;
