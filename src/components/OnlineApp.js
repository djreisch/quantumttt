import React, { Component } from 'react';
import io from 'socket.io-client';

import Board from './Board.js';
import SideBar from './SideBar.js';
import '../style/app.css';

export default class App extends Component {

  constructor(props){
    super(props);

    this.timer = this.timer.bind(this);

    this.state = {
      cSquares: Array(9).fill(null), //index contains classic mark for index square, or null (3x3 grid = 9)
      qSquares: Array(9).fill(null), //index element contains list of quantum marks container in index, or null
      turnNum: 1,                    //user turn
      subTurnNum: 0,                 //quantum turn (0-3)
      cycleSquares: null,            //index of squaured involved in collapse cycle, or null
      cycleMarks: null,              //contains marks involved in collapse cycle, or null
      collapseSquare: null,          //square selected to origin of collage, if exists
      gameOver: false,               //game over
      xScore: 0,                     //running x score
      yScore: 0,                     //running y score
      xTimeLeft: 60 * 5,             //x time left in seconds
      yTimeLeft: 60 * 5,             //y time left in seconds
      status: `You have joined game ${props.name}! Send this url to your friend so they can join.`,
    };
  }

  componentWillMount() {
    console.log(`connecting to ${this.props.name}`);
    fetch(`/g/${this.props.name}`, {
      method: 'POST',
    });

    this.socket = io(`/g/${this.props.name}`);

    this.socket.on('new state', (state) => {
      console.log("received state");
      this.setState(state);
    });

    this.socket.on('new status', (status) => {
      console.log("received status");
      this.setState({status});
    });
  }

  componentWillUnMount() {
    this.socket.close();
  }

  timer() {
    if (this.whoseTurn() === 'X'){
      if (this.state.xTimeLeft <= 0){
        clearInterval(this.timerCallback);
        this.setState({
          gameOver: true,
          status: "Player X has run out of time. Player Y wins!"
        });
      } else
        this.setState({xTimeLeft: this.state.xTimeLeft - 1});
    }
    else if (this.whoseTurn() === 'Y'){
      if (this.state.yTimeLeft <= 0){
        clearInterval(this.timerCallback);
        this.setState({
          gameOver: true,
          status: "Player Y has run out of time. Player X wins!"
        });
      } else
        this.setState({yTimeLeft: this.state.yTimeLeft - 1});
    }
  }

  handleSquareClick(squareNum){

    if (this.state.turnNum === 1 && this.state.subTurnNum === 0){ //initialize timer at game start
      setInterval(this.timer, 1000);
      console.log("here!");
    }

    this.socket.emit('click', squareNum);
  }

  handleCollapse(mark){
    this.socket.emit('collapse click', mark);
  }

  whoseTurn(){
    return (this.state.subTurnNum < 2) ? 'X' : 'Y';
  }

  formatTime(time){
    return ~~(time / 60) + ":" + (time % 60 < 10 ? "0" : "") + time % 60;
  }


  render() {
    let status, choices;

    if (this.state.status != null)
      status = this.state.status;
    else
      status = `Player ${this.whoseTurn()} is next!`;

    if(this.state.collapseSquare != null)
      choices = this.state.qSquares[ this.state.collapseSquare ]
        .filter((choice) => this.state.cycleMarks.includes(choice) );

    return (
      <div>
        <center> <h1> Quantum Tic Tac Toe </h1> </center>
        <div className="game">
          <div className="game-board">

              <Board
                cSquares={this.state.cSquares}
                qSquares={this.state.qSquares}
                cycleSquares={this.state.cycleSquares}
                cycleMarks={this.state.cycleMarks}
                collapseSquare={this.state.collapseSquare}
                onSquareClick={(i) => this.handleSquareClick(i)}
              />

            <div className="xScore"> X: {this.formatTime(this.state.xTimeLeft)} </div>
            <div className="yScore"> Y: {this.formatTime(this.state.yTimeLeft)} </div>
          </div>

            <SideBar
              status={status}
              choices={choices}
              onChoiceClick={(mark) => this.handleCollapse(mark)}
             />

        </div>
      </div>
    );
  }
}
