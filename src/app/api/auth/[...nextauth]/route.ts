// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { eipDb, taxDb } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { userLoginView } from "@/lib/db/schema/eip";
import { taxUserRoles, taxMasterCompany } from "@/lib/db/schema/index";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        try {
          // Get user from eip database
          const [userLogin] = await eipDb
            .select()
            .from(userLoginView)
            .where(eq(userLoginView.username, credentials.username))
            .limit(1)

          if (!userLogin) {
            console.log('User not found:', credentials.username)
            return null
          }

          // Verify password
          const compatibleHash = userLogin.password.replace('$2y$', '$2a$')
          const isValid = await bcrypt.compare(credentials.password, compatibleHash)

          if (!isValid) {
            console.log('Invalid password for user:', credentials.username)
            return null
          }

            // Di dalam fungsi authorize pada route.ts

        // Get user's assigned companies with proper joining
        const assignedCompanies = await taxDb
        .select({
            idnik: taxUserRoles.idnik,
            company_code: taxMasterCompany.company_code,
            company_name: taxMasterCompany.company_name,
            npwp_company: taxMasterCompany.npwp_company,
            status: taxMasterCompany.status,
            is_active: taxUserRoles.is_active
        })
        .from(taxUserRoles)
        .innerJoin(
            taxMasterCompany,
            eq(taxUserRoles.company_code, taxMasterCompany.company_code)
        )
        .where(
            and(
            eq(taxUserRoles.idnik, userLogin.idnik),
            eq(taxUserRoles.is_active, true)
            )
        );

        // Debug log
        console.log('Raw query result:', JSON.stringify(assignedCompanies, null, 2));

        // Transform data
        const companies = assignedCompanies.map((company) => ({
        company_code: company.company_code,
        company_name: company.company_name,
        npwp_company: company.npwp_company,
        is_active: company.is_active,
        status: company.status
        }));

        // Debug final data
        console.log('Processed companies:', JSON.stringify(companies, null, 2));


            const userData = {
            id: userLogin.idnik,
            idnik: userLogin.idnik,
            username: userLogin.username,
            position: userLogin.position,
            companies: companies
            };

            console.log('Final User Data:', userData);

            return userData;
        } catch (error) {
          console.error('Authorization error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 15 * 60, // 15 minutes
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user
      }
      return token
    },
    async session({ session, token }) {
      session.user = token.user
      return session
    }
  },
  pages: {
    signIn: '/auth/login',
  },
  events: {
    async signOut() {
      // Clear any stored data on signout
      if (typeof window !== 'undefined') {
        localStorage.removeItem('selectedCompany')
        localStorage.removeItem('rememberMe')
      }
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };



