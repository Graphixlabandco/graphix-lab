import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Verify if credentials are valid and not default placeholder strings
const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes("your-project-id") && 
  !supabaseAnonKey.includes("your-supabase-anon-key");

// Mock client that persists to localStorage for safe local preview
class MockAuth {
  private listeners: Array<(event: string, session: any) => void> = [];
  private currentUser: any = null;

  constructor() {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("gxl_demo_user");
      if (savedUser) {
        try {
          this.currentUser = JSON.parse(savedUser);
        } catch (e) {
          console.error("Failed to parse saved user", e);
        }
      }
    }
  }

  async signUp({ email, password, options }: any) {
    const name = options?.data?.name || "Valued Client";
    const user = {
      id: "usr_" + Math.random().toString(36).substring(2, 11),
      email,
      user_metadata: { name },
      role: "client",
      createdAt: new Date().toISOString()
    };
    this.currentUser = user;
    if (typeof window !== "undefined") {
      localStorage.setItem("gxl_demo_user", JSON.stringify(user));
      
      // Save to mock users table too
      const savedUsers = localStorage.getItem("gxl_db_users");
      const usersList = savedUsers ? JSON.parse(savedUsers) : [];
      usersList.push({
        uid: user.id,
        email: user.email,
        name,
        role: "client",
        createdAt: user.createdAt
      });
      localStorage.setItem("gxl_db_users", JSON.stringify(usersList));
    }
    this.triggerListeners("SIGNED_IN");
    return { data: { user, session: { user } }, error: null };
  }

  async signInWithPassword({ email, password }: any) {
    const isAdmin = email.toLowerCase() === "graphixlab07@gmail.com" || email.toLowerCase() === "admin@graphixlab.com";
    const user = {
      id: isAdmin ? "demo_admin_uid" : "usr_" + Math.random().toString(36).substring(2, 11),
      email,
      user_metadata: { name: isAdmin ? "GraphixLab Owner" : "Demo Client" },
      role: isAdmin ? "admin" : "client",
      createdAt: new Date().toISOString()
    };
    this.currentUser = user;
    if (typeof window !== "undefined") {
      localStorage.setItem("gxl_demo_user", JSON.stringify(user));
      
      // Upsert mock profile
      const savedUsers = localStorage.getItem("gxl_db_users");
      const usersList = savedUsers ? JSON.parse(savedUsers) : [];
      if (!usersList.some((u: any) => u.email === email)) {
        usersList.push({
          uid: user.id,
          email: user.email,
          name: user.user_metadata.name,
          role: user.role,
          createdAt: user.createdAt
        });
        localStorage.setItem("gxl_db_users", JSON.stringify(usersList));
      }
    }
    this.triggerListeners("SIGNED_IN");
    return { data: { user, session: { user } }, error: null };
  }

  async signOut() {
    this.currentUser = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("gxl_demo_user");
    }
    this.triggerListeners("SIGNED_OUT");
    return { error: null };
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    this.listeners.push(callback);
    const session = this.currentUser ? { user: this.currentUser } : null;
    callback(this.currentUser ? "SIGNED_IN" : "SIGNED_OUT", session);
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.listeners = this.listeners.filter(l => l !== callback);
          }
        }
      }
    };
  }

  private triggerListeners(event: string) {
    const session = this.currentUser ? { user: this.currentUser } : null;
    this.listeners.forEach(callback => callback(event, session));
  }
}

class MockQueryBuilder {
  private table: string;

  constructor(table: string) {
    this.table = table;
  }

  private getData(): any[] {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(`gxl_db_${this.table}`);
    return raw ? JSON.parse(raw) : [];
  }

  private saveData(data: any[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(`gxl_db_${this.table}`, JSON.stringify(data));
  }

  async select(columns: string = "*") {
    return { data: this.getData(), error: null };
  }

  async insert(values: any | any[]) {
    const data = this.getData();
    const items = Array.isArray(values) ? values : [values];
    items.forEach(item => {
      if (!item.id && this.table !== "users") {
        const prefix = this.table === "bookings" ? "bk_" : this.table === "inquiries" ? "inq_" : "id_";
        item.id = prefix + Math.random().toString(36).substring(2, 11);
      }
      if (!item.createdAt) {
        item.createdAt = new Date().toISOString();
      }
    });
    data.push(...items);
    this.saveData(data);
    return { data: items, error: null };
  }

  async update(values: any) {
    const self = this;
    return {
      eq: async (column: string, value: any) => {
        const data = self.getData();
        let updated = false;
        const updatedData = data.map(item => {
          if (item[column] === value) {
            updated = true;
            return { ...item, ...values };
          }
          return item;
        });
        if (updated) {
          self.saveData(updatedData);
        }
        return { data: updatedData, error: null };
      }
    };
  }

  async delete() {
    const self = this;
    return {
      eq: async (column: string, value: any) => {
        const data = self.getData();
        const filtered = data.filter(item => item[column] !== value);
        self.saveData(filtered);
        return { data: filtered, error: null };
      }
    };
  }

  eq(column: string, value: any) {
    const data = this.getData().filter(item => item[column] === value);
    const self = this;
    return {
      select: async () => ({ data, error: null }),
      single: async () => {
        // Find specific match in table (e.g. users where uid = value)
        // Since some schemas use uid and others id, we search both or handle standard
        const users = self.getData();
        const found = users.find(item => item[column] === value);
        return { data: found || null, error: found ? null : { message: "No row found" } };
      },
      delete: async () => {
        const all = self.getData();
        const filtered = all.filter(item => item[column] !== value);
        self.saveData(filtered);
        return { data: filtered, error: null };
      },
      update: async (values: any) => {
        const all = self.getData();
        const updated = all.map(item => {
          if (item[column] === value) {
            return { ...item, ...values };
          }
          return item;
        });
        self.saveData(updated);
        return { data: updated, error: null };
      }
    };
  }

  order(column: string, { ascending = true } = {}) {
    const sorted = [...this.getData()].sort((a, b) => {
      const valA = a[column];
      const valB = b[column];
      if (valA < valB) return ascending ? -1 : 1;
      if (valA > valB) return ascending ? 1 : -1;
      return 0;
    });
    const self = this;
    return {
      select: async () => ({ data: sorted, error: null }),
      eq: (col: string, val: any) => {
        const filtered = sorted.filter(item => item[col] === val);
        return {
          select: async () => ({ data: filtered, error: null })
        };
      }
    };
  }
}

class MockSupabaseClient {
  public auth = new MockAuth();

  public from(table: string) {
    return new MockQueryBuilder(table);
  }
}

// Log status for user clarity
if (isSupabaseConfigured) {
  console.log("Supabase initialized successfully using provided environment secrets.");
} else {
  console.warn(
    "Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY) are not configured. Running in offline fallback mode."
  );
}

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : (new MockSupabaseClient() as any);
