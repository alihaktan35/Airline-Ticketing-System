import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from 'dotenv';

import { Flight } from "./entity/Flight";
import { Booking } from "./entity/Booking";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: true, // synchronize should be false in production, use migrations
  logging: false,
  entities: [Flight, Booking],
  migrations: ["src/migration/**/*.ts"],
  subscribers: ["src/subscriber/**/*.ts"],
  ssl: {
    rejectUnauthorized: false
  }
});
