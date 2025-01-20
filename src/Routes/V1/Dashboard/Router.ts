import express from "express";
import { getFirstPaymentsToday, getNewBoardsToday, getNewUsersToday, getRenewalsToday, getTotalBoardEvents, getTotalBoards, getTotalPayingUsers, getTotalUsers } from "../../../drizzle/functions/board/MetricsDashboard";
import winston from "winston";

export const createDashboardRouter = (logger: winston.Logger): express.Router => {
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
    
            res.status(200).json({
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
            logger.error("Error dashboard data:", error);
            return res.status(500).json({ error: "Ошибка при получении данных дашборда" });
            
        }
    });
    return router;
}


