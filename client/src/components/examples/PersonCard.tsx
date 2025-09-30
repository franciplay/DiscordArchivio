import PersonCard from '../PersonCard';

export default function PersonCardExample() {
  const mockReports = [
    {
      id: "1",
      fact: "Ha vinto il torneo di calcetto aziendale",
      reportedBy: "GiuliaB#1234",
      createdAt: "2024-01-15"
    },
    {
      id: "2", 
      fact: "È un esperto di cucina italiana",
      reportedBy: "LucaM#5678",
      createdAt: "2024-01-20"
    }
  ];

  return (
    <PersonCard
      name="Mario Rossi"
      reports={mockReports}
      isExpanded={true}
      onToggle={() => console.log('Person card toggled')}
    />
  );
}