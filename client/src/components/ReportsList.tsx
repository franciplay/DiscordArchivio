import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import PersonCard from "./PersonCard";

interface Report {
  id: string;
  fact: string;
  reportedBy: string;
  createdAt: Date;
}

interface Person {
  id: string; // Added id to Person interface
  name: string;
  reports: Report[];
}

interface ReportsListProps {
  people: Person[];
  isLoading?: boolean;
  onDeletePerson: (personId: string) => void; // Added onDeletePerson prop
  onDeleteReport: (personId: string, reportId: string) => void; // Added onDeleteReport prop
}

export default function ReportsList({ people, isLoading = false, onDeletePerson, onDeleteReport }: ReportsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedPerson, setExpandedPerson] = useState<string | null>(null);

  const filteredPeople = people.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePersonToggle = (personName: string) => {
    setExpandedPerson(expandedPerson === personName ? null : personName);
  };

  return (
    <Card data-testid="card-reports-list">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Search className="h-5 w-5" />
          <span>Report Persone</span>
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca per nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-people"
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground" data-testid="text-loading">
            Caricamento in corso...
          </div>
        ) : filteredPeople.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground" data-testid="text-no-results">
            {searchTerm ? "Nessuna persona trovata" : "Nessun report disponibile"}
          </div>
        ) : (
          filteredPeople.map((person) => (
            <PersonCard
              key={person.id}
              id={person.id}
              name={person.name}
              reports={person.reports}
              isExpanded={expandedPerson === person.name}
              onToggle={() => handlePersonToggle(person.name)}
              onDeletePerson={onDeletePerson}
              onDeleteReport={onDeleteReport}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}