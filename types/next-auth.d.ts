declare module 'next-auth' {
  export interface Session {
    user: User & { id: string };
  }
  export interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
  export type NextAuthOptions = any;
  export const getServerSession: any;
  export const authOptions: any;
  const NextAuth: any;
  export default NextAuth;
}
declare module 'next-auth/jwt' {
  export interface JWT {
    [key: string]: any;
  }
}
declare module 'next-auth/providers/google' {
  const GoogleProvider: any;
  export default GoogleProvider;
}
declare module 'next-auth/providers/credentials' {
  const CredentialsProvider: any;
  export default CredentialsProvider;
}
declare module 'next-auth/react' {
  export const useSession: any;
  export const getSession: any;
  export const signOut: any;
  export const signIn: any;
  export const SessionProvider: any;
}
declare module '@aws-sdk/client-s3' {
  export const S3Client: any;
  export const PutObjectCommand: any;
}
declare module 'uuid' {
  export const v4: any;
}
