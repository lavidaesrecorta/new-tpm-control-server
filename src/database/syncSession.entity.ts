import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class SyncSession {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    token_uid: string
    @Column()
    status: string

    @Column()
    start_time: number
    @Column()
    end_time: number

    @Column()
    TPM_K: number
    @Column()
    TPM_N: number
    @Column()
    TPM_L: number

}