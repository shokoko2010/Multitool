import { getServerSession } from "next-auth"
import { authOptions } from "./auth"

export async function auth() {
  return await getServerSession(authOptions)
}