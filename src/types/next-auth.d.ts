// types/next-auth.d.ts
import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;         // ini tetap id
    idnik: string;      // tambahkan idnik
    username: string;
    position: string;
    status_login?: string;
    last_active?: Date;
    companies: {
      company_code: string;
      company_name: string;
      npwp_company?: string;
      is_active: boolean;
      status: string;
    }[];
  }

  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: User;
  }
}