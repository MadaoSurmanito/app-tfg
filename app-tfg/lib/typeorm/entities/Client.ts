import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	OneToMany,
	JoinColumn,
	Index,
} from "typeorm";
import type { Relation } from "typeorm";

import { User } from "./User";
import { ClientCommercialAssignment } from "./ClientCommercialAssignment";

@Entity("clients")
@Index("clients_linked_user_id_index", ["linked_user_id"])
@Index("clients_name_index", ["name"])
export class Client {
	@PrimaryGeneratedColumn("uuid")
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

	@Column({ type: "uuid", unique: true })
	linked_user_id!: string;

	@ManyToOne(() => User, { onDelete: "RESTRICT", onUpdate: "CASCADE" })
	@JoinColumn({ name: "linked_user_id" })
	linkedUser!: Relation<User>;

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
