import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Users, Activity } from "lucide-react";

interface BotStatusProps {
  isOnline: boolean;
  serverCount: number;
  totalReports: number;
  lastActivity?: string;
}

export default function BotStatus({ isOnline, serverCount, totalReports, lastActivity }: BotStatusProps) {
  return (
    <Card data-testid="card-bot-status">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Stato Bot</CardTitle>
        <Bot className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <Badge 
            variant={isOnline ? "default" : "secondary"}
            className={isOnline ? "bg-status-online" : "bg-status-offline"}
            data-testid="badge-bot-status"
          >
            {isOnline ? "Online" : "Offline"}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Users className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Server</span>
            </div>
            <div className="text-lg font-semibold" data-testid="text-server-count">{serverCount}</div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Activity className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Report</span>
            </div>
            <div className="text-lg font-semibold" data-testid="text-reports-count">{totalReports}</div>
          </div>
        </div>
        
        {lastActivity && (
          <div className="mt-4 text-xs text-muted-foreground" data-testid="text-last-activity">
            Ultima attività: {lastActivity}
          </div>
        )}
      </CardContent>
    </Card>
  );
}