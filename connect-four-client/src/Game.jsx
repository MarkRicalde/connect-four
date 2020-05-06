/**
 * Name: Mark Danez Ricalde
 * UCID: 10171889
 * Tutorial section: B02
 */

import * as React from "react";
import "./Game.css";
import {Button} from 'react-bootstrap'
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';

// Makes states easier to read
const GameState = {
  WAITING: -2,
  ONGOING: -1,
  DRAW: 0,
  PLAYER1WIN: 1,
  PLAYER2WIN: 2
}

const intitializeBoard = () => {
  const board = [];
  for (let i = 0; i < 42; i++) {
    board.push(0);
  }
  return board;
};

const findLowestEmptyIndex = (board, column) => {
  for (let i = 35 + column; i >= 0; i -= 7) {
    if (board[i] === 0) return i;
  }

  return -1;
};

const getGameState = (board) => {
  // Checks wins horizontally
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c <= 4; c++) {
      const index = r * 7 + c;
      const boardSlice = board.slice(index, index + 4);

      const winningResult = checkWinningSlice(boardSlice);
      if (winningResult !== false) return winningResult;
    }
  }

  // check wins vertically
  for (let r = 0; r <= 2; r++) {
    for (let c = 0; c < 7; c++) {
      const index = r * 7 + c;
      const boardSlice = [
        board[index],
        board[index + 7],
        board[index + 7 * 2],
        board[index + 7 * 3]
      ];

      const winningResult = checkWinningSlice(boardSlice);
      if (winningResult !== false) return winningResult;
    }
  }

  // check wins diagonally
  for (let r = 0; r <= 2; r++) {
    for (let c = 0; c < 7; c++) {
      const index = r * 7 + c;

      // check wins diagonal down-left
      if (c >= 3) {
        const boardSlice = [
          board[index],
          board[index + 7 - 1],
          board[index + 7 * 2 - 2],
          board[index + 7 * 3 - 3]
        ];

        const winningResult = checkWinningSlice(boardSlice);
        if (winningResult !== false) return winningResult;
      }

      // check wins down-right
      if (c <= 3) {
        const boardSlice = [
          board[index],
          board[index + 7 + 1],
          board[index + 7 * 2 + 2],
          board[index + 7 * 3 + 3]
        ];

        const winningResult = checkWinningSlice(boardSlice);
        if (winningResult !== false) return winningResult;
      }
    }
  }

  if (board.some(cell => cell === 0)) {
    return -1
  } else {
    return 0
  }
};

// Checks for matching
const checkWinningSlice = (miniBoard) => {
  if (miniBoard.some(cell => cell === 0)) return false;

  if (
    miniBoard[0] === miniBoard[1] &&
    miniBoard[1] === miniBoard[2] &&
    miniBoard[2] === miniBoard[3]
  ) {
    return miniBoard[1];
  }

  return false;
};

