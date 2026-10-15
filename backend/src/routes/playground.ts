import { Router } from "express";

const router = Router();

const playgroundChallenges = [
  {
    id: "pg1",
    title: "Glassmorphism Card",
    description: "Build a frosted-glass card with backdrop blur and gradient overlay.",
    starterHtml: `<div class="card">
  <h2>Welcome</h2>
  <p>A glass card</p>
  <button class="btn">Explore</button>
</div>`,
    starterCss: `.card {
  /* Add glassmorphism styles */
  padding: 2rem;
  border-radius: 16px;
}

.btn {
  padding: 8px 20px;
  border-radius: 8px;
}`,
    starterJs: `const card = document.querySelector('.card');
// Add hover effects`,
    tests: [
      { name: "Has backdrop-filter", expected: "blur", check: "backdrop-filter" },
      { name: "Has border-radius", expected: "16px", check: "border-radius" },
    ],
  },
  {
    id: "pg2",
    title: "Interactive Counter",
    description: "Create a counter with increment, decrement, and reset buttons.",
    starterHtml: `<div class="counter">
  <button id="dec">-</button>
  <span id="value">0</span>
  <button id="inc">+</button>
</div>
<button id="reset">Reset</button>`,
    starterCss: `.counter {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
}

#value {
  font-size: 2rem;
  font-weight: bold;
}`,
    starterJs: `let count = 0;
const value = document.getElementById('value');

document.getElementById('inc').onclick = () => {
  // increment
};`,
    tests: [
      { name: "Counter exists", expected: "true", check: "getElementById" },
      { name: "Click handler", expected: "true", check: "onclick" },
    ],
  },
  {
    id: "pg3",
    title: "Dynamic Todo App",
    description: "Build a todo list with add, complete, and delete functionality.",
    starterHtml: `<div class="todo-app">
  <h1>Todos</h1>
  <input id="input" placeholder="Add task..." />
  <button id="add">Add</button>
  <ul id="list"></ul>
</div>`,
    starterCss: `.todo-app {
  max-width: 400px;
  margin: 0 auto;
}

li {
  padding: 8px;
  margin: 4px 0;
  border-radius: 6px;
  background: #f5f5f5;
  cursor: pointer;
}

li.done {
  text-decoration: line-through;
  opacity: 0.6;
}`,
    starterJs: `const input = document.getElementById('input');
const list = document.getElementById('list');

document.getElementById('add').onclick = () => {
  const text = input.value.trim();
  if (!text) return;
  // create and append li
};`,
    tests: [
      { name: "Input accessed", expected: "true", check: "getElementById" },
      { name: "Add handler", expected: "true", check: "onclick" },
    ],
  },
];

router.get("/playground/challenges", (_req, res) => {
  res.json(playgroundChallenges);
});

export default router;
