# React Knowledge Base (Interview-Oriented, RAG Optimized)

Structured Knowledge Base for AI Interview System  
Difficulty Tagged: Easy / Medium / Hard

---

# 1. Fundamentals

---

## 1.1 What is React JS

[Difficulty: Easy]  
[Topic: Fundamentals]  
[Type: Conceptual]

### Topic Explanation
React is a JavaScript library for building user interfaces using a component-based architecture and declarative programming.

### Interview Question
What is React JS?

### Model Answer
React is a declarative, component-based JavaScript library for building user interfaces. It efficiently updates the DOM using a Virtual DOM mechanism.

---

## 1.2 JSX, Babel, and Webpack

[Difficulty: Easy]  
[Topic: JSX & Tooling]  
[Type: Conceptual]

### Interview Question
What is JSX and how is it converted into JavaScript?

### Model Answer
JSX is a syntax extension that allows writing HTML-like syntax inside JavaScript. Babel transpiles JSX into React.createElement calls, and Webpack bundles the modules for deployment.

---

## 1.3 Components (Functional vs Class)

[Difficulty: Easy]  
[Topic: Components]  
[Type: Conceptual]

### Interview Question
Difference between functional and class components?

### Model Answer
Functional components are JavaScript functions that return JSX and use Hooks. Class components use ES6 classes and lifecycle methods. Modern React prefers functional components.

---

## 1.4 Props and State

[Difficulty: Easy]  
[Topic: Props & State]  
[Type: Conceptual]

### Interview Questions
- What are props?
- What is state?
- Difference between props and state?

### Model Answer
Props are immutable inputs passed from parent to child.  
State is mutable data managed within a component.  
State updates trigger re-renders, props do not.

---

## 1.5 Event Handling & Conditional Rendering

[Difficulty: Easy]  
[Topic: Rendering Logic]  
[Type: Practical]

### Interview Questions
- What is Synthetic Event in React?
- What are different ways to perform conditional rendering?

### Model Answer
React uses Synthetic Events for cross-browser compatibility.  
Conditional rendering can be done using if statements, ternary operators, logical &&, or switch cases.

---

## 1.6 Lists and Keys

[Difficulty: Medium]  
[Topic: Lists & Reconciliation]  
[Type: Conceptual]

### Interview Question
Why are keys important in React?

### Model Answer
Keys uniquely identify list elements during reconciliation, helping React efficiently update the DOM.

---

## 1.7 Virtual DOM, DOM, and Reconciliation

[Difficulty: Medium]  
[Topic: Internal Working]  
[Type: Architecture]

### Interview Questions
- What is the difference between DOM and Virtual DOM?
- How does reconciliation work?

### Model Answer
The DOM is the real browser structure.  
The Virtual DOM is a lightweight in-memory copy.  
React compares old and new Virtual DOM trees using diffing (O(n)) and updates only changed nodes.

---

## 1.8 Controlled vs Uncontrolled Components

[Difficulty: Medium]  
[Topic: Forms]  
[Type: Practical]

### Interview Question
What is the difference between controlled and uncontrolled components?

### Model Answer
Controlled components use React state to manage form inputs.  
Uncontrolled components use refs to access DOM values.

---

## 1.9 Lifecycle Methods

[Difficulty: Medium]  
[Topic: Lifecycle]  
[Type: Conceptual]

### Interview Question
Explain lifecycle methods in React.

### Model Answer
Class components have mounting, updating, and unmounting lifecycle methods.  
In functional components, useEffect replaces lifecycle behavior.

---

# 2. Hooks

---

## 2.1 Hooks Introduction

[Difficulty: Medium]  
[Topic: Hooks]  
[Type: Conceptual]

### Interview Question
What are Hooks and why were they introduced?

### Model Answer
Hooks allow functional components to use state and lifecycle features without class components.

---

## 2.2 useState

[Difficulty: Easy]  
[Topic: Hooks]  
[Type: Conceptual + Practical]

### Interview Question
How does useState work?

### Model Answer
useState returns a state variable and a setter function. Updating state triggers re-render and may be batched.

---

## 2.3 useEffect

[Difficulty: Medium]  
[Topic: Hooks]  
[Type: Conceptual]

### Interview Question
What is useEffect and what causes infinite loops?

### Model Answer
useEffect runs side effects after render. Incorrect dependency arrays or improper state updates cause infinite loops.

---

## 2.4 useRef

