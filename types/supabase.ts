export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  public: {
    Tables: {
      Bottle_Sizes: {
        Row: {
          created_at: string;
          id: number;
          name: string | null;
          size_ml: string | null;
          weight_kg: number | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          name?: string | null;
          size_ml?: string | null;
          weight_kg?: number | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          name?: string | null;
          size_ml?: string | null;
          weight_kg?: number | null;
        };
        Relationships: [];
      };
      Customers: {
        Row: {
          address: string | null;
          created_at: string;
          id: number;
          license_no: string | null;
          name: string | null;
          route_no: string | null;
          user_id: string | null;
        };
        Insert: {
          address?: string | null;
          created_at?: string;
          id?: number;
          license_no?: string | null;
          name?: string | null;
          route_no?: string | null;
          user_id?: string | null;
        };
        Update: {
          address?: string | null;
          created_at?: string;
          id?: number;
          license_no?: string | null;
          name?: string | null;
          route_no?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "Customers_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      Order_Item_Batches: {
        Row: {
          created_at: string;
          id: number;
          quantity: number | null;
          sales_order_item_id: number | null;
          stock_batch_id: number | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          quantity?: number | null;
          sales_order_item_id?: number | null;
          stock_batch_id?: number | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          quantity?: number | null;
          sales_order_item_id?: number | null;
          stock_batch_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "Order_Item_Batches_sales_order_item_id_fkey";
            columns: ["sales_order_item_id"];
            isOneToOne: false;
            referencedRelation: "Sales_Order_Items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "Order_Item_Batches_stock_batch_id_fkey";
            columns: ["stock_batch_id"];
            isOneToOne: false;
            referencedRelation: "Stock_Batches";
            referencedColumns: ["id"];
          },
        ];
      };
      Product_Stock: {
        Row: {
          created_at: string;
          id: number;
          product_id: number | null;
          quantity: number;
          size_id: number | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          product_id?: number | null;
          quantity: number;
          size_id?: number | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          product_id?: number | null;
          quantity?: number;
          size_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "Product_Stock_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "Products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "Product_Stock_size_id_fkey";
            columns: ["size_id"];
            isOneToOne: false;
            referencedRelation: "Bottle_Sizes";
            referencedColumns: ["id"];
          },
        ];
      };
      Products: {
        Row: {
          created_at: string;
          id: number;
          name: string | null;
          short_name: string | null;
          supplier_id: number | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          name?: string | null;
          short_name?: string | null;
          supplier_id?: number | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          name?: string | null;
          short_name?: string | null;
          supplier_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "Products_supplier_id_fkey";
            columns: ["supplier_id"];
            isOneToOne: false;
            referencedRelation: "Suppliers";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          id: string;
          role: string | null;
          username: string;
        };
        Insert: {
          id: string;
          role?: string | null;
          username: string;
        };
        Update: {
          id?: string;
          role?: string | null;
          username?: string;
        };
        Relationships: [];
      };
      Sales_Order_Items: {
        Row: {
          created_at: string;
          id: number;
          price: number | null;
          product_stock_id: number | null;
          "quantity-ordered": number | null;
          sales_order_id: number | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          price?: number | null;
          product_stock_id?: number | null;
          "quantity-ordered"?: number | null;
          sales_order_id?: number | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          price?: number | null;
          product_stock_id?: number | null;
          "quantity-ordered"?: number | null;
          sales_order_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "Sales_Order_Items_product_stock_id_fkey";
            columns: ["product_stock_id"];
            isOneToOne: false;
            referencedRelation: "Product_Stock";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "Sales_Order_Items_sales_order_id_fkey";
            columns: ["sales_order_id"];
            isOneToOne: false;
            referencedRelation: "Sales_Orders";
            referencedColumns: ["id"];
          },
        ];
      };
      Sales_Orders: {
        Row: {
          completed_at: string | null;
          created_at: string;
          customer_id: number | null;
          id: number;
          status: Database["public"]["Enums"]["order_status"];
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string;
          customer_id?: number | null;
          id?: number;
          status: Database["public"]["Enums"]["order_status"];
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          customer_id?: number | null;
          id?: number;
          status?: Database["public"]["Enums"]["order_status"];
        };
        Relationships: [
          {
            foreignKeyName: "Sales_Orders_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "Customers";
            referencedColumns: ["id"];
          },
        ];
      };
      Stock_Batches: {
        Row: {
          batch_code: string | null;
          created_at: string;
          id: number;
          product_stock_id: number | null;
          quantity: number | null;
        };
        Insert: {
          batch_code?: string | null;
          created_at?: string;
          id?: number;
          product_stock_id?: number | null;
          quantity?: number | null;
        };
        Update: {
          batch_code?: string | null;
          created_at?: string;
          id?: number;
          product_stock_id?: number | null;
          quantity?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "Stock_Batches_product_stock_id_fkey";
            columns: ["product_stock_id"];
            isOneToOne: false;
            referencedRelation: "Product_Stock";
            referencedColumns: ["id"];
          },
        ];
      };
      Suppliers: {
        Row: {
          created_at: string;
          id: number;
          name: string | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          name?: string | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          name?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      add_sales_order: {
        Args: {
          p_customer_id: number;
          p_items: Json;
          p_status: Database["public"]["Enums"]["order_status"];
        };
        Returns: number;
      };
      cancel_sales_order: {
        Args: { p_order_id: number; p_order_item_ids: number[] };
        Returns: undefined;
      };
      delete_stock_batch: {
        Args: { p_batch_id: number; p_stock_update: Json };
        Returns: undefined;
      };
      get_email_from_username: { Args: { p_username: string }; Returns: Json };
      process_order_batches: {
        Args: { p_items: Json; p_sales_order_id: number };
        Returns: undefined;
      };
      purchase_stock: {
        Args: { p_batches: Json; p_stock_updates: Json };
        Returns: undefined;
      };
      update_stock_batch: {
        Args: {
          p_batch_id: number;
          p_new_batch_code: string;
          p_new_batch_qty: number;
          p_new_total_stock_qty: number;
          p_stock_id: number;
        };
        Returns: undefined;
      };
    };
    Enums: {
      order_status: "pending" | "completed";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      order_status: ["pending", "completed"],
    },
  },
} as const;
