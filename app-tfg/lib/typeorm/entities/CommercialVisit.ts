import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	JoinColumn,
	Index,
} from "typeorm";
import type { Relation } from "typeorm";

import { Client } from "./Client";
import { Commercial } from "./Commercial";
import { CommercialVisitStatus } from "./CommercialVisitStatus";

@Entity("commercial_visits")
@Index("commercial_visits_client_id_index", ["client_id"])
@Index("commercial_visits_commercial_id_index", ["commercial_id"])
@Index("commercial_visits_status_id_index", ["status_id"])
@Index("commercial_visits_scheduled_at_index", ["scheduled_at"])
export class CommercialVisit {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Column({ type: "uuid" })
	client_id!: string;

	@Column({ type: "uuid" })
	commercial_id!: string;

	@Column({ type: "timestamptz" })
	scheduled_at!: Date;

	@Column({ type: "smallint" })
	status_id!: number;

	@ManyToOne(() => Client, { onDelete: "RESTRICT", onUpdate: "CASCADE" })
	@JoinColumn({ name: "client_id" })
	client!: Relation<Client>;

	@ManyToOne(() => Commercial, { onDelete: "RESTRICT", onUpdate: "CASCADE" })
	@JoinColumn({ name: "commercial_id" })
	commercial!: Relation<Commercial>;

	@ManyToOne(() => CommercialVisitStatus, {
		onDelete: "RESTRICT",
		onUpdate: "CASCADE",
	})
	@JoinColumn({ name: "status_id" })
	status!: Relation<CommercialVisitStatus>;

	@Column({ type: "text", nullable: true })
	notes!: string | null;

	@Column({ type: "text", nullable: true })
	result!: string | null;
}
