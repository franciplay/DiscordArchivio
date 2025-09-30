import BotStatus from '../BotStatus';

export default function BotStatusExample() {
  return (
    <BotStatus
      isOnline={true}
      serverCount={12}
      totalReports={47}
      lastActivity="2 minuti fa"
    />
  );
}