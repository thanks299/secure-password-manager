export interface Database {
  public: {
    Tables: {
      user_vaults: {
        Row: {
          id: string;
          user_id: string;
          encrypted_data: string;
          iv: string;
          salt: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          encrypted_data: string;
          iv: string;
          salt: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          encrypted_data?: string;
          iv?: string;
          salt?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          encrypted_settings: string;
          iv: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          encrypted_settings: string;
          iv: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          encrypted_settings?: string;
          iv?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}