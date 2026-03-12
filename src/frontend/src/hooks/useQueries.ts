import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ActivityLog as BackendActivityLog,
  Agent as BackendAgent,
  BrainEntry as BackendBrainEntry,
  BroadcastMessage as BackendBroadcastMessage,
  ConfigEntry as BackendConfigEntry,
  Credit as BackendCredit,
  CronJob as BackendCronJob,
  LeaderboardEntry as BackendLeaderboardEntry,
  Provider as BackendProvider,
  SecurityEvent as BackendSecurityEvent,
  Skill as BackendSkill,
} from "../backend";
import { useActor } from "./useActor";

export function useGetAllAgents() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["agents"],
    queryFn: async (): Promise<BackendAgent[]> => {
      if (!actor) return [];
      return (await actor.getAllAgents()) as unknown as BackendAgent[];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllBrainEntries() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["brain"],
    queryFn: async (): Promise<BackendBrainEntry[]> => {
      if (!actor) return [];
      return (await actor.getAllBrainEntries()) as unknown as BackendBrainEntry[];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllSkills() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["skills"],
    queryFn: async (): Promise<BackendSkill[]> => {
      if (!actor) return [];
      return (await actor.getAllSkills()) as unknown as BackendSkill[];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllCronJobs() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["cron"],
    queryFn: async (): Promise<BackendCronJob[]> => {
      if (!actor) return [];
      return (await actor.getAllCronJobs()) as unknown as BackendCronJob[];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllCredits() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["credits"],
    queryFn: async (): Promise<BackendCredit[]> => {
      if (!actor) return [];
      return (await actor.getAllCredits()) as unknown as BackendCredit[];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllProviders() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["providers"],
    queryFn: async (): Promise<BackendProvider[]> => {
      if (!actor) return [];
      return (await actor.getAllProviders()) as unknown as BackendProvider[];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllActivityLogs() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["activity"],
    queryFn: async (): Promise<BackendActivityLog[]> => {
      if (!actor) return [];
      return (await actor.getAllActivityLogs()) as unknown as BackendActivityLog[];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllConfigEntries() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["config"],
    queryFn: async (): Promise<BackendConfigEntry[]> => {
      if (!actor) return [];
      return (await actor.getAllConfigEntries()) as unknown as BackendConfigEntry[];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllSecurityEvents() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["security"],
    queryFn: async (): Promise<BackendSecurityEvent[]> => {
      if (!actor) return [];
      return (await actor.getAllSecurityEvents()) as unknown as BackendSecurityEvent[];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllBroadcastMessages() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["broadcasts"],
    queryFn: async (): Promise<BackendBroadcastMessage[]> => {
      if (!actor) return [];
      return (await actor.getAllBroadcastMessages()) as unknown as BackendBroadcastMessage[];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllLeaderboardEntries() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: async (): Promise<BackendLeaderboardEntry[]> => {
      if (!actor) return [];
      return (await actor.getAllLeaderboardEntries()) as unknown as BackendLeaderboardEntry[];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddBroadcastMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (message: BackendBroadcastMessage) => {
      if (!actor) throw new Error("No actor");
      return actor.addBroadcastMessage(message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["broadcasts"] });
    },
  });
}

export function useSeedData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.seedData();
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}

export function useGetApiToken() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["apiToken"],
    queryFn: async (): Promise<string> => {
      if (!actor) return "";
      return (await (actor as any).getApiToken()) as string;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGenerateApiToken() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<string> => {
      if (!actor) throw new Error("No actor");
      return (await (actor as any).generateApiToken()) as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apiToken"] });
    },
  });
}

export function useRevokeAndRegenerateToken() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<string> => {
      if (!actor) throw new Error("No actor");
      return (await (actor as any).revokeAndRegenerateToken()) as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apiToken"] });
    },
  });
}
