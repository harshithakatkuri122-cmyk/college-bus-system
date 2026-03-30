const request = require("supertest");
const jwt = require("jsonwebtoken");

const mockDb = {
  execute: jest.fn(),
  getConnection: jest.fn(),
};

jest.mock("../../src/config/db", () => mockDb);

describe("Transport APIs", () => {
  const secret = "test-secret";

  beforeAll(() => {
    process.env.JWT_SECRET = secret;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function auth(role = "faculty", id = 101) {
    const token = jwt.sign({ id, role }, secret);
    return `Bearer ${token}`;
  }

  function createConnectionForBooking({ restricted = false } = {}) {
    return {
      beginTransaction: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
      commit: jest.fn().mockResolvedValue(undefined),
      release: jest.fn(),
      query: jest.fn(),
      execute: jest.fn(async (sql, params) => {
        if (sql.includes("FROM buses") && sql.includes("FOR UPDATE")) {
          return [[{ id: 1, bus_no: "B-12", route_no: 22 }], []];
        }

        if (sql.includes("FROM students WHERE roll_no") && sql.includes("FOR UPDATE")) {
          return [[{ roll_no: params[0], seat_no: null, gender: "Male" }], []];
        }

        if (sql.includes("FROM seats") && sql.includes("AND seat_no = ?") && sql.includes("FOR UPDATE") && !sql.includes("JOIN students")) {
          return [[{ seat_no: Number(params[1]), is_booked: 0 }], []];
        }

        if (sql.includes("SELECT st.gender") && sql.includes("JOIN seats")) {
          return [restricted ? [{ gender: "Female" }] : [], []];
        }

        if (sql.includes("UPDATE seats")) {
          return [{ affectedRows: 1 }, []];
        }

        if (sql.includes("UPDATE students")) {
          return [{ affectedRows: 1 }, []];
        }

        if (sql.includes("SELECT route_name FROM routes")) {
          return [[{ route_name: "Miyapur - CBIT" }], []];
        }

        return [[], []];
      }),
    };
  }

  it("rejects booking when adjacent seat is restricted by female occupant", async () => {
    const connection = createConnectionForBooking({ restricted: true });
    mockDb.getConnection.mockResolvedValue(connection);

    const app = require("../../src/app");

    const res = await request(app)
      .post("/api/book-seat")
      .set("Authorization", auth("faculty"))
      .send({ roll_no: "22CSE001", bus_no: "B-12", seat_no: 12 });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Adjacent seat restricted/i);
    expect(connection.rollback).toHaveBeenCalled();
  });

  it("books seat successfully and returns qr_code", async () => {
    const connection = createConnectionForBooking({ restricted: false });
    mockDb.getConnection.mockResolvedValue(connection);

    const app = require("../../src/app");

    const res = await request(app)
      .post("/api/book-seat")
      .set("Authorization", auth("faculty"))
      .send({ roll_no: "22CSE001", bus_no: "B-12", seat_no: 12 });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Booking successful/i);
    expect(typeof res.body.qr_code).toBe("string");
    expect(res.body.qr_code.startsWith("data:image/png;base64,")).toBe(true);
    expect(connection.commit).toHaveBeenCalled();
  });

  it("sends notice to route users", async () => {
    const connection = {
      beginTransaction: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
      commit: jest.fn().mockResolvedValue(undefined),
      release: jest.fn(),
      query: jest.fn().mockResolvedValue([{ affectedRows: 2 }, []]),
      execute: jest.fn(async (sql) => {
        if (sql.includes("INSERT INTO notices")) {
          return [{ insertId: 77 }, []];
        }

        if (sql.includes("SELECT user_id FROM students WHERE route = ?")) {
          return [[{ user_id: 201 }, { user_id: 202 }], []];
        }

        return [[], []];
      }),
    };

    mockDb.getConnection.mockResolvedValue(connection);

    const app = require("../../src/app");

    const res = await request(app)
      .post("/api/notice")
      .set("Authorization", auth("faculty", 501))
      .send({
        title: "Route Delay",
        message: "Bus delayed by 10 mins",
        target_type: "route",
        route_no: 22,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.notice_id).toBe(77);
    expect(res.body.recipients_count).toBe(2);
  });

  it("fetches notices for user", async () => {
    mockDb.execute.mockResolvedValueOnce([
      [
        {
          id: 9,
          title: "Maintenance",
          message: "Bus service paused tomorrow",
          target_type: "all",
          route_no: null,
          created_by: 501,
          created_at: "2026-03-30T00:00:00.000Z",
          is_read: 0,
        },
      ],
      [],
    ]);

    const app = require("../../src/app");

    const res = await request(app)
      .get("/api/notices/101")
      .set("Authorization", auth("faculty", 501));

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].title).toBe("Maintenance");
  });
});
