import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class PendingChallenge {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    token_uid: string

    @Column()
    first: number

    @Column()
    second: number
}