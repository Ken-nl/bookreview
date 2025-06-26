const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ 
    return users.some(user => user.username == username);//returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ 
    return users.some(user => user.username == username && user.password === password);//returns boolean
//write code to check if username and password match the one we have in records.
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;
  
    // ユーザー名とパスワードが提供されているか
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
  
    // ユーザー認証
    if (authenticatedUser(username, password)) {
      // JWT トークンの生成
      const accessToken = jwt.sign({ username }, "access", { expiresIn: '1h' });
  
      // セッションにJWT保存
      req.session.authorization = {
        accessToken: accessToken
      };
  
      return res.status(200).json({ message: "Login successful" });
    } else {
      return res.status(401).json({ message: "Invalid credentials" });
    }
  });
  

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review; // クエリパラメータとしてレビュー取得
  
    // セッションからJWTとユーザー名を復元
    const token = req.session.authorization?.accessToken;
  
    if (!token) {
      return res.status(401).json({ message: "User not logged in" });
    }
  
    let username = "";
  
    try {
      const decoded = jwt.verify(token, "access");
      username = decoded.username;
    } catch (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
  
    // 書籍が存在するかチェック
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    // レビューが提供されているかチェック
    if (!review) {
      return res.status(400).json({ message: "Review content is required in query" });
    }
  
    // レビュー追加または更新
    if (!books[isbn].reviews) {
      books[isbn].reviews = {};
    }
  
    books[isbn].reviews[username] = review;
  
    return res.status(200).json({ message: "Review added/updated successfully", reviews: books[isbn].reviews });
  });
  
  regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
  
    // セッションからJWTを取得
    const token = req.session.authorization?.accessToken;
  
    if (!token) {
      return res.status(401).json({ message: "User not logged in" });
    }
  
    let username = "";
    try {
      const decoded = jwt.verify(token, "access");
      username = decoded.username;
    } catch (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
  
    // 書籍が存在するか確認
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    // ユーザーのレビューが存在するか確認
    if (books[isbn].reviews && books[isbn].reviews[username]) {
      delete books[isbn].reviews[username]; // レビューを削除
      return res.status(200).json({ message: "Review deleted successfully" });
    } else {
      return res.status(404).json({ message: "No review found for this user on this book" });
    }
  });
  
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
