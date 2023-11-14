import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class SensorData {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    token_uid: string

    @Column()
    time: string

    @Column()
    temperature: number

    @Column()
    hall_sensor: number

}