import CommandSimulator from '../CommandSimulator';

export default function CommandSimulatorExample() {
  return (
    <CommandSimulator
      onReportiCommand={(name, fact) => console.log('Reporti command:', { name, fact })}
      onInfoCommand={(name) => console.log('Info command:', { name })}
    />
  );
}