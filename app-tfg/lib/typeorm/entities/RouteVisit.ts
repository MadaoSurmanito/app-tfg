import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	JoinColumn,
	Index,
} from "typeorm";
import type { Relation } from "typeorm";

import { CommercialRoute } from "./CommercialRoute";
import { CommercialVisit } from "./CommercialVisit";

@Entity("route_visits")
@Index("route_visits_route_id_index", ["route_id"])
@Index("route_visits_visit_id_index", ["visit_id"])
@Index("route_visits_route_id_visit_id_unique", ["route_id", "visit_id"], {
	unique: true,
})
@Index(
	"route_visits_route_id_visit_order_unique",
	["route_id", "visit_order"],
	{ unique: true },
)
export class RouteVisit {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Column({ type: "uuid" })
	route_id!: string;

	@Column({ type: "uuid" })
	visit_id!: string;

	@Column({ type: "integer" })
	visit_order!: number;

	@ManyToOne(() => CommercialRoute, {
		onDelete: "CASCADE",
		onUpdate: "CASCADE",
	})
	@JoinColumn({ name: "route_id" })
	route!: Relation<CommercialRoute>;

	@ManyToOne(() => CommercialVisit, {
		onDelete: "CASCADE",
		onUpdate: "CASCADE",
	})
	@JoinColumn({ name: "visit_id" })
	visit!: Relation<CommercialVisit>;
}