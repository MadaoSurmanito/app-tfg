import { getDataSource } from "@/app/lib/typeorm/data-source";
import { User } from "@/app/lib/typeorm/entities/User";

export async function registerSuccessfulLogin(userId: string) {
	const ds = await getDataSource();
	const repo = ds.getRepository(User);

	await repo.update(
		{ id: userId },
		{
			last_login_at: new Date(),
			updated_at: new Date(),
		},
	);
}