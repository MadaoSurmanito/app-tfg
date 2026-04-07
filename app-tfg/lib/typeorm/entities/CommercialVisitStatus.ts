import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity({ name: "commercial_visit_statuses" })
export class CommercialVisitStatus {
	@PrimaryColumn({ type: "smallint" })
	id!: number;

	@Column({ type: "text", unique: true })
	code!: string;

	@Column({ type: "text", unique: true })
	name!: string;
}
