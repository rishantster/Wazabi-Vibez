import type { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import TwitterProvider from "next-auth/providers/twitter";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import { verifyMessage } from "viem";
import bs58 from "bs58";
import nacl from "tweetnacl";

export const authOptions: NextAuthOptions = {
  providers: [
    // ─── Wallet Auth (EVM — SIWE-style) ────────────────────────────────
    CredentialsProvider({
      id: "wallet-evm",
      name: "EVM Wallet",
      credentials: {
        address: { label: "Address", type: "text" },
        message: { label: "Message", type: "text" },
        signature: { label: "Signature", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.address || !credentials?.message || !credentials?.signature) {
          return null;
        }

        const isValid = await verifyMessage({
          address: credentials.address as `0x${string}`,
          message: credentials.message,
          signature: credentials.signature as `0x${string}`,
        });

        if (!isValid) return null;

        // Upsert user with this wallet
        const user = await prisma.user.upsert({
          where: { walletAddress: credentials.address.toLowerCase() },
          update: {},
          create: {
            walletAddress: credentials.address.toLowerCase(),
            walletChain: "ethereum", // default, can be updated
          },
        });

        return { id: user.id, name: user.displayName, image: user.avatarUrl };
      },
    }),

    // ─── Wallet Auth (Solana) ──────────────────────────────────────────
    CredentialsProvider({
      id: "wallet-solana",
      name: "Solana Wallet",
      credentials: {
        address: { label: "Address", type: "text" },
        message: { label: "Message", type: "text" },
        signature: { label: "Signature", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.address || !credentials?.message || !credentials?.signature) {
          return null;
        }

        try {
          const messageBytes = new TextEncoder().encode(credentials.message);
          const signatureBytes = bs58.decode(credentials.signature);
          const publicKeyBytes = bs58.decode(credentials.address);

          const isValid = nacl.sign.detached.verify(
            messageBytes,
            signatureBytes,
            publicKeyBytes
          );

          if (!isValid) return null;

          const user = await prisma.user.upsert({
            where: { walletAddress: credentials.address },
            update: {},
            create: {
              walletAddress: credentials.address,
              walletChain: "solana",
            },
          });

          return { id: user.id, name: user.displayName, image: user.avatarUrl };
        } catch {
          return null;
        }
      },
    }),

    // ─── OAuth Providers ───────────────────────────────────────────────
    ...(process.env.GITHUB_CLIENT_ID
      ? [
          GithubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
          }),
        ]
      : []),
    ...(process.env.TWITTER_CLIENT_ID
      ? [
          TwitterProvider({
            clientId: process.env.TWITTER_CLIENT_ID!,
            clientSecret: process.env.TWITTER_CLIENT_SECRET!,
            version: "2.0",
          }),
        ]
      : []),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (!account) return false;

      // For OAuth providers, link to existing user or create new one
      if (account.provider === "github") {
        await prisma.user.upsert({
          where: { githubId: account.providerAccountId },
          update: {
            githubUsername: user.name ?? undefined,
            avatarUrl: user.image ?? undefined,
          },
          create: {
            githubId: account.providerAccountId,
            githubUsername: user.name ?? undefined,
            avatarUrl: user.image ?? undefined,
            displayName: user.name ?? undefined,
          },
        });
      }

      if (account.provider === "twitter") {
        await prisma.user.upsert({
          where: { twitterId: account.providerAccountId },
          update: {
            twitterHandle: user.name ?? undefined,
            avatarUrl: user.image ?? undefined,
          },
          create: {
            twitterId: account.providerAccountId,
            twitterHandle: user.name ?? undefined,
            avatarUrl: user.image ?? undefined,
            displayName: user.name ?? undefined,
          },
        });
      }

      return true;
    },

    async session({ session, token }) {
      if (token.sub) {
        // Look up user from DB to get full profile
        const dbUser = await prisma.user.findFirst({
          where: {
            OR: [
              { id: token.sub },
              { githubId: token.sub },
              { twitterId: token.sub },
            ],
          },
        });

        if (dbUser) {
          (session as any).user = {
            id: dbUser.id,
            walletAddress: dbUser.walletAddress,
            walletChain: dbUser.walletChain,
            displayName: dbUser.displayName,
            avatarUrl: dbUser.avatarUrl,
            githubUsername: dbUser.githubUsername,
            twitterHandle: dbUser.twitterHandle,
          };
        }
      }
      return session;
    },

    async jwt({ token, account }) {
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
  },

  pages: {
    signIn: "/",
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
