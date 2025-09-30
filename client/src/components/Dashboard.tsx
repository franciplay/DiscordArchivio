import BotStatus from "./BotStatus";
import ReportsList from "./ReportsList";
import CommandSimulator from "./CommandSimulator";
import ThemeToggle from "./ThemeToggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Report {
  id: string;
  fact: string;
  reportedBy: string;
  createdAt: string;
}

interface PersonWithReports {
  id: string;
  name: string;
  reports: Report[];
}

export default function Dashboard() {
  const queryClient = useQueryClient();

  // Fetch all people with their reports
  const { data: people = [], isLoading: peopleLoading } = useQuery<PersonWithReports[]>({
    queryKey: ['/api/people'],
    queryFn: async () => {
      const response = await fetch('/api/people');
      if (!response.ok) {
        throw new Error('Failed to fetch people');
      }
      const data = await response.json();
      return data.map((person: any) => ({
        ...person,
        reports: person.reports.map((report: any) => ({
          ...report,
          createdAt: report.createdAt
        }))
      }));
    }
  });

  // Fetch bot statistics
  const { data: botStats } = useQuery({
    queryKey: ['/api/bot/stats'],
    queryFn: async () => {
      const response = await fetch('/api/bot/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch bot stats');
      }
      return response.json();
    },
    refetchInterval: 30000, // Aggiorna ogni 30 secondi
  });

  // Create report mutation
  const createReportMutation = useMutation({
    mutationFn: async ({ personName, fact, reportedBy }: { personName: string; fact: string; reportedBy: string }) => {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ personName, fact, reportedBy })
      });
      if (!response.ok) {
        throw new Error('Failed to create report');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/people'] });
    }
  });

  // Delete person mutation
  const deletePersonMutation = useMutation({
    mutationFn: async (personId: string) => {
      const response = await fetch(`/api/people/${personId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete person');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/people'] });
    }
  });

  // Delete report mutation
  const deleteReportMutation = useMutation({
    mutationFn: async (reportId: string) => {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete report');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/people'] });
    }
  });

  const totalReports = people.reduce((sum, person) => sum + person.reports.length, 0);

  const handleReportCommand = (name: string, fact: string) => {
    console.log('Comando /report eseguito:', { name, fact });

    createReportMutation.mutate({
      personName: name,
      fact,
      reportedBy: "Dashboard#0000"
    });
  };

  const handleInfoCommand = (name: string) => {
    console.log('Comando /info eseguito:', { name });

    const person = people.find(p => p.name.toLowerCase() === name.toLowerCase());

    if (person) {
      console.log(`Informazioni trovate per ${name}:`, person.reports);
    } else {
      console.log(`Nessuna informazione trovata per ${name}`);
    }
  };

  const handleDeletePerson = (personId: string) => {
    console.log('Eliminazione persona:', personId);
    deletePersonMutation.mutate(personId);
  };

  const handleDeleteReport = (reportId: string) => {
    console.log('Eliminazione report:', reportId);
    deleteReportMutation.mutate(reportId);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bot className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold" data-testid="text-app-title">
              Discord Bot Dashboard
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Bot Status */}
        <BotStatus
          isOnline={botStats?.isOnline ?? false}
          serverCount={botStats?.serverCount ?? 0}
          totalReports={totalReports}
          lastActivity="2 minuti fa"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Command Simulator */}
          <CommandSimulator
            onReportCommand={handleReportCommand}
            onInfoCommand={handleInfoCommand}
            people={people}
            isLoading={createReportMutation.isPending}
          />

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Attività Recente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3" data-testid="recent-activity">
                {people.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    Nessuna attività recente
                  </div>
                ) : (
                  people.slice(0, 3).map((person) => (
                    <div key={person.id} className="text-sm text-muted-foreground">
                      • {person.reports.length} report per {person.name}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reports List */}
        <ReportsList 
          people={people as any} 
          isLoading={peopleLoading}
          onDeletePerson={handleDeletePerson}
          onDeleteReport={handleDeleteReport}
        />
      </main>
    </div>
  );
}