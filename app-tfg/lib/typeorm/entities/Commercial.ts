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
import { CommercialVisit } from "./CommercialVisit";
import { CommercialRoute } from "./CommercialRoute";
import { ClientCommercialAssignment } from "./ClientCommercialAssignment";

@Entity("commercials")
@Index("commercials_employee_code_index", ["employee_code"])
@Index("commercials_territory_index", ["territory"])
export class Commercial {
	@PrimaryColumn("uuid")
	id!: string;

	@OneToOne(() => User, (user) => user.commercialProfile, {
		onDelete: "CASCADE",
		onUpdate: "CASCADE",
	})
	@JoinColumn({ name: "id" })
	user!: Relation<User>;

	@Column({ type: "text", nullable: true })
	employee_code!: string | null;

	@Column({ type: "text", nullable: true })
	territory!: string | null;

	@Column({ type: "text", nullable: true })
	notes!: string | null;

	@OneToMany(
		() => CommercialVisit,
		(commercialVisit) => commercialVisit.commercial,
	)
	commercialVisits!: Relation<CommercialVisit[]>;

	@OneToMany(
		() => CommercialRoute,
		(commercialRoute) => commercialRoute.commercial,
	)
	commercialRoutes!: Relation<CommercialRoute[]>;

	@OneToMany(
		() => ClientCommercialAssignment,
		(clientCommercialAssignment) => clientCommercialAssignment.commercial,
	)
	clientAssignments!: Relation<ClientCommercialAssignment[]>;

	@CreateDateColumn({ type: "timestamptz" })
	created_at!: Date;

	@UpdateDateColumn({ type: "timestamptz" })
	updated_at!: Date;
}
