import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity({ name: "access_event_types" })
export class AccessEventType {
	@PrimaryColumn({ type: "smallint" })
	id!: number;

	@Column({ type: "text", unique: true })
	code!: string;

	@Column({ type: "text", unique: true })
	name!: string;
}