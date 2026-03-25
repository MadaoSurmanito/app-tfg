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
import { UserAdminActionType } from "./UserAdminActionType";
import { UserStatus } from "./UserStatus";
import { Role } from "./Role";

@Entity({ name: "user_management_log" })
@Index("user_management_log_target_user_id_index", ["target_user_id"])
@Index("user_management_log_performed_by_index", ["performed_by"])
@Index("user_management_log_action_type_id_index", ["action_type_id"])
@Index("user_management_log_created_at_index", ["created_at"])
export class UserManagementLog {
	@PrimaryGeneratedColumn("increment", { type: "bigint" })
	id!: string;

	@Column({ type: "uuid" })
	target_user_id!: string;

	@ManyToOne(() => User, {
		onDelete: "RESTRICT",
		onUpdate: "CASCADE",
	})
	@JoinColumn({ name: "target_user_id" })
	targetUser!: Relation<User>;

	@Column({ type: "uuid" })
	performed_by!: string;

	@ManyToOne(() => User, {
		onDelete: "RESTRICT",
		onUpdate: "CASCADE",
	})
	@JoinColumn({ name: "performed_by" })
	performedByUser!: Relation<User>;

	@Column({ type: "smallint" })
	action_type_id!: number;

	@ManyToOne(() => UserAdminActionType, {
		onDelete: "RESTRICT",
		onUpdate: "CASCADE",
	})
	@JoinColumn({ name: "action_type_id" })
	actionType!: Relation<UserAdminActionType>;

	@Column({ type: "smallint", nullable: true })
	previous_status_id!: number | null;

	@ManyToOne(() => UserStatus, {
		nullable: true,
		onDelete: "SET NULL",
		onUpdate: "CASCADE",
	})
	@JoinColumn({ name: "previous_status_id" })
	previousStatus!: Relation<UserStatus> | null;

	@Column({ type: "smallint", nullable: true })
	new_status_id!: number | null;

	@ManyToOne(() => UserStatus, {
		nullable: true,
		onDelete: "SET NULL",
		onUpdate: "CASCADE",
	})
	@JoinColumn({ name: "new_status_id" })
	newStatus!: Relation<UserStatus> | null;

	@Column({ type: "smallint", nullable: true })
	previous_role_id!: number | null;

	@ManyToOne(() => Role, {
		nullable: true,
		onDelete: "SET NULL",
		onUpdate: "CASCADE",
	})
	@JoinColumn({ name: "previous_role_id" })
	previousRole!: Relation<Role> | null;

	@Column({ type: "smallint", nullable: true })
	new_role_id!: number | null;

	@ManyToOne(() => Role, {
		nullable: true,
		onDelete: "SET NULL",
		onUpdate: "CASCADE",
	})
	@JoinColumn({ name: "new_role_id" })
	newRole!: Relation<Role> | null;

	@Column({ type: "text", nullable: true })
	reason!: string | null;

	@Column({ type: "text", nullable: true })
	notes!: string | null;

	@CreateDateColumn({ type: "timestamptz" })
	created_at!: Date;
}