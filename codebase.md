# .aidigestignore

```
# See <https://help.github.com/articles/ignoring-files/> for more about ignoring files

# dependencies

/codebase.md
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz

# testing

/coverage

# next.js

/.next/
/out/

# production

/build

# misc

.DS_Store
\*.pem

# debug

npm-debug.log*
yarn-debug.log*
yarn-error.log\*

# local env files

.env\*.local

# vercel

.vercel

# typescript

\*.tsbuildinfo
next-env.d.ts

.env.local

.vscode/*
.next/*
actions/*
providers/*
fonts/*
context/*
scripts/*
nodemodules/*
components/Article/*
components/Blog/*
components/Contact/*
components/Hero/*
components/Navbar/*
components/Navigation/*
components/NotificationTest/*
components/private/*
components/PushNotification/*
public/*
app/(official)/*

```

# .eslintrc.json

```json
{
  "extends": "/node_modules/next/",
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "rules": {
    "react/jsx-uses-react": "off", // For React 17+
    "react/react-in-jsx-scope": "off" // For React 17+
  }
}

```

# .gitignore

```
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/codebase.md
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

.env.local



```

# app\(external)\business\project-timeline\page.jsx

```jsx
import ProjectPlanner from "@components/business/ProjectPlanner";

export default function ProjectTimeline() {
  return (
    <div>
      <ProjectPlanner />
    </div>
  );
}

```

# app\(external)\business\project-timeline\page.module.css

```css

```

# app\(external)\games\tetris\page.jsx

```jsx
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

```

# app\(external)\games\tetris\page.module.css

```css
.backbuttonContainer {
  display: flex;
  width: 100%;
  max-width: 800px;
  padding: 20px;
  /* justify-content: center; */
}
```

# app\(external)\wordpress\[slug]\loading.js

```js
import LoadingComponent from "@components/(aux)/LoadingComponent/LoadingComponent";
import styles from "@components/(aux)/LoadingComponent/loadingcomponent.module.css";

export default function Loading() {
  // Or a custom loading skeleton component
  return (
    <div className={styles.loadingContainerFullPage}>
      <LoadingComponent />
    </div>
  );
}

```

# app\(external)\wordpress\[slug]\page.jsx

```jsx
// Import the server action
import { fetchWordPressPage } from "@actions/actions";
import styles from "./page.module.css";

export default async function WordPressPage({ params }) {
  const htmlContent = await fetchWordPressPage(params.slug);

  if (!htmlContent) {
    return <div className={styles.pageContainer}>Page not found</div>;
  } else {
    // const updatedContent = htmlContent.replace(
    //   /https:\/\/wp\.carlosmarten\.com/g,
    //   `${process.env.HOST}/wordpress`
    // );
    return (
      <div>
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </div>
    );
  }
}

```

# app\(external)\wordpress\[slug]\page.module.css

```css
.pageContainer {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

```

# app\(external)\wordpress\loading.js

```js
import LoadingComponent from "@components/(aux)/LoadingComponent/LoadingComponent";
import styles from "@components/(aux)/LoadingComponent/loadingcomponent.module.css";

export default function Loading() {
  // Or a custom loading skeleton component
  return (
    <div className={styles.loadingContainerFullPage}>
      <LoadingComponent />
    </div>
  );
}

```

# app\(external)\wordpress\page.jsx

```jsx
import styles from "./page.module.css";
import { fetchWordPressPage } from "@actions/actions";
import BackButton from "@components/Article/BackButton/BackButton";

export default async function WordPress() {
  const htmlContent = await fetchWordPressPage("/");

  if (!htmlContent) {
    return <div className={styles.pageContainer}>Page not found</div>;
  } else {
    // console.log(htmlContent);
    // const updatedContent = htmlContent.replace(
    //   /https:\/\/wp\.carlosmarten\.com/g,
    //   `${process.env.HOST}/wordpress`
    // );
    return (
      <div className={styles.pageContainer}>
        <div className={styles.backbuttonContainer}>
          <BackButton />
        </div>
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </div>
    );
  }
}

```

# app\(external)\wordpress\page.module.css

