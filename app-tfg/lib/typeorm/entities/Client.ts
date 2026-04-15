import {
	Entity,
	PrimaryColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	OneToOne,
	OneToMany,
	JoinColumn,
	Index,
} from "typeorm";
import type { Relation } from "typeorm";
import { User } from "./User";
import { ClientCommercialAssignment } from "./ClientCommercialAssignment";

@Entity("clients")
@Index("clients_name_index", ["name"])
export class Client {
	@PrimaryColumn("uuid")
	id!: string;

	@Column({ type: "text" })
	name!: string;

	@Column({ type: "text", nullable: true })
	contact_name!: string | null;

	@Column({ type: "text", nullable: true })
	tax_id!: string | null;

	@Column({ type: "text" })
	address!: string;

	@Column({ type: "text" })
	city!: string;

	@Column({ type: "text", nullable: true })
	postal_code!: string | null;

	@Column({ type: "text", nullable: true })
	province!: string | null;

	@OneToOne(() => User, { onDelete: "RESTRICT", onUpdate: "CASCADE" })
	@JoinColumn({ name: "id" })
	user!: Relation<User>;

	@OneToMany(
		() => ClientCommercialAssignment,
		(clientCommercialAssignment) => clientCommercialAssignment.client,
	)
	commercialAssignments!: Relation<ClientCommercialAssignment[]>;

	@Column({ type: "text", nullable: true })
	notes!: string | null;

	@CreateDateColumn({ type: "timestamptz" })
	created_at!: Date;

	@UpdateDateColumn({ type: "timestamptz" })
	updated_at!: Date;
}
