import { Button } from "@/components/ui/button";
import { TeamCard } from "@/components/teams/team-card";
import { useAppStore } from "@/lib/store";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Teams() {
  const navigate = useNavigate();
  const { teams } = useAppStore();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Teams</h2>
          <p className="text-muted-foreground">Manage and collaborate with your teams</p>
        </div>
        <Button 
          className="mt-4 sm:mt-0 gap-1"
          onClick={() => navigate('/new-team')}
        >
          <Plus className="h-4 w-4" />
          <span>New Team</span>
        </Button>
      </div>

      {teams.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center">
          <h3 className="font-medium text-lg mb-2">No teams yet</h3>
          <p className="text-muted-foreground mb-4">
            Create a team to start collaborating with others.
          </p>
          <Button onClick={() => navigate('/new-team')}>Create Team</Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </div>
  );
}