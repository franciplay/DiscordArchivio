import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, User, Calendar, Trash2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Report {
  id: string;
  fact: string;
  reportedBy: string;
  createdAt: string;
}

interface PersonCardProps {
  id?: string;
  name: string;
  reports: Report[];
  isExpanded?: boolean;
  onToggle?: () => void;
  onDeletePerson?: (id: string) => void;
  onDeleteReport?: (id: string) => void;
}

export default function PersonCard({
  id,
  name,
  reports,
  isExpanded = false,
  onToggle,
  onDeletePerson,
  onDeleteReport
}: PersonCardProps) {
  return (
    <Card data-testid={`card-person-${name.replace(/\s+/g, '-').toLowerCase()}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div
          className="cursor-pointer flex-1 flex items-center space-x-2"
          onClick={onToggle}
        >
          <CardTitle className="text-base font-medium flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span data-testid="text-person-name">{name}</span>
            <Badge variant="secondary" data-testid="badge-reports-count">
              {reports.length} {reports.length === 1 ? 'report' : 'report'}
            </Badge>
          </CardTitle>
        </div>
        <div className="flex items-center space-x-2">
          {id && onDeletePerson && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <span>Conferma eliminazione</span>
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Sei sicuro di voler eliminare <strong>{name}</strong> e tutti i suoi <strong>{reports.length} report</strong>?
                    Questa azione non può essere annullata.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annulla</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDeletePerson(id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Elimina
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <div className="cursor-pointer" onClick={onToggle}>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            {reports.map((report, index) => (
              <div key={report.id} className="p-3 bg-muted/50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="text-xs">
                    Report #{index + 1}
                  </Badge>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center text-xs text-muted-foreground space-x-2">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {format(new Date(report.createdAt), "d MMM yyyy", { locale: it })}
                      </span>
                    </div>
                    {onDeleteReport && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center space-x-2">
                              <AlertTriangle className="h-5 w-5 text-destructive" />
                              <span>Elimina Report</span>
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Sei sicuro di voler eliminare questo report? Questa azione non può essere annullata.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annulla</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDeleteReport(report.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Elimina
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
                <p className="text-sm mb-2 leading-relaxed">{report.fact}</p>
                <p className="text-xs text-muted-foreground">
                  Segnalato da: <span className="font-mono">{report.reportedBy}</span>
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}