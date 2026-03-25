import { getDataSource } from "@/lib/typeorm/data-source";
import { User } from "@/lib/typeorm/entities/User";

export async function listUsers() {
  const ds = await getDataSource();
  const repo = ds.getRepository(User);

  return repo.find({
    relations: {
      role: true,
      status: true,
    },
    order: {
      created_at: "DESC",
    },
  });
}