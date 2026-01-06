import pkg from 'pg';
const { Pool } = pkg;

export const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "purebita",
  password: "1504Daniela.",
  port: 5432,
});
