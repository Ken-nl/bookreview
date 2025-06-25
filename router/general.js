const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const { username, password } = req.body; // リクエストボディから取得
  
    // 入力チェック
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
  
    // ユーザーがすでに存在するかチェック
    const userExists = users.some((user) => user.username === username);
    if (userExists) {
      return res.status(409).json({ message: "Username already exists" });
    }
  
    // 新しいユーザーを追加
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
  });
  

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  const jBooks = JSON.stringify(books, null, 2);
  return res.status(200).json(jBooks);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn; // リクエストURLからISBNを取得
    const book = books[isbn];     // booksオブジェクトから該当する本を探す
  
    if (book) {
      return res.status(200).json(book); // 本が見つかった場合、詳細を返す
    } else {
      return res.status(404).json({ message: "Book not found with given ISBN" }); // 見つからない場合エラー
    }
  });
  
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const authorParam = req.params.author; // リクエストから著者名を取得
    const matchingBooks = [];
  
    // すべての本のキー（ISBN）を取得してループ
    Object.keys(books).forEach((isbn) => {
      const book = books[isbn];
      if (book.author.toLowerCase() === authorParam.toLowerCase()) {
        // 著者名が一致した場合、結果リストに追加
        matchingBooks.push({ isbn, ...book });
      }
    });
  
    if (matchingBooks.length > 0) {
      return res.status(200).json(matchingBooks);
    } else {
      return res.status(404).json({ message: "No books found by this author" });
    }
  });
  

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const titleParam = req.params.title.toLowerCase(); // リクエストされたタイトル（小文字化）
    const matchingBooks = [];
  
    // すべての本をループしてタイトル一致をチェック
    Object.keys(books).forEach((isbn) => {
      const book = books[isbn];
      if (book.title.toLowerCase() === titleParam) {
        matchingBooks.push({ isbn, ...book });
      }
    });
  
    if (matchingBooks.length > 0) {
      return res.status(200).json(matchingBooks);
    } else {
      return res.status(404).json({ message: "No books found with this title" });
    }
  });
  

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn; // リクエストURLからISBNを取得
    const book = books[isbn];     // booksオブジェクトから該当の本を取得
  
    if (book) {
      return res.status(200).json(book.reviews); // 該当本のreviewsを返す
    } else {
      return res.status(404).json({ message: "Book not found with given ISBN" });
    }
  });
  

module.exports.general = public_users;
