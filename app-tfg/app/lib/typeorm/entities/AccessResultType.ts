import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity({ name: "access_result_types" })
export class AccessResultType {
	@PrimaryColumn({ type: "smallint" })
	id!: number;

	@Column({ type: "text", unique: true })
	code!: string;

	@Column({ type: "text", unique: true })
	name!: string;
}