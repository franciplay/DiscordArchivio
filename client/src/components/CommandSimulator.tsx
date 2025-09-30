"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Generate all 18 school classes in alphabetical order (1A, 2A, 3A, 1B, 2B, 3B, etc.)
const generateSchoolClasses = () => {
  const classes = [];
  for (let letter = 'A'.charCodeAt(0); letter <= 'F'.charCodeAt(0); letter++) {
    const className = String.fromCharCode(letter);
    for (let year = 1; year <= 3; year++) {
      classes.push(`${year}${className}`);
    }
  }
  return classes.sort();
};

const schoolClasses = generateSchoolClasses();

export default function CommandSimulator() {
  const [reportName, setReportName] = useState("");
  const [reportClass, setReportClass] = useState("");
  const [fact, setFact] = useState("");
  const [selectedInfoPerson, setSelectedInfoPerson] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [openReportNameSelect, setOpenReportNameSelect] = useState(false);
  const [openInfoPersonSelect, setOpenInfoPersonSelect] = useState(false);
  const { toast } = useToast();

  // Fetch existing people for the autocomplete
  const { data: people = [] } = useQuery({
    queryKey: ['/api/people'],
    queryFn: async () => {
      const response = await fetch('/api/people');
      if (!response.ok) {
        throw new Error('Failed to fetch people');
      }
      return response.json();
    }
  });

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportName.trim() || !fact.trim()) {
      toast({
        title: "Errore",
        description: "Nome e fatto sono obbligatori",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const fullName = reportClass ? `${reportName} (${reportClass})` : reportName;

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personName: fullName,
          fact: fact,
          reportedBy: 'Web Dashboard'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }

      toast({
        title: "Successo!",
        description: `Report aggiunto per ${fullName}`,
      });

      // Reset form
      setReportName("");
      setReportClass("");
      setFact("");
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'invio del report",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInfoPerson) {
      toast({
        title: "Errore",
        description: "Seleziona una persona",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/people/${encodeURIComponent(selectedInfoPerson)}`);

      if (response.status === 404) {
        toast({
          title: "Non trovato",
          description: `Nessuna informazione trovata per ${selectedInfoPerson}`,
          variant: "destructive"
        });
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch person info');
      }

      const person = await response.json();

      if (!person.reports || person.reports.length === 0) {
        toast({
          title: "Info",
          description: `${selectedInfoPerson} è presente nel database ma non ci sono ancora report disponibili`,
        });
      } else {
        const reportsList = person.reports.map((report: any, index: number) => {
          const reportDate = new Date(report.createdAt).toLocaleDateString('it-IT');
          return `${index + 1}. ${report.fact} (segnalato da ${report.reportedBy} il ${reportDate})`;
        }).join('\n');

        toast({
          title: `Informazioni su ${person.name}`,
          description: `Totale report: ${person.reports.length}\n\n${reportsList}`,
        });
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il recupero delle informazioni",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🤖 Simulatore Comandi Discord</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="report" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="report">/report</TabsTrigger>
            <TabsTrigger value="info">/info</TabsTrigger>
          </TabsList>

          <TabsContent value="report" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Comando /report</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleReportSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="report-name">Nome e Cognome *</Label>
                    <Popover open={openReportNameSelect} onOpenChange={setOpenReportNameSelect}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openReportNameSelect}
                          className="w-full justify-between"
                        >
                          {reportName || "Seleziona o scrivi un nome..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput 
                            placeholder="Cerca o scrivi un nome..." 
                            value={reportName}
                            onValueChange={setReportName}
                          />
                          <CommandList>
                            <CommandEmpty>
                              <div className="p-2">
                                <Button
                                  variant="ghost"
                                  className="w-full justify-start"
                                  onClick={() => {
                                    setOpenReportNameSelect(false);
                                  }}
                                >
                                  Aggiungi "{reportName}"
                                </Button>
                              </div>
                            </CommandEmpty>
                            <CommandGroup>
                              {people.map((person: any) => (
                                <CommandItem
                                  key={person.id}
                                  value={person.name}
                                  onSelect={(currentValue) => {
                                    setReportName(currentValue);
                                    setOpenReportNameSelect(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      reportName === person.name ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {person.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="report-class">Classe (Opzionale)</Label>
                    <Select 
                      value={reportClass} 
                      onValueChange={setReportClass}
                      disabled={people.some((p: any) => p.name === reportName)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          people.some((p: any) => p.name === reportName) 
                            ? "Persona esistente - classe già definita" 
                            : "Seleziona classe..."
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {schoolClasses.map((className) => (
                          <SelectItem key={className} value={className}>
                            {className}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="report-fact">Fatto da segnalare *</Label>
                    <Textarea
                      id="report-fact"
                      value={fact}
                      onChange={(e) => setFact(e.target.value)}
                      placeholder="Inserisci il fatto da segnalare..."
                      className="min-h-[100px]"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Invio in corso..." : "Esegui /report"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Comando /info</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleInfoSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="info-person">Seleziona Persona *</Label>
                    <Popover open={openInfoPersonSelect} onOpenChange={setOpenInfoPersonSelect}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openInfoPersonSelect}
                          className="w-full justify-between"
                        >
                          {selectedInfoPerson || "Seleziona una persona esistente..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Cerca una persona..." />
                          <CommandList>
                            <CommandEmpty>Nessuna persona trovata.</CommandEmpty>
                            <CommandGroup>
                              {people.map((person: any) => (
                                <CommandItem
                                  key={person.id}
                                  value={person.name}
                                  onSelect={(currentValue) => {
                                    setSelectedInfoPerson(currentValue);
                                    setOpenInfoPersonSelect(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedInfoPerson === person.name ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {person.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Caricamento..." : "Esegui /info"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}