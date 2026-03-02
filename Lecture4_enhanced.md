## Slide 1 – Building Backend Applications with Node.js, Express & Databases

- **Course**: COSC2956 – Internet Tools  
- **Topic**: Backend with Node.js, Express, SQL & NoSQL  
- **Goal**: From simple HTTP server to secure authentication with tokens  

---

## Slide 2 – Learning Objectives

By the end of this lecture, you will be able to:

- **Create** a backend using Node.js and Express  
- **Connect** to SQL (PostgreSQL) and NoSQL (MongoDB)  
- **Compare** SQL vs NoSQL from a backend perspective  
- **Implement CRUD** (Create, Read, Update, Delete)  
- **Build authentication** (register + login)  
- **Generate & use JWT tokens** to protect routes  

---

## Slide 3 – What is the Backend?

The **backend** is the **server-side** part of a web application. It:

- Runs on a **server**  
- Receives **HTTP requests** from the frontend or mobile apps  
- Applies the **business logic**  
- Interacts with a **database** to store or retrieve data  
- Sends back a **JSON response** to the client  

Short Express example:

```js
import express from "express";

const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
```

---

## Slide 4 – Backend Responsibilities

The backend is responsible for:

- **Authentication** (Register/Login)  
- **Storing and retrieving data** (CRUD)  
- **Security and permissions** (who can access what)  
- **Data validation** (check and clean input data)  
- **Business logic** (rules of the app)  
- **API communication** (JSON over HTTP)  

---

## Slide 5 – Request Flow: Frontend → Backend → Database

High‑level flow:

- **Frontend** (Browser / React / Mobile App)  
  - Sends an **HTTP request** (e.g. `GET /students`, `POST /auth/login`)  
- **Backend (Express server)**  
  - Receives request, validates input  
  - Runs **business logic**  
  - Sends a **query** to the database  
- **Database (SQL / NoSQL)**  
  - Executes query and returns a **result**  
- **Backend**  
  - Formats result as **JSON**  
- **Frontend**  
  - Renders JSON in the UI  

> The frontend does **not** talk directly to the database. The backend is always the middle layer.

---

## Slide 6 – Why We Need a Database

A backend **without a database** can’t remember anything.

A database allows the backend to:

- **Persist data** across restarts  
- Store **user accounts**  
- Save **passwords securely** (hashed, not plain text)  
- Keep application data (posts, products, orders, etc.)  
- Quickly **retrieve information** using queries  

Example insert:

```js
await pool.query(
  `INSERT INTO users (username, password_hash) VALUES ($1, $2);`,
  [username, passwordHash]
);
```

---

## Slide 7 – Two Types of Databases

**SQL (PostgreSQL)**

- Uses **tables** with rows and columns  
- **Fixed schema** (defined ahead of time)  
- Strong relationships using **JOINs**  
- Great for highly **structured**, relational data  

**NoSQL (MongoDB)**

- Uses **JSON-like documents**  
- **Flexible schema** (fields can vary)  
- Easy to store **nested data**  
- Good for **fast development** and evolving requirements  

---

## Slide 8 – Connecting the Backend to Databases (Node.js)

**MongoDB (NoSQL)**

- Install MongoDB & `mongoose`  
- Add `MONGO_URI` in `.env`  
- Connect using:

```js
import mongoose from "mongoose";
mongoose.connect(process.env.MONGO_URI);
```

**PostgreSQL (SQL)**

- Install PostgreSQL & `pg`  
- Configure `PGHOST`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`, `PGPORT` in `.env`  
- Create a connection pool and test with `SELECT NOW()`  

```js
import dotenv from "dotenv";
import pg from "pg";

dotenv.config();
const { Pool } = pg;

export const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});
```

---

## Slide 9 – PostgreSQL vs MongoDB (Backend Perspective)

**MongoDB (NoSQL)**

- Database and collections often created on first insert  
- Uses **JSON/BSON documents**  
- Connected via `mongodb://` URI string  
- A simple `.connect()` is usually enough to know it’s working  

**PostgreSQL (SQL)**

- Database is **explicitly created** by the developer  
- Requires credentials (user + password)  
- Uses **structured tables** with SQL schema  
- Queries are written in **SQL**  
- We often test connection with `SELECT NOW();`  

---

## Slide 10 – PostgreSQL Schema: `users` Table

To support authentication, we create a `users` table:

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

- `id`: unique ID for each user  
- `username`: must be unique  
- `password_hash`: hashed password (never plain text)  
- `created_at`: timestamp when the account was created  

