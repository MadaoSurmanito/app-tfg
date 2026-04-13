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

import { Client } from "./Client";
import { Commercial } from "./Commercial";
import { User } from "./User";

@Entity("client_commercial_assignments")
@Index("client_commercial_assignments_client_id_index", ["client_id"])
@Index("client_commercial_assignments_commercial_id_index", ["commercial_id"])
@Index("client_commercial_assignments_assigned_at_index", ["assigned_at"])
@Index("client_commercial_assignments_unassigned_at_index", ["unassigned_at"])
export class ClientCommercialAssignment {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Column({ type: "uuid" })
	client_id!: string;

	@Column({ type: "uuid" })
	commercial_id!: string;

	@CreateDateColumn({ type: "timestamptz" })
	assigned_at!: Date;

	@Column({ type: "timestamptz", nullable: true })
	unassigned_at!: Date | null;

	@Column({ type: "uuid", nullable: true })
	assigned_by_user_id!: string | null;

	@Column({ type: "uuid", nullable: true })
	unassigned_by_user_id!: string | null;

	@ManyToOne(() => Client, { onDelete: "RESTRICT", onUpdate: "CASCADE" })
	@JoinColumn({ name: "client_id" })
	client!: Relation<Client>;

	@ManyToOne(() => Commercial, { onDelete: "RESTRICT", onUpdate: "CASCADE" })
	@JoinColumn({ name: "commercial_id" })
	commercial!: Relation<Commercial>;

	@ManyToOne(() => User, {
		onDelete: "SET NULL",
		onUpdate: "CASCADE",
		nullable: true,
	})
	@JoinColumn({ name: "assigned_by_user_id" })
	assignedByUser!: Relation<User> | null;

	@ManyToOne(() => User, {
		onDelete: "SET NULL",
		onUpdate: "CASCADE",
		nullable: true,
	})
	@JoinColumn({ name: "unassigned_by_user_id" })
	unassignedByUser!: Relation<User> | null;

	@Column({ type: "text", nullable: true })
	notes!: string | null;
}