```css
.pageContainer {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /* min-height: calc(100vh - 178px); */
}

.backbuttonContainer{
    display: flex;
    width: 100%;
    max-width: 800px;
    padding: 20px;
    /* justify-content: center; */
}
```

# app\favicon.ico

This is a binary file of the type: Binary

# app\globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;


:root {
  --background-dark: #1a1a1a;

  --first-color: #e8f1fa;
  --second-color: #DBE2EF;
  --third-color: #3F72AF;
  --fourth-color: #112D4E;

  /* sidebar */
  --logout-bg-color: #e63946;
  --logout-hover-color: #d62839;
  --active-link-color: #0070f3;
  --hover-link-color: #0070f3;

  --text-primary: #333333;
  --primary-color: #3F72AF;
  --hover-background: rgba(0, 0, 0, 0.05);
  --hover-background-dark: rgba(255, 255, 255, 0.1);
}



::selection {
  background: rgb(249, 255, 196)
}

.dark ::selection {
  background-color: rgb(61, 66, 12)
}

[class="dark"] {
  --background: #1d1d1d;
  --foreground: #ededed;
}

html {
  overflow-y: scroll;
  -webkit-tap-highlight-color: transparent;
}

html {
  color-scheme: light;
}




html.dark {
  color-scheme: dark;
}


html,
body {
  max-width: 100vw;
  overflow-x: hidden;
  min-height: 100vh;

}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
    Arial, sans-serif, "Apple Color Emoji",
    "Segoe UI Emoji", "Segoe UI Symbol";
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  padding: 0px !important;
  transition: color 0.3s ease, background-color 0.3s ease !important;

}

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

a {
  color: inherit;
  text-decoration: none;
}


/* Typography Wordpress Post */

ol,
ul {
  padding-left: 20px;
  /* Adjust the value as needed */
}

h3 {
  margin-top: 30px;
  margin-bottom: 10px;
}

p {
  margin-top: 15px;
  margin-bottom: 15px;
}

hr {
  margin: 30px auto;

  border: 0;
  width: 50%;
  border-top: 1px solid var(--foreground);
}

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 3.9%;
    --primary: 0 0% 9%;
    --primary-foreground: 0 0% 98%;
    --secondary: 0 0% 96.1%;
    --secondary-foreground: 0 0% 9%;
    --muted: 0 0% 96.1%;
    --muted-foreground: 0 0% 45.1%;
    --accent: 0 0% 96.1%;
    --accent-foreground: 0 0% 9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 89.8%;
    --input: 0 0% 89.8%;
    --ring: 0 0% 3.9%;
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
    --radius: 0.5rem;
  }
  .dark {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    --card: 0 0% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 0 0% 9%;
    --secondary: 0 0% 14.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 14.9%;
    --muted-foreground: 0 0% 63.9%;
    --accent: 0 0% 14.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 14.9%;
    --input: 0 0% 14.9%;
    --ring: 0 0% 83.1%;
    --chart-1: 220 70% 50%;
    --chart-2: 160 60% 45%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

# app\layout.js

```js
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "@providers/theme-provider";
import "./globals.css";

import { AudioProvider } from "@context/AudioContext";
import GlobalAudioPlayer from "@components/Article/AudioPlayer/GlobalAudioPlayer";

export const metadata = {
  title: "Carlos Marten",
  description: "Technology meets business",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  WebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Carlos Marten",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({ children }) {
  console.log("RootLayout loaded");
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body>
        <ThemeProvider>
          <AudioProvider>
            {children}
            <GlobalAudioPlayer />
          </AudioProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

```

# app\manifest.json

```json
{
  "name": "Carlos Marten",
  "short_name": "carlosmarten",
  "description": "Technology meets business",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "orientation": "any",
  "categories": ["business", "technology"],
  "prefer_related_applications": false,
  "icons": [
    {
      "src": "/favicon.ico",
      "sizes": "48x48",
      "type": "image/x-icon"
    },
    {
      "src": "/favicon-16x16.png",
      "sizes": "16x16",
      "type": "image/png"
    },
    {
      "src": "/favicon-32x32.png",
      "sizes": "32x32",
      "type": "image/png"
    },
    {
      "src": "/apple-touch-icon.png",
      "sizes": "180x180",
      "type": "image/png"
    },
    {
      "src": "/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "shortcuts": [
    {
      "name": "Blog",
      "url": "/blog",
      "icons": [
        {
          "src": "/android-chrome-192x192.png",
          "sizes": "192x192"
        }
      ]
    }
  ],
  "related_applications": [],
  "handle_links": "preferred"
}

```

# app\not-found.js

```js
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./not-found.module.css";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className={styles.notfoundcontainer}>
      <h2>Not Found: {pathname} </h2>
      <p>Could not find requested resource</p>
      <button
        className={styles.allpostsbutton}
        onClick={() => router.push("/blog")}
      >
        View all posts
      </button>
    </div>
  );
}

```

# app\not-found.module.css

```css
.notfoundcontainer{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: calc(100vh - 178px);
    width: 100%;
    gap: 20px;
}

.allpostsbutton{
    padding: 10px 20px;
    cursor: pointer;
    background-color: var(--third-color);
    color: white;
    border: none;
    border-radius: 5px;
}
.allpostsbutton:hover{
    background-color: var(--fourth-color);
}
```

# auth.js

```js
import NextAuth from "next-auth";
import Github from "next-auth/providers/github";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Github],
  pages: {
    signIn: "/login",
    error: "/unauthorized",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // restricted to admin users
      const allowedEmail = process.env.AUTH_ADMIN_EMAIL;

      if (user.email === allowedEmail) {
        return true; // Allow sign-in
      }
      return "/unauthorized"; // Reject all other users
    },
  },
});

```

# components.json

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": false,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@components",
    "utils": "@lib/utils",
    "ui": "@components/ui",
    "lib": "@lib",
    "hooks": "@hooks"
  },
  "iconLibrary": "lucide"
}

