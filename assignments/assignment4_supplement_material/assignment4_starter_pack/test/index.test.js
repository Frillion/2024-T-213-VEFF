// Import supertest for HTTP requests
const request = require("supertest");
// note that we take advantage of @jest/globals (describe, it, expect, etc.)
// API for expect can be found here: https://jestjs.io/docs/expect

const app = require("../index");

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
      expect(Object.keys(data.body).length).toBe(4);
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
  // Try to call and endpoint that does not exists

  describe("Testing For Non Existent Endpoint",() => {
    it("Example Test: should return a 404 status for a non-existent endpoint", async () => {
      const response = await request(app).get("/api/v1/nonExistentEndpoint");
      expect(response.statusCode).toBe(404);
    });
  });
});