class Game extends React.Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };

  constructor(props) {
    super(props);
    this.socket = props.socket;
    const { cookies } = props;
    this.state = {
      board: intitializeBoard(),
      gameState: GameState.WAITING,
      gameTheme: cookies.get('theme') || 'classic',
    };
  }

  componentDidMount() {
    // Gets the player id from the other component
    this.socket.on('give id', id => {
      this.setState({playerId: id})
    })

    this.socket.on('start game', (newState) => {
      this.setState({gameState: newState.gameState,
        player1: newState.player1,
        player2: newState.player2,
        roomId: newState.roomId,
        playerTurn: newState.playerTurn});
      if (this.state.playerId === this.state.player1) {
        this.setState({opponentId: this.state.player2})
      }
      else {
        this.setState({opponentId: this.state.player1})
      }
      this.isIllegalMove(false)
    })

    this.socket.on('board move', (column) => {
      this.makeMove(column)
    })
  }

  renderCells = () => {
    const { board } = this.state;
    return board.map((player, index) => this.renderCell(player, index));
  };

  handleOnClick = (index) => () => {
    const {gameState, playerId, playerTurn, board} = this.state;

    if (gameState !== -1) return;

    const column = index % 7;

    if (playerId !== playerTurn) {
      return;
    };

    const check = findLowestEmptyIndex(board, column)
    if (check === -1) {
      this.isIllegalMove(true);
      return;
    }

    this.makeMove(column);
    this.isIllegalMove(false);

    let move = {
      roomId: this.state.roomId,
      moveColumn: column
    }

    this.socket.emit('board move', move)
  };

  makeMove(column) {
    const { board, playerTurn} = this.state;


    const index = findLowestEmptyIndex(board, column);

    const newBoard = board.slice();
    newBoard[index] = playerTurn;

    const gameState = getGameState(newBoard);

    this.setState({
      board: newBoard,
      playerTurn: this.togglePlayerTurn(playerTurn),
      gameState
    });
  }

  renderCell = (player, index) => {
    return (
      <div
        className="cell"
        key={index}
        onClick={this.handleOnClick(index)}
        data-player={this.getPlayer(player)}
        game-theme={this.state.gameTheme}
      />
    );
  };

  renderGameStatus = () => {
    const { gameState } = this.state;

    let text;
    if (gameState === GameState.WAITING) {
      text = 'Game is waiting for 2nd player'
    }
    else if (gameState === GameState.ONGOING) {
      text = `${this.state.playerId}, you are playing against ${this.state.opponentId}`
    } else if (gameState === GameState.DRAW) {
      text = 'Game is a draw'
    } else {
      text = `${gameState} won`
    }

    return <div>
      {text}
    </div>
  };

  renderPlayerTurn = () => {

    let text;
    if (this.state.gameState === GameState.WAITING) {
      text = ''
    } else if (this.state.gameState === GameState.ONGOING) {
      if (this.state.playerTurn === this.state.player1 ) {
        text = `${this.state.player1}'s Turn`
      }
      else {
        text = `${this.state.player2}'s Turn`
      }
    } else {
      text = 'Game is Over'
    }


    return <div> {text}</div>
  };

  isIllegalMove = (status) => {
    if (status === true) {
      this.setState({roomText: "Illegal Move, click a different column"})
    }
    else {
      this.setState({roomText: `Your room is: ${this.state.roomId}`})
    }
  }

  getPlayer = (player) => {
    if (player === 0) return "noPlayer";
    if (player === this.state.player1) return "playerOne";
    if (player === this.state.player2) return "playerTwo";
  };

  togglePlayerTurn = (player) => {
    return player === this.state.player1 ? this.state.player2 : this.state.player1;
  };

  classicButtonClick = () => {
    this.setState({gameTheme: 'classic'})
    const {cookies} = this.props;
    cookies.set('theme', 'classic', {path: '/', maxAge: 31536000 })
  }

  christmasButtonClick = () => {
    this.setState({gameTheme: 'christmas'})
    const {cookies} = this.props;
    cookies.set('theme', 'christmas', {path: '/', maxAge: 31536000 })
  }

  vaporButtonClick = () => {
    this.setState({gameTheme: 'vaporwave'})
    const {cookies} = this.props;
    cookies.set('theme', 'vaporwave', {path: '/', maxAge: 31536000 })
  }

  render() {

    return (
      <div className="Game">
        {this.state.roomText}
        {this.renderGameStatus() }
        {this.renderPlayerTurn()}
        <div className="board" game-theme={this.state.gameTheme}>{this.renderCells()}</div>
        <Button className="button" variant="outline-primary" onClick={this.classicButtonClick}>Classic Theme</Button>
        <Button className="button" variant="outline-primary" onClick={this.christmasButtonClick}>Christmas Theme</Button>
        <Button className="button" variant="outline-primary" onClick={this.vaporButtonClick}>VaporWave Theme</Button>
      </div>
    );
  }
}

export default withCookies(Game);
