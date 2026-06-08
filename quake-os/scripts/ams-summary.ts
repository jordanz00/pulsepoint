#!/usr/bin/env tsx
import { getAmsPlatformSummary, seedRoadmapTasksForGaps } from "@/quake-os/ams/core/services";

const summary = getAmsPlatformSummary();
const tasks = seedRoadmapTasksForGaps();
console.log(JSON.stringify({ summary, tasksSeeded: tasks }, null, 2));
