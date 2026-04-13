import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	ManyToOne,
	JoinColumn,
	Index,
} from "typeorm";
import type { Relation } from "typeorm";

import { Commercial } from "./Commercial";
import { CommercialRouteStatus } from "./CommercialRouteStatus";

@Entity("commercial_routes")
@Index("commercial_routes_commercial_id_index", ["commercial_id"])
@Index("commercial_routes_route_date_index", ["route_date"])
@Index("commercial_routes_status_id_index", ["status_id"])
export class CommercialRoute {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Column({ type: "uuid" })
	commercial_id!: string;

	@Column({ type: "date" })
	route_date!: string;

	@Column({ type: "text" })
	name!: string;

	@Column({ type: "smallint" })
	status_id!: number;

	@ManyToOne(() => Commercial, { onDelete: "RESTRICT", onUpdate: "CASCADE" })
	@JoinColumn({ name: "commercial_id" })
	commercial!: Relation<Commercial>;

	@ManyToOne(() => CommercialRouteStatus, {
		onDelete: "RESTRICT",
		onUpdate: "CASCADE",
	})
	@JoinColumn({ name: "status_id" })
	status!: Relation<CommercialRouteStatus>;

	@CreateDateColumn({ type: "timestamptz" })
	created_at!: Date;
}
