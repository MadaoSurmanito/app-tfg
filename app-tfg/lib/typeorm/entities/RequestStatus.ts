import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity({ name: "request_statuses" })
export class RequestStatus {
	@PrimaryColumn({ type: "smallint" })
	id!: number;

	@Column({ type: "text", unique: true })
	code!: string;

	@Column({ type: "text", unique: true })
	name!: string;
}
