import React from 'react';
import ReactDOM from 'react-dom';
import attachFastClick from 'fastclick';
import generateName from 'sillyname';
import {BrowserRouter as Router, Route, Link} from 'react-router-dom';
import OnlineApp from './components/OnlineApp.js';
import OfflineApp from './components/OfflineApp.js';
import './style/app.css';

//convert our random word (for online game room) to lower case
let name = generateName().split(' ')[0].toLowerCase();

//home object sets gameroom name button and offline name button
const Home = () => {

  return (
    <div className="border">
      <center>
        <h1 className=""> Quantum Tic Tac Toe </h1>
        <Link to={`/g/${name}`}>
          <div className="button"> online </div>
        </Link>
        <Link to={"/offline"}>
          <div className="button"> offline </div>
        </Link>
      </center>
    </div>
  );
};

//app object spawns game instance based on either offline play or gameroom name
const App = () => {
  return (
    <div id="container">

      <div className="overlay">
        <div className="withinOverlay">
          <Router>
            <div>
              <Route exact path="/" component={Home}/>

              <Route path="/g/:name" render={ ({match}) => {
                  return <div className="board"> <OnlineApp name={match.params.name} /> </div>;
              }}/>
            <Route exact path="/offline" render={ () => {
                  return <div className="board"> <OfflineApp /> </div>;
              }}/>
            </div>
          </Router>
        </div>
      </div>
    </div>
  );
};

ReactDOM.render(
  <App /> ,
  document.getElementById('root')
);

attachFastClick.attach(document.body);