[Difficulty: Medium]  
[Topic: Hooks]  
[Type: Practical]

### Interview Question
Difference between useRef and useState?

### Model Answer
useState triggers re-render when updated. useRef does not trigger re-render.

---

## 2.5 useContext

[Difficulty: Medium]  
[Topic: Context API]  
[Type: State Management]

### Interview Question
When should you use Context API?

### Model Answer
For sharing global data such as theme, authentication, or language without prop drilling.

---

## 2.6 useReducer

[Difficulty: Hard]  
[Topic: State Management]  
[Type: Advanced]

### Interview Question
When is useReducer preferred over useState?

### Model Answer
When managing complex state transitions or multiple related state values.

---

## 2.7 useMemo vs useCallback

[Difficulty: Hard]  
[Topic: Performance Optimization]  
[Type: Optimization]

### Interview Question
Difference between useMemo and useCallback?

### Model Answer
useMemo memoizes computed values.  
useCallback memoizes functions.  
Both prevent unnecessary recalculations or re-renders.

---

## 2.8 Rules of Hooks

[Difficulty: Medium]  
[Topic: Hooks Rules]  
[Type: Conceptual]

### Interview Question
What are the rules of hooks?

### Model Answer
Hooks must be called at the top level of functional components and not inside loops or conditions.

---

## 2.9 Custom Hooks

[Difficulty: Medium]  
[Topic: Custom Hooks]  
[Type: Practical]

### Interview Question
What are custom hooks?

### Model Answer
Custom hooks are reusable functions that encapsulate logic using built-in hooks.

---

# 3. State Management & Redux

---

## 3.1 State Management

[Difficulty: Medium]  
[Topic: Architecture]  
[Type: Conceptual]

### Interview Question
What is the difference between Local and Global State?

### Model Answer
Local state is managed within a component.  
Global state is shared across multiple components.

---

## 3.2 Redux Basics

[Difficulty: Medium]  
[Topic: Redux]  
[Type: Conceptual]

### Interview Questions
- What is Redux?
- What are action, reducer, and store?

### Model Answer
Redux is a predictable state container.  
Actions describe events.  
Reducers update state.  
Store holds the global state.

---

## 3.3 Middleware, Thunk, and Saga

[Difficulty: Hard]  
[Topic: Async State Management]  
[Type: Advanced]

### Interview Question
Difference between Redux Thunk and Redux Saga?

### Model Answer
Thunk uses functions for async logic.  
Saga uses generator functions for complex side-effect management.

---

# 4. Advanced Topics

---

## 4.1 Error Boundaries

[Difficulty: Hard]  
[Topic: Error Handling]  
[Type: Advanced]

### Interview Question
Why can’t functional components act as error boundaries?

### Model Answer
Error boundaries require lifecycle methods like componentDidCatch, available only in class components.

---

## 4.2 Portals & Fragments

[Difficulty: Medium]  
[Topic: Rendering Patterns]  
[Type: Conceptual]

### Model Answer
Portals render children outside the parent DOM hierarchy.  
Fragments group elements without adding extra DOM nodes.

---

## 4.3 React Router

[Difficulty: Medium]  
[Topic: Routing]  
[Type: Practical]

### Interview Question
How does client-side routing differ from server-side routing?

### Model Answer
Client-side routing updates UI without full page reload.  
Server-side routing loads new pages from the server.

---

## 4.4 Server-Side Rendering (SSR)

[Difficulty: Hard]  
[Topic: SSR]  
[Type: Architecture]

### Interview Question
What are the benefits of SSR?

### Model Answer
SSR improves SEO and initial load performance by sending pre-rendered HTML.

---

## 4.5 Performance Optimization

[Difficulty: Hard]  
[Topic: Optimization]  
[Type: Advanced]

### Interview Question
How do you optimize a React app?

### Model Answer
Use React.memo, useMemo, useCallback, code splitting, lazy loading, proper keys, and profiling tools.

---

## 4.6 Testing

[Difficulty: Medium]  
[Topic: Testing]  
[Type: Ecosystem]

### Interview Question
What is the philosophy of React Testing Library?

### Model Answer
Test components based on user behavior instead of implementation details.

---

## 4.7 Environment & Defaults

[Difficulty: Easy]  
[Topic: Environment]  
[Type: Practical]

### Interview Question
What is the default localhost port in React?

### Model Answer
Default port is 3000 and can be changed using environment variables.

---

# End of React Knowledge Base