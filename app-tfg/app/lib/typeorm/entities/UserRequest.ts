import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	JoinColumn,
	CreateDateColumn,
	Index,
} from "typeorm";
import type { Relation } from "typeorm";

import { Role } from "./Role";
import { RequestStatus } from "./RequestStatus";
import { RequestSourceType } from "./RequestSourceType";
import { User } from "./User";

@Entity("user_requests")
@Index("user_requests_email_index", ["email"])
@Index("user_requests_requested_role_id_index", ["requested_role_id"])
@Index("user_requests_status_id_index", ["status_id"])
@Index("user_requests_request_source_type_id_index", ["request_source_type_id"])
@Index("user_requests_reviewed_by_index", ["reviewed_by"])
@Index("user_requests_created_user_id_index", ["created_user_id"])
export class UserRequest {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Column({ type: "citext" })
	email!: string;

	@Column({ type: "text" })
	password_hash!: string;

	@Column({ type: "text" })
	name!: string;

	@Column({ type: "text", nullable: true })
	phone!: string | null;

	@Column({ type: "text", nullable: true })
	company!: string | null;

	@Column({ type: "smallint" })
	requested_role_id!: number;

	@ManyToOne(() => Role, {
		onDelete: "RESTRICT",
		onUpdate: "CASCADE",
	})
	@JoinColumn({ name: "requested_role_id" })
	requestedRole!: Relation<Role>;

	@Column({ type: "smallint" })
	status_id!: number;

	@ManyToOne(() => RequestStatus, {
		onDelete: "RESTRICT",
		onUpdate: "CASCADE",
	})
	@JoinColumn({ name: "status_id" })
	status!: Relation<RequestStatus>;

	@Column({ type: "smallint" })
	request_source_type_id!: number;

	@ManyToOne(() => RequestSourceType, {
		onDelete: "RESTRICT",
		onUpdate: "CASCADE",
	})
	@JoinColumn({ name: "request_source_type_id" })
	requestSourceType!: Relation<RequestSourceType>;

	@CreateDateColumn({ type: "timestamptz" })
	requested_at!: Date;

	@Column({ type: "timestamptz", nullable: true })
	reviewed_at!: Date | null;

	@Column({ type: "uuid", nullable: true })
	reviewed_by!: string | null;

	@ManyToOne(() => User, {
		nullable: true,
		onDelete: "SET NULL",
		onUpdate: "CASCADE",
	})
	@JoinColumn({ name: "reviewed_by" })
	reviewedByUser!: Relation<User> | null;

	@Column({ type: "text", nullable: true })
	rejection_reason!: string | null;

	@Column({ type: "uuid", nullable: true })
	created_user_id!: string | null;

	@ManyToOne(() => User, {
		nullable: true,
		onDelete: "SET NULL",
		onUpdate: "CASCADE",
	})
	@JoinColumn({ name: "created_user_id" })
	createdUser!: Relation<User> | null;
}
