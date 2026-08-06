import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, MapPin, ChevronRight } from "lucide-react";
import { TASK_STATUS, TASK_PRIORITY, timeUntil } from "./operatorConstants";

export default function OperatorTaskCard({ task, index = 0 }) {
  const navigate = useNavigate();
  const status = TASK_STATUS[task.status] || TASK_STATUS.assigned;
  const priority = TASK_PRIORITY[task.priority] || TASK_PRIORITY.normal;
  const overdue = task.deadline && new Date(task.deadline).getTime() < Date.now() && task.status !== "completed";

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => navigate(`/operator/tasks/${task.id}`)}
      className="w-full text-left rounded-[20px] p-3.5 glass spring-tap card-hover"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold ${priority.bg} ${priority.color}`}>
              {priority.label}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold ${status.tint}`}>
              {status.label}
            </span>
          </div>
          <p className="font-heading font-semibold text-[13px] text-foreground leading-tight line-clamp-2">
            {task.title}
          </p>
          {task.department && (
            <p className="text-[11px] text-muted-foreground mt-0.5">{task.department}</p>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
      </div>
      <div className="flex items-center gap-3 mt-2.5 text-[10.5px] text-muted-foreground">
        <span className={`flex items-center gap-1 ${overdue ? "text-destructive font-semibold" : ""}`}>
          <Clock className="w-3 h-3" /> {timeUntil(task.deadline)}
        </span>
        {task.location && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {task.location}
          </span>
        )}
      </div>
    </motion.button>
  );
}