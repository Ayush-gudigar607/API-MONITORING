import express from 'express';
import { AnalyticsContainer } from '../Dependencies/dependencies.js';
const {analyticsController}=AnalyticsContainer.controllers;
import authenticate from '../../../shared/middleware/authenticate.js';

const router=express.Router();

router.get('/stats',authenticate,(req,res,next)=>{
    analyticsController.getStatus(req,res,next);
});

router.get("/dashboard",authenticate,(req,res,next)=>{
    analyticsController.getDashboardData(req,res,next);
});

export default router;
