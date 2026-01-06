import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Flight {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  fromCity!: string;

  @Column()
  toCity!: string;

  @Column()
  flightDate!: Date;

  @Column()
  flightCode!: string;

  @Column("decimal", { precision: 10, scale: 2 })
  price!: number;

  @Column()
  duration!: number; // in minutes

  @Column()
  capacity!: number;
}
