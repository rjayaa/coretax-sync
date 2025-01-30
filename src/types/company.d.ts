// // types/company.d.ts
// export interface Company {
//     company_code: string;
//     company_name: string;
//     npwp?: string;
//     is_active: boolean;
//     status: string;
//   }
  
//   // Update next-auth.d.ts to include the Company type
//   declare module "next-auth" {
//     interface User {
//       id: string;
//       username: string;
//       position: string;
//       companies: Company[];
//     }
  
//     interface Session {
//       user: User;
//     }
//   }


// types/company.d.ts
export interface Company {
  company_code: string;
  company_name: string;
  npwp_company?: string;
  is_active: boolean;
  status: string;
}