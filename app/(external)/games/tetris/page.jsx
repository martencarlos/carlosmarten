"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import BackButton from "@components/Article/BackButton/BackButton";
import styles from "./page.module.css";

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const EMPTY_CELL = 0;
const GHOST_CELL = 8;

const SHAPES = [
  [[1, 1, 1, 1]],
  [
    [2, 0],
    [2, 0],
    [2, 2],
  ],
  [
    [0, 3],
    [0, 3],
    [3, 3],
  ],
  [
    [4, 4],
    [4, 4],
  ],
  [
    [0, 5, 5],
    [5, 5, 0],
  ],
  [
    [0, 6, 0],
    [6, 6, 6],
  ],
  [
    [7, 7, 0],
    [0, 7, 7],
  ],
];

const COLORS = [
  "bg-gray-900",
  "bg-cyan-500",
  "bg-orange-500",
  "bg-blue-500",
  "bg-yellow-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-red-500",
  "bg-opacity-30 border-dashed",
];

const createEmptyBoard = () =>
  Array(BOARD_HEIGHT)
    .fill()
    .map(() => Array(BOARD_WIDTH).fill(EMPTY_CELL));

const TetrisGame = () => {
  const [board, setBoard] = useState(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState(null);
  const [nextPiece, setNextPiece] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [combo, setCombo] = useState(0);

  const getRandomPiece = () =>
    SHAPES[Math.floor(Math.random() * SHAPES.length)];

  const isValidMove = useCallback((piece, pos, boardState) => {
    if (!piece) return false;

    for (let y = 0; y < piece.length; y++) {
      for (let x = 0; x < piece[y].length; x++) {
        if (piece[y][x] !== EMPTY_CELL) {
          const newX = pos.x + x;
          const newY = pos.y + y;

          if (
            newX < 0 ||
            newX >= BOARD_WIDTH ||
            newY >= BOARD_HEIGHT ||
            (newY >= 0 &&
              boardState[newY][newX] !== EMPTY_CELL &&
              boardState[newY][newX] !== GHOST_CELL)
          ) {
            return false;
          }
        }
      }
    }
    return true;
  }, []);

  const spawnNewPiece = useCallback(() => {
    const shape = nextPiece || getRandomPiece();
    const newNextPiece = getRandomPiece();
    const x = Math.floor((BOARD_WIDTH - shape[0].length) / 2);
    setCurrentPiece(shape);
    setNextPiece(newNextPiece);
    setPosition({ x, y: 0 });

    if (!isValidMove(shape, { x, y: 0 }, board)) {
      setGameOver(true);
    }
  }, [board, nextPiece, isValidMove]);

  const mergePieceToBoard = useCallback(() => {
    if (!currentPiece) return;

    const newBoard = board.map((row) => [...row]);

    for (let y = 0; y < currentPiece.length; y++) {
      for (let x = 0; x < currentPiece[y].length; x++) {
        if (currentPiece[y][x] !== EMPTY_CELL && position.y + y >= 0) {
          newBoard[position.y + y][position.x + x] = currentPiece[y][x];
        }
      }
    }

    let completedLines = 0;
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (
        newBoard[y].every((cell) => cell !== EMPTY_CELL && cell !== GHOST_CELL)
      ) {
        newBoard.splice(y, 1);
        newBoard.unshift(Array(BOARD_WIDTH).fill(EMPTY_CELL));
        completedLines++;
      }
    }

    if (completedLines > 0) {
      const newLines = lines + completedLines;
      const newLevel = Math.floor(newLines / 10) + 1;
      const comboMultiplier = Math.min(1 + combo * 0.1, 2); // Max 2x multiplier
      const points =
        [0, 100, 300, 500, 800][completedLines] * level * comboMultiplier;

      setScore((prev) => prev + Math.floor(points));
      setLines(newLines);
      setLevel(newLevel);
      setCombo((prev) => prev + 1);
    } else {
      setCombo(0);
    }

    setBoard(newBoard);
    setCurrentPiece(null);
  }, [board, currentPiece, position, level, lines, combo]);

  const moveDown = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;

    const newPos = { ...position, y: position.y + 1 };
    if (isValidMove(currentPiece, newPos, board)) {
      setPosition(newPos);
    } else {
      mergePieceToBoard();
    }
  }, [
    currentPiece,
    position,
    board,
    gameOver,
    isPaused,
    isValidMove,
    mergePieceToBoard,
  ]);

  const moveHorizontal = (direction) => {
    if (!currentPiece || gameOver || isPaused) return;

    const newPos = { ...position, x: position.x + direction };
    if (isValidMove(currentPiece, newPos, board)) {
      setPosition(newPos);
    }
  };

  const rotate = () => {
    if (!currentPiece || gameOver || isPaused) return;

    const rotated = currentPiece[0].map((_, i) =>
      currentPiece.map((row) => row[i]).reverse()
    );

    if (isValidMove(rotated, position, board)) {
      setCurrentPiece(rotated);
    }
  };

  const handleKeyPress = useCallback(
    (event) => {
      switch (event.key) {
        case "ArrowLeft":
          moveHorizontal(-1);
          break;
        case "ArrowRight":
          moveHorizontal(1);
          break;
        case "ArrowDown":
          moveDown();
          break;
        case "ArrowUp":
          rotate();
          break;
        case "p":
          setIsPaused((prev) => !prev);
          break;
        default:
          break;
      }
    },
    [moveDown]
  );

  useEffect(() => {
    if (!currentPiece && !gameOver) {
      spawnNewPiece();
    }
  }, [currentPiece, gameOver, spawnNewPiece]);

  useEffect(() => {
    const speed = Math.max(100, 1000 - (level - 1) * 100);
    const interval = setInterval(() => {
      if (!isPaused) {
        moveDown();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [moveDown, isPaused, level]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  const renderNextPiece = () => {
    if (!nextPiece) return null;

    const previewBoard = Array(4)
      .fill()
      .map(() => Array(4).fill(EMPTY_CELL));
    const offsetY = Math.floor((4 - nextPiece.length) / 2);
    const offsetX = Math.floor((4 - nextPiece[0].length) / 2);

    for (let y = 0; y < nextPiece.length; y++) {
      for (let x = 0; x < nextPiece[y].length; x++) {
        if (nextPiece[y][x] !== EMPTY_CELL) {
          previewBoard[y + offsetY][x + offsetX] = nextPiece[y][x];
        }
      }
    }

    return (
      <div className="border-2 border-gray-700 p-1 bg-gray-900 flex flex-col w-fit">
        {previewBoard.map((row, y) => (
          <div key={y} className="flex">
            {row.map((cell, x) => (
              <div
                key={`${y}-${x}`}
                className={`w-4 h-4 border border-gray-700 ${COLORS[cell]}`}
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  const renderBoard = () => {
    const displayBoard = board.map((row) => [...row]);

    if (currentPiece) {
      for (let y = 0; y < currentPiece.length; y++) {
        for (let x = 0; x < currentPiece[y].length; x++) {
          if (currentPiece[y][x] !== EMPTY_CELL && position.y + y >= 0) {
            displayBoard[position.y + y][position.x + x] = currentPiece[y][x];
          }
        }
      }
    }

    return displayBoard.map((row, y) => (
      <div key={y} className="flex">
        {row.map((cell, x) => (
          <div
            key={`${y}-${x}`}
            className={`w-6 h-6 border border-gray-700 ${COLORS[cell]}`}
          />
        ))}
      </div>
    ));
  };

  const resetGame = () => {
    setBoard(createEmptyBoard());
    setCurrentPiece(null);
    setNextPiece(null);
    setPosition({ x: 0, y: 0 });
    setGameOver(false);
    setScore(0);
    setLevel(1);
    setLines(0);
    setCombo(0);
    setIsPaused(false);
  };

  return (
    <div className="flex flex-col w-full justify-center items-center h-full min-h-screen">
      <div className={styles.backbuttonContainer}>
        <BackButton />
      </div>
      <Card className="w-fit">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Tetris</span>
            <div className="flex gap-4">
              <span>Level: {level}</span>
              <span>Score: {score}</span>
              {combo > 1 && (
                <span className="text-green-500">
                  Combo: x{Math.min(1 + combo * 0.1, 2).toFixed(1)}
                </span>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex flex-col items-center gap-4">
              <div className="border-2 border-gray-700 p-1 bg-gray-900">
                {renderBoard()}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-semibold mb-2">Next:</h3>
                {renderNextPiece()}
              </div>

              <div className="text-sm text-gray-600">
                <p>Controls:</p>
                <p>← → : Move left/right</p>
                <p>↓ : Move down</p>
                <p>↑ : Rotate</p>
                <p>P : Pause</p>
              </div>

              <div className="text-sm">
                <p>Lines: {lines}</p>
              </div>
            </div>
          </div>

          {(gameOver || isPaused) && (
            <div className="text-center mt-4">
              <p className="text-xl font-bold mb-2">
                {gameOver ? "Game Over!" : "Paused"}
              </p>
              {gameOver && (
                <button
                  onClick={resetGame}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Play Again
                </button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TetrisGame;
