import { db } from "drizzle/db";
import { TariffPlan, tariffPlans } from "drizzle/entities/tariffs";
import { eq } from "drizzle-orm";

export const FREE_TARIFF: TariffPlan = {
    id: "1",
    name: "free",
    description: "Free plan",
    monthlyTokenLimit: 100_000,
    resetPeriodDays: 30,
    price: 0,
    version: 1,
};

export async function updateTariffs() {
    console.log("Starting tariff plan synchronization...");

    const tariffs: TariffPlan[] = [
        FREE_TARIFF,
        {
            id: "2",
            name: "Pro",
            description: "Pro plan",
            monthlyTokenLimit: 1_000_000,
            resetPeriodDays: 30,
            price: 1000,
            version: 1,
        },
        {
            id: "3",
            name: "Test",
            description: "Test",
            monthlyTokenLimit: 999_999_999,
            resetPeriodDays: 30,
            price: 5000,
            version: 1,
        },
    ];

    try {
        const existingTariffs = await db.select().from(tariffPlans);
        const existingTariffMap = new Map(existingTariffs.map((t) => [t.id, t]));

        for (const tariff of tariffs) {
            const existingTariff = existingTariffMap.get(tariff.id);

            if (existingTariff) {
                if (!isEqual(existingTariff, tariff)) {
                    await db.update(tariffPlans).set(tariff).where(eq(tariffPlans.id, tariff.id));
                    console.log(`Updated tariff plan: ${tariff.name}`);
                }
            } else {
                await db.insert(tariffPlans).values(tariff);
                console.log(`Created new tariff plan: ${tariff.name}`);
            }
        }
        for (const [existingId, existingTariff] of existingTariffMap) {
            if (!tariffs.some((t) => t.id === existingId)) {
                await db.delete(tariffPlans).where(eq(tariffPlans.id, existingId));
                console.log(`Removed deprecated tariff plan: ${existingTariff.name}`);
            }
        }

        console.log("Tariff plan synchronization completed successfully");
    } catch (error) {
        console.error("Error during tariff plan synchronization:", error);
        throw error;
    }
}

function isEqual(existingTariff: TariffPlan, newTariff: TariffPlan): boolean {
    return (
        existingTariff.name === newTariff.name &&
        existingTariff.description === newTariff.description &&
        existingTariff.monthlyTokenLimit === newTariff.monthlyTokenLimit &&
        existingTariff.resetPeriodDays === newTariff.resetPeriodDays &&
        existingTariff.price === newTariff.price
    );
}
