# Tech Quest: The Data Structures Adventure

**Tech Quest: The Data Structures Adventure** is an educational board game where players compete across an 11×11 perimeter board while the real, underlying computer science data structures operating behind the game are visualized live in real time.

Instead of disconnected diagrams or static mock prototypes, every movement, turn rotation, token collection, tactical power-up, algorithmic challenge, and undo operation directly mutates real JavaScript data structure instances in memory.

---

## 🎮 Game Features & Mechanics

1. **Board Architecture (11×11 Outer Perimeter – Exactly 40 Cells Clockwise)**:
   - **Top row**: Cells 1–11 (left to right)
   - **Right column**: Cells 12–21 (top to bottom)
   - **Bottom row**: Cells 22–31 (right to left)
   - **Left column**: Cells 32–40 (bottom to top)
   - **Strict Cell Categorization (Programmatically Validated)**:
     - **13 Token cells**: 2, 5, 8, 12, 15, 17, 20, 23, 26, 30, 33, 37, 39
     - **6 Power-up cells**: 4, 11, 18, 25, 32, 38
     - **5 Challenge cells**: 7, 14, 21, 28, 35
     - **3 Penalty cells**: 10, 24, 34
     - **12 Safe cells**: 1, 3, 6, 9, 13, 16, 19, 22, 27, 29, 31, 36
     - **1 Finish cell**: 40

2. **Dice & Bounce-Back Movement**:
   - 6-sided animated dice.
   - Exact landing on cell 40 completes the quest.
   - If a player's movement exceeds cell 40, they bounce backwards from 40 (e.g. current 38 + roll 5 = 39 → 40 → 39 → 38 → 37).

3. **Game Modes**:
   - **Mode A: Local Multiplayer**: 2, 3, or 4 human players on the same device with custom names, tokens, and distinct colors.
   - **Mode B: Play Against Computer**: 1 human + 1, 2, or 3 AI opponents with selectable difficulty (**Easy**, **Medium**, **Hard**). AI opponents execute identical game rules and data structure mutations via the central GameEngine.

4. **8 Real Data Structure Implementations**:
   - **Movement History (`DoublyLinkedList`)**: Bi-directional node chain with `prev` and `next` pointers, `append()`, and O(1) `removeLast()`.
   - **Turn Management (`CircularQueue`)**: Fixed-capacity cyclic ring buffer with modulo pointer math (`(rear + 1) % capacity`), `FRONT` and `REAR` pointers.
   - **Token Collection (`TokenLinkedList` + `TokenHashSet`)**: Combines a singly linked list for chronological ordering with an explicit bucketed hash set for O(1) duplicate prevention.
   - **Undo State Management (`Stack`)**: Last-In-First-Out (LIFO) stack storing full atomic snapshots of game state for granular, consecutive undos.
   - **Power-up Management (`HashMap` + `Queue` + `Set`)**: Shared supply HashMap (initially 3 copies of each of the 6 power-ups), player inventory sets, and a FIFO used power-ups queue.
   - **Challenge Management (`ChallengeQueue`)**: FIFO task queue managing algorithmic questions, retry attempts, and completion statuses.
   - **Game History & Replay (`EventList` + isolated `ReplayEngine`)**: Chronological event logging with search, action filtering, and an isolated step-by-step replayer that never mutates live game state.
   - **Score Management (`ScoreHashMap`)**: Key-value map of Player ID → Score with real-time tournament ranking computations.

5. **Live Operation Explanation Panel**:
   - Live ticker displaying Operation Name, Data Structure Name, Before State, Action Performed, After State, Element Count, and an educational algorithmic explanation.

6. **Isolated Educational Sandbox**:
   - Safe experimentation sandbox allowing students to test `push`, `pop`, `enqueue`, `dequeue`, and node manipulations without altering live game state.

---

## 🛠️ Technology Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 (Dark mode, custom theme)
- **Icons**: Lucide React
- **Audio**: Web Audio API (procedural synthesis, zero external assets)
- **Celebration**: canvas-confetti
- **Storage**: LocalStorage automatic state persistence and recovery

---

## 🚀 Setup & Installation Instructions

### Prerequisites
- Node.js (version 18 or later recommended)
- npm or yarn

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
The application will start on `http://localhost:3000`.

### 3. Build for Production
```bash
npm run build
```
This compiles TypeScript and generates optimized static production assets in the `dist/` directory.

### 4. Run Verification Tests
Click the **VERIFY TESTS** button in the top navigation bar to run all 20 specification compliance tests in real-time.

---

## 📦 Deployment & GitHub Preparation

### Push to GitHub
If pushing manually to a new repository named `tech-quest-data-structures-adventure`:
```bash
git init
git add .
git commit -m "feat: complete Tech Quest Data Structures Adventure game"
git branch -M main
git remote add origin https://github.com/<your-username>/tech-quest-data-structures-adventure.git
git push -u origin main
```

### Deploy to Production (Vercel / Cloudflare Pages / Netlify / Cloud Run)
- **Vercel**: Run `npx vercel` or connect the GitHub repository.
- **Netlify**: Set build command to `npm run build` and publish directory to `dist`.
- **Cloud Run / Docker**: The build output in `dist` can be served with any static web server (e.g. `npx serve dist -p 3000`).
