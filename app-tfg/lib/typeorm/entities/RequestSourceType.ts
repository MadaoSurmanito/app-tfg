import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity({ name: "request_source_types" })
export class RequestSourceType {
	@PrimaryColumn({ type: "smallint" })
	id!: number;

	@Column({ type: "text", unique: true })
	code!: string;

	@Column({ type: "text", unique: true })
	name!: string;
}