```

# components\(auth)\signin-button\signin-button.jsx

```jsx
"use client";
import { signIn } from "next-auth/react";
import { FaGithub } from "react-icons/fa";
import styles from "./signin-button.module.css";

export default function SignInButton() {
  return (
    <button
      className={styles.signinbutton}
      onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
    >
      <FaGithub className={styles.icon} /> {/* GitHub Icon */}
      Sign In with GitHub
    </button>
  );
}

```

# components\(auth)\signin-button\signin-button.module.css

```css
/* signin-button.module.css */
.signinbutton {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  font-size: 1.2rem;
  font-weight: bold;
  background-color: #24292e; /* GitHub black */
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.signinbutton:hover {
  background-color: #333;
}

.icon {
  margin-right: 8px; /* Space between the icon and text */
  font-size: 1.5rem;
}

```

# components\(auth)\signout-button\signout-button.jsx

```jsx
"use client"; // This is a client component
import { signOut } from "next-auth/react";
import styles from "@components/private/Sidebar/sidebar.module.css";

export default function SignOutButton() {
  return (
    <button
      className={styles.logout}
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      Sign Out
    </button>
  );
}

```

# components\(aux)\LoadingComponent\LoadingComponent.jsx

```jsx
import styles from "./loadingcomponent.module.css";


export default function LoadingComponent() {
  console.log("Loading component loaded");
  return (
    <div className={styles.loader}>
      <div className={styles.dot}></div>
      <div className={styles.dot}></div>
      <div className={styles.dot}></div>
    </div>
  );
}

```

# components\(aux)\LoadingComponent\loadingcomponent.module.css

```css
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
    background-color: var(--third-color);
  }
  50% {
    transform: translateY(-15px);
    background-color: var(--second-color);
  }
}

.loadingContainer{
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 178px);
}

.loadingContainerFullPage{
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
}

.loader {
  display: flex;
  justify-content: center;
  margin: 40px;
}

