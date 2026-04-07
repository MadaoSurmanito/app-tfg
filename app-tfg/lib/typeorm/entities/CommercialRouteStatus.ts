import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity({ name: "commercial_route_statuses" })
export class CommercialRouteStatus {
	@PrimaryColumn({ type: "smallint" })
	id!: number;

	@Column({ type: "text", unique: true })
	code!: string;

	@Column({ type: "text", unique: true })
	name!: string;
}
