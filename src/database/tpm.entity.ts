import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class SavedTpm {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    token_uid: string

    @Column()
    TPM_K: number
    @Column()
    TPM_N: number
    @Column()
    TPM_L: number

    @Column()
    TPM_weights: string
}