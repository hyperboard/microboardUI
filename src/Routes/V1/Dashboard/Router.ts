import express from "express";
import { getFirstPaymentsToday, getNewBoardsToday, getNewUsersToday, getRenewalsToday, getTotalBoardEvents, getTotalBoards, getTotalPayingUsers, getTotalUsers } from "../../../drizzle/functions/board/MetricsDashboard";



export const createDashboardRouter = (): express.Router => {
    const router = express.Router();
    router.get("/dashboard", async (req, res) => {
        try {
            const [
                totalBoards, 
                newBoardsToday, 
                totalUsers, 
                newUsersToday, 
                totalBoardEvents, 
                firstPaymentsToday, 
                renewalsToday, 
                totalPayingUsers
            ] = await Promise.all([
                getTotalBoards(),
                getNewBoardsToday(),
                getTotalUsers(),
                getNewUsersToday(),
                getTotalBoardEvents(),
                getFirstPaymentsToday(),
                getRenewalsToday(),
                getTotalPayingUsers()
            ]);
    
            res.json({
                totalBoards,
                newBoardsToday,
                totalUsers,
                newUsersToday,
                totalBoardEvents,
                firstPaymentsToday,
                renewalsToday,
                totalPayingUsers,
            });
        } catch (error) {
            res.status(500).json({ error: "Ошибка при получении данных дашборда" });
        }
    });
    return router;
}


