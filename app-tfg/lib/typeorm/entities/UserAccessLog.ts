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
import { User } from "./User";
import { AccessEventType } from "./AccessEventType";
import { AccessResultType } from "./AccessResultType";

@Entity({ name: "user_access_log" })
@Index("user_access_log_user_id_index", ["user_id"])
@Index("user_access_log_event_type_id_index", ["event_type_id"])
@Index("user_access_log_result_type_id_index", ["result_type_id"])
@Index("user_access_log_session_token_index", ["session_token"])
@Index("user_access_log_created_at_index", ["created_at"])
@Index("user_access_log_email_attempted_index", ["email_attempted"])
export class UserAccessLog {
	@PrimaryGeneratedColumn("increment", { type: "bigint" })
	id!: string;

	@Column({ type: "uuid", nullable: true })
	user_id!: string | null;

	@ManyToOne(() => User, {
		nullable: true,
		onDelete: "SET NULL",
		onUpdate: "CASCADE",
	})
	@JoinColumn({ name: "user_id" })
	user!: Relation<User> | null;

	@Column({ type: "citext", nullable: true })
	email_attempted!: string | null;

	@Column({ type: "smallint" })
	event_type_id!: number;

	@ManyToOne(() => AccessEventType, {
		onDelete: "RESTRICT",
		onUpdate: "CASCADE",
	})
	@JoinColumn({ name: "event_type_id" })
	eventType!: Relation<AccessEventType>;

	@Column({ type: "smallint" })
	result_type_id!: number;

	@ManyToOne(() => AccessResultType, {
		onDelete: "RESTRICT",
		onUpdate: "CASCADE",
	})
	@JoinColumn({ name: "result_type_id" })
	resultType!: Relation<AccessResultType>;

	@Column({ type: "text", nullable: true })
	failure_reason!: string | null;

	@Column({ type: "text", nullable: true })
	session_token!: string | null;

	@Column({ type: "inet", nullable: true })
	ip_address!: string | null;

	@Column({ type: "text", nullable: true })
	user_agent!: string | null;

	@CreateDateColumn({ type: "timestamptz" })
	created_at!: Date;

	@Column({ type: "timestamptz", nullable: true })
	revoked_at!: Date | null;

	@Column({ type: "timestamptz", nullable: true })
	expires_at!: Date | null;
}