export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
        };
        Insert: {
          id: string;
          username: string;
        };
        Update: {
          id?: string;
          username?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_email_from_username: {
        Args: {
          p_username: string;
        };
        Returns: {
          email: string;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
