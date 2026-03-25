import { getDataSource } from "@/app/lib/typeorm/data-source";

export async function rejectUserRequest(
	requestId: string,
	performedByUserId: string,
	rejectionReason: string,
) {
	const ds = await getDataSource();

	return ds.transaction(async (manager) => {
		const userRequestRepo = manager.getRepository("UserRequest");
		const requestStatusRepo = manager.getRepository("RequestStatus");

		const request = await userRequestRepo.findOne({
			where: { id: requestId },
			relations: {
				requestedRole: true,
				status: true,
				requestSourceType: true,
				reviewedByUser: true,
				createdUser: true,
			},
		});

		if (!request) {
			throw new Error("Solicitud no encontrada");
		}

		const [pendingStatus, rejectedStatus] = await Promise.all([
			requestStatusRepo.findOne({ where: { code: "pending" } }),
			requestStatusRepo.findOne({ where: { code: "rejected" } }),
		]);

		if (!pendingStatus || !rejectedStatus) {
			throw new Error("No se pudieron resolver los estados de solicitud");
		}

		if (request.status_id !== pendingStatus.id) {
			throw new Error("La solicitud no está pendiente");
		}

		const reviewedAt = new Date();

		await userRequestRepo.update(
			{ id: request.id },
			{
				status_id: rejectedStatus.id,
				reviewed_at: reviewedAt,
				reviewed_by: performedByUserId,
				rejection_reason: rejectionReason,
			},
		);

		return userRequestRepo.findOne({
			where: { id: request.id },
			relations: {
				requestedRole: true,
				status: true,
				requestSourceType: true,
				reviewedByUser: true,
				createdUser: true,
			},
		});
	});
}
