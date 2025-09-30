import ReportsList from '../ReportsList';

export default function ReportsListExample() {
  const mockPeople = [
    {
      name: "Mario Rossi",
      reports: [
        {
          id: "1",
          fact: "Ha vinto il torneo di calcetto aziendale",
          reportedBy: "GiuliaB#1234",
          createdAt: new Date("2024-01-15")
        }
      ]
    },
    {
      name: "Anna Verdi",
      reports: [
        {
          id: "2",
          fact: "Suona la chitarra da 10 anni",
          reportedBy: "MarcT#9012",
          createdAt: new Date("2024-01-18")
        }
      ]
    }
  ];

  return <ReportsList people={mockPeople} />;
}