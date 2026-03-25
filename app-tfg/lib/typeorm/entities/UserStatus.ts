import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity({ name: "user_statuses" })
export class UserStatus {
	@PrimaryColumn({ type: "smallint" })
	id!: number;

	@Column({ type: "text", unique: true })
	code!: string;

	@Column({ type: "text", unique: true })
	name!: string;
}