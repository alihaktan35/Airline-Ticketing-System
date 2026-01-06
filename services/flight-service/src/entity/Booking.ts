import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Flight } from "./Flight";

@Entity()
export class Booking {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    flightId!: number;

    @Column()
    userId!: number;

    @Column()
    numberOfPassengers!: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date;

    @ManyToOne(() => Flight)
    @JoinColumn({ name: "flightId" })
    flight!: Flight;
}
