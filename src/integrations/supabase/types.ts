export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type TableDefinition<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

type UserSettingsRow = {
  user_id: string;
  theme: string;
  background_color: string | null;
  card_color: string | null;
  foreground_color: string | null;
  border_color: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  success_color: string | null;
  warning_color: string | null;
  destructive_color: string | null;
  chart_colors: Json;
  preset_name: string | null;
  border_radius: string;
  button_style: string;
  density: string;
  daily_rate: number;
  default_ot_type: number;
  travel_cost: number;
  food_cost: number;
  other_income: number;
  other_deductions: number;
  spreadsheet_id: string | null;
  updated_at: string;
};

type WorkTypeRow = {
  id: string;
  user_id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type OtTypeRow = {
  id: string;
  user_id: string | null;
  name: string;
  multiplier: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type WorkLogRow = {
  id: string;
  user_id: string;
  date: string;
  check_in_time: string;
  check_out_time: string | null;
  work_type: string;
  location_name: string;
  check_in_gps: Json | null;
  check_out_gps: Json | null;
  check_in_photo: string | null;
  check_out_photo: string | null;
  gross_hours: number;
  working_hours: number;
  ot_hours: number;
  ot_type: number;
  break_hours: number;
  daily_rate: number;
  base_wage: number;
  ot_income: number;
  travel_cost: number;
  food_cost: number;
  other_income: number;
  other_deductions: number;
  net_income: number;
  tasks: Json;
  airtable_record_id: string | null;
  airtable_synced_at: string | null;
  sync_status: "synced" | "failed" | "pending";
  synced_at: string | null;
  updated_at: string;
};

type BranchRow = {
  id: string;
  user_id: string;
  name: string;
  code: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type BranchSettingsRow = {
  branch_id: string;
  user_id: string;
  settings: Json;
  updated_at: string;
};

type DashboardLayoutRow = {
  user_id: string;
  viewport: "mobile" | "desktop";
  layout: Json;
  updated_at: string;
};

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      user_settings: TableDefinition<
        UserSettingsRow,
        Partial<UserSettingsRow> & Pick<UserSettingsRow, "user_id">,
        Partial<UserSettingsRow>
      >;
      work_types: TableDefinition<
        WorkTypeRow,
        Partial<WorkTypeRow> & Pick<WorkTypeRow, "user_id" | "name">,
        Partial<WorkTypeRow>
      >;
      ot_types: TableDefinition<
        OtTypeRow,
        Partial<OtTypeRow> & Pick<OtTypeRow, "name" | "multiplier">,
        Partial<OtTypeRow>
      >;
      work_logs: TableDefinition<
        WorkLogRow,
        Partial<WorkLogRow> &
          Pick<WorkLogRow, "id" | "user_id" | "date" | "check_in_time" | "work_type">,
        Partial<WorkLogRow>
      >;
      branches: TableDefinition<
        BranchRow,
        Partial<BranchRow> & Pick<BranchRow, "user_id" | "name">,
        Partial<BranchRow>
      >;
      branch_settings: TableDefinition<
        BranchSettingsRow,
        Partial<BranchSettingsRow> & Pick<BranchSettingsRow, "branch_id" | "user_id">,
        Partial<BranchSettingsRow>
      >;
      dashboard_layouts: TableDefinition<
        DashboardLayoutRow,
        Partial<DashboardLayoutRow> & Pick<DashboardLayoutRow, "user_id" | "viewport">,
        Partial<DashboardLayoutRow>
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends { Insert: infer I }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends { Update: infer U }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