.dot {
  width: 12px;
  height: 12px;
  margin: 0 5px;
  border-radius: 50%;
  background-color: var(--first-color);
  animation: bounce 0.6s infinite alternate;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

```

# components\(aux)\SkeletonLoader\SkeletonLoader.jsx

```jsx
// SkeletonLoader.js
"use client";
import styles from "./SkeletonLoader.module.css"; // Adjust the path as needed
import { useTheme } from "next-themes";

const SkeletonLoader = () => {
  console.log("SkeletonLoader loaded");
  const { resolvedTheme } = useTheme();
  return (
    <div
      className={`${styles.skeletonContainer} ${
        resolvedTheme === "dark" ? styles.darkMode : styles.lightMode
      }`}
    ></div>
  );
};

export default SkeletonLoader;

```

# components\(aux)\SkeletonLoader\SkeletonLoader.module.css

```css
/* SkeletonLoader.module.css */
.skeletonContainer {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
  max-width: 700px;
  width: 90vw;
  height: 150px;
  padding: 20px;
  margin: 10px auto;
  border-radius: 4px;
}

/* .lightMode {
  background-color: #f0f0f0;
  color: #333;
} */
.lightMode.skeletonContainer {
  animation: pulseLight 1.5s infinite ease-in-out;
}

/* .darkMode {
  background-color: #333;
  color: #f0f0f0;
} */
.darkMode.skeletonContainer {
  animation: pulseDark 1.5s infinite ease-in-out;
}

/* .skeletonTitle {
  height: 20px;
  width: 80%;
  background-color: #e0e0e0;
  margin-bottom: 10px;
  border-radius: 4px;
}

.skeletonExcerpt {
  height: 16px;
  width: 100%;
  background-color: #e0e0e0;
  margin-bottom: 10px;
  border-radius: 4px;
}

.skeletonImage {
  height: 200px;
  background-color: #e0e0e0;
  border-radius: 4px;
} */

@keyframes pulseLight {
  0% {
    background-color: #e0e0e0;
  }
  50% {
    background-color: #d0d0d0;
  }
  100% {
    background-color: #e0e0e0;
  }
}

@keyframes pulseDark {
  0% {
    background-color: #333;
  }
  50% {
    background-color: #444;
  }
  100% {
    background-color: #333;
  }
}

```

# components\business\AddTaskForm.jsx

```jsx
// components/AddTaskForm.tsx
"use client";
import React from "react";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { Plus } from "lucide-react";
import { formatCurrency } from "@lib/utils";

export const AddTaskForm = ({ newTask, roles, onTaskChange, onAddTask }) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <Input
        placeholder="Task name"
        value={newTask.name}
        onChange={(e) => onTaskChange({ ...newTask, name: e.target.value })}
        className="flex-1 h-10"
      />
      <Input
        type="date"
        value={newTask.start}
        onChange={(e) => onTaskChange({ ...newTask, start: e.target.value })}
        className="w-full md:w-40 h-10"
      />
      <Input
        type="number"
        placeholder="Duration (days)"
        value={newTask.duration}
        onChange={(e) => onTaskChange({ ...newTask, duration: e.target.value })}
        className="w-full md:w-32 h-10"
      />
      <Select
        value={newTask.role}
        onValueChange={(value) => onTaskChange({ ...newTask, role: value })}
      >
        <SelectTrigger className="w-full md:w-40 h-10">
          <SelectValue placeholder="Select role" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(roles).map(([key, role]) => (
            <SelectItem key={key} value={key}>
              {role.name} ({formatCurrency(role.rate)}/hr)
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="number"
        placeholder="Hours/day"
        value={newTask.hoursPerDay}
        onChange={(e) =>
          onTaskChange({ ...newTask, hoursPerDay: parseInt(e.target.value) })
        }
        className="w-full md:w-32 h-10"
      />
      <Button onClick={onAddTask} className="flex items-center gap-2 h-10">
        <Plus className="w-4 h-4" />
        Add Task
      </Button>
    </div>
  );
};

```

# components\business\ProjectPlanner.jsx

```jsx
// ProjectPlanner.tsx
"use client";

import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@components/ui/card";
import { TimelineHeader } from "@components/business/TimelineHeader";
import { TaskItem } from "@components/business/TaskItem";
import { AddTaskForm } from "@components/business/AddTaskForm";
import { ViewModeSelector } from "@components/business/ViewModeSelector";
import { getDateRange, formatCurrency, calculateTaskCost } from "@lib/utils";

const roles = {
  developer: { name: "Developer", rate: 85 },
  designer: { name: "Designer", rate: 75 },
  researcher: { name: "Researcher", rate: 65 },
  manager: { name: "Project Manager", rate: 95 },
};

export const ProjectPlanner = () => {
  const [viewMode, setViewMode] = useState("overview");
  const [tasks, setTasks] = useState([
    {
      id: 1,
      name: "Research",
      start: "2024-12-10",
      duration: 5,
      progress: 60,
      role: "researcher",
      hoursPerDay: 6,
    },
    {
      id: 2,
      name: "Design",
      start: "2024-12-15",
      duration: 7,
      progress: 30,
      role: "designer",
      hoursPerDay: 8,
    },
  ]);

  const [newTask, setNewTask] = useState({
    name: "",
    start: "",
    duration: "",
    role: "",
    hoursPerDay: 8,
  });

  const dateRange = getDateRange(viewMode, tasks);
  const totalDays =
    Math.ceil((dateRange.end - dateRange.start) / (1000 * 60 * 60 * 24)) + 1;

  const timelineLabels = useMemo(() => {
    const labels = [];
    const currentDate = new Date(dateRange.start);
    let currentMonth = "";
    let currentYear = "";

    while (currentDate <= dateRange.end) {
      const day = currentDate.getDate();
      const month = currentDate.toLocaleDateString("default", {
        month: "short",
      });
      const year = currentDate.getFullYear();
      const isFirstOfMonth = day === 1;

      let monthLabel = "";
      let yearLabel = "";
      if (month !== currentMonth || year !== currentYear) {
        monthLabel = month;
        yearLabel = year.toString();
        currentMonth = month;
        currentYear = year;
      }

      labels.push({
        date: new Date(currentDate),
        day: day.toString(),
        month: monthLabel,
        year: yearLabel,
        isFirstOfMonth,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }
    return labels;
  }, [dateRange]);

  const totalCost = tasks.reduce((sum, task) => {
    const role = roles[task.role];
    return sum + calculateTaskCost(task, role.rate);
  }, 0);

  const addTask = () => {
    if (newTask.name && newTask.start && newTask.duration && newTask.role) {
      setTasks([
        ...tasks,
        {
          ...newTask,
          id: tasks.length + 1,
          progress: 0,
          duration: parseInt(newTask.duration),
        },
      ]);
      setNewTask({
        name: "",
        start: "",
        duration: "",
        role: "",
        hoursPerDay: 8,
      });
    }
  };

  const removeTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  return (
    <div className="p-2 md:p-6 max-w-full mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Project Timeline</CardTitle>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  Total Cost: {formatCurrency(totalCost)}
                </span>
              </div>
              <ViewModeSelector
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AddTaskForm
            newTask={newTask}
            roles={roles}
            onTaskChange={setNewTask}
            onAddTask={addTask}
          />

          {/* Gantt Chart */}
          <div className="relative border rounded-lg p-4 overflow-x-auto">
            <div className="min-w-[768px]">
              <TimelineHeader
                viewMode={viewMode}
                timelineLabels={timelineLabels}
                dateRange={dateRange}
              />

              {/* Tasks */}
              {tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  role={roles[task.role]}
                  dateRange={dateRange}
                  totalDays={totalDays}
                  onRemove={removeTask}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectPlanner;

```

# components\business\TaskItem.jsx

```jsx
// components/TaskItem.tsx

"use client";
import React from "react";
import { Button } from "@components/ui/button";
import { Trash2 } from "lucide-react";
import { formatCurrency, calculateTaskCost, getTaskPosition } from "@lib/utils";

export const TaskItem = ({ task, role, dateRange, totalDays, onRemove }) => {
  return (
    <div className="flex items-center mb-4">
      <div className="w-2/5 flex items-center gap-2 pr-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(task.id)}
          className="h-6 w-6 p-0 flex-shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
        <div className="flex flex-col min-w-0">
          <span className="truncate">{task.name}</span>
          <span className="text-xs text-gray-500 truncate">
            {role.name} - {formatCurrency(calculateTaskCost(task, role.rate))}
          </span>
        </div>
      </div>
      <div className="w-3/5 relative h-6">
        <div
          className="absolute h-full rounded-full bg-blue-600"
          style={getTaskPosition(task, dateRange, totalDays)}
        >
          <div
            className="h-full rounded-full bg-blue-400"
            style={{ width: `${task.progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

```

# components\business\TimelineHeader.jsx

```jsx
// components/TimelineHeader.tsx

"use client";
import React from "react";

export const TimelineHeader = ({ viewMode, timelineLabels, dateRange }) => {
  if (viewMode === "year") {
    return (
      <div className="flex border-b mb-4">
        <div className="w-2/5">Task</div>
        <div className="w-3/5 flex">
          {Array.from({ length: 12 }).map((_, i) => {
            const date = new Date(dateRange.start.getFullYear(), i, 1);
            return (
              <div
                key={i}
                className="flex-1 text-center border-l border-gray-200"
              >
                <div className="text-xs font-semibold">
                  {date.toLocaleDateString("default", { month: "short" })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex border-b mb-4">
      <div className="w-2/5">Task</div>
      <div className="w-3/5 flex">
        {timelineLabels.map((item, i) => (
          <div
            key={i}
            className={`flex-1 text-center ${
              item.isFirstOfMonth ? "border-l border-gray-200" : ""
            }`}
          >
            {(item.month || item.year) && (
              <div className="border-b border-gray-100 mb-1">
                {item.month && (
                  <div className="text-xs text-gray-500">{item.month}</div>
                )}
                {item.year && (
                  <div className="text-xs text-gray-400">{item.year}</div>
                )}
              </div>
            )}
            <div className="text-xs font-semibold">{item.day}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

```

# components\business\ViewModeSelector.jsx

```jsx
// components/ViewModeSelector.tsx

"use client";
import React from "react";
import { Button } from "@components/ui/button";

export const ViewModeSelector = ({ viewMode, onViewModeChange }) => {
  return (
    <div className="inline-flex rounded-md shadow-sm">
      <Button
        variant={viewMode === "overview" ? "default" : "outline"}
        className="rounded-r-none"
        onClick={() => onViewModeChange("overview")}
      >
        Overview
      </Button>
      <Button
        variant={viewMode === "month" ? "default" : "outline"}
        className="rounded-none border-l-0"
        onClick={() => onViewModeChange("month")}
      >
        Month
      </Button>
      <Button
        variant={viewMode === "year" ? "default" : "outline"}
        className="rounded-l-none border-l-0"
        onClick={() => onViewModeChange("year")}
      >
        Year
      </Button>
    </div>
  );
};

```

# components\Footer\Footer.jsx

```jsx
import Link from "next/link";
import { SiSailsdotjs } from "react-icons/si";

import styles from "./footer.module.css";

const Footer = () => {
  console.log("Footer loaded");
  return (
    <footer className={styles.footer}>
      <div className={styles.content} suppressHydrationWarning>
        <p>&copy; {new Date().getFullYear()} Carlos Marten</p>
        <nav className={styles.footerNav}>
          <Link href="/about" className={styles.link}>
            About
          </Link>
          <Link href="/contact" className={styles.link}>
            Contact
          </Link>
          <Link href="/dashboard" className={styles.link}>
            <SiSailsdotjs />
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;

```

# components\Footer\footer.module.css

```css
.footer {
  width: 100%;
  /* padding: 1rem 0; */
  /* background-color: var(--background); */
  color: var(--text);
  /* border-top: 1px solid var(--border); */
}

.content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.footerNav {
  display: flex;
  justify-content: center;
  align-items: center;
}

.link {
  margin-left: 1rem;
  color: var(--text);
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

@media (max-width: 380px) {
  .content {
    flex-direction: column;
    justify-content: center;
  }

  .footer nav {
    margin: 1rem 0;
  }
}



/* Dark mode styles are handled by CSS variables */
:global(.dark) .footer {
  /* --background: #1a1a1a; */
  /* --text: #ffffff; */
  /* --border: #333333; */
}
```

# components\OptimizedImage\optimized-image.module.css

```css
.imageWrapper {
    position: relative;
    overflow: hidden;
    background: #f6f7f8;
    transition: opacity 0.2s ease;
}

.loading {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.image {
    object-fit: cover;
    transition: transform 0.3s ease, opacity 0.2s ease;
}

@keyframes pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.7;
    }
}

/* Dark mode support */
:global(.dark) .imageWrapper {
    background: #2a2a2a;
}
```

# components\OptimizedImage\OptimizedImage.jsx

```jsx
"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./optimized-image.module.css";

const shimmer = (w, h) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f6f7f8" offset="20%" />
      <stop stop-color="#edeef1" offset="50%" />
      <stop stop-color="#f6f7f8" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#f6f7f8" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str) =>
  typeof window === "undefined"
    ? Buffer.from(str).toString("base64")
    : window.btoa(str);

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  sizes,
  priority = false,
  className,
  quality = 75,
  onLoad,
  style,
  fill = false,
}) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div
      className={`${styles.imageWrapper} ${isLoading ? styles.loading : ""} ${
        className ? className : ""
      }`}
      style={
        fill
          ? { position: "relative", width: "100%", height: "100%" }
          : undefined
      }
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        quality={quality}
        fill={fill}
        style={style}
        className={`${styles.Image} ${className ? className : ""} `}
        placeholder="blur"
        blurDataURL={`data:image/svg+xml;base64,${toBase64(
          shimmer(width || 700, height || 475)
        )}`}
        onLoad={() => {
          setIsLoading(false);
          if (onLoad) onLoad();
        }}
      />
    </div>
  );
}

```

# components\ui\button.jsx

```jsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "@lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

```

# components\ui\card.jsx

```jsx
import * as React from "react";

import { cn } from "@lib/utils";

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-card text-card-foreground shadow",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};

```

# components\ui\input.jsx

```jsx
import * as React from "react";

import { cn } from "@lib/utils";

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };

```

# components\ui\select.jsx

```jsx
"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

import { cn } from "@lib/utils";

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
);
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef(
  ({ className, ...props }, ref) => (
    <SelectPrimitive.ScrollUpButton
      ref={ref}
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronUp className="h-4 w-4" />
    </SelectPrimitive.ScrollUpButton>
  )
);
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef(
  ({ className, ...props }, ref) => (
    <SelectPrimitive.ScrollDownButton
      ref={ref}
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronDown className="h-4 w-4" />
    </SelectPrimitive.ScrollDownButton>
  )
);
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef(
  ({ className, children, position = "popper", ...props }, ref) => (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={cn(
          "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
);
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
);
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};

```

# jsconfig.json

```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@components/*": ["components/*"],
      "@actions/*": ["actions/*"],
      "@lib/*": ["lib/*"],
      "@context/*": ["context/*"],
      "@providers/*": ["providers/*"]
    }
  }
}

```

# lib\aws-config.js

```js
import { S3Client } from "@aws-sdk/client-s3";
import { SQSClient } from "@aws-sdk/client-sqs";

export const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const sqsClient = new SQSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

```

# lib\constants.js

```js
// constants.ts
export const DEFAULT_ROLES = {
  developer: { name: "Developer", rate: 85 },
  designer: { name: "Designer", rate: 75 },
  researcher: { name: "Researcher", rate: 65 },
  manager: { name: "Project Manager", rate: 95 },
};

export const DEFAULT_TASKS = [
  {
    id: 1,
    name: "Research",
    start: "2024-12-10",
    duration: 5,
    progress: 60,
    role: "researcher",
    hoursPerDay: 6,
  },
  {
    id: 2,
    name: "Design",
    start: "2024-12-15",
    duration: 7,
    progress: 30,
    role: "designer",
    hoursPerDay: 8,
  },
];

export const DEFAULT_NEW_TASK = {
  name: "",
  start: "",
  duration: "",
  role: "",
  hoursPerDay: 8,
};

```

# lib\utils.js

```js
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const getDateRange = (viewMode, tasks) => {
  const now = new Date();

  switch (viewMode) {
    case "month":
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { start: startOfMonth, end: endOfMonth };

    case "year":
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfYear = new Date(now.getFullYear(), 11, 31);
      return { start: startOfYear, end: endOfYear };

    default: // overview
      const startDates = tasks.map((task) => new Date(task.start));
      const endDates = tasks.map((task) => {
        const end = new Date(task.start);
        end.setDate(end.getDate() + parseInt(task.duration.toString()));
        return end;
      });

      if (startDates.length === 0) {
        const today = new Date();
        return {
          start: today,
          end: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000),
        };
      }

      const minDate = new Date(
        Math.min(...startDates.map((date) => date.getTime()))
      );
      const maxDate = new Date(
        Math.max(...endDates.map((date) => date.getTime()))
      );
      minDate.setDate(minDate.getDate() - 2);
      maxDate.setDate(maxDate.getDate() + 2);
      return { start: minDate, end: maxDate };
  }
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
};

export const calculateTaskCost = (task, roleRate) => {
  return roleRate * task.hoursPerDay * task.duration;
};

export const getTaskPosition = (task, dateRange, totalDays) => {
  const start = new Date(task.start);
  const end = new Date(start);
  end.setDate(end.getDate() + parseInt(task.duration.toString()));

  const left = Math.max(
    0,
    ((start.getTime() - dateRange.start.getTime()) /
      (1000 * 60 * 60 * 24) /
      totalDays) *
      100
  );
  const right = Math.min(
    100,
    ((end.getTime() - dateRange.start.getTime()) /
      (1000 * 60 * 60 * 24) /
      totalDays) *
      100
  );
  const width = right - left;

  return { left: `${left}%`, width: `${width}%` };
};

```

# middleware.js

```js
export { auth as middleware } from "./auth.js";

```

# next.config.js

```js
// next.config.js
const nextConfig = {
  reactStrictMode: false,
  env: {
    NEXT_PUBLIC_WP_URL: process.env.NEXT_PUBLIC_WP_URL,
  },

  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "", // Leave it empty unless you need a specific port
      },
      {
        protocol: "https",
        hostname: "www.carlosmarten.com",
      },
      {
        protocol: "https", // Specify the protocol (http or https)
        hostname: process.env.NEXT_PUBLIC_WP_URL, // Domain name
        port: "", // Leave this empty if there's no specific port
        pathname: "/**", // Wildcard to allow all image paths
      },
      {
        protocol: "https", // Specify the protocol (http or https)
        hostname: "rocketmedia.b-cdn.net", // Domain name
        port: "", // Leave this empty if there's no specific port
        pathname: "/**", // Wildcard to allow all image paths
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
    unoptimized: true,
  },

  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
        ],
      },
    ];
  },
  // async rewrites() {
  //   return [
  //     {
  //       source: "/wordpress/:path*",
  //       destination: `https://${process.env.NEXT_PUBLIC_WP_URL}/:path*`, // URL of your WordPress server
  //     },
  //   ];
  // },
};

// Use ES Modules syntax for exporting
export default nextConfig;

```

# package.json

```json
{
  "name": "carlosmarten",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@aws-sdk/client-s3": "^3.679.0",
    "@aws-sdk/client-sqs": "^3.679.0",
    "@aws-sdk/s3-request-presigner": "^3.679.0",
    "@radix-ui/react-select": "^2.1.2",
    "@radix-ui/react-slot": "^1.1.0",
    "@vercel/analytics": "^1.3.1",
    "@vercel/postgres": "^0.10.0",
    "@vercel/speed-insights": "^1.0.14",
    "@wordpress/api-fetch": "^7.8.0",
    "canvas-confetti": "^1.9.3",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "framer-motion": "^11.9.0",
    "lucide-react": "^0.468.0",
    "next": "^15.0.3",
    "next-auth": "^5.0.0-beta.22",
    "next-themes": "^0.3.0",
    "react": "^18",
    "react-dom": "^18",
    "react-icons": "^5.3.0",
    "shadcn-ui": "^0.9.4",
    "sharp": "^0.33.5",
    "tailwind-merge": "^2.5.5",
    "tailwindcss-animate": "^1.0.7",
    "web-push": "^3.6.7"
  },
  "devDependencies": {
    "autoprefixer": "^10.4.20",
    "eslint": "^8",
    "eslint-config-next": "14.2.13",
    "eslint-plugin-react": "^7.37.1",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.16"
  }
}

```

# postcss.config.js

```js
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;

```

# README.md

```md
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

```

# tailwind.config.js

```js
/** @type {import('tailwindcss').Config} */
export default module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

```