---

## Slide 11 – CRUD Operations (Concept + HTTP)

**CRUD** stands for:

- **Create** → Add new data  
- **Read** → Retrieve data  
- **Update** → Modify existing data  
- **Delete** → Remove data  

Examples for `students`:

- **Create Student** → `POST /students`  
- **Read All Students** → `GET /students`  
- **Read Student by ID** → `GET /students/:id`  
- **Update Student** → `PUT /students/:id`  
- **Delete Student** → `DELETE /students/:id`  

---

## Slide 12 – CRUD with cURL (Students Example)

**Create Student**

```bash
curl -X POST http://localhost:3001/students \
  -H "Content-Type: application/json" \
  -d '{"username":"john","password":"1234"}'
```

**Read All Students**

```bash
curl http://localhost:3001/students
```

**Read Student by ID**

```bash
curl http://localhost:3001/students/1
```

**Update Student**

```bash
curl -X PUT http://localhost:3001/students/1 \
  -H "Content-Type: application/json" \
  -d '{"username":"Sam"}'
```

**Delete Student**

```bash
curl -X DELETE http://localhost:3001/students/1
```

---

## Slide 13 – What is Authentication?

**Authentication** = verifying **who** the user is.

Typical flow:

- **Register**
  - User sends `username` + `password`
  - Backend hashes the password and stores it in the `users` table  
- **Login**
  - User sends `username` + `password`
  - Backend verifies the password against the stored hash  
- On success:
  - Backend generates a **JWT token** and returns it to the client  

---

## Slide 14 – Password Security with bcrypt

**Never store plain text passwords.**

Instead:

- Use **bcrypt** to hash the password when registering  
- Store only the **hash** in the database  
- During login, compare the plain password with the hash  

Example:

```js
import bcrypt from "bcrypt";

// Register
const passwordHash = await bcrypt.hash(password, 10);
await pool.query(
  `INSERT INTO users (username, password_hash) VALUES ($1, $2);`,
  [username, passwordHash]
);

// Login
const ok = await bcrypt.compare(password, user.password_hash);
if (!ok) return res.status(401).json({ error: "Invalid credentials" });
```

---

## Slide 15 – JSON Web Tokens (JWT) Basics

**JWT (JSON Web Token)**:

- A compact, signed string representing a **JSON payload**  
- Contains:
  - `sub`: subject (user ID)  
  - `username`: optional username  
  - `iat`, `exp`: issued at and expiry times  
- Signed with a **secret key** (e.g. `JWT_SECRET`)  
- Client stores it (e.g. in `localStorage`)  
- Client sends it in `Authorization: Bearer <token>` header  

Example of creating a token:

```js
import jwt from "jsonwebtoken";

function signToken(userId, username) {
  return jwt.sign(
    { sub: userId, username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
  );
}
```

---

## Slide 16 – Register & Login Routes (Express + PostgreSQL)

**Register – POST `/auth/register`**

```js
authRouter.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "username and password are required" });

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (username, password_hash)
       VALUES ($1, $2)
       RETURNING id, username, created_at;`,
      [username, passwordHash]
    );

    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    if (err.code === "23505")
      return res.status(409).json({ error: "username already exists" });
    res.status(500).json({ error: err.message });
  }
});
```

**Login – POST `/auth/login`**

```js
authRouter.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "username and password are required" });

    const result = await pool.query(
      `SELECT id, username, password_hash FROM users WHERE username = $1;`,
      [username]
    );

    if (result.rows.length === 0)
      return res.status(401).json({ error: "Invalid credentials" });

    const user = result.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken(user.id, user.username);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

---

## Slide 17 – Protecting Routes with Middleware (`requireAuth`)

We protect routes using **JWT middleware**:

```js
import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "Missing Authorization header" });

  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token)
    return res.status(401).json({ error: "Invalid Authorization format" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { sub, username, iat, exp }
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
```

Example protected route:

```js
app.get("/me", requireAuth, (req, res) => {
  res.json({ userId: req.user.sub, username: req.user.username });
});
```

---

## Slide 18 – Summary

- Backend = server-side logic + database access  
- Databases give us **persistence** and **fast queries**  
- SQL vs NoSQL: structure vs flexibility  
- CRUD = core pattern for data access  
- Authentication needs **hashed passwords** and **tokens**  
- JWT + middleware (`requireAuth`) let us protect routes cleanly  

