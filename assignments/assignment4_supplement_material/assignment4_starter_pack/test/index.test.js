// Import supertest for HTTP requests
const request = require("supertest");
// note that we take advantage of @jest/globals (describe, it, expect, etc.)
// API for expect can be found here: https://jestjs.io/docs/expect
const app = require("../index");
const { sha256 } = require("js-sha256");

describe("Endpoint tests", () => {
  // Make sure the server is in default state when testing
  beforeEach(async () => {
    await request(app).get("/api/v1/reset");
  });

  /*---------------------------
   Write your tests below here
  ---------------------------*/
  
  /*----------------------
  | SUCCESSFUL CALLS     |
  -----------------------*/
  describe("Testing Successful Calls To Endpoint: GET /api/v1/books",() => {
    test("Excpecting Succsessful Request Of Status Code 200", async () => {
      const data = await request(app).get("/api/v1/books");
      expect(data.statusCode).toBe(200);
    });

    test("Expecting Response To Have A Defined Body", async () => {
      const data = await request(app).get("/api/v1/books");
      expect(data.body).not.toBeUndefined();
    });

    test("Expecting Response Body To Be Of Type Array", async () => {
      const data = await request(app).get("/api/v1/books");
      expect(Array.isArray(data.body)).toBe(true);
    });

    test("Expecting Respobse Array To Have Length Of 3 (the default length)", async () => {
      const data = await request(app).get("/api/v1/books");
      expect(data.body.length).toBe(3);
    });
  });

  describe("Testing Successful Calls To Endpoint: GET /api/v1/genres/:genreId/books/:bookId",() => {
    test("Excpecting Succsessful Request Of Status Code 200", async () => {
      const data = await request(app).get("/api/v1/genres/1/books/1");
      expect(data.statusCode).toBe(200);
    });

    test("Expecting Response To Have A Defined Body", async () => {
      const data = await request(app).get("/api/v1/genres/1/books/1");
      expect(data.body).not.toBeUndefined();
    }); 

    test("Expecting The Response To Contain ONLY The Right Attributes And Correct Values", async () => {
      const data = await request(app).get("/api/v1/genres/1/books/1");
      expect(data.body).toHaveProperty("id", 1);
      expect(data.body).toHaveProperty("title", "Pride and Prejudice");
      expect(data.body).toHaveProperty("author", "Jane Austin");
      expect(data.body).toHaveProperty("genreId", 1);
      expect(Object.keys(data.body)).toHaveLength(4);
    });
  });

  describe("Testing Successful Calls To Endpoint: PATCH /api/v1/genres/:genreId/books/:booksId",() => {
    new_book_data = {
      "title":"Scientist Eleanor Follows",
      "author":"Gabriel Smith",
      "genreId":2
    }

    test("Excpecting Succsessful Request Of Status Code 200", async () => {
      const data = await request(app).patch("/api/v1/genres/1/books/1").send(new_book_data);
      expect(data.statusCode).toBe(200);
    });

    test("Excpecting Fetched Book To Be The Same As The Updated Book(sent in request body)", async () => {
      const data = await request(app).patch("/api/v1/genres/1/books/1").send(new_book_data);
      const new_data = await request(app).get("/api/v1/genres/2/books/1");
      expect(new_data.body).not.toBeUndefined();
      expect(new_data.body).toHaveProperty("id", 1);
      expect(new_data.body).toHaveProperty("title", "Scientist Eleanor Follows");
      expect(new_data.body).toHaveProperty("author", "Gabriel Smith");
      expect(new_data.body).toHaveProperty("genreId", 2);
    });

    test("Expecting The Response To Contain ONLY The Right Attributes And Correct Values", async () => {
      const data = await request(app).patch("/api/v1/genres/1/books/1").send(new_book_data);
      expect(data.body).toHaveProperty("id", 1);
      expect(data.body).toHaveProperty("title", "Scientist Eleanor Follows");
      expect(data.body).toHaveProperty("author", "Gabriel Smith");
      expect(data.body).toHaveProperty("genreId", 2);
      expect(Object.keys(data.body)).toHaveLength(4);
    });
  });

  describe("Testing Successful Calls To Endpoint: POST /api/v1/genres", () => {
    correct_auth = sha256.hmac(
      "bookSecret",
      "post /api/v1/genres"
    );

    correct_genre = {
      "name":"owner" 
    }

    test("Expecting A Correct 201 Status And For The Genre To Be Added To Storage", async () => {
      const attempt = await request(app).post("/api/v1/genres").set({"Authorization":"HMAC "+correct_auth}).send(correct_genre);
      expect(attempt.statusCode).toBe(201);
      const all_genres = await request(app).get("/api/v1/genres");
      expect(all_genres.body.some((genre) => {return genre.name === correct_genre.name})).toBe(true);
    });
  });

  /*------------------
  |  FAILED CALLS    |
  ------------------*/
  describe("Testing Failed Calls To Endpoint: PATCH /api/v1/genres/:genreId/books/:bookId", () => {
    junk_data = {
      "perfectly":"without",
      "create":"mainly"
    }

    real_data = {
      "title":"successful stay",
      "author":"Eula Hunter"
    }

    test("Should Fail To Update Book If Payload(non-empty) Doesn't Have The Right Attributes", async () => {
      const attempt = await request(app).patch("/api/v1/genres/1/books/1").send(junk_data);
      expect(attempt.statusCode).toBe(400);
      expect(attempt.body).not.toBeUndefined();
      expect(attempt.body).toHaveProperty("message");
      expect(attempt.body.message).not.toBeFalsy();
    });

    test("Should Fail When An Existing Book Is Refered to With The Wrong genreId", async () => {
      const attempt = await request(app).patch("/api/v1/genres/2/books/1").send(real_data);
      expect(attempt.statusCode).toBe(404);
      expect(attempt.body).not.toBeUndefined();
      expect(attempt.body).toHaveProperty("message");
      expect(attempt.body.message).not.toBeFalsy();
    });
  });

  describe("Testing Failed Calls To Endpoint: GET /api/v1/genres/:genreId/books/:bookId", () => {
    test("Should Fail With 404 When A Book Doesn't Exist Of The Given bookId", async () => {
      const attempt = await request(app).get("/api/v1/genres/1/books/10");
      expect(attempt.statusCode).toBe(404);
      expect(attempt.body).not.toBeUndefined();
      expect(attempt.body).toHaveProperty("message");
      expect(attempt.body.message).not.toBeFalsy();
    });
  });

  describe("Testing Failed Calls To Endpoint: POST /api/v1/genres/:genreId/books", () => {
    incorrect_book = {
      "name":"railroad"
    }

    test("Should Fail Due To No Author In The Request Body", async () => {
      const attempt = await request(app).post("/api/v1/genres/2/books").send(incorrect_book)
      expect(attempt.statusCode).toBe(400);
      expect(attempt.body).not.toBeUndefined();
      expect(attempt.body).toHaveProperty("message");
      expect(attempt.body.message).not.toBeFalsy();
    });
  });

  describe("Testing Failed Calls To Endpoint: POST /api/v1/genres", () => {
    incorrect_auth = sha256.hmac(
      "bookSecret",
      "blub"
    );

    correct_genre = {
      "name":"owner" 
    }

    test("Should Fail Due To Incorrect Authentication", async () => {
      const attempt = await request(app).post("/api/v1/genres").set({"Authorization":incorrect_auth}).send(correct_genre);
      expect(attempt.statusCode).toBe(403);
      expect(attempt.body).not.toBeUndefined();
      expect(attempt.body).toHaveProperty("message");
      expect(attempt.body.message).not.toBeFalsy();
    });
  });

  /*---------------
  |   SECURITY    |
  ---------------*/
  describe("Testing Vulnerabillity With Information From Intercepted Message", () => {
    malicious_payload = {
      "name":"#9e84a1"
    }

    test("Should Succeed At Using The Intercepted Authentication To Make Modified Request", async () => {
      const attempt = await request(app).post("/api/v1/genres").set({
        "Authorization":"HMAC d5951928a797e3de418978abeb1c4f036672aa63b3241843493bfae1c0e60923",
        "Content-Type": "application/json"
      }).send(malicious_payload);
      expect(attempt.statusCode).toBe(201);
      const all_genres = await request(app).get("/api/v1/genres");
      expect(all_genres.body.some((genre) => {return genre.name === malicious_payload.name})).toBe(true);
    });
  });

  // Try to call and endpoint that does not exists

  describe("Testing For Non Existent Endpoint",() => {
    it("Example Test: should return a 404 status for a non-existent endpoint", async () => {
      const response = await request(app).get("/api/v1/nonExistentEndpoint");
      expect(response.statusCode).toBe(404);
    });
  });
});
