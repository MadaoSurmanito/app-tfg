import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity({ name: "user_admin_action_types" })
export class UserAdminActionType {
	@PrimaryColumn({ type: "smallint" })
	id!: number;

	@Column({ type: "text", unique: true })
	code!: string;

	@Column({ type: "text", unique: true })
	name!: string;
}