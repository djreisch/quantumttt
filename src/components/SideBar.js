import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class SideBar extends Component{

	static propTypes = {
	  choices: PropTypes.array,                 //tracks selected collapsing squares, or null
	  onChoiceClick: PropTypes.func.isRequired, //pass back selected choice of mark to Gmae.handleCollapse
	  status: PropTypes.string.isRequired,      //convery player info about current state of game
	};

	render(){
    let choices;

    //render a quantum collapse and reutrn the resulting info
    if (this.props.choices != null)
      choices = this.props.choices.map((choice) => {
          return (
            <div className="collapseChoice"
               onClick={() => this.props.onChoiceClick(choice)}
               key={choice}>
               {choice}
            </div>
          );
        });

    return (<div className="game-info">
              <div className="status"> {this.props.status} </div>
              {choices}
            </div>);
	}
}
