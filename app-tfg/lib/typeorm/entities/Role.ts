import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity({ name: "roles" })
export class Role {
	@PrimaryColumn({ type: "smallint" })
	id!: number;

	@Column({ type: "text", unique: true })
	code!: string;

	@Column({ type: "text", unique: true })
	name!: string;

	@Column({ type: "text", nullable: true })
	description!: string | null;
}
