export type SaveScope =
  "theme" | "rates" | "spreadsheet" | "branch-profile" | "branch-rates" | "layout";

export type SaveParticipant = {
  scope: SaveScope;
  dirty: boolean;
  validate?: () => void | Promise<void>;
  save: () => void | Promise<void>;
};

export type SaveResult = {
  savedScopes: SaveScope[];
  failedScope?: SaveScope;
  error?: unknown;
};

export type SaveCoordinator = {
  hasDirtyParticipants: () => boolean;
  save: () => Promise<SaveResult>;
};

/**
 * Creates a deterministic sequential save workflow for independent draft domains.
 * Validation is completed for every dirty participant before the first remote write.
 */
export function createSaveCoordinator(participants: readonly SaveParticipant[]): SaveCoordinator {
  return {
    hasDirtyParticipants: () => participants.some((participant) => participant.dirty),

    async save(): Promise<SaveResult> {
      const dirtyParticipants = participants.filter((participant) => participant.dirty);
      const savedScopes: SaveScope[] = [];

      try {
        for (const participant of dirtyParticipants) {
          await participant.validate?.();
        }

        for (const participant of dirtyParticipants) {
          await participant.save();
          savedScopes.push(participant.scope);
        }

        return { savedScopes };
      } catch (error) {
        const failedScope = dirtyParticipants[savedScopes.length]?.scope;
        const result: SaveResult = { savedScopes };
        if (failedScope !== undefined) result.failedScope = failedScope;
        result.error = error;
        return result;
      }
    },
  };
}
