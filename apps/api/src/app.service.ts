import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { HealthService } from "@mini-crm/core";

@Injectable()
export class AppService {
    async ping(): Promise<{ status: "ok"; database: "up" }> {
        const databaseUp = await HealthService.isDatabaseUp();
        if (!databaseUp) {
            throw new ServiceUnavailableException("Database is unavailable");
        }
        return { status: "ok", database: "up" };
    }
}
