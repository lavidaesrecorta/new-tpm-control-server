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
    start_time: string
    @Column()
    end_time: string

    @Column()
    TPM_K: number
    @Column()
    TPM_N: number
    @Column()
    TPM_L: number

}